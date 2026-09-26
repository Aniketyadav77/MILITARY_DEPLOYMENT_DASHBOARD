"use client";

import { useEffect, useState } from "react";
import { snapshotRoute } from "@/lib/sentinel/types";
import { backoffMs } from "./backoff";

export type SnapshotState =
  | { state: "idle" }
  /** No frame yet; the server is fetching the first one. */
  | { state: "pending" }
  | { state: "live"; url: string; capturedAt: number }
  /** No frame and the camera is failing upstream. */
  | { state: "down"; retryAt: number };

/** How often a visible tile asks for a newer frame. The server answers from memory. */
const POLL_MS = 4_000;
/** While the first frame is on its way. */
const PENDING_POLL_MS = 2_000;

const IDLE: SnapshotState = { state: "idle" };

/**
 * Keeps the latest still frame for a camera while `active`. A new frame is
 * swapped in only once it has fully arrived, so a tile never flashes blank.
 */
export function useSnapshot(id: string, active: boolean): SnapshotState {
  const [snap, setSnap] = useState<SnapshotState>(IDLE);

  useEffect(() => {
    if (!active) return;
    const ctl = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let failures = 0;
    let lastAt = 0;
    let url: string | null = null;

    const poll = async () => {
      let next = POLL_MS;
      try {
        const res = await fetch(snapshotRoute(id), { cache: "no-store", signal: ctl.signal });
        if (res.status === 204) {
          if (!url) setSnap({ state: "pending" });
          next = PENDING_POLL_MS;
        } else if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        } else {
          failures = 0;
          const capturedAt = Number(res.headers.get("x-captured-at")) || Date.now();
          if (capturedAt !== lastAt) {
            const blob = await res.blob();
            const prev = url;
            url = URL.createObjectURL(blob);
            lastAt = capturedAt;
            setSnap({ state: "live", url, capturedAt });
            if (prev) URL.revokeObjectURL(prev);
          } else {
            await res.body?.cancel();
          }
        }
      } catch {
        if (ctl.signal.aborted) return;
        next = backoffMs(failures++);
        // Keep showing the last frame (its age says how old); only an empty tile reads as down.
        if (!url) setSnap({ state: "down", retryAt: Date.now() + next });
      }
      if (!ctl.signal.aborted) timer = setTimeout(poll, next);
    };

    void poll();
    return () => {
      ctl.abort();
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
      setSnap(IDLE); // the revoked URL must not be rendered on reactivation
    };
  }, [id, active]);

  return active ? snap : IDLE;
}
