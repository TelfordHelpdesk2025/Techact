import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import toast from "react-hot-toast"; // if you use toast notifications

export default function MassApproval({ activities = [], empData = {} }) {
  const [selected, setSelected] = useState([]);
  const [activitiesState, setActivitiesState] = useState(activities);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [form, setForm] = useState({
    remarks: "",
    emp_id: empData?.emp_id,
    emp_name: empData?.emp_name,
  });

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMassApprove = () => {
    if (!selected.length) return alert("No activities selected!");

    router.put(
      "/tech/forApproval/mass/approve",
      {
        ids: selected,
        approver_id: form.emp_id,
        approver_name: form.emp_name,
        approve_date:new Date().toLocaleString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }),
      },
      {
        preserveScroll: true,
        headers: { "Content-Type": "application/json" },
        onSuccess: () => {
          // Update the status of selected activities in state
          setActivitiesState((prev) =>
            prev.map((a) =>
              selected.includes(a.id) ? { ...a, status: "Ongoing" } : a
            )
          );
          setSelected([]); // reset selection
          alert(`✅ Successfully approved ${selected.length} activities`);
          window.location.reload();
        },
        
        onError: (errors) => {
          console.error(errors);
          toast.error("Mass approval failed!");
        },
      }
    );
  };

 const handleSingleAction = (actionType) => {
  if (!form.remarks?.trim()) {
    return alert("Remarks are required before " + actionType + ".");
  }

  const url =
    actionType === "approve"
      ? `/techact/forApproval/approve/${selectedActivity.id}`
      : `/techact/forApproval/reject/${selectedActivity.id}`;

  const payload =
    actionType === "approve"
      ? {
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
          status: selectedActivity.status,
        }
      : {
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
          remarks: form.remarks,
        };

  router.put(url, payload, {
    onSuccess: () => {
      setActivitiesState((prev) =>
        prev.map((a) =>
          a.id === selectedActivity.id
            ? {
                ...a,
                status: actionType === "approve" ? "Ongoing" : "Rejected",
              }
            : a
        )
      );
      setModalOpen(false);
      setSelectedActivity(null);
      alert(
        `✅ Activity ${actionType === "approve" ? "approved" : "rejected"} successfully!`
      ),
      window.location.reload();
    },
    onError: () => {
      alert(`Failed to ${actionType} activity.`);
    },
  });
};


  return (
    <AuthenticatedLayout>
      <Head title="Mass Approval" />
      <div className="p-6">
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <i className="fa-solid fa-list-check text-blue-600"></i>
      For Approval Activities - Mass Approval
    </h1>

    {selected.length > 0 && (
      <button
        onClick={handleMassApprove}
        className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
      >
        Approve Selected ({selected.length})
      </button>
    )}
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-300 text-left text-gray-700 rounded-lg">
      <thead className="bg-gray-700 text-white">
        <tr>
          <th className="px-4 py-2">
            <input
              type="checkbox"
              checked={
                activitiesState.length > 0 && selected.length === activitiesState.length
              }
              onChange={(e) =>
                setSelected(
                  e.target.checked ? activitiesState.map((a) => a.id) : []
                )
              }
            />
          </th>
          <th className="px-4 py-2">Technician</th>
          <th className="px-4 py-2">Date Log</th>
          <th className="px-4 py-2">Activity</th>
          <th className="px-4 py-2">Machine</th>
          <th className="px-4 py-2">Approval Waiting Time</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {activitiesState.map((a, idx) => (
          <tr
            key={a.id}
            className={`${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-gray-100 transition`}
          >
            <td className="px-4 py-2">
              <input
                type="checkbox"
                checked={selected.includes(a.id)}
                onChange={() => toggleSelect(a.id)}
              />
            </td>
            <td className="px-4 py-2">{a.emp_name}</td>
            <td className="px-4 py-2">{a.log_time}</td>
            <td className="px-4 py-2">{a.my_activity}</td>
            <td className="px-4 py-2">{a.machine}</td>
            <td className="px-4 py-2">
              {a.time_out
                ? Math.floor((new Date() - new Date(a.time_out)) / 60000) + " min"
                : "-"}
            </td>
            <td className="px-4 py-2 font-medium text-gray-800">{a.status}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => {
                  setSelectedActivity(a);
                  setModalOpen(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

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
                <div className="mb-4">
                  <label className="block text-white mb-1">Activity</label>
                  <input
                    type="text"
                    value={selectedActivity.my_activity}
                    className="w-full p-2 rounded border bg-gray-600 text-white"
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-1">Machine</label>
                  <input
                    type="text"
                    value={selectedActivity.machine}
                    className="w-full p-2 rounded border bg-gray-600 text-white"
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-1">Status</label>
                  <input
                    type="text"
                    value={selectedActivity.statusText || selectedActivity.status}
                    className="w-full p-2 rounded border bg-blue-900 text-white"
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-1">Note</label>
                  <textarea
                    value={selectedActivity.note || ""}
                    className="w-full p-3 rounded border text-white bg-gray-600"
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-1">Approver Remarks</label>
                  <textarea
                    value={form.remarks || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                    className="w-full p-3 rounded border text-gray-700 bg-white"
                    placeholder="Enter your remarks here..."
                  />
                </div>

                <div className="flex justify-between">
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
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center"
                      onClick={() => handleSingleAction("reject")}
                    >
                      <i className="fa-solid fa-ban mr-1"></i>
                      Reject
                    </button>

                    <button
                      type="button"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center"
                      onClick={() => handleSingleAction("approve")}
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
