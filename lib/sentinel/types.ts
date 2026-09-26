/** Client-safe Sentinel shapes and our own proxy routes. No upstream hosts, no secrets. */

/**
 * One camera as the browser sees it. The live catalogue currently returns
 * exactly `{ id, name }`; anything else upstream adds is dropped server-side.
 */
export type SentinelCamera = {
  id: string;
  name: string;
};

export type CatalogueResponse = {
  cameras: SentinelCamera[];
  /** ISO time the server fetched the catalogue. */
  fetchedAt: string;
};

export type CatalogueError = {
  error: string;
  /** Set while Sentinel's watch-time quota is cooling down: when the server re-checks. */
  cooldownRetryAt?: string;
};

/**
 * Full-motion players open at once (the focused tile plays video; the grid shows
 * refreshed stills). Sentinel's gateway carries only a few Mbit/s per session and
 * each feed needs ~1.5 Mbit/s, so this stays small. NEXT_PUBLIC_SENTINEL_MAX_FEEDS overrides.
 */
export const MAX_OPEN_FEEDS = Math.max(1, Number(process.env.NEXT_PUBLIC_SENTINEL_MAX_FEEDS) || 2);

export const CATALOGUE_ROUTE = "/api/sentinel/cameras";
const HLS_ROUTE = "/api/sentinel/hls";

/** Latest still frame (JPEG) for a camera; 204 while the first one is being fetched. */
export const snapshotRoute = (id: string) => `/api/sentinel/snapshot/${encodeURIComponent(id)}`;

/** Playlist entry point for a camera. Upstream layout is `<id>/index.m3u8`. */
export const hlsPlaylistRoute = (id: string) => `${HLS_ROUTE}/${encodeURIComponent(id)}/index.m3u8`;

/** Map an upstream path (as found inside a playlist) onto the proxy. */
export const hlsProxyPath = (upstreamPath: string) => `${HLS_ROUTE}/${upstreamPath.replace(/^\/+/, "")}`;
