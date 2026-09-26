"use client";

import { useEffect, useState, type RefObject } from "react";
import type Hls from "hls.js";
import type { ErrorData } from "hls.js";
import { MAX_OPEN_FEEDS } from "@/lib/sentinel/types";
import { backoffMs } from "./backoff";

export type FeedStatus =
  | { state: "idle" }
  /** On screen, waiting for one of the MAX_OPEN_FEEDS player slots. */
  | { state: "queued" }
  | { state: "connecting" }
  | { state: "live" }
  /** Connected, but no new frame has been presented for a while. */
  | { state: "stalled"; lastFrameAt: number }
  | { state: "retrying"; retryAt: number }
  | { state: "unsupported" };

/** Join = playlist + key + first segment; the gateway's first response can be slow. */
const FIRST_FRAME_TIMEOUT_MS = 30_000;
/** Inter-frame gaps are normal; only a gap this long is surfaced as "stalled". */
const STALL_MS = 5_000;
/** A gap this long is treated as a dead connection and reconnected. */
const DEAD_MS = 20_000;
/** A connection must stay healthy this long before the backoff resets. */
const HEALTHY_RESET_MS = 15_000;

/** Codec failures won't fix themselves on retry in the same browser. */
const UNSUPPORTED = new Set<string>([
  "manifestIncompatibleCodecsError",
  "bufferIncompatibleCodecsError",
  "bufferAddCodecError",
]);

const IDLE: FeedStatus = { state: "idle" };

/**
 * Feeds allowed to be joining (playlist + key + first segment) at once.
 * A playing feed fetches one segment every few seconds, but a join is a burst;
 * 25 tiles joining together queue behind the browser's 6 connections per origin
 * and all time out before their first frame. Joins are paced through this gate.
 */
const MAX_JOINING = 3;

type Slot = { immediate: boolean; release: () => void };

/**
 * A counting semaphore shared by every tile on the page. Queue order is
 * first-come, except that a feed reconnecting after a failure goes to the front:
 * it was already on the wall. `release` is safe to call more than once and
 * cancels the wait if the slot was not yet granted.
 */
function createGate(limit: number) {
  let held = 0;
  const queue: Array<() => void> = [];

  return function request(onGranted: () => void, front: boolean): Slot {
    let state: "waiting" | "held" | "done" = "waiting";
    const grant = () => {
      state = "held";
      held++;
      onGranted();
    };
    const immediate = held < limit && queue.length === 0;
    if (immediate) grant();
    else if (front) queue.unshift(grant);
    else queue.push(grant);

    const release = () => {
      if (state === "waiting") {
        const i = queue.indexOf(grant);
        if (i >= 0) queue.splice(i, 1);
      } else if (state === "held") {
        held--;
        queue.shift()?.();
      }
      state = "done";
    };
    return { immediate, release };
  };
}

/** Players open at once; visible tiles beyond this wait on standby. */
const requestPlayerSlot = createGate(MAX_OPEN_FEEDS);
/** Of those, players still joining; released at the first presented frame. */
const requestJoinSlot = createGate(MAX_JOINING);

let hlsModule: Promise<typeof Hls> | null = null;
const loadHls = () => (hlsModule ??= import("hls.js").then((m) => m.default));

/**
 * Sentinel's HLS playlists are finite loops (VOD + ENDLIST), which the portal
 * presents as live by playing each camera at `now mod duration`. Doing the same
 * keeps every viewer on the same moment and makes reconnects rejoin "now"
 * instead of replaying from the top.
 */
const wallClockPosition = (duration: number) => (Date.now() / 1000) % duration;

/**
 * Plays one HLS feed into `videoRef` while `active`, and owns its recovery:
 * exponential backoff on failure, silent handling of loop-point cuts and
 * non-fatal decoder noise, and staleness judged from frames actually presented.
 * Going inactive (off screen, tab hidden, unmounted) closes the connection.
 */
