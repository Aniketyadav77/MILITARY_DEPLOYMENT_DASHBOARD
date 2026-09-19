import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { inspection as i, zonesPanel, type ZoneRow, type ZoneTone } from "@/lib/map-data";

const row = "p-space-sm hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-between";

const toneStyle: Record<
  ZoneTone,
  { row: string; dot: string; name: string; detail: string; count: string; chevron: string }
> = {
  nominal: {
    row,
    dot: "bg-secondary",
    name: "text-on-surface",
    detail: "text-outline",
    count: "text-secondary",
    chevron: "text-outline",
  },
  inspected: {
    row: `${row} bg-surface-container/40`,
    dot: "bg-secondary",
    name: "text-primary",
    detail: "text-outline",
    count: "text-secondary",
    chevron: "text-primary",
  },
  warn: {
    row,
    dot: "bg-tertiary",
    name: "text-on-surface",
    detail: "text-tertiary",
    count: "text-tertiary",
    chevron: "text-outline",
  },
  breach: {
    // Stitch (Tailwind v3) lets `divide-*` recolour this row's 2px left border to the neutral divider tone.
    row: "p-space-sm bg-error-container/10 border-l-2 border-outline-variant/60 hover:bg-error-container/20 transition-colors cursor-pointer flex items-center justify-between",
    dot: "bg-error animate-critical-pulse",
    name: "text-error",
    detail: "text-error",
    count: "text-error font-semibold",
    chevron: "text-error",
  },
};

const tagStyle: Partial<Record<ZoneTone, string>> = {
  inspected: "bg-surface-container-highest text-primary border-outline-variant",
  breach: "bg-error-container text-error border-error",
};

function ZoneItem({ zone }: { zone: ZoneRow }) {
  const s = toneStyle[zone.tone];
  return (
    <div className={s.row}>
      <div className="flex items-center gap-space-sm">
        <span className={`w-2 h-2 ${s.dot}`} />
        <div>
          <div className={`text-label-md font-semibold ${s.name} ${zone.tag ? "flex items-center gap-1" : ""}`}>
            {zone.name}
            {zone.tag && (
              <span className={`text-[9px] px-1 border ${tagStyle[zone.tone]}`}>{zone.tag}</span>
            )}
          </div>
          <div className={`text-code-sm ${s.detail}`}>{zone.detail}</div>
        </div>
      </div>
      <div className="flex items-center gap-space-md">
        <span className={`text-code-sm ${s.count}`}>{zone.online}</span>
        <Icon name="chevron_right" size={14} className={`${s.chevron} align-middle`} />
      </div>
    </div>
  );
}

/** Top half of the right rail: zone list with online counts. */
export function ZonesPanel() {
  return (
    <div className="flex-1 flex flex-col border-b border-outline-variant overflow-hidden">
      <div className="p-space-sm bg-surface-container border-b border-outline-variant flex items-center justify-between shrink-0">
        <div>
          <div className="text-headline-sm text-on-surface flex items-center gap-1.5 min-h-6">
            <Icon name="domain" size={16} className="text-primary align-middle" />
            {zonesPanel.title}
          </div>
          <div className="text-label-sm text-outline">{zonesPanel.summary}</div>
        </div>
        <button
          type="button"
          aria-label="Refresh"
          className="p-1 border border-outline-variant bg-surface-container-lowest text-outline hover:text-on-surface"
        >
          <Icon name="refresh" size={14} className="align-middle" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/60">
        {zonesPanel.zones.map((zone) => (
          <ZoneItem key={zone.name} zone={zone} />
        ))}
      </div>
    </div>
  );
}

/** Bottom of the right rail: CAM-12 inspection node with feed, telemetry and intervention actions. */
export function InspectionPanel() {
  return (
    <div className="h-64 border-t-2 border-error bg-surface-container flex flex-col p-space-sm shrink-0">
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-error animate-ping" />
          <span className="text-headline-sm text-error font-semibold">{i.title}</span>
        </div>
        <span className="px-1.5 py-0.5 bg-error-container text-error border border-error text-[9px] leading-3 text-code-sm font-semibold">
          {i.alert}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-space-sm py-space-xs flex-1 items-stretch">
        <div className="relative bg-surface-container-lowest border border-error overflow-hidden flex flex-col justify-between p-1">
          <Image
            src={i.feed.src}
            alt={i.feed.alt}
            fill
            sizes="15vw"
            className="object-cover grayscale contrast-125"
          />
          <div className="relative z-10 flex justify-between items-center text-[8px] text-code-sm bg-surface-container-lowest/80 px-1 text-on-surface">
            <span>{i.feed.label}</span>
            <span className="text-error font-semibold">{i.feed.rec}</span>
          </div>
          <div className="relative z-10 w-16 h-20 border border-error border-dashed mx-auto my-auto flex flex-col justify-between p-0.5">
            <div className="flex justify-between text-[7px] text-error text-code-sm">
              <span>{i.feed.trackId}</span>
              <span>{i.feed.trackScore}</span>
            </div>
            <div className="text-[7px] text-center text-error bg-surface-container-lowest/90 text-code-sm">
              {i.feed.target}
            </div>
          </div>
          <div className="relative z-10 text-[8px] text-code-sm bg-surface-container-lowest/80 px-1 text-outline flex justify-between">
            <span>{i.feed.fov}</span>
            <span>{i.feed.fps}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between text-code-sm space-y-1">
          <div className="p-1 bg-surface-container-lowest border border-outline-variant">
            <div className="text-outline text-[9px]">{i.ptz.label}</div>
            <div className="text-primary font-medium">{i.ptz.value}</div>
          </div>
          <div className="p-1 bg-surface-container-lowest border border-error/40">
            <div className="text-error text-[9px] font-semibold">{i.sensors.label}</div>
            <div className="text-on-surface text-[10px]">{i.sensors.value}</div>
          </div>
          <div className="p-1 bg-surface-container-lowest border border-outline-variant">
            <div className="text-outline text-[9px]">{i.location.label}</div>
            <div className="text-on-surface text-[10px]">{i.location.value}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-space-xs pt-space-xs border-t border-outline-variant">
        <button
          type="button"
          className="h-7 bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-bright hover:border-outline text-[10px] text-label-sm font-medium transition-colors"
        >
          {i.actions.lock}
        </button>
        <button
          type="button"
          className="h-7 bg-error text-white border-none hover:bg-red-700 text-[10px] text-label-sm font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <Icon name="shield" size={12} className="align-middle" />
          {i.actions.dispatch}
        </button>
        <button
          type="button"
          className="h-7 bg-surface-container-high border border-error text-error hover:bg-error-container text-[10px] text-label-sm font-medium transition-colors"
        >
          {i.actions.isolate}
        </button>
      </div>
    </div>
  );
}
