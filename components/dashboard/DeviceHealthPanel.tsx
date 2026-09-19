import { Panel, PanelHeader } from "@/components/ui/Panel";
import { FaultTag } from "@/components/ui/Tag";
import { nvrs, type Nvr } from "@/lib/dashboard-data";

function DeviceRow({ nvr }: { nvr: Nvr }) {
  const fault = nvr.status === "FAULT";
  return (
    <div
      className={`flex-1 px-3 flex items-center justify-between ${
        fault ? "bg-[#201517] hover:bg-[#25181a]" : "hover:bg-hover"
      }`}
    >
      <div className="flex items-center space-x-2.5">
        <span
          className={`w-2 h-2 ${fault ? "bg-brand-amber" : "bg-brand-green"}`}
        />
        <div>
          <div className="text-[11px] font-semibold text-white leading-tight">
            {nvr.name}
          </div>
          <div
            className={`text-[10px] ${fault ? "text-brand-red" : "text-fg-3"}`}
          >
            {nvr.detail}
          </div>
        </div>
      </div>
      {fault ? (
        <div className="flex items-center space-x-2">
          <FaultTag />
        </div>
      ) : (
        <div className="text-[10px] font-mono text-brand-green">
          {nvr.status}
        </div>
      )}
    </div>
  );
}

export function DeviceHealthPanel() {
  return (
    <Panel className="flex-[2] flex flex-col min-h-0 overflow-hidden">
      <PanelHeader title="DEVICE HEALTH" meta="STORAGE INFRASTRUCTURE" />
      <div className="flex-1 flex flex-col divide-y divide-brand-border overflow-hidden">
        {nvrs.map((nvr) => (
          <DeviceRow key={nvr.id} nvr={nvr} />
        ))}
      </div>
    </Panel>
  );
}
