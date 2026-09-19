import { Icon } from "@/components/ui/Icon";
import { usersPanel as p, type Role, type UserRow, type UserStatus } from "@/lib/admin-data";

const roleBadge: Record<Role, string> = {
  ADMIN: "bg-surface-container border border-outline-variant text-on-surface",
  SUPERVISOR: "bg-primary-container/20 border border-primary text-primary font-semibold",
  OPERATOR: "bg-secondary/10 border border-secondary/40 text-secondary",
  MAINTENANCE: "bg-tertiary/10 border border-tertiary/40 text-tertiary",
  VIEWER: "bg-surface-container border border-outline-variant text-outline",
};

const statusBadge: Record<UserStatus, { box: string; dot: string }> = {
  "ACTIVE [ONLINE]": { box: "bg-secondary/10 text-secondary border-secondary/30", dot: "bg-secondary" },
  OFFLINE: { box: "bg-surface-container text-outline border-outline-variant", dot: "bg-outline" },
  STANDBY: { box: "bg-tertiary/10 text-tertiary border-tertiary/30", dot: "bg-tertiary" },
};

const clearanceStyle = {
  "TS//SCI": "text-primary font-semibold",
  SECRET: "text-on-surface-variant",
  CONFIDENTIAL: "text-outline",
} as const;

// Stitch (Tailwind v3): the selected row keeps its blue left border; `divide-*` only recolours later rows.
const selectedRow =
  "h-10 hover:bg-surface-container-high transition-none bg-primary/5 border-l-2 border-primary border-b-surface-variant";

function UserTableRow({ user }: { user: UserRow }) {
  const status = statusBadge[user.status];
  return (
    <tr className={user.selected ? selectedRow : "h-10 hover:bg-surface-container-high transition-none"}>
      <td
        className={
          user.emphasis
            ? "px-3 py-2 text-on-surface font-semibold text-code-sm"
            : "px-3 py-2 text-on-surface-variant"
        }
      >
        {user.serviceNo}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon name={user.icon} size={14} className={user.selected ? "text-primary" : "text-outline"} />
          <span className={user.emphasis ? "text-on-surface font-semibold" : "text-on-surface"}>
            {user.name}
          </span>
        </div>
      </td>
      <td className="px-3 py-2">
        <span className={`px-2 py-0.5 rounded-[2px] text-[10px] uppercase ${roleBadge[user.role]}`}>
          {user.role}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={clearanceStyle[user.clearance]}>{user.clearance}</span>
      </td>
      <td className="px-3 py-2">
        <span
          className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px] text-[10px] border ${status.box}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {user.status}
        </span>
      </td>
      <td className="px-3 py-2 text-outline text-body-sm">{user.lastLogin}</td>
      <td className="px-3 py-2 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            className="h-6 px-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface text-[10px] rounded-[2px] border border-outline-variant uppercase"
          >
            EDIT
          </button>
          <button
            type="button"
            className="h-6 px-1.5 bg-surface-container hover:bg-error-container text-error text-[10px] rounded-[2px] border border-outline-variant uppercase"
          >
            REVOKE
          </button>
        </div>
      </td>
    </tr>
  );
}

const filterSelect =
  "alerts-select h-8 px-2.5 rounded-[2px] bg-surface border border-outline-variant text-on-surface text-label-md uppercase tracking-wider focus:border-primary focus:ring-0";

/** Centre column: user directory with filters, add action, table and audit footer. */
export function UsersPanel() {
  return (
    <section className="flex-1 flex flex-col min-w-0 border-r border-outline-variant bg-surface">
      <div className="h-10 px-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-headline-sm uppercase text-on-surface">{p.title}</span>
          <span className="h-3 w-[1px] bg-outline-variant" />
          <span className="text-label-md text-outline uppercase">{p.sessions}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-code-sm text-secondary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {p.sync}
          </span>
        </div>
      </div>

      <div className="h-11 px-3 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Icon
              name="search"
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="text"
              aria-label="Filter users"
              placeholder={p.searchPlaceholder}
              className="w-full h-8 pl-8 pr-3 rounded-[2px] bg-surface border border-outline-variant text-on-surface text-body-sm placeholder:text-outline focus:border-primary focus:ring-0"
            />
          </div>
          <select aria-label="Role" className={filterSelect}>
            {p.roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select aria-label="Status" className={filterSelect}>
            {p.statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="h-8 px-3 rounded-[2px] bg-primary text-on-primary font-semibold text-label-md uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary-container transition-none shrink-0"
        >
          <Icon name="person_add" size={15} />
          {p.add}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-10">
            <tr className="h-7 text-label-md text-outline uppercase tracking-wider">
              <th className="px-3 py-1 font-semibold w-24">SERVICE NO.</th>
              <th className="px-3 py-1 font-semibold">NAME &amp; RANK</th>
              <th className="px-3 py-1 font-semibold w-28">ROLE</th>
              <th className="px-3 py-1 font-semibold w-28">CLEARANCE</th>
              <th className="px-3 py-1 font-semibold w-36">STATUS</th>
              <th className="px-3 py-1 font-semibold">LAST LOGIN / TERMINAL</th>
              <th className="px-3 py-1 font-semibold text-right w-28">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {p.users.map((user) => (
              <UserTableRow key={user.serviceNo} user={user} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="h-8 px-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-code-sm text-outline shrink-0">
        <span>{p.footer}</span>
        <span className="flex items-center gap-1 text-on-surface-variant">
          <Icon name="verified" size={13} className="text-secondary" />
          {p.audit}
        </span>
      </div>
    </section>
  );
}
