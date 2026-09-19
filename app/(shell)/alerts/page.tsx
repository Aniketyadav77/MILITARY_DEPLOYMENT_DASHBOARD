import type { Metadata } from "next";
import { AlertsFilterBar } from "@/components/alerts/AlertsFilterBar";
import { AlertsTable } from "@/components/alerts/AlertsTable";
import { metricsBar } from "@/lib/alerts-data";

export const metadata: Metadata = {
  title: "DEFCON // WATCHFLOOR AUTH GATEWAY - Tactical Alert Console",
};

export default function AlertsPage() {
  return (
    <main className="flex-1 flex flex-col p-space-sm overflow-hidden gap-space-xs bg-surface-dim">
      <AlertsFilterBar />
      <AlertsTable />
      <div className="flex items-center justify-between px-space-xs py-0.5 text-code-sm text-outline shrink-0">
        <div className="flex items-center gap-space-md">
          {metricsBar.left.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="flex items-center gap-space-md">
          <span>{metricsBar.frameLoss}</span>
          <span className="text-secondary font-semibold">{metricsBar.encrypted}</span>
        </div>
      </div>
    </main>
  );
}
