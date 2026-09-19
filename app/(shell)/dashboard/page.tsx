import type { Metadata } from "next";
import { Dashboard } from "@/components/gotham/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard · ISCC Watchfloor",
};

export default function DashboardPage() {
  return <Dashboard />;
}
