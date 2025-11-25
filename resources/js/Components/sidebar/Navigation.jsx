import Dropdown from "@/Components/sidebar/Dropdown";
import SidebarLink from "@/Components/sidebar/SidebarLink";
import { usePage } from "@inertiajs/react";

export default function NavLinks() {
    const { emp_data, forApprovalCount } = usePage().props;

    // fallback sa 0
    const ApprovalCount = Number(forApprovalCount) || 0;

    const role = emp_data?.emp_system_role;

    return (
        <nav className="flex flex-col flex-grow space-y-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <SidebarLink
                href={route("dashboard")}
                label="Dashboard"
                icon={<i className="fa-solid fa-gauge-high"></i>}
            />

            {!["superadmin", "admin", "approver", "engineer"].includes(role) && (
                <Dropdown
                    label="My Activities"
                    icon={<i className="fa-solid fa-list-check"></i>}
                    links={[
                        { href: route("tech.ongoing"), label: "Ongoing" },
                        { href: route("tech.doneActivities"), label: "Activity Done" },
                    ]}
                />
            )}

            {["superadmin", "admin", "approver", "engineer"].includes(role) && (
                <>
                    <SidebarLink
                        href={route("tech.activity")}
                        label="All Activities"
                        icon={<i className="fa-solid fa-list"></i>}
                    />

                    <SidebarLink
                        href={route("tech.forApproval")}
                        label="For Approval"
                        icon={<i className="fa-solid fa-thumbs-up"></i>}
                        notifications={ApprovalCount}
                    />
                </>
            )}

            {["superadmin", "admin"].includes(role) && (
                <>
                    <SidebarLink
                        href={route("tech.activity.deleted")}
                        label="Deleted Activity"
                        icon={<i className="fa-solid fa-trash-can"></i>}
                    />
                    <SidebarLink
                        href={route("activity.list")}
                        label="Activity List"
                        icon={<i className="fas fa-check-square"></i>}
                    />
                    <SidebarLink
                        href={route("export.activities")}
                        label="Quarterly Export"
                        icon={<i className="fas fa-file-csv"></i>}
                    />
                    <SidebarLink
                        href={route("admin")}
                        label="Approver"
                        icon={<i className="fa-solid fa-user-shield"></i>}
                    />
                </>
            )}
        </nav>
    );
}
