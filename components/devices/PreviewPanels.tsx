import { Icon } from "@/components/ui/Icon";
import { nvrPanel, terminalPanel } from "@/lib/devices-data";

const panel = "bg-surface-container border border-outline-variant rounded-[2px] flex flex-col";
const panelHeader =
  "h-8 px-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between";
const viewAll = "text-label-sm text-primary hover:underline flex items-center gap-0.5";

/** NVR storage & cluster topology preview (4 of 8 recorders). */
export function NvrPanel() {
  return (
    <div className={panel}>
      <div className={panelHeader}>
        <div className="flex items-center gap-2">
          <Icon name="dns" className="text-primary align-middle" />
          <span className="text-headline-sm text-on-surface">{nvrPanel.title}</span>
          <span className="text-label-sm text-outline">{nvrPanel.preview}</span>
        </div>
        <button type="button" className={viewAll}>
          <span>{nvrPanel.viewAll}</span>
          <Icon name="chevron_right" size={12} className="align-middle" />
        </button>
      </div>
      <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
        {nvrPanel.nodes.map((n) => {
          const warn = n.tone === "warn";
          return (
            <div
              key={n.name}
              className={`p-2 bg-surface-container-lowest border ${warn ? "border-tertiary/70" : "border-outline-variant"} rounded-[2px] flex flex-col gap-1.5`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-code-sm ${warn ? "font-bold text-tertiary" : "font-semibold text-primary"}`}>
                  {n.name}
                </span>
                <span
                  className={`text-[10px] font-code-sm px-1.5 rounded-[2px] ${warn ? "bg-error/20 text-error font-bold" : "bg-secondary/15 text-secondary"}`}
                >
                  {n.badge}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-code-sm text-outline mb-0.5">
                  <span>{n.storage}</span>
                  <span className={`${warn ? "text-tertiary" : "text-secondary"} font-bold`}>{n.pctLabel}</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-[2px] overflow-hidden">
                  <div className={`${warn ? "bg-tertiary" : "bg-secondary"} h-full`} style={{ width: `${n.pct}%` }} />
                </div>
              </div>
              <div
                className={`flex justify-between items-center text-[10px] font-code-sm pt-1 border-t border-outline-variant/60 ${warn ? "text-tertiary" : "text-outline"}`}
              >
                <span>
                  Temp: <span className={warn ? "text-tertiary" : "text-on-surface"}>{n.temp}</span>
                </span>
                <span>
                  {n.raidLabel}{" "}
                  <span className={warn ? "font-bold" : "text-secondary font-medium"}>{n.raid}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Operator terminals & workstations preview (4 of 12). */
export function TerminalPanel() {
  const [station, operator, ip, heartbeat, status] = terminalPanel.columns;
  return (
    <div className={panel}>
      <div className={panelHeader}>
        <div className="flex items-center gap-2">
          <Icon name="desktop_windows" className="text-primary align-middle" />
          <span className="text-headline-sm text-on-surface">{terminalPanel.title}</span>
          <span className="text-label-sm text-outline">{terminalPanel.preview}</span>
        </div>
        <button type="button" className={viewAll}>
          <span>{terminalPanel.viewAll}</span>
          <Icon name="chevron_right" size={12} className="align-middle" />
        </button>
      </div>
      <div className="p-2">
        <div className="border border-outline-variant rounded-[2px] overflow-hidden">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-lowest text-[10px] font-code-sm text-outline uppercase border-b border-outline-variant">
                <th className="py-1 px-2">{station}</th>
                <th className="py-1 px-2">{operator}</th>
                <th className="py-1 px-2 font-code-sm">{ip}</th>
                <th className="py-1 px-2 font-code-sm">{heartbeat}</th>
                <th className="py-1 px-2 text-right">{status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 font-code-sm text-[11px]">
              {terminalPanel.rows.map((r) => (
                <tr key={r.station} className="hover:bg-surface-container-high/50 bg-surface-container-lowest">
                  <td className={`py-1 px-2 font-semibold ${r.master ? "text-primary" : "text-on-surface"}`}>
                    {r.station}
                  </td>
                  <td className="py-1 px-2 text-on-surface">{r.operator}</td>
                  <td className="py-1 px-2 text-outline">{r.ip}</td>
                  <td className={`py-1 px-2 ${r.master ? "text-secondary" : "text-outline"}`}>{r.heartbeat}</td>
                  <td className="py-1 px-2 text-right">
                    <span
                      className={`px-1.5 text-secondary rounded-[2px] text-[9px] ${r.master ? "bg-secondary/15 font-bold" : "bg-secondary/10"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
