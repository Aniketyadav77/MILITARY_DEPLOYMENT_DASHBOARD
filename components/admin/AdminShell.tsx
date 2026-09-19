import { ZuluClock } from "@/components/shell/ZuluClock";
import { Icon } from "@/components/ui/Icon";
import { adminFooter, adminHeader as h } from "@/lib/admin-data";

const chip =
  "px-2 py-0.5 rounded-[2px] text-label-sm uppercase border flex items-center gap-1";

/** 40px admin header: title, DEFCON / enclave / clearance chips, operator identity and emergency lockdown. */
export function AdminHeader() {
  return (
    <header className="w-full h-10 px-3 flex items-center justify-between border-b border-outline-variant select-none bg-surface-container-lowest z-40 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon name="security" size={18} className="text-primary" />
          <span className="text-headline-sm font-semibold tracking-wide text-on-surface uppercase">
            {h.title}
          </span>
        </div>
        <div className="h-4 w-[1px] bg-outline-variant" />
        <div className="flex items-center gap-1.5">
          <span className={`${chip} bg-tertiary/10 border-tertiary/40 text-tertiary`}>
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            {h.defcon}
          </span>
          <span className={`${chip} bg-surface-container border-outline-variant text-on-surface-variant`}>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {h.siprnet}
          </span>
          <span className={`${chip} bg-surface-container border-outline-variant text-primary`}>
            <Icon name="lock" size={12} />
            {h.clearance}
          </span>
          <span
            className={`${chip} text-code-sm bg-surface-container border-outline-variant text-on-surface tabular-nums`}
          >
            <Icon name="schedule" size={12} className="text-outline" />
            <ZuluClock timeOnly className="" />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-container-low px-2.5 py-1 rounded-[2px] border border-outline-variant">
          <Icon name="vpn_key" size={15} className="text-primary" />
          <span className="text-label-md uppercase tracking-wider text-on-surface">{h.operator}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="text-label-sm text-secondary uppercase tracking-wider">{h.audit}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Keystore Lock"
            aria-label="Keystore Lock"
            className="h-7 px-2 bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface rounded-[2px] border border-outline-variant flex items-center justify-center transition-none"
          >
            <Icon name="lock" size={15} />
          </button>
          <button
            type="button"
            className="h-7 px-2.5 bg-error-container hover:bg-error text-white hover:text-on-error rounded-[2px] border border-error/50 flex items-center gap-1.5 text-label-sm uppercase tracking-wider transition-none"
          >
            <Icon name="power_settings_new" size={15} />
            {h.lockdown}
          </button>
        </div>
      </div>
    </header>
  );
}

/** 44px cryptographic / STIG strip, sitting directly above the shared navigation rail. */
export function AdminFooter() {
  return (
    <footer className="fixed bottom-[56px] left-0 w-full h-11 z-50 flex items-stretch justify-end px-2 bg-surface-container-lowest border-t border-outline-variant select-none">
      <div className="flex items-center gap-3 pr-2 text-code-sm text-outline">
        {adminFooter.items.map(({ label, kind }, i) => (
          <span key={label} className="contents">
            {i > 0 && <span className="text-outline-variant">{"//"}</span>}
            {kind === "status" ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-on-surface-variant">{label}</span>
              </div>
            ) : (
              <span
                className={
                  kind === "hash"
                    ? "text-primary tabular-nums"
                    : kind === "restricted"
                      ? "text-error font-semibold"
                      : undefined
                }
              >
                {label}
              </span>
            )}
          </span>
        ))}
      </div>
    </footer>
  );
}
