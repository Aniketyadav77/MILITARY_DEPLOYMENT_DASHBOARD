import { Panel } from "@/components/ui/Panel";
import { alertsByHour, alertsByHourPeak } from "@/lib/dashboard-data";

/** 128px, 12-bar alerts-per-hour chart. The peak bar is red, the rest blue. */
export function AlertsByHourChart() {
  return (
    <Panel className="h-[128px] p-2 flex flex-col shrink-0">
      <div className="flex justify-between items-center pb-1 mb-1 border-b border-brand-border">
        <span className="text-[11px] font-bold text-fg-1 uppercase tracking-wider">
          ALERTS BY HOUR (12H)
        </span>
        <span className="text-[10px] font-mono text-fg-3">
          {alertsByHourPeak}
        </span>
      </div>
      <div className="flex-1 flex items-end justify-between gap-1.5 px-2 pt-1">
        {alertsByHour.map((bar) => (
          <div
            key={bar.hour}
            className="flex-1 flex flex-col items-center h-full justify-end"
          >
            <div
              className={`w-full ${bar.peak ? "bg-brand-red" : "bg-brand-blue"}`}
              style={{ height: `${bar.height}%` }}
            />
            <span className="text-[9px] font-mono text-fg-3 mt-1">
              {bar.hour}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
