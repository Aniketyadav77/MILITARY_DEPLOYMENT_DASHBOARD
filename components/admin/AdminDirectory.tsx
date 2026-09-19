import { Icon } from "@/components/ui/Icon";
import { directory, type DirectoryEntry } from "@/lib/admin-data";

const badgeTone: Record<DirectoryEntry["badgeTone"], string> = {
  primary: "bg-primary/20 text-primary border border-primary/40",
  outline: "bg-surface-container border border-outline-variant text-outline",
  secondary: "bg-surface-container border border-outline-variant text-secondary",
};

const enclaveTone = {
  secondary: "text-secondary font-semibold",
  primary: "text-primary font-semibold",
  default: "text-on-surface tabular-nums",
} as const;

/** 240px administration directory rail with the enclave-integrity box at the bottom. */
export function AdminDirectory() {
  const e = directory.enclave;
  return (
    <aside className="w-60 border-r border-outline-variant bg-surface-container-lowest flex flex-col justify-between shrink-0">
      <div className="flex flex-col">
        <div className="h-9 px-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">
            {directory.title}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-surface-container border border-outline-variant text-secondary uppercase">
            {directory.badge}
          </span>
        </div>
        <nav className="p-1.5 space-y-0.5">
          {directory.items.map(({ label, icon, badge, badgeTone: tone, active }) =>
            active ? (
              <button
                key={label}
                type="button"
                aria-current="page"
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-[2px] bg-surface-container-high text-primary border-l-2 border-primary font-semibold text-label-md uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Icon name={icon} />
                  <span>{label}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-[2px] ${badgeTone[tone]}`}>
                  {badge}
                </span>
              </button>
            ) : (
              <button
                key={label}
                type="button"
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-[2px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface text-label-md uppercase tracking-wider border-l-2 border-transparent transition-none"
              >
                <div className="flex items-center gap-2">
                  <Icon name={icon} className="text-outline" />
                  <span>{label}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-[2px] ${badgeTone[tone]}`}>
                  {badge}
                </span>
              </button>
            ),
          )}
        </nav>
      </div>

      <div className="p-3 border-t border-outline-variant bg-surface-container-low space-y-2">
        <div className="flex items-center justify-between text-label-sm text-outline uppercase tracking-wider">
          <span>{e.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        </div>
        <div className="p-2 rounded-[2px] bg-surface-container-lowest border border-outline-variant space-y-1.5">
          {e.rows.map(({ label, value, tone }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[9px] text-outline uppercase">{label}</span>
              <span className={`text-[9px] ${enclaveTone[tone]}`}>{value}</span>
            </div>
          ))}
          <div className="pt-1 border-t border-outline-variant flex items-center justify-between text-[9px] text-outline">
            <span>{e.compliance.label}</span>
            <span className="text-on-surface">{e.compliance.value}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
