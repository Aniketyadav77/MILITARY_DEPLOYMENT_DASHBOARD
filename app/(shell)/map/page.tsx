import type { Metadata } from "next";
import { CameraPopover, MapControls, MapToolbar } from "@/components/map/MapOverlays";
import { InspectionPanel, ZonesPanel } from "@/components/map/MapSidePanels";
import { TacticalMapSvg } from "@/components/map/TacticalMapSvg";

export const metadata: Metadata = {
  title: "AEGIS C2 // TAC-GIS - CANTONMENT SECTOR 04",
};

/** Split workspace: 70% tactical GIS map, 30% zones list and CAM-12 inspection HUD. */
export default function MapPage() {
  return (
    <main className="flex-1 flex w-full overflow-hidden relative">
      <section className="w-[70%] h-full relative cad-grid border-r border-outline-variant flex flex-col overflow-hidden">
        <MapToolbar />
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
          <TacticalMapSvg />
          <CameraPopover />
          <MapControls />
        </div>
      </section>
      <aside className="w-[30%] h-full bg-surface-container-low flex flex-col justify-between overflow-hidden">
        <ZonesPanel />
        <InspectionPanel />
      </aside>
    </main>
  );
}
