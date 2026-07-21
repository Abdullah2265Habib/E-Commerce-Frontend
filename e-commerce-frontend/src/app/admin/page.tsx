import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Plus
} from "lucide-react";
import Link  from "next/link";
import { Button } from "@/components/ui/button";

// Mock operational metrics
const adminStats = [
  { title: "Total Revenue", value: "$24,580.00", icon: DollarSign, change: "+12.5% this month", changeType: "positive" },
  { title: "Active Customers", value: "1,248", icon: Users, change: "+48 new registrations", changeType: "positive" },
  { title: "Total Products", value: "342", icon: Package, change: "18 categories active", changeType: "neutral" },
  { title: "Conversion Rate", value: "3.42%", icon: TrendingUp, change: "+0.8% variance", changeType: "positive" },
];

const lowStockItems = [
  { name: "Wireless Earbuds Pro", sku: "EP-092", stock: 3, price: "$79.99" },
  { name: "Leather Smart Wallet", sku: "LW-441", stock: 1, price: "$45.00" },
  { name: "Mechanical Keyboard", sku: "MK-882", stock: 0, price: "$129.00" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 p-1">
      {/* Admin Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Global platform overview, operations tracking, and inventory status.</p>
      </div>

      {/* Kept exactly as requested */}
      <Link
        href="/dashboard"
        className="
          flex items-center justify-start gap-3 w-full max-w-xs
          px-4 py-3 font-medium text-sm
          border border-slate-200 dark:border-slate-800 rounded-xl
          bg-gray-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300
          hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300
          dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:hover:border-slate-700
          hover:shadow-sm
          transition-all duration-200 ease-in-out
        "
      >
        <LayoutDashboard className="h-5 w-5" />
        <span>Customer Dashboard</span>
      </Link>

      {/* Admin KPI Metrics Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
        {adminStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title} 
              className="p-5 bg-background border rounded-xl flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className="p-2 bg-muted rounded-lg text-slate-700 dark:text-slate-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold">{stat.value}</span>
                <p className={`text-xs mt-1 ${
                  stat.changeType === "positive" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                }`}>
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Operational Panels Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Inventory Warning Panel (Takes up 2 columns) */}
        <div className="md:col-span-2 border rounded-xl p-5 bg-background shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="font-semibold text-lg">Inventory Stock Alerts</h2>
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                <Link href="/dashboard/product">
                  Manage Stock <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground font-medium">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Stock Remaining</th>
                    <th className="pb-3 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowStockItems.map((item) => (
                    <tr key={item.sku} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-medium">{item.name}</td>
                      <td className="py-3 text-muted-foreground uppercase text-xs">{item.sku}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.stock === 0 
                            ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400" 
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          {item.stock === 0 ? "Out of Stock" : `${item.stock} units left`}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Administrative Quick Actions (Takes up 1 column) */}
        <div className="border rounded-xl p-5 bg-background shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Management Console</h2>
            <p className="text-sm text-muted-foreground">Perform swift operations across global store entities.</p>
            
            <div className="space-y-2">
              <Button className="w-full justify-start gap-2">
                <Link href="/dashboard/product">
                  <Plus className="h-4 w-4" /> Add New Product
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-left" >
                <Link href="/dashboard/orders">Review Pending Orders</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                <Link href="/dashboard/settings">System Configuration</Link>
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t mt-4 text-xs text-muted-foreground text-center">
            System Core v2.4.1 • Active Session Secured
          </div>
        </div>
      </div>
    </div>
  );
}
