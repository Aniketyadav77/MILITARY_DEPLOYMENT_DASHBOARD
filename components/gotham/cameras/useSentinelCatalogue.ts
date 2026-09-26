"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CATALOGUE_ROUTE, type CatalogueError, type CatalogueResponse, type SentinelCamera } from "@/lib/sentinel/types";
import { backoffMs } from "./backoff";

/** How often a healthy catalogue is re-read; the camera set can change under us. */
const REFRESH_MS = 60_000;

export type CatalogueState = {
  /** null until the first successful load. Kept through later failures. */
  cameras: SentinelCamera[] | null;
  fetchedAt: string | null;
  /** Set while the most recent attempt failed. */
  error: string | null;
  /** Epoch ms of the server's next check while Sentinel's watch-time quota cools down; null otherwise. */
  cooldownUntil: number | null;
  retryNow: () => void;
};

const sameList = (a: SentinelCamera[] | null, b: SentinelCamera[]) =>
  !!a && a.length === b.length && a.every((c, i) => c.id === b[i].id && c.name === b[i].name);

export function useSentinelCatalogue(): CatalogueState {
  const [cameras, setCameras] = useState<SentinelCamera[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);
  const failures = useRef(0);

  useEffect(() => {
    const ctl = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      try {
        const res = await fetch(CATALOGUE_ROUTE, { cache: "no-store", signal: ctl.signal });
        if (!res.ok) {
          const fail = (await res.json().catch(() => null)) as CatalogueError | null;
          const until = fail?.cooldownRetryAt ? Date.parse(fail.cooldownRetryAt) : NaN;
          if (Number.isFinite(until)) {
            // Nothing will change before the server's next probe; ask again just after it.
            setCooldownUntil(until);
            setError(fail?.error ?? "Sentinel cooling down");
            timer = setTimeout(load, Math.max(5_000, until - Date.now() + 2_000));
            return;
          }
          throw new Error(fail?.error ?? `HTTP ${res.status}`);
        }
        setCooldownUntil(null);
        const body = (await res.json()) as CatalogueResponse;
        failures.current = 0;
        // Same ids and names: keep the old array so no tile re-renders or reconnects.
        setCameras((prev) => (sameList(prev, body.cameras) ? prev : body.cameras));
        setFetchedAt(body.fetchedAt);
        setError(null);
        timer = setTimeout(load, REFRESH_MS);
      } catch (err) {
        if (ctl.signal.aborted) return;
        setCooldownUntil(null);
        setError((err as Error).message || "Catalogue unavailable");
        timer = setTimeout(load, backoffMs(failures.current++));
      }
    };

    void load();
    return () => {
      ctl.abort();
      clearTimeout(timer);
    };
  }, [nonce]);

  const retryNow = useCallback(() => {
    failures.current = 0;
    setNonce((n) => n + 1);
  }, []);

  return { cameras, fetchedAt, error, cooldownUntil, retryNow };
}
