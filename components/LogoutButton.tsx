"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/actions/auth.actions";

const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        const res = await logoutUser();

        if (res.success) {
            router.push("/sign-in"); // 🔥 login page
        } else {
            alert("Logout failed");
        }
    };

    return (
        <button onClick={handleLogout} className="btn">
            Logout
        </button>
    );
};

export default LogoutButton;