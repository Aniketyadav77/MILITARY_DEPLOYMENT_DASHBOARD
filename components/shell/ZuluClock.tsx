"use client";

import { useSyncExternalStore } from "react";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const pad = (n: number) => String(n).padStart(2, "0");

function formatZulu(now: Date, date?: string, timeOnly?: boolean) {
  const time = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  if (timeOnly) return `ZULU: ${time}Z`;
  const day = date ?? `${pad(now.getUTCDate())} ${MONTHS[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
  return `${time} HRS · ${day} ZULU`;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

// Server and hydration render show a neutral placeholder so they never mismatch the client clock.
const getServerSnapshot = () => "--:--:-- HRS · -- --- ---- ZULU";
const getServerSnapshotTimeOnly = () => "ZULU: --:--:--Z";

type ZuluClockProps = {
  className?: string;
  /** Pins the date part (e.g. "18 SEP 2026") while the time keeps running; defaults to today (UTC). */
  date?: string;
  /** Compact readout ("ZULU: 14:38:01Z") instead of the full time + date line. */
  timeOnly?: boolean;
};

/** Live UTC clock, refreshed every second. */
export function ZuluClock({
  className = "text-[12px] font-mono tracking-wider text-fg-2",
  date,
  timeOnly,
}: ZuluClockProps) {
  const text = useSyncExternalStore(
    subscribe,
    () => formatZulu(new Date(), date, timeOnly),
    timeOnly ? getServerSnapshotTimeOnly : getServerSnapshot,
  );
  return <span className={className}>{text}</span>;
}
