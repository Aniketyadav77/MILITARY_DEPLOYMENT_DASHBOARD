"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

/* ---------------------------------------------------------------------- clock */

function subscribeSecond(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Wall clock, ticking every second. The server snapshot is a fixed placeholder so
 * hydration never mismatches; the real time appears on the first client tick.
 */
export function useClock() {
  return useSyncExternalStore(
    subscribeSecond,
    () => {
      const d = new Date();
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    () => "--:--:--",
  );
}

/* ------------------------------------------------------------------- sortable */

export type SortDir = "asc" | "desc";

/**
 * Column sorting for any table. Clicking the active column flips direction;
 * clicking another column starts it descending, which is what operators expect
 * from a time-ordered log.
 */
export function useSortable<T>(rows: T[], initialKey: keyof T & string, initialDir: SortDir = "desc") {
  const [key, setKey] = useState<string>(initialKey);
  const [dir, setDir] = useState<SortDir>(initialDir);

  const toggle = useCallback(
    (k: string) => {
      if (k === key) {
        setDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setKey(k);
        setDir("desc");
      }
    },
    [key],
  );

  const sorted = useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av = (a as Record<string, unknown>)[key];
      const bv = (b as Record<string, unknown>)[key];
      let c: number;
      if (typeof av === "number" && typeof bv === "number") c = av - bv;
      else c = String(av ?? "").localeCompare(String(bv ?? ""));
      return dir === "asc" ? c : -c;
    });
    return out;
  }, [rows, key, dir]);

  return { sorted, key, dir, toggle };
}

/* -------------------------------------------------------------------- hotkeys */

type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

/** Global key handling that stands down while the operator is typing in a field. */
export function useHotkeys(map: HotkeyMap, enabled = true) {
  const ref = useRef(map);
  // Refs are synchronised in an effect; writing them during render is not allowed.
  useEffect(() => {
    ref.current = map;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      // Escape must still work from inside a field so filters can be dismissed.
      if (typing && e.key !== "Escape") return;
      const fn = ref.current[e.key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}

/* ---------------------------------------------------------------- interval fx */

/** setInterval with a live callback and a pausable delay (null = paused). */
export function useInterval(fn: () => void, delay: number | null) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  });
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
