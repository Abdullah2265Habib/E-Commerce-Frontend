"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tags,
    Settings,
    LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";


const menuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Categories",
        href: "/admin/category",
        icon: Tags,
    },
    {
        title: "Products",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "Orders",
        href: "/admin/order",
        icon: ShoppingCart,
    },
    {
        title: "Customers",
        href: "/admin/customers",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];


export default function AdminSidebar() {

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
                        className="w-full justify-start gap-3"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </Button>

            </div>


        </aside>

    );
}