import type { Metadata } from "next";
import { DevicesToolbar, KpiCards } from "@/components/devices/DevicesOverview";
import { NvrPanel, TerminalPanel } from "@/components/devices/PreviewPanels";
import { SensorMatrix } from "@/components/devices/SensorMatrix";

export const metadata: Metadata = {
  title: "ISCC // SYS-DIAGNOSTICS & TELEMETRY",
};

export default function DevicesPage() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto custom-scroll p-2.5 gap-2.5">
      <DevicesToolbar />
      <KpiCards />
      <SensorMatrix />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 pb-2">
        <NvrPanel />
        <TerminalPanel />
      </div>
    </main>
  );
}
