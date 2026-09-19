import { TopBar } from "@/components/shell/TopBar";

/** Main Command Dashboard header: 48px top bar above the screen content. */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <TopBar />
      {children}
    </>
  );
}
