import { AlertsFooter, AlertsHeader, AlertsSubNav } from "@/components/alerts/AlertsShell";

/** Alert console chrome: 32px command header, 28px sub-navigation, content and the compliance footer. */
export default function AlertsLayout({ children }: LayoutProps<"/alerts">) {
  return (
    <div className="alerts-console bg-surface text-on-surface antialiased select-none w-full flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
      <AlertsHeader />
      <AlertsSubNav />
      {children}
      <AlertsFooter />
    </div>
  );
}
