import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { incidentDetail as d } from "@/lib/alerts-data";

const toneClass = {
  default: "text-on-surface",
  error: "text-error",
  secondary: "text-secondary",
} as const;

const ptzButton =
  "px-1.5 py-0.5 bg-surface-container border border-outline-variant text-label-sm hover:bg-surface-container-high";

/** Inline tactical inspection drawer for the selected incident. */
export function IncidentDrawer() {
  return (
    <div className="p-space-sm grid grid-cols-12 gap-space-md border-l-2 border-error">
      {/* Left: live IR frame */}
      <div className="col-span-4 flex flex-col gap-1">
        <div className="flex items-center justify-between text-label-sm text-outline">
          <span className="text-error font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-error" /> {d.frame.liveLabel}
          </span>
          <span className="tabular-nums text-on-surface-variant">{d.frame.meta}</span>
        </div>
        <div className="relative w-full aspect-video bg-surface-container-lowest border border-outline-variant overflow-hidden flex items-center justify-center">
          <Image
            src={d.frame.src}
            alt={d.frame.alt}
            fill
            sizes="33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 p-2 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start text-code-sm bg-surface-container-lowest/80 px-1 py-0.5 border border-outline-variant/40">
              <span className="text-secondary">{d.frame.rec}</span>
              <span className="text-outline">{d.frame.fps}</span>
            </div>
            <div className="border border-error bg-error/10 w-28 h-36 mx-auto my-auto relative flex flex-col justify-between p-1">
              <span className="text-error text-label-sm font-semibold bg-surface-container-lowest/90 px-0.5">
                {d.frame.target}
              </span>
              <div className="text-[9px] text-error bg-surface-container-lowest/90 px-0.5 self-end">
                {d.frame.conf}
              </div>
            </div>
            <div className="flex justify-between items-end text-code-sm bg-surface-container-lowest/80 px-1 py-0.5 border border-outline-variant/40">
              <span className="text-on-surface">{d.frame.azEl}</span>
              <span className="text-primary">{d.frame.ir}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-code-sm pt-1">
          <span className="text-outline">{d.frame.ptzLock}</span>
          <div className="flex items-center gap-1">
            <button type="button" className={`${ptzButton} text-on-surface`}>PAN L</button>
            <button type="button" className={`${ptzButton} text-on-surface`}>PAN R</button>
            <button type="button" className={`${ptzButton} text-primary`}>TRACK +</button>
            <button type="button" className={`${ptzButton} text-error`}>SIREN: OFF</button>
          </div>
        </div>
      </div>

      {/* Middle: analytics & sensor correlation */}
      <div className="col-span-4 flex flex-col gap-space-xs border-r border-outline-variant/60 pr-space-md">
        <div className="text-label-sm text-outline tracking-wider uppercase">
          ANALYTICS &amp; SENSOR CORRELATION
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-code-sm">
          {d.telemetry.map(({ label, value, tone, strong }) => (
            <div key={label} className="contents">
              <div className="text-outline">{label}</div>
              <div className={`${toneClass[tone]} ${strong ? "font-semibold" : ""} text-right`}>
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="border border-outline-variant bg-surface-container-lowest p-2 mt-1">
          <div className="flex justify-between text-label-sm text-outline mb-1">
            <span>{d.confidenceLabel}</span>
            <span className="text-error font-semibold">{d.confidenceNote}</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high">
            <div className="bg-error h-full" style={{ width: "98.4%" }} />
          </div>
        </div>
      </div>

      {/* Right: operator log & dispatch */}
      <div className="col-span-4 flex flex-col justify-between">
        <div>
          <div className="text-label-sm text-outline tracking-wider uppercase mb-1">
            OPERATOR LOG &amp; DIRECTIVE
          </div>
          <label className="sr-only" htmlFor="op-note">
            Operator Observation Note
          </label>
          <textarea
            id="op-note"
            rows={3}
            defaultValue={d.note}
            className="w-full bg-surface-container-lowest border border-outline-variant p-1.5 text-code-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none resize-none font-[ui-sans-serif,system-ui,sans-serif]"
          />
          <div className="flex justify-between items-center text-[10px] text-outline mt-0.5">
            <span>{d.auditLogged}</span>
            <span>{d.signature}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          <button
            type="button"
            className="w-full py-1.5 bg-error text-surface-container-lowest hover:bg-[#b83838] text-label-md font-semibold flex items-center justify-center gap-1 transition-none"
          >
            <Icon name="warning" size={15} />
            <span>DISPATCH QRF (QUICK REACTION FORCE)</span>
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              className="py-1 bg-tertiary-container text-on-tertiary-container hover:bg-tertiary text-label-sm font-semibold transition-none"
            >
              ACKNOWLEDGE ALERT
            </button>
            <button
              type="button"
              className="py-1 bg-surface-container border border-outline-variant text-outline hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-none"
            >
              FALSE POSITIVE / ARCHIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
