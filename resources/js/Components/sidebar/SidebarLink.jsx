import React from "react";
import { Link, usePage } from "@inertiajs/react";

const SidebarLink = ({ href, label, icon, notifications = 0 }) => {
    const { url } = usePage();

    // Simple active check
    const isActive = url === new URL(href, window.location.origin).pathname;

    return (
        <Link
            href={href}
            className={`relative flex items-center px-4 py-2 rounded-md transition-colors duration-150 ${
                isActive ? "bg-blue-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
        >
            {/* Icon + Label */}
            <div className="flex items-center">
                <span className="w-6 h-6">{icon}</span>
                <p className="pl-2">{label}</p>
            </div>

            {/* Notification badge */}
            {notifications > 0 && (
                <span className="absolute top-1 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                    {notifications}
                </span>
            )}
        </Link>
    );
};

export default SidebarLink;
