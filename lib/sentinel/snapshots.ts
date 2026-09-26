import "server-only";
import { spawn } from "node:child_process";
import { createDecipheriv } from "node:crypto";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { sentinelConfig } from "./config";
import { SentinelCooldownError, sentinelGet } from "./upstream";

/**
 * Still frames for the camera wall.
 *
 * Sentinel's gateway serves this session a few Mbit/s in total, while each feed
 * runs at ~1.5 Mbit/s — enough for two or three full streams, not a wall of 30.
 * So the grid shows stills: for each camera, fetch only the head of the segment
 * playing *now*, decrypt it, and decode its first (key)frame with ffmpeg. That
 * costs ~200 KB per camera instead of a continuous stream, so every tile stays
 * current. Frames are held in memory only, one per camera, replaced on refresh.
 */

/** Media paths refuse clients without a browser User-Agent. */
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

/** A segment opens on a keyframe; this much of it nearly always contains the whole first frame. */
const HEAD_BYTES = [256 * 1024, 1024 * 1024];
/** A frame this old is replaced on the next request for it. */
const FRESH_MS = 8_000;
/** Snapshot captures under way at once; the upstream pacer does the real rate limiting. */
const MAX_FETCHES = 6;
/** Playlists are finite loops; their segment list doesn't change, so one fetch lasts. */
const PLAYLIST_TTL_MS = 60 * 60_000;
const KEY_TTL_MS = 10 * 60_000;
const FFMPEG_TIMEOUT_MS = 10_000;
/** A camera whose snapshot just failed is not retried before this. */
const FAILURE_HOLD_MS = 15_000;

type SegmentKey = { url: URL; iv: Buffer | null };
type Segment = { url: URL; start: number; seq: number; key: SegmentKey | null };
type Playlist = { at: number; segments: Segment[]; total: number };
export type Snapshot = { jpeg: Buffer; capturedAt: number };

type Store = {
  playlists: Map<string, Playlist>;
  keys: Map<string, { at: number; key: Buffer }>;
  frames: Map<string, Snapshot>;
  failedAt: Map<string, number>;
  inflight: Map<string, Promise<Snapshot>>;
  running: number;
  queue: Array<() => void>;
};

const g = globalThis as typeof globalThis & { __sentinelSnapshots?: Store };
const store: Store = (g.__sentinelSnapshots ??= {
  playlists: new Map(),
  keys: new Map(),
  frames: new Map(),
  failedAt: new Map(),
  inflight: new Map(),
  running: 0,
  queue: [],
});

async function withFetchSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (store.running >= MAX_FETCHES) await new Promise<void>((r) => store.queue.push(r));
  store.running++;
  try {
    return await fn();
  } finally {
    store.running--;
    store.queue.shift()?.();
  }
}

async function getOk(url: URL, range?: string): Promise<Response> {
  const res = await sentinelGet(url, { userAgent: BROWSER_UA, range, priority: "low" });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || (type.startsWith("text/") && !url.pathname.endsWith(".m3u8"))) {
    const reason = type.startsWith("text/") ? (await res.text()).slice(0, 120).trim() : "";
    if (!reason) await res.body?.cancel();
    throw new Error(`HTTP ${res.status}${reason ? ` — ${reason}` : ""} for ${url.pathname}`);
  }
  return res;
}

function parseIv(attr: string): Buffer | null {
  const m = /IV=0x([0-9a-f]{32})/i.exec(attr);
  return m ? Buffer.from(m[1], "hex") : null;
}

async function playlist(id: string): Promise<Playlist> {
  const hit = store.playlists.get(id);
  if (hit && Date.now() - hit.at < PLAYLIST_TTL_MS) return hit;

  const url = new URL(`${id}/index.m3u8`, sentinelConfig().hlsBase);
  const text = await (await getOk(url)).text();
  if (!text.trimStart().startsWith("#EXTM3U")) throw new Error(`not a playlist: ${url.pathname}`);

  const segments: Segment[] = [];
  let key: SegmentKey | null = null;
  let seq = 0;
  let total = 0;
  let pending: number | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXT-X-MEDIA-SEQUENCE:")) seq = Number(line.slice(22)) || 0;
    else if (line.startsWith("#EXT-X-KEY:")) {
      const uri = /URI="([^"]+)"/.exec(line)?.[1];
      key = /METHOD=AES-128/.test(line) && uri ? { url: new URL(uri, url), iv: parseIv(line) } : null;
    } else if (line.startsWith("#EXTINF:")) pending = parseFloat(line.slice(8)) || 0;
    else if (!line.startsWith("#") && pending !== null) {
      segments.push({ url: new URL(line, url), start: total, seq: seq++, key });
      total += pending;
      pending = null;
    }
  }
  if (!segments.length || total <= 0) throw new Error(`empty playlist: ${url.pathname}`);

  const p = { at: Date.now(), segments, total };
  store.playlists.set(id, p);
  return p;
}

