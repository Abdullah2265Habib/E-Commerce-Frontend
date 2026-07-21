import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  Star, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Customer Dashboard",
  description: "Overview of your personal orders, cart, wishlist, and activity.",
};

function getStatusBadge(status?: string) {
  const st = (status || "").toLowerCase();
  if (st === "shipped" || st === "in transit") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  }
  if (st === "delivered") {
    return "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400";
  }
  if (st === "cancelled") {
    return "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400";
  }
  return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  const userName = session?.user?.name || "Customer";

  let orders: any[] = [];
  let wishlistItems: any[] = [];
  let cartItems: any[] = [];
  let cartTotal = 0;

  if (token) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 1. Fetch User Orders
    try {
      const res = await fetch(`${backendUrl}/orders?page=1&limit=50`, {
        cache: "no-store",
        headers,
      });
      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.data)) {
          orders = result.data;
        } else if (Array.isArray(result)) {
          orders = result;
        }
      }
    } catch (err) {
      console.error("[dashboard/page] error fetching orders:", err);
    }

    // 2. Fetch User Wishlist
    try {
      const res = await fetch(`${backendUrl}/wishlist?page=1&limit=50`, {
        cache: "no-store",
        headers,
      });
      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.data)) {
          wishlistItems = result.data.filter((item: any) => item.productId);
        } else if (Array.isArray(result)) {
          wishlistItems = result.filter((item: any) => item.productId);
        } else if (result && Array.isArray(result.products)) {
          wishlistItems = result.products.filter((item: any) => item.productId);
        }
      }
    } catch (err) {
      console.error("[dashboard/page] error fetching wishlist:", err);
    }

    // 3. Fetch User Cart
    try {
      const res = await fetch(`${backendUrl}/cart`, {
        cache: "no-store",
        headers,
      });
      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.items)) {
          cartItems = result.items;
          cartTotal = cartItems.reduce((sum: number, item: any) => {
            const unitPrice = item.product?.price ?? item.unitPrice ?? 0;
            return sum + unitPrice * (item.quantity ?? 1);
          }, 0);
        }
      }
    } catch (err) {
      console.error("[dashboard/page] error fetching cart:", err);
    }
  }

  // Derive Stats
  const totalOrdersCount = orders.length;
  const activeShipmentsCount = orders.filter((o: any) => {
    const st = (o.status || "").toLowerCase();
    return st === "shipped" || st === "in transit" || st === "processing";
  }).length;

  const totalCartQuantity = cartItems.reduce(
    (sum: number, item: any) => sum + (item.quantity ?? 1),
    0
  );

  const eligibleReviewsCount = orders.filter(
    (o: any) =>
      o.status?.toLowerCase() === "shipped" &&
      (o.paymentStatus?.toLowerCase() === "paid" ||
        o.paymentStatus?.toLowerCase() === "succeeded")
  ).length;

  const stats = [
    {
      title: "Total Orders",
      value: String(totalOrdersCount),
      icon: ShoppingBag,
      desc:
        activeShipmentsCount > 0
          ? `${activeShipmentsCount} active / in transit`
          : "No active shipments",
      href: "/dashboard/orders",
    },
    {
      title: "Active Cart",
      value: `${totalCartQuantity} Item${totalCartQuantity !== 1 ? "s" : ""}`,
      icon: ShoppingCart,
      desc: `$${cartTotal.toFixed(2)} total value`,
      href: "/dashboard/cart",
    },
    {
      title: "Wishlist Items",
      value: String(wishlistItems.length),
      icon: Heart,
      desc:
        wishlistItems.length > 0
          ? `${wishlistItems.length} item(s) saved`
          : "No wishlist items",
      href: "/dashboard/wishlists",
    },
    {
      title: "Reviews Left",
      value: String(eligibleReviewsCount),
      icon: Star,
      desc:
        eligibleReviewsCount > 0
          ? `${eligibleReviewsCount} order(s) to review`
          : "No orders pending review",
      href: "/dashboard/rating",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 p-1">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-semibold text-foreground">{userName}</span>! Here is a glance at your recent activity.
        </p>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="p-5 bg-background border rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.title}
                </span>
                <div className="p-2 bg-muted rounded-lg text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold">{stat.value}</span>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </div>
            </Link>
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
                <Link href="/dashboard/orders" className="flex items-center gap-1">
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
                {recentOrders.length > 0 ? (
                  <tbody className="divide-y">
                    {recentOrders.map((order: any) => {
                      const total =
                        order.totalAmount != null
                          ? order.totalAmount
                          : order.items?.reduce(
                              (sum: number, it: any) =>
                                sum + (it.product?.price ?? 0) * (it.quantity ?? 1),
                              0
                            ) ?? 0;

                      const orderDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 font-medium text-primary font-mono text-xs">
                            #{order._id ? order._id.slice(-8).toUpperCase() : "—"}
                          </td>
                          <td className="py-3 text-muted-foreground">{orderDate}</td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </td>
                          <td className="py-3 text-right font-medium">
                            ${total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-muted-foreground"
                      >
                        You have not placed any orders yet.
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts / Recommendations Panel (Takes 1 column wide) */}
        <div className="border rounded-xl p-5 bg-background shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">
              Looking for something specific? Jump straight into shopping items or checking your cart.
            </p>

            <div className="space-y-2">
              <Button className="w-full justify-start">
                <Link href="/dashboard/product">Browse Products</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Link href="/dashboard/cart">View Shopping Cart</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Link href="/dashboard/wishlists">View Wishlist</Link>
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

