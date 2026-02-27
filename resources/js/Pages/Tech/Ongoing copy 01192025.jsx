import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react"; // ✅ dagdag usePage para sa flash messages
import DataTable from "@/Components/DataTable";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";



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
  if (lower.startsWith("ongoing") || lower === "on-going")
    return <span className="badge bg-info text-white">{status}</span>;
  if (lower === "complete")
    return <span className="badge bg-success text-white">{status}</span>;
  if (lower.startsWith("for engineer approval"))
    return <span className="badge bg-primary text-white">{status}</span>;
  return <span className="badge bg-secondary text-white">{status}</span>;
}

export default function Activity({
  tableData,
  tableFilters,
  auth,
  empData,
  activityOptions,
  machineOptions,
}) {

  
  const { flash } = usePage().props; // ✅ kunin flash messages galing backend
    // console.log(usePage().props); // ✅ Here!
  const [alertVisible, setAlertVisible] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const empId = empData?.emp_id || "";
  const empName = empData?.emp_name || "";

  

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    emp_id: empId,
    emp_name: empName,
    shift: "",
    my_activity: "",
    machine: "",
    note: "",
  });

// auto update kapag machine nagbago
useEffect(() => {
  if (form.machine === "N/A" && form.status !== "Ongoing") {
    setForm((prev) => ({ ...prev, status: "Ongoing" }));
  } else if (form.machine && form.machine !== "N/A" && form.status !== "On-Going") {
    setForm((prev) => ({ ...prev, status: "On-Going" }));
  }
}, [form.machine, form.status]);



  // ✅ Auto compute shift on mount
  useEffect(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const shift =
      totalMinutes >= 7 * 60 + 1 && totalMinutes <= 19 * 60
        ? "A-Shift"
        : "C-Shift";
    setForm((prev) => ({ ...prev, shift }));
  }, []);

  // ✅ Auto-hide alerts after 3 seconds
  useEffect(() => {
    if (flash.success || flash.error) {
      setAlertVisible(true);
      const timer = setTimeout(() => setAlertVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = (e) => {
  e.preventDefault();

  router.post("/techact/ongoing/add", form, {
    preserveScroll: true,
    onSuccess: () => {
      setForm({
        emp_id: auth.user?.id || "",
        emp_name: auth.user?.name || "",
        shift: "",
        my_activity: "",
        machine: "",
        note: "",
      });
      setShowForm(false);
    },
  });
};

  const filteredData = tableData?.data || [];

  // ✅ Check if current user has ongoing activity
  const hasOngoing = filteredData.some(
    (row) =>
      row.emp_id === empId &&
      (row.status?.toLowerCase() === "ongoing" ||
        row.status?.toLowerCase() === "on-going" )
        // row.status?.toLowerCase() === "for engineer approval")
  );

  const dataWithBadgesAndDuration = filteredData.map((row, index) => {
    const enhancedRow = {
      ...row,
      i: index + 1,
      duration: calculateDuration(row),
      shift: getShiftBadge(row),
      shiftText: row.shift || "", // plain text for modal
      status: getStatusBadge(row.status),
      statusText: row.status || "Unknown", // plain text for modal
    };

    return {
      ...enhancedRow,
      viewDetails:
      enhancedRow.statusText === "For Engineer Approval" ? null : (
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          onClick={() => {
            setSelectedActivity(enhancedRow); // ✅ now passing enhanced row
            setModalOpen(true);
          }}
        >
          <div className="flex items-center">
            <i className="fa-regular fa-eye mr-1"></i>
            View
          </div>
        </button>
      ),
    };
  });

  return (
    <AuthenticatedLayout>
      <Head title="My Ongoing Activities" />
      <div className="p-6">
        {/* ✅ Alert Toast */}
        {alertVisible && flash.success && (
          <div className="mb-4 p-3 rounded bg-green-500 text-white shadow">
            <div className="flex items-center">
              <i className="fa-solid fa-circle-check mr-1"></i>
            {flash.success}
            </div>
          </div>
        )}
        {alertVisible && flash.error && (
          <div className="mb-4 p-3 rounded bg-red-500 text-white shadow">
            <div className="flex items-center">
              <i className="fa-solid fa-shield-virus mr-1"></i>
          {flash.error}
          </div>
          </div>
        )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">My Ongoing Activities</h1>

        {/* ✅ Toggle Insert Form */}
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded mb-4 ${
            hasOngoing
              ? "bg-yellow-400 text-red-500 cursor-not-allowed"
              : "bg-green-600 text-white"
          }`}
          disabled={hasOngoing}
        >
          {hasOngoing
            ? "🚫 You have an ongoing activity !!"
            : "+ Log New Activity"}
        </button>

      </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 grid gap-2 border p-4 rounded"
          >
            <input
              type="text"
              name="status"
              value={form.status}
              hidden
            />

            <input
              name="emp_id"
              value={form.emp_id}
              onChange={handleChange}
              placeholder="Employee ID"
              className="border p-2 text-gray-700 bg-gray-200"
              readOnly
            />
            <input
              name="emp_name"
              value={form.emp_name}
              onChange={handleChange}
              placeholder="Employee Name"
              className="border p-2 text-gray-700 bg-gray-200"
              readOnly
            />
            {/* ✅ Auto selected shift */}
            <select
              name="shift"
              value={form.shift}
              onChange={handleChange}
              className="border p-2 text-gray-700"
              required
            >
              <option disabled value="">
                Select Shift
              </option>
              <option value="A-Shift">A-Shift</option>
              <option value="C-Shift">C-Shift</option>
            </select>

            <select
              name="my_activity"
              value={form.my_activity}
              onChange={handleChange}
              className="border p-2 text-gray-700"
              required
            >
              <option disabled value="">
                Select Activity
              </option>
              {activityOptions.map((activity, idx) => (
                <option key={idx} value={activity}>
                  {activity}
                </option>
              ))}
            </select>

            <select
              name="machine"
              value={form.machine}
              onChange={handleChange}
              className="border p-2 text-gray-700"
              required
            >
              <option disabled value="">
                Select Machine
              </option>
              <option value="N/A">N/A</option>
              {machineOptions.map((machine_num, idx) => (
                <option key={idx} value={machine_num}>
                  {machine_num}
                </option>
              ))}
            </select>

            <input
              name="log_time"
              value={(() => {
                const now = new Date();
                const monthNames = [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ];
                return `${monthNames[now.getMonth()]}/${String(
                  now.getDate()
                ).padStart(2, "0")}/${now.getFullYear()} ${String(
                  now.getHours()
                ).padStart(2, "0")}:${String(now.getMinutes()).padStart(
                  2,
                  "0"
                )}:${String(now.getSeconds()).padStart(2, "0")}`;
              })()}
              onChange={handleChange}
              placeholder="Log Time"
               className="border p-2 text-gray-700 bg-gray-200"
              readOnly
            />

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Note"
              className="border py-10 text-gray-700"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded flex items-center justify-center"
            >
              <i className="fa-regular fa-bookmark mr-1"></i>
              Save
            </button>
          </form>
        )}

        <DataTable
          columns={[
            { key: "emp_name", label: "Technician" },
            { key: "shift", label: "Shift" },
            { key: "my_activity", label: "Activity" },
            { key: "machine", label: "Machine" },
            { key: "log_time", label: "Date Log" },
            // { key: "time_out", label: "Done Date" },
            { key: "duration", label: "Time Duration" },
            { key: "status", label: "Status" },
            { key: "note", label: "Comment" },
            { key: "viewDetails", label: "Action" },
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
          routeName={route("tech.ongoing")}
          filters={tableFilters}
          rowKey="id"
          sortBy="id"
          sortOrder="desc"
        />

         {/* Modal */}
{modalOpen && selectedActivity && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded shadow-lg w-1/3">
      <h2 className="text-xl font-bold mb-4 text-gray-200">
        <div className="flex items-center bg-gray-500 p-2 rounded text-white">
          <i className="fa-solid fa-circle-info text-4xl mr-1"></i>
          My Activity
        </div>
      </h2>

      <form
       onSubmit={(e) => {
  e.preventDefault();

  // Check if the activity requires supervisor approval
  if (selectedActivity.statusText === "On-Going") {
    toast.info(
      "Please inform your Supervisor to approve this activity so it can be counted as complete and included in the daily ranking."
    );
  }

  router.put(`/techact/ongoing/update/${selectedActivity.id}`, {
    time_out: new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    my_activity: selectedActivity.my_activity,
    machine: selectedActivity.machine,
    note: selectedActivity.note,
    status: selectedActivity.statusText,
  }, {
    onSuccess: () => {
      toast.success("Activity updated successfully!");
      setModalOpen(false);
      setSelectedActivity(null);
      window.location.reload(); // refresh table
    },
    onError: () => {
      toast.error("Failed to update activity. Please try again.");
    }
  });
}}

      >
        <div className="mb-4">
          <label className="block text-white mb-1">Done Time</label>
          <input
            name="time_out"
            value={new Date().toLocaleString()}
            className="border p-2 text-blue-300 bg-gray-600 w-full mb-2"
            readOnly
          />

          <label className="block text-white mb-1">Activity</label>
          <input
            type="text"
            value={selectedActivity.my_activity}
            className="border p-2 text-blue-300 bg-gray-600 w-full mb-2"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block text-white mb-1">Machine</label>
          <input
            type="text"
            value={selectedActivity.machine}
            className="border p-2 text-blue-300 bg-gray-600 w-full mb-2"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block text-white mb-1">Note</label>
          <textarea
            value={selectedActivity.note || ""}
            onChange={(e) =>
              setSelectedActivity({
                ...selectedActivity,
                note: e.target.value,
              })
            }
            className="w-full p-3 rounded border text-gray-800"
          />
        </div>

        {/* ✅ Only show Approval Remarks if not empty */}
        {selectedActivity.remarks && selectedActivity.remarks.trim() !== "" && (
          <div className="mb-4">
            <label className="block text-white mb-1">Approval Remarks</label>
            <textarea
              value={selectedActivity.remarks}
              readOnly
              className="w-full p-3 rounded border text-gray-800 bg-gray-300 cursor-not-allowed"
            />
          </div>
        )}

        <div className="flex justify-between">
 <button
            type="button"
            onClick={() => {
              setModalOpen(false);
              setSelectedActivity(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            <div className="flex items-center">
              <i className="fa-regular fa-rectangle-xmark text-2xl mr-1"></i>
              Close
            </div>
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            <div className="flex items-center">
              <i className="fa-regular fa-square-check text-2xl mr-1"></i>
              Done
            </div>
          </button>

         
        </div>
      </form>
    </div>
  </div>
)}



      </div>
    </AuthenticatedLayout>
  );
}
