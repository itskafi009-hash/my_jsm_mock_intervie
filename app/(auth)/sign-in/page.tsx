'use client'; // Must be first line for Client Component

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Example: dynamic import for any browser-only component
// const MyForm = dynamic(() => import("@/components/Form"), { ssr: false });

const SignInPage = () => {
       const [theme, setTheme] = useState<string>("light"); // default light
       const [email, setEmail] = useState("");
       const [password, setPassword] = useState("");

       // Only runs in the browser
       useEffect(() => {
              const storedTheme = typeof window !== "undefined"
                  ? window.localStorage.getItem("theme")
                  : null;
              if (storedTheme) setTheme(storedTheme);
       }, []);

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              console.log("Email:", email);
              console.log("Password:", password);
              // Call your login API here
       };

       return (
           <div className={`${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen flex items-center justify-center`}>
                  <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-800 p-8 rounded shadow-md w-80">
                         <h2 className="text-2xl mb-6 text-center">Sign In</h2>

                         <label className="block mb-2">Email</label>
                         <input
                             type="email"
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             className="w-full mb-4 p-2 rounded border"
                             required
                         />

                         <label className="block mb-2">Password</label>
                         <input
                             type="password"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             className="w-full mb-6 p-2 rounded border"
                             required
                         />

                         <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                                Sign In
                         </button>
                  </form>
           </div>
       );
};

export default SignInPage;