import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import { useState } from "react";

export default function ActivityList({ tableData, tableFilters, empData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [activityName, setActivityName] = useState("");
    const [activityDesc, setActivityDesc] = useState("");
    const [selectedActivity, setSelectedActivity] = useState(null);

    const empName = empData?.emp_name || "";

    // 🟢 Open modal for new
    const openNewModal = () => {
        setEditMode(false);
        setSelectedActivity(null);
        setActivityName("");
        setActivityDesc("");
        setIsModalOpen(true);
    };

    // 🟢 Open modal for edit
    const openEditModal = (row) => {
        setEditMode(true);
        setSelectedActivity(row);
        setActivityName(row.activity);
        setActivityDesc(row.description);
        setIsModalOpen(true);
    };

    // 🟢 Save / Update
    const saveActivity = () => {
        if (!activityName.trim() || !activityDesc.trim()) {
            alert("⚠️ Please fill in all fields.");
            return;
        }

        const payload = {
            activity: activityName,
            description: activityDesc,
            created_by: empName,
        };

        if (editMode && selectedActivity?.id) {
            router.put(route("update.activity.list", selectedActivity.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    alert("✅ Activity updated successfully!");
                    setIsModalOpen(false);
                    router.visit(route("activity.list"));
                },
            });
        } else {
            router.post(route("add.activity.list"), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    alert("✅ Activity added successfully!");
                    setIsModalOpen(false);
                    router.visit(route("activity.list"));
                },
            });
        }
    };

    // 🗑️ Delete
    const deleteActivity = (id) => {
        if (confirm("Are you sure you want to delete this activity?")) {
            router.delete(route("delete.activity.list", id), {
                preserveScroll: true,
                onSuccess: () => {
                    alert("🗑️ Activity deleted successfully!");
                    router.visit(route("activity.list"));
                },
            });
        }
    };

    // 🧩 Prepare rows (inject button components)
    const tableRows = tableData.data.map((row) => ({
        ...row,
        actions: (
            <div className="flex gap-2 justify-center">
                <button
                    className="px-3 py-2 bg-blue-600 text-white rounded-md"
                    onClick={() => openEditModal(row)}
                >
                    <div className="flex items-center">
                        <i className="fa-solid fa-pen mr-1"></i>
                    </div>
                </button>

                <button
                    className="px-3 py-2 bg-red-600 text-white rounded-md"
                    onClick={() => deleteActivity(row.id)}
                >
                    <div className="flex items-center">
                        <i className="fa-solid fa-trash mr-1"></i>
                    </div>
                </button>
            </div>
        ),
    }));

    return (
        <AuthenticatedLayout>
            <Head title="Activity List" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">
                        <i className="fa-solid fa-clipboard-list mr-2"></i>Activity List
                    </h1>
                    <button
                        onClick={openNewModal}
                        className="btn bg-green-600 hover:bg-green-700 text-white"
                    >
                        <i className="fa-solid fa-plus mr-2"></i>New Activity
                    </button>
                </div>

                <div className="p-6 overflow-x-auto">
                    <DataTable
                    columns={[
                        { key: "activity", label: "Activity Name" },
                        { key: "description", label: "Description" },
                        { key: "created_by", label: "Created By" },
                        { key: "date_created", label: "Date Created" },
                        { key: "actions", label: "Actions" }, // Buttons column
                    ]}
                    data={tableRows}
                    meta={{
                        from: tableData.from,
                        to: tableData.to,
                        total: tableData.total,
                        links: tableData.links,
                        currentPage: tableData.current_page,
                        lastPage: tableData.last_page,
                    }}
                    routeName={route("activity.list")}
                    filters={tableFilters}
                    rowKey="activity"
                    showExport={false}
                    />
                </div>

                {/* MODAL */}
{isModalOpen && (
    <Modal
        id="AddEditActivityModal"
        title={
            <div className="flex items-center gap-2 text-lg font-semibold">
                <i className={`fa-solid ${editMode ? "fa-pen-to-square" : "fa-plus"} text-blue-600`}></i>
                {editMode ? "Edit Activity" : "Add New Activity"}
            </div>
        }
        show={true}
        onClose={() => setIsModalOpen(false)}
        className="w-[450px] max-w-none"
    >
        <div className="space-y-5 p-1">

            {/* Activity Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <i className="fa-solid fa-tag mr-1 text-blue-500"></i> Activity Name
                </label>
                <div className="relative">
                    <i className="fa-solid fa-pen text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                    <input
                        type="text"
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                        placeholder="Enter activity name"
                        className="input input-bordered w-full pl-10 rounded-md focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <i className="fa-solid fa-align-left mr-1 text-blue-500"></i> Description
                </label>
                <div className="relative">
                    <i className="fa-solid fa-note-sticky text-gray-400 absolute left-3 top-3"></i>
                    <textarea
                        value={activityDesc}
                        onChange={(e) => setActivityDesc(e.target.value)}
                        placeholder="Enter description"
                        rows="3"
                        className="textarea textarea-bordered w-full pl-10 rounded-md focus:ring-2 focus:ring-blue-400"
                    ></textarea>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-4 gap-2 pt-3 border-t">
                <button
                    className="btn bg-gray-500 hover:bg-gray-600 text-white px-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <i className="fa-solid fa-xmark mr-1"></i>
                    Cancel
                </button>

                <button
                    className="btn bg-green-600 hover:bg-green-700 text-white px-4"
                    onClick={saveActivity}
                >
                    <i className="fa-solid fa-floppy-disk mr-1"></i>
                    {editMode ? "Update" : "Save"}
                </button>
            </div>
        </div>
    </Modal>
)}

            </div>
        </AuthenticatedLayout>
    );
}
