import { Panel, PanelHeader } from "@/components/ui/Panel";
import { SeverityTag, TypeTag } from "@/components/ui/Tag";
import {
  alerts,
  alertsSummary,
  type Alert,
  type AlertType,
} from "@/lib/dashboard-data";

// Wireframe bounding box drawn in the 40x22 thumbnail: size and color depend on the detection type.
const boxSize: Record<AlertType, string> = {
  PERSON: "w-3.5 h-3",
  VEHICLE: "w-4 h-2.5",
  ANIMAL: "w-3 h-2",
};

const boxColor: Record<AlertType, string> = {
  PERSON: "border-brand-blue",
  VEHICLE: "border-brand-purple",
  ANIMAL: "border-brand-green",
};

function AlertRow({ alert }: { alert: Alert }) {
  const { unacknowledged } = alert;
  return (
    <div
      className={`group h-1/5 px-2.5 flex items-center justify-between ${
        unacknowledged
          ? "border-l-4 border-brand-red bg-[#1c191a] hover:bg-[#221f20]"
          : "hover:bg-hover"
      }`}
    >
      <div className="flex items-center space-x-2 min-w-0">
        <div className="w-[40px] h-[22px] bg-well border border-brand-border flex items-center justify-center shrink-0">
          <div
            className={`border ${boxSize[alert.type]} ${
              unacknowledged ? "border-brand-red" : boxColor[alert.type]
            }`}
          />
        </div>
        <div className="flex items-center space-x-1.5 min-w-0">
          <TypeTag type={alert.type} />
          <span
            className={`text-[11px] truncate ${
              unacknowledged
                ? "font-semibold text-white"
                : "font-medium text-fg-1"
            }`}
          >
            {alert.camera}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 shrink-0">
        <span className="text-[10px] font-mono text-fg-3">{alert.time}</span>
        <SeverityTag severity={alert.severity} />
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 bg-white text-black px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-none"
        >
          ACK
        </button>
      </div>
    </div>
  );
}

export function RealtimeAlertsPanel() {
  return (
    <Panel className="flex-[3] flex flex-col min-h-0 overflow-hidden">
      <PanelHeader
        title="REAL-TIME ALERTS"
        meta={alertsSummary}
        metaClassName="text-brand-red"
      />
      <div className="flex-1 flex flex-col divide-y divide-brand-border overflow-hidden">
        {alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>
    </Panel>
  );
}
