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
    note: ""
  });

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/activity")
      .then(res => setActivities(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/activities", form)
      .then(res => {
        setActivities([res.data, ...activities]);
        setForm({ emp_id: "", emp_name: "", shift: "", my_activity: "", machine: "", note: "" });
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ongoing Activities</h1>

      <button
        onClick={() => document.getElementById("activityForm").classList.toggle("hidden")}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        + Log New Activity
      </button>

      <form id="activityForm" onSubmit={handleSubmit} className="hidden mb-6 grid gap-2 border p-4 rounded">
        <input name="emp_id" value={form.emp_id} onChange={handleChange} placeholder="Employee ID" className="border p-2" required />
        <input name="emp_name" value={form.emp_name} onChange={handleChange} placeholder="Employee Name" className="border p-2" required />
        <select name="shift" value={form.shift} onChange={handleChange} className="border p-2" required>
          <option value="">Select Shift</option>
          <option value="A-Shift">A-Shift 7:00 - 19:00</option>
          <option value="C-Shift">C-Shift</option>
        </select>
        <input name="my_activity" value={form.activity_list} onChange={handleChange} placeholder="Activity" className="border p-2" required />
        <input name="machine" value={form.machine} onChange={handleChange} placeholder="Machine" className="border p-2" required />
        <textarea name="note" value={form.note} onChange={handleChange} placeholder="Note" className="border p-2" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
      </form>

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
              <td className="border px-2 py-1">{act.log_time}</td>
              <td className="border px-2 py-1">{act.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
