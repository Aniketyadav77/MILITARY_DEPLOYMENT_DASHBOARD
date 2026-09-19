/**
 * Transitional: the Stitch header, side rail and footer were removed when the
 * global icon rail + top bar landed. The screen body is reworked in the Gotham pass.
 */
export default function DevicesLayout({ children }: LayoutProps<"/devices">) {
  return <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>;
}
