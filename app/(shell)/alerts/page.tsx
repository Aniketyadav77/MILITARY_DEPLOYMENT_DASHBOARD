import type { Metadata } from "next";
import { AlertConsole } from "@/components/gotham/alerts/AlertConsole";

export const metadata: Metadata = {
  title: "Alert console · ISCC Watchfloor",
};

export default function AlertsPage() {
  return <AlertConsole />;
}
