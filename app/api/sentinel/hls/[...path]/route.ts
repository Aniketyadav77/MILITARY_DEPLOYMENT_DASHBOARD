import type { NextRequest } from "next/server";
import { isKnownCamera } from "@/lib/sentinel/catalogue";
import { sentinelConfig } from "@/lib/sentinel/config";
import { hlsProxyPath } from "@/lib/sentinel/types";
import { SentinelAuthError, SentinelCooldownError, SentinelTimeoutError, sentinelGet } from "@/lib/sentinel/upstream";

/**
 * Read-only HLS pass-through for the camera wall.
 *
 * The browser's player talks to this route; this route talks to Sentinel with
 * the server-held session cookie. Nothing is stored — bytes stream through as
 * the player asks for them, and closing the player aborts the upstream fetch.
 *
 * Only three kinds of path are forwarded, so this can't be used to reach the
 * rest of the portal (logout, account pages, …):
 *   <catalogue id>/…/*.m3u8     playlists
 *   <catalogue id>/…/<media>    segments
 *   key URIs                    only ones seen inside a playlist we served
 */

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;
const MEDIA_EXT = /\.(ts|m4s|mp4|m4v|aac|mp3|vtt|webvtt)$/i;
const NO_STORE = { "Cache-Control": "no-store" };

const g = globalThis as typeof globalThis & { __sentinelKeys?: Set<string> };
const allowedKeys = (g.__sentinelKeys ??= new Set<string>());

/** Upstream path relative to the HLS base, or null when it lives elsewhere. */
function relativeToBase(url: URL): string | null {
  const base = sentinelConfig().hlsBase;
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
  return url.pathname.slice(base.pathname.length);
}

/** Scheme-qualified (`https:`) or root-relative (`/x`) — i.e. not relative to the playlist. */
const ANCHORED = /^(?:[a-z][a-z0-9+.-]*:|\/)/i;

function proxied(uri: string, playlistUrl: URL, isKey: boolean): string {
  const abs = new URL(uri, playlistUrl);
  const rel = relativeToBase(abs);
  if (rel === null) return uri;
  if (isKey) allowedKeys.add(rel);
  // The proxy mirrors upstream paths, so a relative URI already resolves to the
  // right proxy URL. Leaving those alone keeps a 7,000-segment playlist small.
  if (!ANCHORED.test(uri)) return uri;
  return hlsProxyPath(rel) + abs.search;
}

/**
 * The AES-128 key is 16 bytes shared by every feed, and its upstream TTFB is
 * seconds. Memoizing it briefly keeps 30 simultaneous joins from each paying
 * that cost. (A key, not footage — nothing from the video itself is kept.)
 */
const KEY_TTL_MS = 60_000;
type KeyEntry = { at: number; body: ArrayBuffer; type: string };
const keyMemo = new Map<string, KeyEntry>();
/** A wall joining at once asks for the same key many times; they share one upstream fetch. */
const keyInflight = new Map<string, Promise<KeyEntry | null>>();

/** Fetch a key upstream, or null if Sentinel refused it. Not tied to any one viewer's request. */
function fetchKey(url: URL, userAgent: string | null): Promise<KeyEntry | null> {
  const memoKey = url.pathname + url.search;
  let p = keyInflight.get(memoKey);
  if (!p) {
    p = (async () => {
      const res = await sentinelGet(url, { userAgent });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || type.startsWith("text/")) {
        await res.body?.cancel();
        console.warn(`[sentinel] hls key refused: HTTP ${res.status}`);
        return null;
      }
      const entry = { at: Date.now(), body: await res.arrayBuffer(), type: type || "application/octet-stream" };
      keyMemo.set(memoKey, entry);
      return entry;
    })().finally(() => keyInflight.delete(memoKey));
    keyInflight.set(memoKey, p);
  }
  return p;
}

/** Point every URI in the playlist (segments, keys, maps, variants) at this proxy. */
function rewritePlaylist(text: string, playlistUrl: URL): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return line;
      if (t.startsWith("#")) {
        const isKey = t.startsWith("#EXT-X-KEY") || t.startsWith("#EXT-X-SESSION-KEY");
        return line.replace(/URI="([^"]+)"/g, (_, uri: string) => `URI="${proxied(uri, playlistUrl, isKey)}"`);
      }
      return proxied(t, playlistUrl, false);
    })
    .join("\n");
}

