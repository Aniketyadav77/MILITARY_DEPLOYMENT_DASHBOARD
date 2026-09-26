"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MAX_OPEN_FEEDS, hlsPlaylistRoute, type SentinelCamera } from "@/lib/sentinel/types";
import { useClock, useEpochSecond, useInView, usePageVisible } from "../hooks";
import { Button, EmptyState, MicroLabel, StatusDot } from "../primitives";
import { useLiveFeed, type FeedStatus } from "./useLiveFeed";
import { useSentinelCatalogue } from "./useSentinelCatalogue";
import { useSnapshot, type SnapshotState } from "./useSnapshot";

/* ------------------------------------------------------------------- overlay */

function FeedBadge({ status }: { status: FeedStatus }) {
  switch (status.state) {
    case "live":
      return (
        <span className="flex items-center gap-1 shrink-0">
          <StatusDot tone="red" className="animate-pulse" />
          <span className="text-micro text-g-text-2">LIVE</span>
        </span>
      );
    case "stalled":
      return <span className="text-micro text-g-amber shrink-0">STALLED</span>;
    case "retrying":
      return <span className="text-micro text-g-red shrink-0">RETRYING</span>;
    case "unsupported":
      return <span className="text-micro text-g-amber shrink-0">CODEC</span>;
    case "connecting":
      return <span className="text-micro text-g-muted shrink-0">JOINING</span>;
    case "queued":
      return <span className="text-micro text-g-muted shrink-0">STANDBY</span>;
    default:
      return <StatusDot tone="idle" className="shrink-0" />;
  }
}

/** Centre message for every state that isn't a moving picture. */
function FeedNotice({ status, big }: { status: FeedStatus; big?: boolean }) {
  const now = useEpochSecond();
  const size = big ? 40 : 18;

  if (status.state === "live") return null;
  if (status.state === "retrying") {
    const secs = Math.max(0, Math.ceil(status.retryAt / 1000 - now));
    return (
      <span className="flex flex-col items-center gap-1 text-g-red">
        <Icon name="videocam_off" size={size} />
        <span className="text-micro uppercase">Feed unavailable · retrying{secs ? ` in ${secs}s` : "…"}</span>
      </span>
    );
  }
  if (status.state === "stalled") {
    const secs = Math.max(0, Math.round(now - status.lastFrameAt / 1000));
    return (
      <span className="flex flex-col items-center gap-1 text-g-amber bg-g-bg/70 px-2 py-1">
        <span className="text-micro uppercase">No new frame for {secs}s</span>
      </span>
    );
  }
  if (status.state === "unsupported") {
    return (
      <span className="flex flex-col items-center gap-1 text-g-amber text-center px-2">
        <Icon name="videocam_off" size={size} />
        <span className="text-micro uppercase">Codec not supported by this browser</span>
      </span>
    );
  }
  return (
    <span className="flex flex-col items-center gap-1 text-g-muted">
      <Icon name="videocam" size={size} className="text-g-border-strong" />
      <span className="text-micro uppercase text-center px-2">
        {status.state === "connecting"
          ? "Joining live feed…"
          : status.state === "queued"
            ? `Standby · ${MAX_OPEN_FEEDS} feeds open — click to focus`
            : "Standby"}
      </span>
    </span>
  );
}

/* --------------------------------------------------------------------- tiles */

/** A still older than this is flagged: a few refresh cycles (~30s each) have been missed. */
const STALE_S = 90;

type TileState = "live" | "stale" | "pending" | "down";

const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString([], { hour12: false });

function tileState(snap: SnapshotState, now: number): TileState | null {
  if (snap.state === "idle") return null;
  if (snap.state === "live") return now - snap.capturedAt / 1000 > STALE_S ? "stale" : "live";
  return snap.state;
}

type TileProps = {
  cam: SentinelCamera;
  onOpen: (id: string) => void;
  onStatus: (id: string, state: TileState | null) => void;
};

/**
 * One camera in the grid: its latest still, refreshed every few seconds while
 * the tile is on screen and the tab is visible. Click for full-motion video.
 */
