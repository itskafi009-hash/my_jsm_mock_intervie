"use client"
import { useEffect, useState } from "react";
import AuthForm from "@/components/AuthForm";

const page = () => {
       const [theme, setTheme] = useState<string | null>(null);

       useEffect(() => {
              // Runs only in the browser
              const storedTheme = window.localStorage.getItem("theme");
              setTheme(storedTheme);
       }, []);

       return (
           <div className={theme === "dark" ? "dark-mode" : "light-mode"}>

                  {<AuthForm type="sign-in"/>}
           </div>
       );
};

export default page;