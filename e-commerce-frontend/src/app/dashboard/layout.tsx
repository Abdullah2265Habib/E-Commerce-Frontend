import DashboardNavbar from "@/components/layout/customer/Navbar";
import Sidebar from "@/components/layout/customer/Sidebar";
import { CartProvider } from "@/components/providers/cart-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1">
          <DashboardNavbar />

          <main className="p-6">{children}</main>
        </div>
      </div>
    </CartProvider>
  );
}
