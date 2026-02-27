import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";

function formatDurationBetween(startStr, endStr) {
  if (!startStr) return "-";

  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";

  const diffMs = end - start;
  if (diffMs < 0) return "-";

  const totalSeconds = Math.floor(diffMs / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}


function calculateDuration(row) {
  const { log_time, time_out, status } = row;

  const start = log_time ? new Date(log_time) : null;
  let end = null;

  // ✅ Kung may time_out gamitin siya, kung wala current time ang fallback
  if (time_out) {
    end = new Date(time_out);
  } else {
    end = new Date(); 
  }

  if (!start || isNaN(start) || !end || isNaN(end)) return "-";

  const diffMs = end - start;
  if (diffMs < 0) return "-";

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes > 0) return `${diffMinutes} min`;

  const diffSeconds = Math.floor(diffMs / 1000);
  return `${diffSeconds} secs`;
}


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
export default function Activity({ tableData, tableFilters }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

 const dataWithBadgesAndDuration = (tableData?.data || []).map((row, index) => ({
  ...row,
  i: index + 1,
  duration: calculateDuration(row),
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
          View
        </div>
      </button>

      {/* Delete Button */}
      <button
        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        onClick={() => {
          if (confirm("Are you sure you want to mark this as Deleted?")) {
            router.put(
              route("activity.deleted-status", { id: row.id }),
              { item_status: "Deleted" },
              {
                  onSuccess: () => {
                  alert("🗑️ Item marked as Deleted");
                  window.location.reload(); // ✅ reload after success
                  },
                  onError: () => alert("❌ Failed to remove this activity...!"),
              }
            );
          }
        }}
      >
        <div className="flex items-center">
          <i className="fa-solid fa-trash mr-1"></i>
          Remove
        </div>
      </button>
    </div>
  ),
}));



  return (
    <AuthenticatedLayout>
      <Head title="All Activities" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 animate-pulse"><i className="fa-solid fa-list mr-2"></i>All Activities</h1>
      <div className="p-6 overflow-x-auto">
        <DataTable
          columns={[
            { key: "emp_name", label: "Technician" },
            { key: "shift", label: "Shift" },
            { key: "my_activity", label: "Activity" },
            { key: "machine", label: "Machine" },
            { key: "log_time", label: "Date Log" },
            { key: "time_out", label: "Completion Time" },
            { key: "duration", label: "Time Duration" },
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
          routeName={route("tech.activity")}
          filters={tableFilters}
          rowKey="id"
          // showExport={false}
          // sortBy="emp_name"
          // sortOrder="desc"
        />
      </div>
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
      <div className="space-y-3 text-sm text-gray-200 max-h-[60vh] overflow-y-auto pr-2">
  {[
    ["Technician", selectedActivity.emp_name],
    ["Shift", selectedActivity.shift],
    ["Activity", selectedActivity.my_activity],
    ["Machine", selectedActivity.machine],
    ["Log Time", selectedActivity.log_time],
    ["Completion Time", selectedActivity.time_out || "-"],
    ["Activity Duration", calculateDuration(selectedActivity)],
    ["Status", selectedActivity.status],
    ["Note", selectedActivity.note || "-"],
    // Conditional Approver
    ...(selectedActivity.approver_id
      ? [
          ["Approver", selectedActivity.approver_name],
          ["Approved Date", selectedActivity.approve_date],
          ["Remarks", selectedActivity.remarks],
        [
  "Approval Duration Time",
  formatDurationBetween(
    selectedActivity.time_out,
    selectedActivity.approve_date
  )
],


        ]
      : []),
    // Conditional Rejector
    ...(selectedActivity.rejector_id
      ? [
          ["Rejector", selectedActivity.rejector_name],
          ["Rejected Date", selectedActivity.rejected_date],
          ["Remarks", selectedActivity.reject_remarks],
          [
  "Approval Duration Time",
  formatDurationBetween(
    selectedActivity.time_out,
    selectedActivity.rejected_date
  )
],
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
