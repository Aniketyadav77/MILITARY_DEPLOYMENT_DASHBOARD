"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button, MicroLabel } from "./primitives";

const IDLE_MS = 15 * 60 * 1000;

/**
 * Unattended-terminal lock. After 15 minutes without input the console dims and
 * demands the operator password again. Any key or pointer event resets the timer.
 */
export function LockOverlay() {
  const [locked, setLocked] = useState(false);
  const [pw, setPw] = useState("");
  const [bad, setBad] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (locked) return;

    const arm = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setLocked(true), IDLE_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();

    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [locked]);

  if (!locked) return null;

  const unlock = () => {
    // Mock credential: any non-empty password re-enters the session.
    if (pw.trim().length === 0) {
      setBad(true);
      setTimeout(() => setBad(false), 400);
      return;
    }
    setPw("");
    setLocked(false);
  };

  return (
    <div
      data-testid="lock-overlay"
      className="fixed inset-0 z-[200] bg-g-bg/92 flex items-center justify-center"
    >
      <div
        className={`w-80 bg-g-panel border border-g-border-strong rounded-[4px] ${bad ? "animate-g-shake border-g-red" : ""}`}
      >
        <div className="h-8 px-3 flex items-center gap-2 border-b border-g-border">
          <Icon name="lock" size={14} className="text-g-amber" />
          <MicroLabel>Session locked · 15 min idle</MicroLabel>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <p className="text-ui text-g-text-2">
            Terminal 01 · <span className="font-data">A. VERMA</span>
          </p>
          <input
            autoFocus
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="Operator password"
            aria-label="Operator password"
            className="h-8 px-2 bg-g-bg border border-g-border-strong rounded-[2px] text-ui text-g-text placeholder:text-g-muted focus:border-g-blue focus:outline-none"
          />
          {bad && <span className="text-data font-data text-g-red">Password required</span>}
          <Button variant="primary" onClick={unlock}>
            Re-enter session
          </Button>
        </div>
      </div>
    </div>
  );
}
