import { Icon } from "@/components/ui/Icon";
import { cameraPopover as p, mapControls as c, mapLayers, mapReadout } from "@/lib/map-data";

/** Top-left HUD: coordinate readout and layer toggles. */
export function MapToolbar() {
  return (
    <div className="absolute top-2 left-2 z-20 flex items-center gap-space-sm">
      <div className="bg-surface-container-lowest border border-outline-variant p-space-xs flex items-center gap-space-sm text-code-sm shadow-none">
        <div className="text-outline">
          MGRS: <span className="text-primary font-semibold">{mapReadout.mgrs}</span>
        </div>
        <span className="text-outline-variant">|</span>
        <div className="text-outline">
          WGS84: <span className="text-on-surface">{mapReadout.wgs84}</span>
        </div>
        <span className="text-outline-variant">|</span>
        <div className="text-outline">
          ELEV: <span className="text-on-surface">{mapReadout.elevation}</span>
        </div>
      </div>
      <div className="flex items-center bg-surface-container-lowest border border-outline-variant text-label-sm">
        {mapLayers.map(({ label, on }, i) => {
          const last = i === mapLayers.length - 1;
          return on ? (
            <button
              key={label}
              type="button"
              aria-pressed="true"
              className="px-2 py-1 bg-surface-container-high text-primary border-r border-outline-variant flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 bg-primary" />
              {label}
            </button>
          ) : (
            <button
              key={label}
              type="button"
              aria-pressed="false"
              className={`px-2 py-1 text-outline hover:text-on-surface flex items-center gap-1${last ? "" : " border-r border-outline-variant"}`}
            >
              <span className="w-1.5 h-1.5 bg-outline" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Popover card anchored beside the selected camera node (CAM-07). */
export function CameraPopover() {
  return (
    <div className="absolute top-[260px] right-[70px] w-64 bg-surface-container-high border border-outline-variant p-space-sm z-30 shadow-none">
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant">
        <span className="text-headline-sm text-on-surface">{p.title}</span>
        <span className="px-1.5 py-0.5 bg-secondary-container/20 border border-secondary text-secondary text-[10px] leading-3 text-label-sm font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-secondary" />
          {p.status}
        </span>
      </div>
      <div className="py-space-xs space-y-1">
        <div className="flex justify-between text-label-sm">
          <span className="text-outline">{p.lastAlertLabel}</span>
          <span className="text-on-surface-variant">{p.lastAlert}</span>
        </div>
        <div className="flex justify-between text-code-sm pt-1 border-t border-outline-variant/50">
          <span className="text-outline">{p.specsLabel}</span>
          <span className="text-primary">{p.specs}</span>
        </div>
        <div className="flex justify-between text-code-sm">
          <span className="text-outline">{p.bandwidthLabel}</span>
          <span className="text-on-surface">{p.bandwidth}</span>
        </div>
      </div>
      <div className="flex gap-space-xs pt-space-xs border-t border-outline-variant">
        <button
          type="button"
          className="flex-1 h-7 bg-primary border-none text-on-primary text-label-sm font-semibold hover:bg-primary-container transition-colors"
        >
          VIEW LIVE
        </button>
        <button
          type="button"
          className="flex-1 h-7 bg-surface-container border border-outline-variant text-on-surface text-label-sm hover:bg-surface-bright hover:border-outline transition-colors"
        >
          VIEW ALERTS
        </button>
      </div>
    </div>
  );
}

const control =
  "h-6 px-2 bg-surface-container-lowest border border-outline-variant text-outline hover:text-on-surface text-code-sm flex items-center gap-1";
const zoom =
  "h-6 w-6 bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-bright flex items-center justify-center text-sm text-code-sm";

/** Bottom-left overlay: scale bar, GPS status and zoom / recenter / base-layer tools. */
export function MapControls() {
  return (
    <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-space-xs">
      <div className="bg-surface-container-lowest border border-outline-variant px-space-sm py-1 flex items-center gap-space-md text-code-sm">
        <span className="text-outline">{c.scale}</span>
        <div className="flex flex-col items-center">
          <div className="w-20 h-1 border-b-2 border-l-2 border-r-2 border-outline" />
          <span className="text-[9px] text-outline mt-0.5">{c.scaleBar}</span>
        </div>
        <span className="text-secondary flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-secondary" />
          {c.gps}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Zoom in" className={zoom}>+</button>
        <button type="button" aria-label="Zoom out" className={zoom}>-</button>
        <button type="button" className={control}>
          <Icon name="filter_center_focus" size={12} className="align-middle" /> {c.recenter}
        </button>
        <button type="button" className={control}>
          <Icon name="layers" size={12} className="align-middle" /> {c.base}
        </button>
      </div>
    </div>
  );
}
