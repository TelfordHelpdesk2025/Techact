import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";

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
        badgeClass = "badge bg-primary text-black";
      } else {
        shift = "C-Shift";
        badgeClass = "badge bg-warning text-black";
      }
    } else {
      shift = "Unknown";
      badgeClass = "badge bg-secondary text-black";
    }
  } else {
    if (shift === "A-Shift") badgeClass = "badge bg-primary  text-black";
    else if (shift === "C-Shift") badgeClass = "badge bg-warning  text-black";
  }
  return <span className={badgeClass}>{shift}</span>;
}

function getStatusBadge(status) {
  if (!status) return <span className="badge bg-secondary text-black">Unknown</span>;
  const lower = status.toLowerCase();
  if (lower.startsWith("ongoing") || lower === "on-going" || lower === "on going")
    return <span className="badge bg-info text-black">{status}</span>;
  if (lower === "complete")
    return <span className="badge bg-success text-black">{status}</span>;
  if (lower.startsWith("for engineer approval"))
    return <span className="badge bg-primary text-black">{status}</span>;
  if (lower === "reject")
    return <span className="badge bg-red-600 text-bold text-black">{status}</span>;
  return <span className="badge bg-secondary text-black">{status}</span>;
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
      <button
        className="px-3 py-2 bg-gray-500 text-white rounded-md"
        onClick={() => {
          setSelectedActivity(row);
          setModalOpen(true);
        }}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>&nbsp;View
        </div>
      </button>
    ),
  }));

  return (
    <AuthenticatedLayout>
      <Head title="All Activities" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">All Activities</h1>

        <DataTable
          columns={[
            { key: "emp_name", label: "Technician" },
            { key: "shift", label: "Shift" },
            { key: "my_activity", label: "Activity" },
            { key: "machine", label: "Machine" },
            { key: "log_time", label: "Date Log" },
            { key: "time_out", label: "Done Date" },
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
          showExport={true}
          sortBy="id"
          sortOrder="desc"
        />

        {/* Modal */}
       {modalOpen && selectedActivity && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-55">
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-[420px]">
      {/* Header */}
      <div className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg mb-4 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             strokeWidth={1.5} stroke="currentColor" className="size-8 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 
                   2.836a.75.75 0 0 0 1.063.853l.041-.021M21 
                   12a9 9 0 1 1-18 0 9 9 0 0 1 18 
                   0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 
                     4.5M21 12a9 9 0 1 1-18 0 
                     9 9 0 0 1 18 0Z" />
          </svg>
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
