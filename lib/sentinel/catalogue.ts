import "server-only";
import { sentinelConfig } from "./config";
import type { SentinelCamera } from "./types";
import { sentinelGet } from "./upstream";

/** Ids become URL path segments in the proxy, so only a conservative charset is accepted. */
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** Short server-side memo: the HLS proxy checks every request against it. */
const TTL_MS = 15_000;

type Memo = { at: number; cameras: SentinelCamera[] } | null;
type Store = { memo: Memo; inflight?: Promise<SentinelCamera[]> | null };
const g = globalThis as typeof globalThis & { __sentinelCatalogue?: Store };
const store: Store = (g.__sentinelCatalogue ??= { memo: null });

/**
 * Whitelist the fields the browser may see. If the catalogue ever grows RTSP /
 * WHEP URLs (which embed credentials), they stop here.
 */
function parse(raw: unknown): SentinelCamera[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { cameras?: unknown }).cameras)
      ? (raw as { cameras: unknown[] }).cameras
      : null;
  if (!list) throw new Error("Sentinel catalogue: unexpected response shape");

  const seen = new Set<string>();
  const out: SentinelCamera[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const { id, name } = item as { id?: unknown; name?: unknown };
    if (typeof id !== "string" || !SAFE_ID.test(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name: typeof name === "string" && name.trim() ? name.trim() : id });
  }
  return out;
}

async function load(): Promise<SentinelCamera[]> {
  const res = await sentinelGet(sentinelConfig().catalogueUrl);
  if (!res.ok) {
    await res.body?.cancel();
    throw new Error(`Sentinel catalogue: HTTP ${res.status}`);
  }
  const cameras = parse(await res.json());
  store.memo = { at: Date.now(), cameras };
  return cameras;
}

export async function fetchCatalogue({ fresh = false } = {}): Promise<SentinelCamera[]> {
  if (!fresh && store.memo && Date.now() - store.memo.at < TTL_MS) return store.memo.cameras;
  // Every tile on the wall asks at once when the memo expires; they share one upstream read.
  store.inflight ??= load().finally(() => (store.inflight = null));
  return store.inflight;
}

/** How long the proxy may keep trusting the last good catalogue while Sentinel's is unreachable. */
const STALE_OK_MS = 10 * 60_000;

export async function isKnownCamera(id: string): Promise<boolean> {
  if (!SAFE_ID.test(id)) return false;
  // A camera the last good catalogue lists is answered at once; an expired memo
  // is refreshed in the background rather than holding up every media request.
  if (store.memo && Date.now() - store.memo.at < STALE_OK_MS && store.memo.cameras.some((c) => c.id === id)) {
    if (Date.now() - store.memo.at >= TTL_MS) fetchCatalogue().catch(() => {});
    return true;
  }
  let cams: SentinelCamera[];
  try {
    cams = await fetchCatalogue();
  } catch (err) {
    // A slow or failing catalogue must not take down feeds that are otherwise playing.
    if (!store.memo || Date.now() - store.memo.at > STALE_OK_MS) throw err;
    return store.memo.cameras.some((c) => c.id === id);
  }
  if (cams.some((c) => c.id === id)) return true;
  // A camera added since the memo was taken should not wait out the full TTL,
  // but a stream of unknown ids must not turn into a stream of upstream fetches.
  if (store.memo && Date.now() - store.memo.at < 3_000) return false;
  return (await fetchCatalogue({ fresh: true })).some((c) => c.id === id);
}
