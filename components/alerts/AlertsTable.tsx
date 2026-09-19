import {
  activeAlert,
  alerts,
  type AlertRow,
  type AlertSeverity,
  type AlertStatus,
  type Classification,
  type ConfidenceTone,
} from "@/lib/alerts-data";
import { IncidentDrawer } from "./IncidentDrawer";

const cell = "px-2 py-1 border-r border-outline-variant";

const barTone: Record<ConfidenceTone, string> = {
  error: "bg-error",
  tertiary: "bg-tertiary",
  outline: "bg-outline",
  primary: "bg-primary",
  secondary: "bg-secondary",
};

const classStyle: Record<Classification, string> = {
  PERSON: "text-primary font-semibold",
  VEHICLE: "text-on-surface-variant",
  ANIMAL: "text-outline",
};

const badge = "px-1.5 py-0.5 text-label-sm border";
const neutralBadge = `${badge} bg-surface-container text-outline border-outline-variant`;

const severityStyle: Record<AlertSeverity, string> = {
  HIGH: `${badge} bg-error-container text-error border-error`,
  MED: `${badge} bg-tertiary/20 text-tertiary border-tertiary/40`,
  LOW: neutralBadge,
};

const statusStyle: Record<AlertStatus, string> = {
  UNACKNOWLEDGED: "",
  ACKNOWLEDGED: neutralBadge,
  DISPATCHED: `${badge} bg-primary/20 text-primary border-primary/40 font-semibold`,
};

function Confidence({ row, strong }: { row: AlertRow; strong?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-surface-container-highest overflow-hidden">
        <div
          className={`${barTone[row.confidenceTone]} h-full`}
          style={{ width: `${row.confidence.toFixed(1)}%` }}
        />
      </div>
      <span className={strong ? "font-semibold text-on-surface" : undefined}>
        {row.confidence.toFixed(1)}%
      </span>
    </div>
  );
}

/** The selected incident row, followed by its inline inspection drawer. */
function ActiveRow({ row }: { row: AlertRow }) {
  return (
    <>
      <tr className="bg-error-container/20 border-l-2 border-error border-b-outline-variant hover:bg-error-container/30 cursor-pointer text-on-surface">
        <td className={`${cell} font-semibold text-error`}>{row.time}</td>
        <td className={`${cell} text-primary font-semibold`}>{row.incidentId}</td>
        <td className={`${cell} text-on-surface-variant`}>{row.cameraId}</td>
        <td className="px-3 py-1 border-r border-outline-variant font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-error animate-tactical-pulse" />
          <span>{row.location}</span>
        </td>
        <td className={cell}>
          <span className="text-primary font-semibold">{row.classification}</span>
        </td>
        <td className={cell}>
          <Confidence row={row} strong />
        </td>
        <td className={cell}>
          <span className={severityStyle[row.severity]}>{row.severity}</span>
        </td>
        <td className="px-3 py-1 border-r border-outline-variant">
          <span className="px-1.5 py-0.5 bg-error text-surface-container-lowest text-label-sm font-semibold inline-flex items-center gap-1">
            <span className="w-1 h-1 bg-surface-container-lowest rounded-full animate-tactical-pulse" />
            {row.status}
          </span>
        </td>
        <td className={`${cell} text-center text-outline`}>{row.operator}</td>
        <td className="px-2 py-1 text-center">
          <button
            type="button"
            className="text-primary hover:text-on-primary-container px-1 py-0.5 bg-surface-container-high border border-outline-variant text-label-sm"
          >
            COLLAPSE
          </button>
        </td>
      </tr>
      <tr>
        <td colSpan={10} className="p-0 border-b border-error bg-[#12161e]">
          <IncidentDrawer />
        </td>
      </tr>
    </>
  );
}

function AlertTableRow({ row }: { row: AlertRow }) {
  return (
    <tr className="hover:bg-surface-container cursor-pointer">
      <td className={`${cell} font-semibold text-outline`}>{row.time}</td>
      <td className={`${cell} text-primary`}>{row.incidentId}</td>
      <td className={`${cell} text-on-surface-variant`}>{row.cameraId}</td>
      <td className="px-3 py-1 border-r border-outline-variant text-on-surface">{row.location}</td>
      <td className={`${cell} ${classStyle[row.classification]}`}>{row.classification}</td>
      <td className={cell}>
        <Confidence row={row} />
      </td>
      <td className={cell}>
        <span className={severityStyle[row.severity]}>{row.severity}</span>
      </td>
      <td className="px-3 py-1 border-r border-outline-variant">
        <span className={statusStyle[row.status]}>{row.status}</span>
      </td>
      <td
        className={`${cell} text-center text-on-surface${row.operatorStrong ? " font-semibold" : ""}`}
      >
        {row.operator}
      </td>
      <td className="px-2 py-1 text-center">
        <button
          type="button"
          className="text-outline hover:text-on-surface px-1 py-0.5 border border-transparent hover:border-outline-variant text-label-sm"
        >
          VIEW
        </button>
      </td>
    </tr>
  );
}

const head = "px-2 py-1 border-r border-outline-variant";

/** Sticky-header alert investigation table with the selected incident expanded. */
export function AlertsTable() {
  return (
    <div className="flex-1 bg-surface-container-low border border-outline-variant overflow-y-auto rounded-[2px] relative flex flex-col">
      <table className="w-full text-left border-collapse tabular-nums">
        <thead className="sticky top-0 z-20 bg-surface-container-lowest border-b border-outline-variant">
          <tr className="text-label-sm text-outline tracking-wider uppercase h-7">
            <th className={`${head} w-20`}>TIME (ZULU)</th>
            <th className={`${head} w-24`}>INCIDENT ID</th>
            <th className={`${head} w-20`}>CAMERA ID</th>
            <th className="px-3 py-1 border-r border-outline-variant">LOCATION / TACTICAL ZONE</th>
            <th className={`${head} w-24`}>CLASS</th>
            <th className={`${head} w-28`}>CONFIDENCE</th>
            <th className={`${head} w-24`}>SEVERITY</th>
            <th className="px-3 py-1 w-36 border-r border-outline-variant">STATUS</th>
            <th className={`${head} w-24 text-center`}>OPERATOR</th>
            <th className="px-2 py-1 w-20 text-center">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant text-code-sm">
          <ActiveRow row={activeAlert} />
          {alerts.map((row) => (
            <AlertTableRow key={row.incidentId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