const SnapshotTile = memo(function SnapshotTile({ cam, onOpen, onStatus }: TileProps) {
  const boxRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(boxRef);
  const pageVisible = usePageVisible();
  const now = useEpochSecond();
  const snap = useSnapshot(cam.id, inView && pageVisible);
  const state = tileState(snap, now);

  useEffect(() => {
    onStatus(cam.id, state);
  }, [cam.id, state, onStatus]);
  useEffect(() => () => onStatus(cam.id, null), [cam.id, onStatus]);

  const age = snap.state === "live" ? Math.max(0, Math.round(now - snap.capturedAt / 1000)) : 0;

  return (
    <button
      ref={boxRef}
      type="button"
      data-testid={`live-tile-${cam.id}`}
      data-feed={state ?? "idle"}
      onClick={() => onOpen(cam.id)}
      title={`${cam.id} · ${cam.name} — click for live video`}
      className="relative aspect-video bg-g-bg border border-g-border hover:border-g-border-strong rounded-[2px] overflow-hidden text-left transition-none"
    >
      {snap.state === "live" && (
        // eslint-disable-next-line @next/next/no-img-element -- a blob: URL, refreshed every few seconds
        <img src={snap.url} alt={cam.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      )}

      <div className="absolute inset-0 flex flex-col justify-between p-1.5 pointer-events-none">
        <div className="flex items-center justify-between gap-1 bg-gradient-to-b from-g-bg/80 to-transparent -m-1.5 p-1.5">
          <span className="text-micro uppercase text-g-text-2 truncate">
            {cam.id} · {cam.name}
          </span>
          {state === "live" ? (
            <span className="flex items-center gap-1 shrink-0">
              <StatusDot tone="red" className="animate-pulse" />
              <span className="text-micro text-g-text-2">LIVE</span>
            </span>
          ) : state === "stale" ? (
            <span className="text-micro text-g-amber shrink-0">{age}s AGO</span>
          ) : state === "down" ? (
            <span className="text-micro text-g-red shrink-0">RETRYING</span>
          ) : state === "pending" ? (
            <span className="text-micro text-g-muted shrink-0">ACQUIRING</span>
          ) : (
            <StatusDot tone="idle" className="shrink-0" />
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {snap.state !== "live" && (
            <span className={`flex flex-col items-center gap-1 ${snap.state === "down" ? "text-g-red" : "text-g-muted"}`}>
              <Icon name={snap.state === "down" ? "videocam_off" : "videocam"} size={18} />
              <span className="text-micro uppercase text-center px-2">
                {snap.state === "down"
                  ? `Feed unavailable · retrying in ${Math.max(0, Math.ceil(snap.retryAt / 1000 - now))}s`
                  : snap.state === "pending"
                    ? "Acquiring feed…"
                    : "Standby"}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 bg-gradient-to-t from-g-bg/80 to-transparent -m-1.5 p-1.5">
          <span className="text-micro uppercase text-g-muted truncate">
            Sentinel · {snap.state === "live" ? `frame ${age}s ago` : "still"}
          </span>
          <span className="text-micro font-data text-g-muted shrink-0">
            {snap.state === "live" ? fmtTime(snap.capturedAt) : "--:--:--"}
          </span>
        </div>
      </div>
    </button>
  );
});

/**
 * The focused camera: full-motion HLS video, with the camera's latest still
 * behind it while the stream joins.
 */
function FocusTile({ cam, onClose }: { cam: SentinelCamera; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pageVisible = usePageVisible();
  const clock = useClock();
  const status = useLiveFeed(videoRef, hlsPlaylistRoute(cam.id), pageVisible);
  const picture = status.state === "live" || status.state === "stalled";
  const snap = useSnapshot(cam.id, pageVisible && !picture);

  return (
    <button
      type="button"
      data-testid={`focus-tile-${cam.id}`}
      data-feed={status.state}
      onClick={onClose}
      title={`${cam.id} · ${cam.name} — click to return to the grid`}
      className="relative h-full w-full bg-g-bg border border-g-blue rounded-[2px] overflow-hidden text-left transition-none"
    >
      {!picture && snap.state === "live" && (
        // eslint-disable-next-line @next/next/no-img-element -- a blob: URL
        <img src={snap.url} alt="" className="absolute inset-0 w-full h-full object-contain opacity-60" draggable={false} />
      )}
      <video
        ref={videoRef}
        muted
        playsInline
        disablePictureInPicture
        preload="none"
        className={`absolute inset-0 w-full h-full object-contain ${picture ? "" : "invisible"}`}
      />

      <div className="absolute inset-0 flex flex-col justify-between p-1.5 pointer-events-none">
        <div className="flex items-center justify-between gap-1 bg-gradient-to-b from-g-bg/80 to-transparent -m-1.5 p-1.5">
          <span className="text-micro uppercase text-g-text-2 truncate">
            {cam.id} · {cam.name}
          </span>
          <FeedBadge status={status} />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <FeedNotice status={status} big />
        </div>

        <div className="flex items-center justify-between gap-1 bg-gradient-to-t from-g-bg/80 to-transparent -m-1.5 p-1.5">
          <span className="text-micro uppercase text-g-muted truncate">Sentinel · HLS video</span>
          <span className="text-micro font-data text-g-muted shrink-0">{picture ? clock : "--:--:--"}</span>
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------------- wall */

/**
 * Live Gujarat camera wall, fed by the Sentinel catalogue. One tile per camera
 * the catalogue currently returns — nothing about the set is assumed. Tiles show
 * each camera's current frame, refreshed continuously (the gateway can't carry
 * 30 video streams at once); click a tile for full-motion video, Esc returns.
 */
export function LiveCameraWall() {
  const { cameras, fetchedAt, error, cooldownUntil, retryNow } = useSentinelCatalogue();
  const [focusId, setFocusId] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<Record<string, TileState>>({});

  const onStatus = useCallback((id: string, state: TileState | null) => {
    setFeeds((prev) => {
      if (state === null) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return prev[id] === state ? prev : { ...prev, [id]: state };
    });
  }, []);

  useEffect(() => {
    if (!focusId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocusId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusId]);

  // A camera dropped from the catalogue can't stay focused.
  const focused = cameras?.find((c) => c.id === focusId) ?? null;

  const counts = useMemo(() => {
    const ids = new Set(cameras?.map((c) => c.id));
    let live = 0;
    let stale = 0;
    let down = 0;
    for (const [id, s] of Object.entries(feeds)) {
      if (!ids.has(id)) continue;
      if (s === "live") live++;
      else if (s === "stale") stale++;
      else if (s === "down") down++;
    }
    return { live, stale, down };
  }, [cameras, feeds]);

  return (
    <section className="flex-1 bg-g-panel border border-g-border rounded-[4px] flex flex-col min-h-0">
      <header className="h-8 px-3 flex items-center justify-between border-b border-g-border shrink-0">
        <MicroLabel>Gujarat · Sentinel camera grid</MicroLabel>
        <div className="flex items-center gap-3">
          {cooldownUntil ? (
            <span className="text-micro uppercase text-g-amber" title={error ?? undefined} data-testid="wall-cooldown">
              Sentinel watch-time limit · cooling down
            </span>
          ) : (
            error &&
            cameras && (
              <span className="text-micro uppercase text-g-amber" title={error}>
                Catalogue stale · retrying
              </span>
            )
          )}
          {cameras && (
            <span className="text-micro font-data text-g-muted" data-testid="wall-counts">
              {counts.live} live · {counts.stale} stale · {counts.down} down · {cameras.length} cameras
            </span>
          )}
          {fetchedAt && (
            <span className="text-micro font-data text-g-muted" title="Catalogue last read">
              CAT {new Date(fetchedAt).toLocaleTimeString([], { hour12: false })}
            </span>
          )}
          {focused && (
            <button
              type="button"
              data-testid="wall-exit-focus"
              onClick={() => setFocusId(null)}
              className="text-micro uppercase text-g-blue hover:underline flex items-center gap-1"
            >
              <Icon name="fullscreen_exit" size={12} />
              Exit focus · Esc
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 p-2 overflow-y-auto">
        {!cameras ? (
          cooldownUntil ? (
            <EmptyState message="Sentinel's watch-time limit for this account is reached. Feeds resume automatically when the provider's cooldown ends (checked every minute)." />
          ) : error ? (
            <EmptyState message="Camera catalogue unavailable — retrying" actionLabel="Retry now" onAction={retryNow} />
          ) : (
            <EmptyState message="Loading camera catalogue…" />
          )
        ) : cameras.length === 0 ? (
          <EmptyState message="The catalogue currently lists no cameras" actionLabel="Reload" onAction={retryNow} />
        ) : focused ? (
          <div className="h-full" data-testid="wall-focus">
            <FocusTile key={focused.id} cam={focused} onClose={() => setFocusId(null)} />
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2" data-testid="live-grid">
            {cameras.map((c) => (
              <SnapshotTile key={c.id} cam={c} onOpen={setFocusId} onStatus={onStatus} />
            ))}
          </div>
        )}
      </div>

      {cameras && error && cameras.length > 0 && (
        <footer className="h-7 px-3 flex items-center justify-end border-t border-g-border shrink-0">
          <Button size="sm" variant="ghost" onClick={retryNow}>
            Refresh catalogue
          </Button>
        </footer>
      )}
    </section>
  );
}
