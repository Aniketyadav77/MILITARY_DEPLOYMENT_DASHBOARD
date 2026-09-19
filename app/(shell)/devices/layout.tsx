import { JetBrains_Mono } from "next/font/google";
import { DevicesFooter, DevicesHeader, DevicesRail, DevicesStatusStrip } from "@/components/devices/DevicesShell";

// Stitch pairs Inter with JetBrains Mono for IDs, IPs, versions and readouts (`font-code-sm`).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/** Diagnostics chrome: 48px header, 64px side rail, content, tamper strip and compliance footer. */
export default function DevicesLayout({ children }: LayoutProps<"/devices">) {
  return (
    <div
      className={`${jetbrainsMono.variable} devices-console bg-surface-container-lowest text-on-surface antialiased select-none w-full flex-1 min-h-0 flex flex-col overflow-hidden`}
    >
      <DevicesHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <DevicesRail />
        {children}
      </div>
      <DevicesStatusStrip />
      <DevicesFooter />
    </div>
  );
}
