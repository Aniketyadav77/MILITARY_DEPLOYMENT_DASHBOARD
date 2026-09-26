import type { Metadata } from "next";
import { LiveCameraWall } from "@/components/gotham/cameras/LiveCameraWall";

export const metadata: Metadata = {
  title: "Cameras · Gujarat · ISCC Watchfloor",
};

/** Gujarat state view: the live Sentinel camera wall. Leaving the route closes every feed. */
export default function CamerasPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col p-2 overflow-hidden">
      <LiveCameraWall />
    </div>
  );
}
