import Image from "next/image";
import { ZuluClock } from "@/components/shell/ZuluClock";
import { Icon } from "@/components/ui/Icon";
import { mapFooter, mapHeader as h } from "@/lib/map-data";

const chip = "px-space-xs py-0.5 border border-outline-variant bg-surface-container-lowest";
const iconButton = "p-1 hover:bg-surface-bright hover:text-on-surface transition-colors";

/** 40px tactical command header: brand, telemetry chips, filter, Zulu clock, acknowledge-all and operator. */
export function MapHeader() {
  return (
    <header className="flex justify-between items-center w-full px-space-md h-10 border-b border-outline-variant bg-surface-container shrink-0 z-30">
      <div className="flex items-center gap-space-md">
        <span className="text-headline-sm font-semibold tracking-wider text-primary uppercase flex items-center gap-space-xs">
          <Icon name="shield" className="text-primary align-middle" />
          {h.title}
        </span>
        <div className="h-4 w-[1px] bg-outline-variant" />
        <div className="flex items-center gap-space-sm text-code-sm">
          <span className={`${chip} text-on-surface-variant`}>{h.grid}</span>
          <span className={`${chip} text-tertiary font-medium`}>{h.defcon}</span>
          <span className={`${chip} text-secondary flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-none bg-secondary" />
            {h.system}
          </span>
        </div>
        <div className="relative flex items-center ml-space-sm">
          <Icon name="search" size={14} className="absolute left-2 text-outline align-middle" />
          <input
            type="text"
            aria-label="Filter target, lat-long or MGRS"
            placeholder={h.searchPlaceholder}
            className="h-7 w-64 bg-surface-container-lowest border border-outline-variant pl-7 pr-2 text-code-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none rounded-none"
          />
        </div>
      </div>

      <div className="text-center">
        <ZuluClock
          date={h.clockDate}
          className="text-code-sm text-on-surface tracking-wider px-space-sm py-1 bg-surface-container-lowest border border-outline-variant"
        />
      </div>

      <div className="flex items-center gap-space-sm">
        <button
          type="button"
          className="h-7 px-space-sm bg-error-container border border-error text-error text-label-sm flex items-center gap-1 hover:bg-error hover:text-on-error transition-colors"
        >
          <Icon name="warning" size={14} className="align-middle" />
          {h.acknowledgeAll}
        </button>
        <div className={`flex items-center gap-1 text-code-sm px-space-xs py-1 border border-outline-variant bg-surface-container-lowest text-secondary`}>
          <Icon name="lock" size={12} className="align-middle" />
          {h.network}
        </div>
        <div className="flex items-center text-outline-variant mx-1">
          <button type="button" aria-label="Schedule" className={`${iconButton} text-outline`}>
            <Icon name="schedule" className="align-middle" />
          </button>
          <button type="button" aria-label="Priority alerts" className={`${iconButton} text-error`}>
            <Icon name="notifications_active" className="align-middle" />
          </button>
          <button type="button" aria-label="Sensors" className={`${iconButton} text-outline`}>
            <Icon name="sensors" className="align-middle" />
          </button>
          <button type="button" aria-label="Settings" className={`${iconButton} text-outline`}>
            <Icon name="tune" className="align-middle" />
          </button>
        </div>
        <div className="h-4 w-[1px] bg-outline-variant" />
        <div className="flex items-center gap-space-xs pl-space-xs">
          <div className="text-right">
            <div className="text-label-sm text-on-surface">{h.operator}</div>
            <div className="text-[9px] leading-[10px] text-code-sm text-outline">{h.operatorId}</div>
          </div>
          <Image
            src={h.avatar}
            alt={h.avatarAlt}
            width={24}
            height={24}
            className="w-6 h-6 border border-outline-variant object-cover grayscale brightness-90 contrast-125"
          />
          <button
            type="button"
            className="text-outline hover:text-on-surface text-label-sm ml-1 px-1 py-0.5 border border-outline-variant hover:border-outline bg-surface-container-lowest"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
}

/** 36px audit strip: restricted-dissemination notice (navigation lives in the shared rail below). */
export function MapFooter() {
  return (
    <footer className="h-9 w-full bg-surface-container-lowest border-t border-outline-variant flex items-center justify-end px-space-md text-code-sm shrink-0 z-30">
      <div className="text-[10px] text-outline flex items-center gap-space-sm">
        <span className="text-tertiary flex items-center gap-1">
          <Icon name="gavel" size={12} className="align-middle" />
          {mapFooter.restricted}
        </span>
        {mapFooter.items.map((item) => (
          <span key={item} className="contents">
            <span>|</span>
            <span>{item}</span>
          </span>
        ))}
        <span>|</span>
        <span className="text-on-surface">{mapFooter.node}</span>
        <span>|</span>
        <span className="text-tertiary font-bold">{mapFooter.defcon}</span>
      </div>
    </footer>
  );
}
