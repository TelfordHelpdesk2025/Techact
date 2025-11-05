import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";

import { useState } from "react";

export default function Admin({ tableData, tableFilters, emp_data }) {
    const [role, setRole] = useState(null);

    function removeAdmin(id) {
        router.post(
            route("removeAdmin"),
            { id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Admin removed");
                },
            }
        );
    }

    function changeRole(id) {
        role &&
            router.patch(
                route("changeAdminRole"),
                { id, role },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        console.log("Admin role changed");
                    },
                }
            );
    }

    const tableModalClose = (close) => {
        setRole(null);
        close();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Administrators" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Administrators</h1>

                {["superadmin", "admin"].includes(
                    emp_data?.emp_system_role
                ) && (
                    <button
                        className="text-blue-600 border-blue-600 btn"
                        onClick={() =>
                            router.get(
                                route("index_addAdmin"),
                                {},
                                { preserveScroll: true }
                            )
                        }
                    >
                        Add New Admin
                    </button>
                )}
            </div>

            <DataTable
                columns={[
                    { key: "emp_id", label: "ID" },
                    { key: "emp_name", label: "Employee Name" },
                    { key: "emp_role", label: "Role" },
                ]}
                data={tableData.data}
                meta={{
                    from: tableData.from,
                    to: tableData.to,
                    total: tableData.total,
                    links: tableData.links,
                    currentPage: tableData.current_page,
                    lastPage: tableData.last_page,
                }}
                routeName={route("admin")}
                filters={tableFilters}
                rowKey="EMPLOYID"
                // selectable={true}
                // onSelectionChange={setSelectedRows}
                // dateRangeSearch={true}
                showExport={false}
            >
                {(row, close) => (
                   <Modal
    id="RowModal"
    icon={<i className="fa-solid fa-user-shield"></i>}
    title="Admin Details"
    show={true}
    onClose={() => tableModalClose(close)}
    className="w-full max-w-md" // 👉 mas malapad kaysa 300px
>
    <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="text-lg font-semibold text-gray-800">
                {row.emp_id}
            </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold text-gray-800">
                {row.emp_name}
            </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
                {row.emp_role}
            </p>
        </div>

        {["superadmin"].includes(emp_data?.emp_system_role) && (
            <div className="pt-2 border-t">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                    Update Role
                </label>
                <select
                    defaultValue={row.emp_role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="superadmin">Superadmin</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="approver">Approver</option>
                </select>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => removeAdmin(row.emp_id)}
                        className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-400 rounded-lg hover:bg-red-50 transition"
                    >
                        Remove
                    </button>
                    <button
                        onClick={() => changeRole(row.emp_id)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                        Update Role
                    </button>
                </div>
            </div>
        )}
    </div>
</Modal>

                )}
            </DataTable>
        </AuthenticatedLayout>
    );
}
