/**
 * Transitional: the Stitch header and audit strip were removed when the global
 * icon rail + top bar landed. The screen body is reworked in the Gotham pass.
 */
export default function MapLayout({ children }: LayoutProps<"/map">) {
  return <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>;
}
