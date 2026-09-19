import { AlertsByHourChart } from "@/components/dashboard/AlertsByHourChart";
import { CameraWall } from "@/components/dashboard/CameraWall";
import { DeviceHealthPanel } from "@/components/dashboard/DeviceHealthPanel";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { RealtimeAlertsPanel } from "@/components/dashboard/RealtimeAlertsPanel";

export default function DashboardPage() {
  return (
    <>
      <KpiStrip />
      {/* Main content: left 60% / right 40% */}
      <main className="flex-1 px-4 py-1 grid grid-cols-10 gap-2 min-h-0 overflow-hidden">
        <div className="col-span-6 flex flex-col gap-2 h-full min-h-0 overflow-hidden">
          <CameraWall />
          <AlertsByHourChart />
        </div>
        <div className="col-span-4 flex flex-col gap-2 h-full min-h-0 overflow-hidden">
          <RealtimeAlertsPanel />
          <DeviceHealthPanel />
        </div>
      </main>
    </>
  );
}
