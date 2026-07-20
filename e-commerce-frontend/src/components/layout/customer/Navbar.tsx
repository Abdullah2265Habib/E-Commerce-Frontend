"use client";

import {
  Bell,
  Menu,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/providers/cart-context";
import { useSession } from "next-auth/react";

export default function DashboardNavbar() {
  const { totalItems, openDrawer } = useCart();
  const { data: session } = useSession();

  const user = session?.user as any;
  const name: string = user?.name ?? "Customer User";
  const role: string = user?.role ?? "Customer";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>

        <div className="hidden sm:flex items-center gap-2 rounded-md border px-3 py-2 w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Cart button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={openDrawer}
          aria-label="Open cart"
          id="cart-drawer-trigger"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-[10px] flex items-center justify-center pointer-events-none">
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          )}
        </Button>

        {/* Notifications (placeholder) */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User avatar */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}