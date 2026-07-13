"use client";


import {
    Bell,
    Menu,
    Search,
} from "lucide-react";


import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


export default function AdminNavbar(){


    return (

        <header className="
            h-16
            border-b
            bg-background
            flex
            items-center
            justify-between
            px-6
        ">


            {/* Left */}

            <div className="flex items-center gap-4">


                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                >
                    <Menu />
                </Button>



                <div className="
                    hidden
                    sm:flex
                    items-center
                    gap-2
                    rounded-md
                    border
                    px-3
                    py-2
                    w-72
                ">

                    <Search className="
                        h-4
                        w-4
                        text-muted-foreground
                    "/>


                    <input
                        placeholder="Search..."
                        className="
                            bg-transparent
                            outline-none
                            text-sm
                            w-full
                        "
                    />

                </div>


            </div>





            {/* Right */}

            <div className="
                flex
                items-center
                gap-4
            ">


                <Button
                    variant="ghost"
                    size="icon"
                >


                </Button>



                <div className="
                    flex
                    items-center
                    gap-3
                ">


                    <Avatar>

                        <AvatarFallback>
                            AD
                        </AvatarFallback>

                    </Avatar>



                    <div className="
                        hidden
                        md:block
                    ">

                        <p className="
                            text-sm
                            font-medium
                        ">
                            Admin User
                        </p>


                        <p className="
                            text-xs
                            text-muted-foreground
                        ">
                            Administrator
                        </p>


                    </div>


                </div>


            </div>


        </header>

    );

}