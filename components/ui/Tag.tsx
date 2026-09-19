import type { AlertType, Severity } from "@/lib/dashboard-data";

const typeStyles: Record<AlertType, string> = {
  PERSON: "bg-brand-blue/20 text-brand-blue",
  VEHICLE: "bg-brand-purple/20 text-brand-purple",
  ANIMAL: "bg-brand-green/20 text-brand-green",
};

/** Detection-type tag (PERSON / VEHICLE / ANIMAL). */
export function TypeTag({ type }: { type: AlertType }) {
  return (
    <span className={`px-1 text-[9px] font-bold tracking-wider ${typeStyles[type]}`}>
      {type}
    </span>
  );
}

const severityStyles: Record<Severity, string> = {
  HIGH: "bg-brand-red text-white",
  MED: "bg-brand-amber text-white",
  LOW: "bg-brand-border text-fg-3",
};

export function SeverityTag({ severity }: { severity: Severity }) {
  return (
    <span className={`px-1 text-[9px] font-bold ${severityStyles[severity]}`}>
      {severity}
    </span>
  );
}

/** Solid FAULT tag used in the device health panel. */
export function FaultTag() {
  return (
    <span className="px-1 text-[9px] font-bold bg-brand-red text-white">
      FAULT
    </span>
  );
}
