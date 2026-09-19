import { operator } from "@/lib/dashboard-data";
import { ZuluClock } from "./ZuluClock";

/** 48px top bar: system title, live Zulu clock, unacknowledged badge and operator. */
export function TopBar() {
  return (
    <header className="h-[48px] bg-brand-panel border-b border-brand-border px-4 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center">
        <span className="text-[13px] font-bold tracking-wider text-white uppercase">
          ISCC // COMMAND WATCHFLOOR
        </span>
      </div>
      <div className="flex items-center text-center">
        <ZuluClock />
      </div>
      <div className="flex items-center space-x-3">
        <div className="bg-brand-red text-white text-[11px] font-bold px-2 py-0.5 tracking-wider uppercase">
          {operator.unacknowledged} UNACKNOWLEDGED
        </div>
        <div className="text-[12px] text-fg-2 font-mono">
          {operator.name} · {operator.serviceId}
        </div>
      </div>
    </header>
  );
}
