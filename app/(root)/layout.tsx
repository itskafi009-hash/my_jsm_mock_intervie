import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import {logoutUser} from "@/lib/actions/auth.actions";

import { isAuthenticated } from "@/lib/actions/auth.actions";

const Layout = async ({ children }: { children: ReactNode }) => {
    const isUserAuthenticated = await isAuthenticated();
    if (!isUserAuthenticated) redirect("/sign-in");

    return (
        <div className="root-layout">
            <nav className="flex items-center justify-between px-10 py-5 bg-gradient-to-r from-black/70 to-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">

                {/* LEFT: Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <Image src="/logo.svg" alt="logo" width={42} height={36} />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-wide">
                        PrepWise
                    </h2>
                </Link>

                {/* RIGHT: Logout */}
                <form action={logoutUser}>
                    <button className="relative px-6 py-2 rounded-full text-sm font-semibold text-white
        bg-white/10 border border-white/20 backdrop-blur-md
        hover:bg-red-500/80 hover:border-red-400
        hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]
        transition-all duration-300">
                        Logout
                    </button>
                </form>

            </nav>

            {children}
        </div>
    );
};

export default Layout;
