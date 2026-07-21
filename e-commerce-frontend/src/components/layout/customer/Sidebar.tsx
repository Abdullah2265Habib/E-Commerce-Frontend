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
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

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
    href: "/dashboard/wishlists",
    icon: Heart,
  },
  {
    title: "Ratings",
    href: "/dashboard/rating",
    icon: Star,
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
                    href="/dashboard"
                    className="
                        text-xl
                        font-bold
                        tracking-tight
                    "
                >
                    CustomerPanel
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
                    {/* <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </Button> */}
                    <Button
                        variant="outline"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="
                            w-full justify-start gap-3 group
                            /* Padding */
                            px-4 py-3 h-auto 
                            /* Borders */
                            border border-slate-200 dark:border-slate-800 rounded-xl
                            /* Base Colors */
                            bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400
                            /* Hover Colors, Borders, & Shadow */
                            hover:bg-red-50 hover:text-red-600 hover:border-red-200
                            dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50
                            hover:shadow-sm hover:shadow-red-500/5
                            /* Smooth Transitions */
                            transition-all duration-200 ease-in-out
                        "
                        >
                        <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        <span className="font-medium">Logout</span>
                    </Button>

            </div>


        </aside>

    );
}
