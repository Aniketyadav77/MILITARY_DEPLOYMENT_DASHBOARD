"use client";

import type { ReactNode } from "react";
import { IconRail, TopBar } from "./Chrome";
import { ConsoleProvider } from "./ConsoleProvider";
import { LockOverlay } from "./LockOverlay";
import { ToastProvider } from "./Toast";

/** Providers + persistent chrome. Everything live in the console hangs off this. */
export function Chrome({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConsoleProvider>
        <div className="gotham w-screen h-screen flex overflow-hidden">
          <IconRail />
          <div className="flex-1 min-w-0 flex flex-col">
            <TopBar />
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
          </div>
        </div>
        <LockOverlay />
      </ConsoleProvider>
    </ToastProvider>
  );
}
