import { kpis, type Kpi } from "@/lib/dashboard-data";

const toneStyles: Record<Kpi["tone"], string> = {
  default: "text-white",
  red: "text-brand-red",
  amber: "text-brand-amber",
};

/** 90px strip of four KPI cards. */
export function KpiStrip() {
  return (
    <section className="h-[90px] px-4 py-2 grid grid-cols-4 gap-2 shrink-0 bg-brand-bg">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-brand-panel border border-brand-border flex flex-col justify-center px-4"
        >
          <div
            className={`text-[26px] font-bold tracking-tight leading-none ${toneStyles[kpi.tone]}`}
          >
            {kpi.value}
          </div>
          <div className="text-[10px] font-bold text-fg-3 tracking-wider uppercase mt-1.5">
            {kpi.label}
          </div>
        </div>
      ))}
    </section>
  );
}
