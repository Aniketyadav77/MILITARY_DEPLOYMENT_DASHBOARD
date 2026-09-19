import Link from "next/link";
import { ZuluClock } from "@/components/shell/ZuluClock";
import { Icon } from "@/components/ui/Icon";
import { complianceFooter, consoleHeader, subNav } from "@/lib/alerts-data";

const divider = "text-outline-variant text-code-sm";

/** 32px command header: system title, live Zulu clock, unacknowledged badge, operator and logout. */
export function AlertsHeader() {
  return (
    <header className="flex justify-between items-center w-full px-space-md h-8 z-50 bg-surface-container-lowest border-b border-outline-variant shrink-0">
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 bg-error inline-block" />
          <span className="text-headline-sm text-on-surface uppercase tracking-wider">
            {consoleHeader.title}
          </span>
        </div>
        <span className={divider}>|</span>
        <div className="flex items-center gap-space-sm text-label-md text-on-surface-variant">
          <span>{consoleHeader.subtitle}</span>
        </div>
      </div>
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs text-code-sm text-primary tabular-nums">
          <span className="w-1.5 h-1.5 bg-secondary inline-block" />
          <ZuluClock className="" date={consoleHeader.clockDate} />
        </div>
        <div className="flex items-center gap-1 bg-error-container border border-error px-1.5 py-0.5 rounded-[2px] text-label-sm text-error">
          <span className="w-1.5 h-1.5 bg-error rounded-full animate-tactical-pulse" />
          <span>{consoleHeader.unacknowledged} UNACKNOWLEDGED</span>
        </div>
        <div className="flex items-center gap-1 text-code-sm text-primary">
          <Icon name="lock" size={13} />
          <span>{consoleHeader.status}</span>
        </div>
        <div className="flex items-center gap-1 text-outline">
          <span className="flex" title="SIPRNET AIRGAP ACTIVE">
            <Icon name="wifi_off" size={14} />
          </span>
          <span className="flex" title="PRIORITY INTERRUPTS ENABLED">
            <Icon name="notifications" size={14} />
          </span>
        </div>
        <span className={divider}>|</span>
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-1 text-code-sm text-on-surface">
            <Icon name="badge" size={13} className="text-outline" />
            <span>{consoleHeader.operator}</span>
          </div>
          <button
            type="button"
            className="px-2 py-0.5 bg-surface-container border border-outline-variant text-label-sm text-on-surface hover:bg-surface-container-high hover:text-on-surface transition-none uppercase"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
}

const tabBase = "h-full px-space-sm text-label-md";
const tabIdle = `${tabBase} text-on-surface-variant hover:text-on-surface hover:bg-surface-container`;

/** 28px console sub-navigation with sensor sync / latency readouts. */
export function AlertsSubNav() {
  return (
    <nav className="flex items-center justify-between px-space-md h-7 bg-surface-container-lowest border-b border-outline-variant shrink-0">
      <div className="flex items-center gap-space-xs h-full">
        {subNav.items.map(({ label, href, active }) => {
          if (active) {
            return (
              <button
                key={label}
                type="button"
                aria-current="page"
                className={`${tabBase} text-primary border-b-2 border-primary bg-surface-container-low flex items-center gap-1`}
              >
                <span>{label}</span>
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-tactical-pulse" />
              </button>
            );
          }
          // Destinations without a built screen stay inert, as in Stitch.
          return href ? (
            <Link key={label} href={href} className={`${tabIdle} flex items-center`}>
              {label}
            </Link>
          ) : (
            <button key={label} type="button" className={tabIdle}>
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-space-md text-code-sm text-outline">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-secondary rounded-full" /> {subNav.sensorSync}
        </span>
        <span>{subNav.latency}</span>
      </div>
    </nav>
  );
}

/** Fixed audit-compliance strip, sitting directly above the shared 56px navigation rail. */
export function AlertsFooter() {
  return (
    <footer className="fixed bottom-[56px] left-0 w-full z-50 flex justify-between items-center px-space-md py-space-xs text-code-sm bg-surface-container-lowest border-t border-outline-variant">
      <div className="flex items-center gap-space-xs text-label-sm text-on-surface-variant">
        <span className="w-1.5 h-1.5 bg-tertiary inline-block" />
        <span>{complianceFooter.notice}</span>
      </div>
      <div className="flex items-center gap-space-md text-tertiary">
        {complianceFooter.items.map((item, i) => (
          <span key={item} className="contents">
            {i > 0 && <span className="text-outline-variant">|</span>}
            <span className="hover:text-on-surface cursor-default">{item}</span>
          </span>
        ))}
      </div>
    </footer>
  );
}
