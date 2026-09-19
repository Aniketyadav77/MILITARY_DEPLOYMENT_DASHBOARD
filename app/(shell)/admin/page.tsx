import type { Metadata } from "next";
import { AdminDirectory } from "@/components/admin/AdminDirectory";
import { ConfigPanel } from "@/components/admin/ConfigPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";

export const metadata: Metadata = {
  title: "ISCC MATRIX // SYS-ADMIN & SECURITY ACCESS",
};

/** Three-column administrative workspace: directory rail, user table, configuration panels. */
export default function AdminPage() {
  return (
    <main className="flex-1 flex overflow-hidden bg-background">
      <AdminDirectory />
      <UsersPanel />
      <ConfigPanel />
    </main>
  );
}
