import AdminNavbar from "@/components/layout/admin/AdminNavbar";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1">
        <AdminNavbar />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