export function useLiveFeed(videoRef: RefObject<HTMLVideoElement | null>, src: string, active: boolean): FeedStatus {
  const [status, setStatus] = useState<FeedStatus>(IDLE);

  useEffect(() => {
    const video = videoRef.current;
    if (!active || !video) return;

    let disposed = false;
    let hls: Hls | null = null;
    let attempt = 0;
    let shown: FeedStatus["state"] = "idle";

    let connectStartedAt = 0;
    let lastFrameAt = 0; // performance.now() of the last presented frame, 0 = none yet
    let lastFrameEpoch = 0;
    let decodedFrames = 0;
    let lastMediaRecoverAt = -Infinity;
    let vodDuration = 0; // > 0 only for finite (VOD-backed) sources

    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let healthyTimer: ReturnType<typeof setTimeout> | undefined;
    let watchdog: ReturnType<typeof setInterval> | undefined;
    let frameHandle: number | undefined;
    let releasePlayer: (() => void) | undefined;
    let releaseJoin: (() => void) | undefined;
    const freeJoin = () => {
      releaseJoin?.();
      releaseJoin = undefined;
    };
    const freeSlots = () => {
      freeJoin();
      releasePlayer?.();
      releasePlayer = undefined;
    };
    const hasFrameCallback = "requestVideoFrameCallback" in HTMLVideoElement.prototype;

    const report = (next: FeedStatus) => {
      if (disposed) return;
      shown = next.state;
      setStatus(next);
    };

    const markFrame = () => {
      const first = lastFrameAt === 0;
      lastFrameAt = performance.now();
      lastFrameEpoch = Date.now();
      if (first) {
        freeJoin(); // joined: let the next tile start
        clearTimeout(healthyTimer);
        healthyTimer = setTimeout(() => (attempt = 0), HEALTHY_RESET_MS);
      }
      if (shown !== "live") report({ state: "live" });
    };

    const onFrame = () => {
      markFrame();
      frameHandle = video.requestVideoFrameCallback(onFrame);
    };

    const teardown = () => {
      freeSlots();
      clearInterval(watchdog);
      clearTimeout(healthyTimer);
      if (frameHandle !== undefined) video.cancelVideoFrameCallback(frameHandle);
      frameHandle = undefined;
      if (hls) {
        hls.destroy();
        hls = null;
      }
      video.removeAttribute("src");
      video.load();
    };

    const fail = (why: "error" | "stalled" | "unsupported", detail?: string) => {
      if (disposed) return;
      teardown();
      if (why === "unsupported") {
        console.info(`[feed] ${src}: unsupported in this browser (${detail})`);
        report({ state: "unsupported" });
        return;
      }
      const delay = backoffMs(attempt++);
      console.info(`[feed] ${src}: ${why}${detail ? ` (${detail})` : ""} — reconnecting in ${Math.round(delay / 1000)}s`);
      report({ state: "retrying", retryAt: Date.now() + delay });
      retryTimer = setTimeout(() => connect(true), delay);
    };

    const tick = () => {
      const now = performance.now();

      // Without requestVideoFrameCallback, count decoded frames instead.
      if (!hasFrameCallback) {
        const n = video.getVideoPlaybackQuality?.().totalVideoFrames ?? 0;
        if (n > decodedFrames) {
          decodedFrames = n;
          markFrame();
        }
      }

      if (lastFrameAt === 0) {
        if (now - connectStartedAt > FIRST_FRAME_TIMEOUT_MS) fail("stalled", "no first frame");
        return;
      }

      const gap = now - lastFrameAt;
      if (gap > DEAD_MS) return fail("stalled", `no frame for ${Math.round(gap / 1000)}s`);
      if (gap > STALL_MS && shown === "live") report({ state: "stalled", lastFrameAt: lastFrameEpoch });

      // No mid-play seeking to catch up with the wall clock: jumping ahead
      // discards the buffer and, on a slow link, just causes the next stall.
      // A feed that fell behind is re-aligned only when it next (re)joins.

      // Muted autoplay can still be paused by the browser (e.g. power saving).
      if (video.paused && !video.ended) video.play().catch(() => {});
    };

    const startWatching = () => {
      connectStartedAt = performance.now();
      lastFrameAt = 0;
      decodedFrames = 0;
      if (hasFrameCallback) frameHandle = video.requestVideoFrameCallback(onFrame);
      watchdog = setInterval(tick, 1000);
    };

    /**
     * Take a player slot (standby if the wall is full), then a join slot, then
     * join. The first-frame timeout only starts once the join actually begins.
     */
    const connect = (reconnecting = false) => {
      if (disposed) return;
      const player = requestPlayerSlot(() => {
        report({ state: "connecting" });
        releaseJoin = requestJoinSlot(() => void join(), reconnecting).release;
      }, reconnecting);
      releasePlayer = player.release;
      if (!player.immediate) report({ state: "queued" });
    };

    const join = async () => {
      if (disposed) return;
      vodDuration = 0;

      const HlsCtor = await loadHls().catch(() => null);
      if (disposed) return;

      if (HlsCtor?.isSupported()) {
        const h = new HlsCtor({
          autoStartLoad: false,
          lowLatencyMode: false,
          capLevelToPlayerSize: true,
          // A small forward buffer: this is a wall of previews, not a VOD player.
          maxBufferLength: 8,
          maxMaxBufferLength: 16,
          backBufferLength: 10,
        });
        hls = h;

        h.on(HlsCtor.Events.MANIFEST_LOADED, (_, data) => {
          const details = data.levels[0]?.details;
          if (details && !details.live && details.totalduration > 1) {
            vodDuration = details.totalduration;
            h.startLoad(wallClockPosition(vodDuration));
          } else {
            h.startLoad(-1); // genuinely live (or a multivariant playlist): join at the live edge
          }
        });
        h.on(HlsCtor.Events.LEVEL_LOADED, (_, data) => {
          if (!vodDuration && !data.details.live && data.details.totalduration > 1) {
            vodDuration = data.details.totalduration;
          }
        });
        h.on(HlsCtor.Events.ERROR, (_, data: ErrorData) => {
          // Non-fatal errors (decoder warnings on join, buffer stalls at the loop
          // point, a retried fragment) are hls.js recovering by itself.
          if (!data.fatal) return;
          if (UNSUPPORTED.has(data.details)) return fail("unsupported", data.details);
          if (data.type === HlsCtor.ErrorTypes.MEDIA_ERROR && performance.now() - lastMediaRecoverAt > 10_000) {
            lastMediaRecoverAt = performance.now();
            h.recoverMediaError();
            return;
          }
          fail("error", data.details);
        });

        h.attachMedia(video);
        h.loadSource(src);
        startWatching();
        video.play().catch(() => {});
        return;
      }

      // Safari without MSE: native HLS.
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        startWatching();
        video.play().catch(() => {});
        return;
      }

      fail("unsupported", "no HLS support");
    };

    const onMetadata = () => {
      if (hls || !Number.isFinite(video.duration) || video.duration <= 1) return;
      vodDuration = video.duration;
      video.currentTime = wallClockPosition(vodDuration);
    };
    // The loop point: a hard scene cut back to the top. Normal, not an error.
    const onEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    const onNativeError = () => {
      if (!hls && video.getAttribute("src")) fail("error", `media error ${video.error?.code ?? "?"}`);
    };

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onNativeError);
    void connect();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onNativeError);
      teardown();
    };
  }, [videoRef, src, active]);

  return active ? status : IDLE;
}