type Kind = "playlist" | "media" | "key";

async function classify(parts: string[]): Promise<Kind | null> {
  if (!parts.length || parts.some((p) => !SAFE_SEGMENT.test(p) || p === "." || p === "..")) return null;
  const rel = parts.join("/");
  if (allowedKeys.has(rel)) return "key";
  if (parts.length < 2 || !(await isKnownCamera(parts[0]))) return null;
  const last = parts[parts.length - 1];
  if (last.toLowerCase().endsWith(".m3u8")) return "playlist";
  if (MEDIA_EXT.test(last)) return "media";
  return null;
}

export async function GET(req: NextRequest, ctx: RouteContext<"/api/sentinel/hls/[...path]">) {
  const { path } = await ctx.params;

  let kind: Kind | null;
  try {
    kind = await classify(path);
  } catch (err) {
    if (err instanceof SentinelCooldownError) return new Response("Sentinel cooling down", { status: 503, headers: NO_STORE });
    console.warn("[sentinel] hls classify failed:", (err as Error).message);
    return new Response("Upstream unavailable", { status: 502, headers: NO_STORE });
  }
  if (!kind) return new Response("Not found", { status: 404, headers: NO_STORE });

  const upstreamUrl = new URL(path.join("/") + req.nextUrl.search, sentinelConfig().hlsBase);

  const memoKey = upstreamUrl.pathname + upstreamUrl.search;
  const memo = kind === "key" ? keyMemo.get(memoKey) : undefined;
  if (memo && Date.now() - memo.at < KEY_TTL_MS) {
    return new Response(memo.body.slice(0), { headers: { ...NO_STORE, "Content-Type": memo.type } });
  }

  if (kind === "key") {
    try {
      const key = await fetchKey(upstreamUrl, req.headers.get("user-agent"));
      if (!key) return new Response("Feed unavailable", { status: 502, headers: NO_STORE });
      return new Response(key.body.slice(0), { headers: { ...NO_STORE, "Content-Type": key.type } });
    } catch (err) {
      if (!(err instanceof SentinelCooldownError)) console.warn("[sentinel] hls key fetch failed:", (err as Error).message);
      const status = err instanceof SentinelAuthError || err instanceof SentinelCooldownError ? 503 : err instanceof SentinelTimeoutError ? 504 : 502;
      return new Response("Upstream unavailable", { status, headers: NO_STORE });
    }
  }

  let res: Response;
  try {
    // The gateway serves media only to browsers; the requester here is one
    // (hls.js in the camera wall), so its own User-Agent is passed along.
    res = await sentinelGet(upstreamUrl, { userAgent: req.headers.get("user-agent"), signal: req.signal });
  } catch (err) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    const status = err instanceof SentinelAuthError || err instanceof SentinelCooldownError ? 503 : err instanceof SentinelTimeoutError ? 504 : 502;
    if (!(err instanceof SentinelCooldownError)) console.warn(`[sentinel] hls ${kind} fetch failed:`, (err as Error).message);
    return new Response(status === 503 ? "Upstream auth failed" : "Upstream unavailable", {
      status,
      headers: NO_STORE,
    });
  }

  const type = res.headers.get("content-type") ?? "";
  // The gateway answers refused media requests with a short text/plain body.
  if (!res.ok || (kind !== "playlist" && type.startsWith("text/"))) {
    // Refusals carry a one-line reason ("browser required", "One session per IP").
    const isText = type.startsWith("text/");
    const reason = isText ? (await res.text()).slice(0, 120).trim() : "";
    if (!isText) await res.body?.cancel();
    console.warn(`[sentinel] hls ${kind} refused: HTTP ${res.status}${reason ? ` — ${reason}` : ""}`);
    return new Response("Feed unavailable", { status: res.status === 404 ? 404 : 502, headers: NO_STORE });
  }

  if (kind === "playlist") {
    const text = await res.text();
    if (!text.trimStart().startsWith("#EXTM3U")) {
      return new Response("Feed unavailable", { status: 502, headers: NO_STORE });
    }
    return new Response(rewritePlaylist(text, upstreamUrl), {
      headers: { ...NO_STORE, "Content-Type": "application/vnd.apple.mpegurl" },
    });
  }

  const headers = new Headers(NO_STORE);
  headers.set("Content-Type", type || "application/octet-stream");
  const len = res.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  return new Response(res.body, { status: res.status, headers });
}
