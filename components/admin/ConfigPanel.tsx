import { Icon } from "@/components/ui/Icon";
import { escalation, profiles, rbac } from "@/lib/admin-data";

const checkbox =
  "admin-checkbox w-4 h-4 rounded-[2px] bg-surface-container-lowest border-outline-variant text-primary focus:ring-0";

/** Section 1: role selector, capability matrix and save / revert actions. */
function RbacMatrix() {
  return (
    <div className="p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="policy" className="text-primary" />
            <span className="text-headline-sm uppercase text-on-surface">{rbac.title}</span>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-outline mt-0.5">{rbac.subtitle}</p>
        </div>
        <span className="px-2 py-0.5 rounded-[2px] text-[9px] uppercase bg-primary/10 border border-primary/40 text-primary">
          {rbac.badge}
        </span>
      </div>

      <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-[2px] border border-outline-variant">
        {rbac.roles.map((role) =>
          role === rbac.selectedRole ? (
            <button
              key={role}
              type="button"
              aria-pressed="true"
              className="flex-1 py-1 text-center rounded-[2px] text-label-sm uppercase tracking-wider bg-primary text-on-primary font-semibold transition-none"
            >
              {role}
            </button>
          ) : (
            <button
              key={role}
              type="button"
              aria-pressed="false"
              className="flex-1 py-1 text-center rounded-[2px] text-label-sm uppercase tracking-wider text-outline hover:text-on-surface transition-none"
            >
              {role}
            </button>
          ),
        )}
      </div>

      <div className="border border-outline-variant rounded-[2px] bg-surface-container-lowest overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant text-[10px] text-outline uppercase tracking-wider">
            <tr>
              <th className="px-2.5 py-1.5">{rbac.descriptor}</th>
              {rbac.columns.map((col) => (
                <th
                  key={col}
                  className={`px-2 py-1.5 text-center w-14${col === "SUPV" ? " bg-primary/10 text-primary font-semibold" : ""}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 text-body-sm">
            {rbac.capabilities.map(({ label, flags }) => (
              <tr key={label} className="hover:bg-surface-container">
                <td className="px-2.5 py-1.5 text-on-surface">{label}</td>
                {flags.map((on, i) => (
                  <td
                    key={rbac.columns[i]}
                    className={`px-2 py-1.5 text-center${i === 1 ? " bg-primary/5" : ""}`}
                  >
                    <input
                      type="checkbox"
                      aria-label={`${label} — ${rbac.columns[i]}`}
                      defaultChecked={on}
                      disabled={i === 0}
                      className={checkbox}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          className="h-7 px-2.5 rounded-[2px] bg-surface-container hover:bg-surface-container-highest border border-outline-variant text-outline text-label-sm uppercase tracking-wider transition-none"
        >
          {rbac.revert}
        </button>
        <button
          type="button"
          className="h-7 px-3 rounded-[2px] bg-primary text-on-primary font-semibold text-label-sm uppercase tracking-wider hover:bg-primary-container transition-none"
        >
          {rbac.save}
        </button>
      </div>
    </div>
  );
}

const priorityStyle = {
  error: "bg-error-container/30 border border-error text-error font-bold",
  tertiary: "bg-tertiary/20 border border-tertiary text-tertiary font-bold",
} as const;

/** Section 2: automated escalation rules with enable toggles. */
function EscalationRules() {
  return (
    <div className="p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="crisis_alert" className="text-tertiary" />
          <span className="text-headline-sm uppercase text-on-surface">{escalation.title}</span>
        </div>
        <button
          type="button"
          className="text-label-sm text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
        >
          <Icon name="add" size={13} /> {escalation.add}
        </button>
      </div>
      <div className="space-y-2">
        {escalation.rules.map((rule) => (
          <div
            key={rule.title}
            className="p-2.5 rounded-[2px] bg-surface-container-lowest border border-outline-variant space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] ${priorityStyle[rule.tone]}`}>
                  {rule.priority}
                </span>
                <span className="text-label-md uppercase text-on-surface font-semibold">{rule.title}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label={`Enable ${rule.title}`}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-surface-container border border-outline-variant peer-checked:bg-primary rounded-xs peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-xs after:h-3 after:w-3 after:transition-none" />
              </label>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              {rule.parts.map((part, i) =>
                part.em ? (
                  <span key={i} className="text-primary">
                    {part.text}
                  </span>
                ) : (
                  part.text
                ),
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Section 3: dynamic sensitivity profiles. */
function SensitivityProfiles() {
  const { night, weather } = profiles;
  return (
    <div className="p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="tune" className="text-secondary" />
          <span className="text-headline-sm uppercase text-on-surface">{profiles.title}</span>
        </div>
        <span className="text-label-sm text-outline uppercase">{profiles.engine}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-[2px] bg-surface-container-lowest border border-outline-variant space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-sm uppercase text-on-surface font-semibold block">{night.title}</span>
              <span className="text-[9px] text-secondary">{night.status}</span>
            </div>
            <Icon name={night.icon} className="text-outline" />
          </div>
          <p className="text-[11px] text-on-surface-variant leading-normal">{night.body}</p>
        </div>
        <div className="p-2.5 rounded-[2px] bg-surface-container-lowest border border-outline-variant space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-sm uppercase text-on-surface font-semibold block">{weather.title}</span>
              <span className="text-[9px] text-outline">{weather.status}</span>
            </div>
            <Icon name={weather.icon} className="text-outline" />
          </div>
          <p className="text-[11px] text-on-surface-variant leading-normal">{weather.body}</p>
          <div className="pt-1 border-t border-outline-variant flex items-center justify-between">
            <span className="text-[10px] uppercase text-outline">{weather.override}</span>
            <button
              type="button"
              className="h-5 px-2 bg-surface-container hover:bg-surface-container-highest border border-outline-variant text-[9px] uppercase text-primary rounded-[2px]"
            >
              {weather.engage}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Right column (760px): RBAC matrix, escalation protocols and sensitivity profiles. */
export function ConfigPanel() {
  return (
    <section className="w-[760px] flex flex-col bg-surface-container-low overflow-y-auto shrink-0 divide-y divide-outline-variant">
      <RbacMatrix />
      <EscalationRules />
      <SensitivityProfiles />
    </section>
  );
}
