import { ZuluClock } from "@/components/shell/ZuluClock";
import { Icon } from "@/components/ui/Icon";
import {
  complianceFooter,
  devicesHeader as h,
  railTabs,
  railTop,
  statusStrip,
} from "@/lib/devices-data";

/** 48px diagnostics header: brand, SIPRNET + Zulu clock, section links, alert badge, operator and actions. */
export function DevicesHeader() {
  return (
    <header className="flex justify-between items-center w-full px-space-md h-12 max-w-full bg-surface-container-lowest border-b border-outline-variant shrink-0 z-30">
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-primary" />
          <span className="text-headline-sm tracking-wider uppercase text-on-surface font-bold">
            {h.title}
          </span>
        </div>
        <div className="h-4 w-[1px] bg-outline-variant" />
        <div className="flex items-center gap-2">
          <span className="text-label-sm uppercase px-1.5 py-0.5 rounded-[2px] bg-surface-container-high text-secondary border border-secondary/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            {h.secure}
          </span>
          <ZuluClock
            date={h.clockDate}
            className="text-code-sm font-code-sm text-outline tracking-wider"
          />
        </div>
      </div>

      <div className="hidden lg:flex items-center space-x-1">
        {h.links.map(({ label, active }) => (
          <button
            key={label}
            type="button"
            className={
              active
                ? "px-3 py-1 text-label-sm border-b-2 border-primary text-primary font-semibold"
                : "px-3 py-1 text-label-sm text-on-surface-variant hover:text-on-surface transition-colors duration-150"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-space-sm">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-error-container/40 border border-error text-error rounded-[2px] text-label-sm">
          <Icon name="notifications_active" size={15} filled className="align-middle" />
          <span className="font-bold">{h.unacknowledged}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-surface-container border border-outline-variant rounded-[2px]">
          <Icon name="account_circle" className="text-outline align-middle" />
          <div className="text-left">
            <div className="text-label-sm text-on-surface leading-none">{h.operator}</div>
            <div className="text-[9px] font-code-sm text-outline leading-tight">{h.operatorClearance}</div>
          </div>
        </div>
        <button
          type="button"
          className="h-8 px-3 rounded-[2px] bg-tertiary-container/30 border border-tertiary text-tertiary text-label-sm hover:bg-tertiary/20 active:bg-tertiary/30 transition-colors duration-150 flex items-center gap-1.5 font-semibold"
        >
          <Icon name="report" size={14} className="align-middle" />
          <span>{h.faultReport}</span>
        </button>
        <div className="flex items-center border-l border-outline-variant pl-2 ml-1 space-x-1">
          <button
            type="button"
            title="Timer Audit"
            aria-label="Timer Audit"
            className="w-8 h-8 flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container rounded-[2px] transition-colors duration-150"
          >
            <Icon name="timer" className="align-middle" />
          </button>
          <button
            type="button"
            title="Logout"
            aria-label="Logout"
            className="w-8 h-8 flex items-center justify-center text-outline hover:text-error hover:bg-surface-container rounded-[2px] transition-colors duration-150"
          >
            <Icon name="logout" className="align-middle" />
          </button>
        </div>
      </div>
    </header>
  );
}

const tabBase =
  "w-14 h-12 flex flex-col items-center justify-center transition-colors duration-150";

/** 64px diagnostics side rail: defence state, section tabs and utility actions. */
export function DevicesRail() {
  return (
    <aside className="flex flex-col justify-between items-center py-space-sm h-full w-16 bg-surface-container-lowest border-r border-outline-variant shrink-0 z-20">
      <div className="flex flex-col items-center w-full px-1 gap-1">
        <div className="w-10 h-10 rounded-[2px] bg-surface-container-high border border-outline-variant flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-tertiary leading-none">DEFCON</span>
          <span className="text-headline-sm text-tertiary leading-none font-bold">{railTop.defcon}</span>
        </div>
        <span className="text-[8px] font-code-sm uppercase text-secondary tracking-tighter text-center">
          {railTop.state}
        </span>
      </div>

      <nav className="flex flex-col w-full gap-1 items-center">
        {railTabs.map(({ label, icon, active }) =>
          active ? (
            <button
              key={label}
              type="button"
              title={label}
              aria-current="page"
              className={`${tabBase} bg-surface-container-high text-primary border-l-2 border-primary`}
            >
              <Icon name={icon} filled className="align-middle" />
              <span className="text-[9px] text-label-sm mt-0.5 font-semibold">{label}</span>
            </button>
          ) : (
            <button
              key={label}
              type="button"
              title={label}
              className={`${tabBase} text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-[2px]`}
            >
              <Icon name={icon} className="align-middle" />
              <span className="text-[9px] text-label-sm mt-0.5">{label}</span>
            </button>
          ),
        )}
      </nav>

      <div className="flex flex-col items-center w-full gap-2 px-1">
        <button
          type="button"
          title="PING ALL NODES"
          className="w-12 h-7 rounded-[2px] bg-surface-container border border-outline-variant hover:border-primary text-outline hover:text-primary text-[8px] font-code-sm flex items-center justify-center font-bold"
        >
          PING
        </button>
        <div className="w-8 h-[1px] bg-outline-variant my-0.5" />
        <button type="button" title="Settings" aria-label="Settings" className="text-outline hover:text-on-surface p-1">
          <Icon name="settings" size={18} className="align-middle" />
        </button>
        <button type="button" title="Security" aria-label="Security" className="text-outline hover:text-secondary p-1">
          <Icon name="shield" size={18} className="align-middle" />
        </button>
      </div>
    </aside>
  );
}

/** 40px tamper-audit strip (the primary navigation lives in the shared rail below). */
export function DevicesStatusStrip() {
  return (
    <div className="h-10 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-end px-3 shrink-0 z-30">
      <div className="hidden lg:flex items-center gap-3 text-[10px] font-code-sm text-outline">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          {statusStrip.tamper}
        </span>
        <span>{statusStrip.hash}</span>
        <span className="text-primary font-semibold">{statusStrip.audit}</span>
      </div>
    </div>
  );
}

/** 24px compliance banner. */
export function DevicesFooter() {
  return (
    <footer className="flex justify-between items-center w-full px-space-md h-6 bg-surface-container-lowest border-t border-outline-variant text-[9px] font-code-sm text-outline tracking-tight shrink-0">
      <div className="truncate">{complianceFooter.left}</div>
      <div className="hidden sm:block text-right truncate text-outline/80">{complianceFooter.right}</div>
    </footer>
  );
}
