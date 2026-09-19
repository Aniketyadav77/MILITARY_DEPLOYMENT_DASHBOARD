import { BottomNav } from "@/components/shell/BottomNav";

/**
 * Shared ISCC shell for every screen: the screen fills the space above a persistent 56px navigation rail.
 * Layouts stay mounted across client-side navigation, so the rail never remounts or flickers.
 */
export default function ShellLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      <BottomNav />
    </div>
  );
}
