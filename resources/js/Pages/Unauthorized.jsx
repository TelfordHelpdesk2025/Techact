import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function Unauthorized() {
    const [countdown, setCountdown] = useState(10);

    const logout = () => {
        router.post(
            route("logout"),
            {},
            {
                onFinish: () => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = route("login");
                },
            }
        );
    };

    // Auto logout countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    logout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Head title="Unauthorized" />

            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 p-16 rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 max-w-3xl w-full"
                >
                    {/* 401 */}
                    <motion.h1
                        initial={{ scale: 0.9 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="text-[120px] font-extrabold text-red-500 drop-shadow-[0_0_25px_rgba(255,0,0,0.6)] mb-4"
                    >
                        401
                    </motion.h1>

                    <h2 className="text-5xl font-bold text-gray-100 mb-4">
                        Unauthorized Access
                    </h2>

                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                        You do not have permission to access this page.
                        Please contact your administrator if you believe this is an error.
                    </p>

                    {/* Countdown */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="text-3xl font-semibold text-red-400 mb-8"
                    >
                        Auto logout in{" "}
                        <span className="text-white font-extrabold">
                            {countdown}
                        </span>{" "}
                        seconds
                    </motion.div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="px-10 py-4 text-2xl font-semibold text-white rounded-full shadow-lg hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-red-600 via-red-700 to-red-900"
                    >
                        Logout Now
                    </button>
                </motion.div>
            </div>
        </>
    );
}
