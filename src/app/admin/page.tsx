import type { Metadata } from "next";
import { AdminClient } from "@/app/admin/AdminClient";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return <AdminClient />;
}
