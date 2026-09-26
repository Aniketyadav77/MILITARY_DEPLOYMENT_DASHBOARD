import "server-only";

/**
 * Every Sentinel connection detail lives here and nowhere else. Values come from
 * the environment (.env locally); this module is server-only, so none of it —
 * least of all the access password — can end up in the client bundle.
 *
 * Only the HLS/CDN host is used: the browser wall plays HLS through our proxy.
 * RTSP / WebRTC (credentials in the URL) are for server-side inference and are
 * deliberately not configured here until something actually needs them.
 */

function required(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Sentinel: ${name} is not set`);
  return v;
}

/**
 * The portal issues a system-generated access password at registration
 * (format XXXX-XXXX-XXXX). In the current .env that value is stored as
 * SENTINEL_REGISTER_TOKEN; SENTINEL_PASSWORD there is rejected by /auth/login.
 */
function accessPassword(): string {
  const v = process.env.SENTINEL_ACCESS_PASSWORD?.trim() || process.env.SENTINEL_REGISTER_TOKEN?.trim();
  if (!v) throw new Error("Sentinel: SENTINEL_ACCESS_PASSWORD (or SENTINEL_REGISTER_TOKEN) is not set");
  return v;
}

export type SentinelConfig = {
  /** Origin every HLS path (playlists, segments, keys) is resolved against. */
  hlsBase: URL;
  catalogueUrl: URL;
  loginUrl: URL;
  email: string;
  password: string;
};

let cached: SentinelConfig | null = null;

export function sentinelConfig(): SentinelConfig {
  if (cached) return cached;
  const hlsBase = new URL(required("SENTINEL_HLS_BASE").replace(/\/+$/, "") + "/");
  cached = {
    hlsBase,
    catalogueUrl: new URL(process.env.SENTINEL_CATALOGUE_URL?.trim() || "cameras.json", hlsBase),
    loginUrl: new URL(process.env.SENTINEL_LOGIN_URL?.trim() || "auth/login", hlsBase),
    email: required("SENTINEL_EMAIL"),
    password: accessPassword(),
  };
  return cached;
}
