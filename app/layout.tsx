import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISCC // COMMAND WATCHFLOOR",
  description: "Integrated Surveillance Command Center",
};

// Material Symbols Outlined, limited to the icons used in the UI (icon_names must stay alphabetical).
// Add new icon names here when a screen needs them.
const MATERIAL_SYMBOLS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&icon_names=account_circle,add,arrow_drop_down,badge,calendar_today,check_circle,chevron_right,cloud_sync,crisis_alert,dashboard,description,desktop_windows,dns,domain,download,engineering,error,filter_center_focus,gavel,group,hub,layers,lock,logout,map,memory,military_tech,nightlight,notifications,notifications_active,person,person_add,policy,power_settings_new,refresh,report,router,schedule,search,security,sensors,settings,shield,storm,sync,terminal,timelapse,timer,tune,verified,verified_user,videocam,videocam_off,view_list,visibility,vpn_key,warning,wifi_off&display=block";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="stylesheet" href={MATERIAL_SYMBOLS_URL} />
      </head>
      <body className="h-full overflow-hidden bg-brand-bg text-fg antialiased select-none">
        {children}
      </body>
    </html>
  );
}
