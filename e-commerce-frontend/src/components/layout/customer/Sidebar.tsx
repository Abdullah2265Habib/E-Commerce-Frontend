"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  ShoppingBag,
  Heart,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/product",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Wishlists",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
  {
    title: "Cart",
    href: "/dashboard/cart",
    icon: ShoppingCart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];





export default function Sidebar() {

    const pathname = usePathname();


    return (

        <aside className="
            hidden md:flex
            w-64
            flex-col
            border-r
            bg-background
            min-h-screen
        ">


            {/* Logo */}

            <div className="
                h-16
                flex
                items-center
                px-6
                border-b
            ">
                <Link
                    href="/admin"
                    className="
                        text-xl
                        font-bold
                        tracking-tight
                    "
                >
                    AdminPanel
                </Link>
            </div>



            {/* Navigation */}

            <nav className="
                flex-1
                p-4
                space-y-2
            ">


                {menuItems.map((item)=>{

                    const Icon = item.icon;

                    const active =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");


                    return (

                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                                active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >

                            <Icon className="h-5 w-5" />

                            {item.title}

                        </Link>

                    );

                })}


            </nav>



            {/* Logout */}

            <div className="
                p-4
                border-t
            ">

                <Button
                    variant="outline"
                    className="
                        w-full
                        justify-start
                        gap-3
                    "
                >

                    <LogOut className="h-5 w-5"/>

                    Logout

                </Button>

            </div>


        </aside>

    );
}
