import { MapFooter, MapHeader } from "@/components/map/MapShell";

/** Tactical map chrome: 40px command header, content and the 36px audit strip, above the shared nav rail. */
export default function MapLayout({ children }: LayoutProps<"/map">) {
  return (
    <div className="map-console bg-surface-dim text-on-surface antialiased select-none w-full flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
      <MapHeader />
      {children}
      <MapFooter />
    </div>
  );
}
