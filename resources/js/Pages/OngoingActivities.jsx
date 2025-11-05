import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OngoingActivities() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    emp_id: "",
    emp_name: "",
    shift: "",
    my_activity: "",
    machine: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = () => {
    axios
      .get("http://127.0.0.1:8000/api/activities")
      .then((res) => setActivities(res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      axios
        .put(`http://127.0.0.1:8000/api/activities/${editingId}`, form)
        .then((res) => {
          setActivities(
            activities.map((act) => (act.id === editingId ? res.data : act))
          );
          resetForm();
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .post("http://127.0.0.1:8000/api/activities", form)
        .then((res) => {
          setActivities([res.data, ...activities]);
          resetForm();
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEdit = (activity) => {
    setForm({
      emp_id: activity.emp_id,
      emp_name: activity.emp_name,
      shift: activity.shift,
      my_activity: activity.my_activity,
      machine: activity.machine,
      note: activity.note,
    });
    setEditingId(activity.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      axios
        .delete(`http://127.0.0.1:8000/api/activities/${id}`)
        .then(() => {
          setActivities(activities.filter((act) => act.id !== id));
        })
        .catch((err) => console.error(err));
    }
  };

  const resetForm = () => {
    setForm({
      emp_id: "",
      emp_name: "",
      shift: "",
      my_activity: "",
      machine: "",
      note: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ongoing Activities</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {showForm ? "Close Form" : "+ Log New Activity"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid gap-2 border p-4 rounded"
        >
          <input
            name="emp_id"
            value={form.emp_id}
            onChange={handleChange}
            placeholder="Employee ID"
            className="border p-2"
            required
          />
          <input
            name="emp_name"
            value={form.emp_name}
            onChange={handleChange}
            placeholder="Employee Name"
            className="border p-2"
            required
          />
          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="border p-2"
            required
          >
            <option value="">Select Shift</option>
            <option value="A-Shift">A-Shift 7:00 - 19:00</option>
            <option value="C-Shift">C-Shift</option>
          </select>
          <input
            name="my_activity"
            value={form.my_activity}
            onChange={handleChange}
            placeholder="Activity"
            className="border p-2"
            required
          />
          <input
            name="machine"
            value={form.machine}
            onChange={handleChange}
            placeholder="Machine"
            className="border p-2"
            required
          />
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Note"
            className="border p-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Emp ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Shift</th>
            <th className="border px-2 py-1">Activity</th>
            <th className="border px-2 py-1">Machine</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Log Time</th>
            <th className="border px-2 py-1">Note</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((act) => (
            <tr key={act.id}>
              <td className="border px-2 py-1">{act.emp_id}</td>
              <td className="border px-2 py-1">{act.emp_name}</td>
              <td className="border px-2 py-1">{act.shift}</td>
              <td className="border px-2 py-1">{act.my_activity}</td>
              <td className="border px-2 py-1">{act.machine}</td>
              <td className="border px-2 py-1 text-blue-600">{act.status}</td>
              <td className="border px-2 py-1">{formatDate(act.log_time)}</td>
              <td className="border px-2 py-1">{act.note}</td>
              <td className="border px-2 py-1 flex gap-2">
                <button
                  onClick={() => handleEdit(act)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(act.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
