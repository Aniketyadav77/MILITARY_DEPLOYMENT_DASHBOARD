const BASE_MS = 2_000;
const CAP_MS = 30_000;

/**
 * Exponential backoff with ±20% jitter: ~2s, 4s, 8s, 16s, then 30s forever.
 * Jitter keeps 30 tiles that failed together from reconnecting in lockstep.
 */
export function backoffMs(attempt: number): number {
  const raw = Math.min(CAP_MS, BASE_MS * 2 ** Math.max(0, attempt));
  return Math.round(raw * (0.8 + Math.random() * 0.4));
}
