import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";

// function calculateDuration(row) {
//   const { log_time, time_out, status } = row;

//   const start = log_time ? new Date(log_time) : null;
//   let end = null;

//   // ✅ Kung may time_out gamitin siya, kung wala current time ang fallback
//   if (time_out) {
//     end = new Date(time_out);
//   } else {
//     end = new Date(); 
//   }

//   if (!start || isNaN(start) || !end || isNaN(end)) return "-";

//   const diffMs = end - start;
//   if (diffMs < 0) return "-";

//   const diffMinutes = Math.floor(diffMs / 60000);
//   if (diffMinutes > 0) return `${diffMinutes} min`;

//   const diffSeconds = Math.floor(diffMs / 1000);
//   return `${diffSeconds} secs`;
// }


function getShiftBadge(row) {
  let shift = row.shift || "";
  let badgeClass = "badge bg-secondary";
  if (!shift) {
    const logDate = new Date(row.log_time);
    if (!isNaN(logDate)) {
      const hours = logDate.getHours();
      const minutes = logDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes >= 7 * 60 + 1 && totalMinutes <= 19 * 60) {
        shift = "A-Shift";
        badgeClass = "badge bg-primary text-white";
      } else {
        shift = "C-Shift";
        badgeClass = "badge bg-warning text-white";
      }
    } else {
      shift = "Unknown";
      badgeClass = "badge bg-secondary text-white";
    }
  } else {
    if (shift === "A-Shift") badgeClass = "badge bg-primary  text-white";
    else if (shift === "C-Shift") badgeClass = "badge bg-warning  text-white";
  }
  return <span className={badgeClass}>{shift}</span>;
}

function getStatusBadge(status) {
  if (!status) return <span className="badge bg-secondary text-white">Unknown</span>;
  const lower = status.toLowerCase();
  if (lower.startsWith("ongoing") || lower === "on-going" || lower === "on going")
    return <span className="badge bg-info text-white">{status}</span>;
  if (lower === "complete")
    return <span className="badge bg-success text-white">{status}</span>;
  if (lower.startsWith("for engineer approval"))
    return <span className="badge bg-primary text-white">{status}</span>;
  if (lower === "rejected")
    return <span className="badge bg-red-600 text-bold text-white">{status}</span>;
  return <span className="badge bg-secondary text-white">{status}</span>;
}
export default function DeletedActivity({ tableData, tableFilters }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const deleteActivity = (id) => {
    if (confirm("Are you sure you want to delete this activity?")) {
        router.delete(route('activity.permanent-delete', { id }), {
            preserveScroll: true,
            onSuccess: () => {
                alert("🗑️ Activity deleted successfully!");
            },
        });
    }
};


 const dataWithBadgesAndDuration = (tableData?.data || []).map((row, index) => ({
  ...row,
  i: index + 1,
  // duration: calculateDuration(row),
  shift: getShiftBadge(row),
  status: getStatusBadge(row.status),



  viewDetails: (
    <div className="flex gap-2">
      {/* View Button */}
      <button
        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        onClick={() => {
          setSelectedActivity(row);
          setModalOpen(true);
        }}
      >
        <div className="flex items-center">
          <i className="fa-solid fa-eye mr-1"></i>
        </div>
      </button>

      

      {/* Restore Button */}
      <button
        className="px-3 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-700"
        onClick={() => {
          if (confirm("Are you sure you want to mark this as Restore?")) {
            router.put(
              route("activity.restore-status", { id: row.id }),
              { item_status: "Restored" },
              {
                  onSuccess: () => {
                  alert("↩️ Item marked as Restored");
                  window.location.reload(); // ✅ reload after success
                  },
                  onError: () => alert("❌ Failed to restore this Activity...!"),
              }
            );
          }
        }}
      >
        <div className="flex items-center">
          <i className="fa-solid fa-undo mr-1"></i>
        </div>
      </button>

      {/* Delete Button */}
      <button
        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
      <Head title="Deleted Activities" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4"> 
          <i className="fa-regular fa-trash-can mr-1"></i>
          Deleted Activities
        </h1>

        <DataTable
          columns={[
            { key: "emp_name", label: "Technician" },
            { key: "shift", label: "Shift" },
            { key: "my_activity", label: "Activity" },
            { key: "machine", label: "Machine" },
            { key: "log_time", label: "Date Log" },
            { key: "time_out", label: "Done Date" },
            // { key: "duration", label: "Time Duration" },
            { key: "status", label: "Status" },
            { key: "note", label: "Comment" },
            { key: "viewDetails", label: "Details" }, // Button to open modal
          ]}
          data={dataWithBadgesAndDuration}
          meta={{
            from: tableData?.from,
            to: tableData?.to,
            total: tableData?.total,
            links: tableData?.links,
            currentPage: tableData?.current_page,
            lastPage: tableData?.last_page,
          }}
          routeName={route("tech.activity.deleted")}
          filters={tableFilters}
          rowKey="id"
        />

        {/* Modal */}
       {modalOpen && selectedActivity && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-55">
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-[420px]">
      {/* Header */}
      <div className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg mb-4 text-white">
        <i className="fa-solid fa-circle-info text-4xl mr-1"></i>
        <h2 className="text-lg font-bold">Activity Details</h2>
      </div>

      {/* Details List (left aligned) */}
      <div className="space-y-3 text-sm text-gray-200">
  {[
    ["Technician", selectedActivity.emp_name],
    ["Shift", selectedActivity.shift],
    ["Activity", selectedActivity.my_activity],
    ["Machine", selectedActivity.machine],
    ["Log Time", selectedActivity.log_time],
    ["Time Out", selectedActivity.time_out || "-"],
    ["Status", selectedActivity.status],
    ["Note", selectedActivity.note || "-"],
    // Conditional Approver
    ...(selectedActivity.approver_id
      ? [
          ["Approver", selectedActivity.approver_name],
          ["Approved Date", selectedActivity.approve_date],
          ["Remarks", selectedActivity.remarks],
        ]
      : []),
    // Conditional Rejector
    ...(selectedActivity.rejector_id
      ? [
          ["Rejector", selectedActivity.rejector_name],
          ["Rejected Date", selectedActivity.rejected_date],
          ["Remarks", selectedActivity.remarks],
        ]
      : []),
  ].map(([label, value], idx) => (
    <div key={idx} className="border-b border-gray-700 pb-2">
      <p className="text-gray-400 font-semibold">{label}:</p>
      <p className="text-white ml-2">{value}</p>
    </div>
  ))}
</div>


      {/* Close Button */}
      <div className="mt-6 text-right">
        <button
          onClick={() => setModalOpen(false)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition"
        >
          <i className="fa-regular fa-rectangle-xmark text-2xl"></i>
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </AuthenticatedLayout>
  );
}
