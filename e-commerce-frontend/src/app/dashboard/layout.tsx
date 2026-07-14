import AdminNavbar from "@/components/layout/admin/AdminNavbar";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import DashboardNavbar from "@/components/layout/customer/Navbar";
import Sidebar from "@/components/layout/customer/Sidebar";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <DashboardNavbar />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
