import Dropdown from "@/Components/sidebar/Dropdown";
import SidebarLink from "@/Components/sidebar/SidebarLink";
import { usePage } from "@inertiajs/react";

export default function NavLinks() {
    const { emp_data, forApprovalCount } = usePage().props;

    const role = emp_data?.emp_system_role;

    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            {/* Dashboard - Admin only */}
                <SidebarLink
                    href={route("dashboard")}
                    label="Dashboard"
                    icon={<i className="fa-solid fa-gauge-high"></i>}
                />

            {/* My Activities - User only */}
            {!["superadmin", "admin", "approver"].includes(role) && (
                <Dropdown
                    label="My Activities"
                    icon={<i className="fa-solid fa-list-check"></i>}
                    links={[
                        { href: route("tech.ongoing"), label: "Ongoing" },
                        { href: route("tech.doneActivities"), label: "Activity Done" },
                    ]}
                />
            )}

            {/* All Activities - Admin only */}
            {["superadmin", "admin", "approver"].includes(role) && (
                <SidebarLink
                    href={route("tech.activity")}
                    label="All Activities"
                    icon={<i className="fa-solid fa-list"></i>}
                />
            )}

            {/* For Approval - Admin & Approver */}
            {["superadmin", "admin", "approver"].includes(role) && (
                <SidebarLink
                    href={route("tech.forApproval")}
                    label="For Approval"
                    icon={<i className="fa-solid fa-thumbs-up"></i>}
                    notifications={forApprovalCount}
                />
            )}

            {["superadmin", "admin"].includes(role) && (
                
                <SidebarLink
                    href={route("activity.list")}
                    label="Activity List"
                    icon={<i className="fas fa-check-square"></i>}
                />
            )}

            {["superadmin", "admin"].includes(role) && (
                
                <SidebarLink
                    href={route("export.activities")}
                    label="Quarterly Export"
                    icon={<i className="fas fa-file-csv"></i>}
                />
            )}

            {/* Administrators - Admin only */}
            {["superadmin", "admin"].includes(role) && (
                <SidebarLink
                    href={route("admin")}
                    label="Administrators"
                    icon={<i className="fa-solid fa-user-shield"></i>}
                />
            )}
        </nav>
    );
}
