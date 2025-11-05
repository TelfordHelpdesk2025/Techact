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
  if (lower.startsWith("ongoing") || lower === "on-going")
    return <span className="badge bg-info text-black">{status}</span>;
  if (lower === "complete")
    return <span className="badge bg-success text-black">{status}</span>;
  if (lower.startsWith("for engineer approval"))
    return <span className="badge bg-primary text-black">{status}</span>;
  return <span className="badge bg-secondary text-black">{status}</span>;
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
        row.status?.toLowerCase() === "on-going" ||
        row.status?.toLowerCase() === "for engineer approval")
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
          className="px-3 py-2 bg-gray-500 text-white rounded-md"
          onClick={() => {
            setSelectedActivity(enhancedRow); // ✅ now passing enhanced row
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
            </svg>
            &nbsp;View
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            &nbsp;
            {flash.success}
            </div>
          </div>
        )}
        {alertVisible && flash.error && (
          <div className="mb-4 p-3 rounded bg-red-500 text-white shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
              </svg>
          &nbsp;
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
              className="bg-green-600 text-white px-4 py-3 rounded flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
              </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="size-12">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 9-3.75h.008v.008H12V8.25Z" />
          </svg>
          &nbsp; My Activity
        </div>
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();

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
            className="border p-2 text-green-300 bg-gray-600 w-full mb-2"
            readOnly
          />

          <label className="block text-white mb-1">Activity</label>
          <input
            type="text"
            value={selectedActivity.my_activity}
            className="w-full p-2 rounded border bg-gray-600"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block text-white mb-1">Machine</label>
          <input
            type="text"
            value={selectedActivity.machine}
            className="w-full p-2 rounded border bg-gray-600"
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
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor"
                className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 
                     4.5M21 12a9 9 0 1 1-18 0 9 
                     9 0 0 1 18 0Z" />
              </svg>
              Close
            </div>
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor"
                className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 
                     1.125v17.25c0 .621.504 1.125 
                     1.125 1.125h12.75c.621 0 1.125-.504 
                     1.125-1.125v-9M10.125 2.25h.375a9 
                     9 0 0 1 9 9v.375M10.125 2.25A3.375 
                     3.375 0 0 1 13.5 5.625v1.5c0 
                     .621.504 1.125 1.125 1.125h1.5a3.375 
                     3.375 0 0 1 3.375 3.375M9 15l2.25 
                     2.25L15 12" />
              </svg>
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
