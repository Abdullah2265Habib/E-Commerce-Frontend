import { 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  Star, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data to simulate look and feel
const stats = [
  { title: "Total Orders", value: "12", icon: ShoppingBag, desc: "3 items in transit", href: "/dashboard/orders" },
  { title: "Active Cart", value: "3 Items", icon: ShoppingCart, desc: "$148.50 total value", href: "/dashboard/cart" },
  { title: "Wishlist Items", value: "8", icon: Heart, desc: "2 on limited discount", href: "/dashboard/wishlists" },
  { title: "Reviews Left", value: "5", icon: Star, desc: "4.8 average rating given", href: "/dashboard/rating" },
];

const recentOrders = [
  { id: "#ORD-9021", date: "Jul 18, 2026", status: "In Transit", total: "$89.00" },
  { id: "#ORD-8841", date: "Jun 30, 2026", status: "Delivered", total: "$45.50" },
  { id: "#ORD-8512", date: "May 14, 2026", status: "Delivered", total: "$120.00" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 p-1">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here is a glance at your recent activity.</p>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title} 
              className="p-5 bg-background border rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className="p-2 bg-muted rounded-lg text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold">{stat.value}</span>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Main Action & Tables Layout Split */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Orders Overview (Takes 2 columns wide) */}
        <div className="md:col-span-2 border rounded-xl p-5 bg-background shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Recent Orders</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                <Link href="/dashboard/orders">
                  View All <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground font-medium">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-medium text-primary">{order.id}</td>
                      <td className="py-3 text-muted-foreground">{order.date}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "In Transit" 
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" 
                            : "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts / Recommendations Panel (Takes 1 column wide) */}
        <div className="border rounded-xl p-5 bg-background shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Looking for something specific? Jump straight into shopping items.</p>
            
            <div className="space-y-2">
              <Button className="w-full justify-start">
                <Link href="/dashboard/product">Browse Products</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" >
                <Link href="/dashboard/settings">Update Account Details</Link>
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t mt-4 text-xs text-muted-foreground text-center">
            Need support? Contact us anytime.
          </div>
        </div>
      </div>
    </div>
  );
}
