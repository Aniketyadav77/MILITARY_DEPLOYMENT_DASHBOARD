import { Chrome } from "@/components/gotham/Shell";

/**
 * Operator console shell: 56px icon rail on the left, 44px top bar, screen below.
 * Both are mounted once here, so they never remount across client-side navigation.
 */
export default function ShellLayout({ children }: LayoutProps<"/">) {
  return <Chrome>{children}</Chrome>;
}
