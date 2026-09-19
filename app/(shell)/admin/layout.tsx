import { AdminFooter, AdminHeader } from "@/components/admin/AdminShell";

/** Admin console chrome: 40px header, three-column workspace and the 44px STIG strip above the shared nav rail. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin-console bg-surface text-on-surface antialiased select-none w-full flex-1 min-h-0 flex flex-col overflow-hidden">
      <AdminHeader />
      {children}
      <AdminFooter />
    </div>
  );
}
