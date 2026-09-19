/**
 * Seeded PRNG (mulberry32). Every mock generator draws from this so the console
 * renders identically on the server and on the client — no hydration drift, and
 * the same backlog every reload.
 */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export const pick = <T>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];

export const range = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo);

export const intRange = (rng: Rng, lo: number, hi: number) => Math.floor(range(rng, lo, hi + 1));
