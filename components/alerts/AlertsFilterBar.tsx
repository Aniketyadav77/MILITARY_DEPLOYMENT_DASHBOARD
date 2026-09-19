import { Icon } from "@/components/ui/Icon";
import { filters } from "@/lib/alerts-data";

const field =
  "flex items-center bg-surface-container-lowest border border-outline-variant";
const select =
  "alerts-select bg-transparent border-none p-0 text-on-surface focus:ring-0 text-label-md cursor-pointer";

/** Dense filter bar: range, zone, classification chips, severity, search, count, export and live toggle. */
export function AlertsFilterBar() {
  return (
    <div className="bg-surface-container-low border border-outline-variant p-space-xs flex items-center justify-between gap-space-sm shrink-0 rounded-[2px]">
      <div className="flex items-center gap-space-xs flex-wrap">
        <div className={`${field} px-1.5 py-1 text-code-sm text-on-surface`}>
          <span className="text-outline mr-1 text-label-sm">RANGE:</span>
          <span className="tabular-nums text-on-surface">{filters.range}</span>
          <Icon name="calendar_today" size={12} className="ml-1 text-outline cursor-pointer" />
        </div>

        <div className={`${field} px-1.5 py-1 text-label-md text-on-surface`}>
          <span className="text-outline mr-1 text-label-sm">ZONE:</span>
          <select className={select} defaultValue="ALL" aria-label="Zone">
            {filters.zones.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center border border-outline-variant bg-surface-container-lowest">
          {filters.classes.map(({ label, active }, i) => {
            const last = i === filters.classes.length - 1;
            const edge = last ? "" : " border-r border-outline-variant";
            return active ? (
              <button
                key={label}
                type="button"
                className={`px-2 py-1 text-label-sm text-on-primary-container bg-primary-container font-semibold${edge}`}
              >
                {label}
              </button>
            ) : (
              <button
                key={label}
                type="button"
                className={`px-2 py-1 text-label-sm text-outline hover:text-on-surface${edge}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className={`${field} px-1.5 py-1 text-label-md text-on-surface`}>
          <span className="text-outline mr-1 text-label-sm">SEVERITY:</span>
          <select className={select} aria-label="Severity">
            {filters.severities.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </div>

        <div className={`${field} px-2 py-1 text-code-sm w-56`}>
          <Icon name="search" size={13} className="text-outline mr-1" />
          <input
            type="text"
            aria-label="Search"
            placeholder={filters.searchPlaceholder}
            className="bg-transparent border-none p-0 text-on-surface placeholder:text-outline text-code-sm w-full focus:ring-0 focus:outline-none"
          />
          <span className="text-outline text-label-sm border border-outline-variant px-1">/</span>
        </div>
      </div>

      <div className="flex items-center gap-space-xs shrink-0">
        <div className="text-code-sm text-outline px-2 tabular-nums">
          SHOWING <span className="text-on-surface font-semibold">{filters.shown}</span> OF{" "}
          <span className="text-on-surface font-semibold">{filters.total}</span> INCIDENTS
        </div>
        <button
          type="button"
          className="flex items-center gap-1 bg-surface-container border border-outline-variant px-2.5 py-1 text-label-md text-on-surface hover:bg-surface-container-high transition-none"
        >
          <Icon name="download" size={13} className="text-outline" />
          <span>EXPORT CSV</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 bg-surface-container-lowest border border-secondary px-2 py-1 text-code-sm text-secondary hover:bg-surface-container transition-none"
        >
          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-tactical-pulse" />
          <span>{filters.liveFeed}</span>
        </button>
      </div>
    </div>
  );
}