async function aesKey(url: URL): Promise<Buffer> {
  const hit = store.keys.get(url.href);
  if (hit && Date.now() - hit.at < KEY_TTL_MS) return hit.key;
  const key = Buffer.from(await (await getOk(url)).arrayBuffer());
  if (key.length !== 16) throw new Error(`bad key length ${key.length}`);
  store.keys.set(url.href, { at: Date.now(), key });
  return key;
}

/** The segment playing now, on the same `now mod duration` clock the live player uses. */
function currentSegment(p: Playlist): Segment {
  const pos = (Date.now() / 1000) % p.total;
  let lo = 0;
  let hi = p.segments.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (p.segments[mid].start <= pos) lo = mid;
    else hi = mid - 1;
  }
  return p.segments[lo];
}

function decodeFirstFrame(ts: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Keyframes only, no audio, minimal probing, one thread: ~0.3s instead of seconds
    // per frame, and several can run side by side without starving the server.
    const proc = spawn(ffmpeg.path, [
      "-hide_banner", "-loglevel", "error",
      "-threads", "1", "-skip_frame", "nokey", "-probesize", "65536", "-analyzeduration", "0",
      "-f", "mpegts", "-i", "pipe:0",
      "-an", "-sn", "-dn", "-threads", "1",
      "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "5",
      "-f", "image2", "-c:v", "mjpeg", "pipe:1",
    ]);
    const out: Buffer[] = [];
    let err = "";
    const timer = setTimeout(() => proc.kill("SIGKILL"), FFMPEG_TIMEOUT_MS);
    proc.stdout.on("data", (c: Buffer) => out.push(c));
    proc.stderr.on("data", (c: Buffer) => (err += c.toString()));
    proc.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    proc.on("close", () => {
      clearTimeout(timer);
      const jpeg = Buffer.concat(out);
      if (jpeg.length > 0) resolve(jpeg);
      else reject(new Error(`no frame decoded${err ? `: ${err.trim().split("\n").pop()}` : ""}`));
    });
    proc.stdin.on("error", () => {}); // ffmpeg may close stdin once it has its frame
    proc.stdin.end(ts);
  });
}

async function capture(id: string): Promise<Snapshot> {
  const p = await playlist(id);
  const seg = currentSegment(p);
  const key = seg.key ? await aesKey(seg.key.url) : null;

  let lastErr: Error | null = null;
  for (const bytes of HEAD_BYTES) {
    const res = await getOk(seg.url, `bytes=0-${bytes - 1}`);
    let data = Buffer.from(await res.arrayBuffer());
    if (key) {
      const iv = seg.key?.iv ?? Buffer.alloc(16);
      if (!seg.key?.iv) iv.writeUInt32BE(seg.seq, 12);
      const d = createDecipheriv("aes-128-cbc", key, iv);
      d.setAutoPadding(false);
      data = d.update(data.subarray(0, data.length - (data.length % 16)));
    }
    data = data.subarray(0, data.length - (data.length % 188));
    try {
      return { jpeg: await decodeFirstFrame(data), capturedAt: Date.now() };
    } catch (err) {
      lastErr = err as Error;
      if (res.status !== 206) break; // already had the whole segment
    }
  }
  throw lastErr ?? new Error("no frame");
}

function refresh(id: string): Promise<Snapshot> {
  let p = store.inflight.get(id);
  if (!p) {
    p = withFetchSlot(() => capture(id))
      .then((snap) => {
        store.frames.set(id, snap);
        store.failedAt.delete(id);
        return snap;
      })
      .catch((err: Error) => {
        store.failedAt.set(id, Date.now());
        if (!(err instanceof SentinelCooldownError)) console.warn(`[sentinel] snapshot ${id} failed:`, err.message);
        throw err;
      })
      .finally(() => store.inflight.delete(id));
    store.inflight.set(id, p);
  }
  return p;
}

/**
 * The latest frame for a camera, without waiting on Sentinel: a stale frame
 * is returned as-is while a newer one is fetched in the background. `null`
 * means none yet (one is on its way, unless the camera is failing).
 */
export function latestSnapshot(id: string): { snap: Snapshot | null; failing: boolean } {
  const snap = store.frames.get(id) ?? null;
  const failedAt = store.failedAt.get(id);
  const failing = failedAt !== undefined && Date.now() - failedAt < FAILURE_HOLD_MS;
  if ((!snap || Date.now() - snap.capturedAt > FRESH_MS) && !failing) refresh(id).catch(() => {});
  return { snap, failing };
}
