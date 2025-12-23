import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react"; // ✅ dagdag usePage para sa flash messages
import DataTable from "@/Components/DataTable";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// function calculateDuration(row) {
//   const { time_out, approve_date } = row;

//   if (!time_out) return "-";

//   // Start = time_out
//   const start = new Date(time_out);

//   // End = approve_date OR current time
//   const end = approve_date
//     ? new Date(approve_date)
//     : new Date();

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";

//   const diffMs = end - start;
//   if (diffMs < 0) return "-";

//   const diffMinutes = Math.floor(diffMs / 60000);

//   if (diffMinutes >= 60) {
//     const hrs = Math.floor(diffMinutes / 60);
//     const mins = diffMinutes % 60;
//     return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min`;
//   }

//   if (diffMinutes > 0) return `${diffMinutes} min`;

//   return `${Math.floor(diffMs / 1000)} secs`;
// }

function formatDuration(start, end) {
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

function useRunningDuration(row) {
  const { time_out, approve_date } = row;
  const [duration, setDuration] = useState("-");

  useEffect(() => {
    if (!time_out) {
      setDuration("-");
      return;
    }

    const start = new Date(time_out);

    const update = () => {
      const end = approve_date
        ? new Date(approve_date)
        : new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setDuration("-");
        return;
      }

      setDuration(formatDuration(start, end));
    };

    update(); // initial run

    // Run every second ONLY if not approved yet
    if (!approve_date) {
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [time_out, approve_date]);

  return duration;
}

function DurationCell({ row }) {
  const duration = useRunningDuration(row);
  return <span className="font-mono">{duration}</span>;
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
    return <span className="badge bg-blue-800 text-white">{status}</span>;
  return <span className="badge bg-secondary text-white">{status}</span>;
}

export default function Activity({
  tableData,
  tableFilters,
  auth,
  empData,
  children,
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



  const filteredData = tableData?.data || [];

  // ✅ Check if current user has ongoing activity
  const hasOngoing = filteredData.some(
    (row) =>
      row.emp_id === empId &&
      (row.status?.toLowerCase() === "for engineer approval")
  );

  const dataWithBadgesAndDuration = filteredData.map((row, index) => {
  const enhancedRow = {
    ...row,
    i: index + 1,

    // ✅ LIVE running duration
    duration: <DurationCell row={row} />,

    shift: getShiftBadge(row),
    shiftText: row.shift || "",
    status: getStatusBadge(row.status),
    statusText: row.status || "Unknown",
  };

 

  return {

    
    ...enhancedRow,
    viewDetails: (
      <button
        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        onClick={() => {
          setSelectedActivity(enhancedRow);
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
      <Head title="For Approval Activities" />
      <div className="p-6">
       
        <div className="flex justify-between items-center mb-3 p-4 bg-gradient-to-r from-gray-600 to-black rounded-t-2xl text-white">
  <h1 className="text-2xl font-bold">For Approval Activities</h1>

  <button
  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 flex items-center"
  onClick={() => router.get(route("tech.forApproval.mass"))} // SPA navigation
>
  <i className="fa-solid fa-list-check mr-2"></i> Multiple Approved
</button>

</div>

        
        <DataTable
          columns={[
            { key: "emp_name", label: "Technician" },
            { key: "shift", label: "Shift" },
            { key: "my_activity", label: "Activity" },
            { key: "machine", label: "Machine" },
            { key: "time_out", label: "Date Done" },
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
          routeName={route("tech.forApproval")}
          filters={tableFilters}
          rowKey="id"
          sortBy="id"
          sortOrder="desc"
        />

         {/* Modal */}
{/* Modal */}
{modalOpen && selectedActivity && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded shadow-lg w-1/3">
      <h2 className="text-xl font-bold mb-4 text-gray-200">
        <div className="flex items-center bg-blue-500 p-2 rounded text-white">
           <i className="fa-solid fa-circle-info text-4xl mr-1"></i>
          For Approval Activity Details
        </div>
      </h2>

      <form>

        {/* Hidden Fields */}
        <input hidden name="approver_id" value={form.emp_id} />
        <input hidden name="approver_name" value={form.emp_name} />
        <input hidden name="approve_date" value={new Date().toLocaleString()} />

        {/* Activity */}
        <div className="mb-4">
          <label className="block text-white mb-1">Activity</label>
          <input
            type="text"
            value={selectedActivity.my_activity}
            className="w-full p-2 rounded border bg-gray-600 text-white"
            readOnly
          />
        </div>

        {/* Machine */}
        <div className="mb-4">
          <label className="block text-white mb-1">Machine</label>
          <input
            type="text"
            value={selectedActivity.machine}
            className="w-full p-2 rounded border bg-gray-600 text-white"
            readOnly
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block text-white mb-1">Status</label>
          <input
            type="text"
            value={selectedActivity.statusText}
            style={{ textTransform: "capitalize" }}
            className="w-full p-2 rounded border bg-blue-900 text-white"
            readOnly
          />
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block text-white mb-1">Note</label>
          <textarea
            value={selectedActivity.note || ""}
            className="w-full p-3 rounded border text-white bg-gray-600"
            readOnly
          />
        </div>

        {/* Remarks */}
        <div className="mb-4">
          <label className="block text-white mb-1">Approver Remarks</label>
          <textarea
            value={form.remarks || ""}
            onChange={(e) => setForm(prev => ({ ...prev, remarks: e.target.value }))}
            className="w-full p-3 rounded border text-gray-700 bg-white"
            placeholder="Enter your remarks here..."
            required
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between">

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => {
              setModalOpen(false);
              setSelectedActivity(null);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center"
          >
            <i className="fa-solid fa-xmark mr-1"></i>
            Close
          </button>

          <div className="flex gap-2">
 <>
      {children}

      {/* REQUIRED FOR TOASTS */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
            {/* REJECT BUTTON */}
<button
  type="button"
  disabled={!form.remarks?.trim()}
  title={!form.remarks?.trim() ? "Remarks are required to reject" : ""}
  className={`px-4 py-2 rounded flex items-center
    ${
      !form.remarks?.trim()
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700 text-white"
    }
  `}
  onClick={() => {
    if (!form.remarks || !form.remarks.trim()) {
      toast.error("Remarks are required before rejecting.");
      return;
    }

    router.put(
      `/techact/forApproval/reject/${selectedActivity.id}`,
      {
        rejector_id: form.emp_id,
        rejector_name: form.emp_name,
        rejected_date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        remarks: form.remarks.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Activity rejected successfully!");
          setModalOpen(false);
          setSelectedActivity(null);
        },
        onError: () => {
          toast.error("Failed to reject activity.");
        },
      }
    );
  }}
>
  <i className="fa-solid fa-ban mr-1"></i>
  Reject
</button>


            {/* APPROVE BUTTON - NOW SAFE */}
            <button
              type="button"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center"
              onClick={() => {
                router.put(
                  `/techact/forApproval/approve/${selectedActivity.id}`,
                  {
                    approver_id: form.emp_id,
                    approver_name: form.emp_name,
                    approve_date: new Date().toLocaleString("en-US", {
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
                    remarks: form.remarks,
                    status: selectedActivity.statusText,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Activity approved successfully!");
                      alert("✅ Activity approved successfully!");
                      setModalOpen(false);
                      setSelectedActivity(null);
                      window.location.reload();
                    },
                    onError: () => {
                      toast.error("Failed to approve activity.");
                    }
                  }
                );
              }}
            >
              <i className="fa-regular fa-thumbs-up mr-1"></i>
              Approve
            </button>

          </div>
        </div>
      </form>
    </div>
  </div>
)}




      </div>
    </AuthenticatedLayout>
  );
}
