import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";

export default function QuarterlyExportTool() {
  const [quarter, setQuarter] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!quarter || !year) return alert("Select quarter and year");
    setLoading(true);
    try {
      const res = await axios.get(route("api.export.activities"), {
  params: { quarter, year },
});

      setRows(res.data.slice(0, 10000)); // Limit to 10,000 rows for preview
      setMessage(`Found ${res.data.length} record(s)`);
    } catch (err) {
      console.error(err);
      setMessage("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

const handleExport = () => {
  if (!rows.length) return alert("Preview data first");

  // ✅ CSV-safe wrapper
  const escapeCsvValue = (value) => {
    if (value == null) return "";
    value = String(value);
    // Wrap in quotes if contains comma, quote, or newline
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      value = '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  };

  const headers = [
    "ID",
    "Employee ID",
    "Employee Name",
    "Shift Type",
    "Activity",
    "Machine",
    "Log Time",
    "Time Done",
    "Duration",
    "Note",
    "Status",
  ];

  const csvRows = [headers.join(",")];

  rows.forEach((r, i) => { // <-- dagdag si i dito
  const duration = computeDuration(r.log_time, r.time_out);

  const rowValues = [
    i + 1, // ✅ Auto-incremented row number
    r.emp_id,
    r.emp_name,
    r.shift,
    r.my_activity,
    r.machine || "N/A",
    r.log_time,
    r.time_out,
    duration,
    r.note,
    r.status,
  ].map(escapeCsvValue);

  csvRows.push(rowValues.join(","));
});


  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Quarter${quarter}_${year}.csv`;
  link.click();
};


  const computeDuration = (startStr, endStr) => {
    try {
      const start = new Date(startStr);
      const end = endStr ? new Date(endStr) : new Date();
      const diffMs = end - start;
      const diffMin = Math.floor(diffMs / 60000);
      return diffMin < 1 ? `${Math.floor(diffMs / 1000)} sec` : diffMin;
    } catch {
      return "Invalid";
    }
  };

  return (
     <AuthenticatedLayout>
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
                <i className="fa-solid fa-file-csv mr-2"></i>Quarterly Export Tool
            </h1>
        </div>
    <div className="p-2 max-w-8xl mx-auto">
      {message && (
        <div className="p-3 bg-green-100 border border-green-400 rounded mb-3 text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={handlePreview} className="flex gap-3 items-end">
        <div>
          <label className="block mb-1">Quarter</label>
          <select
            className="border p-2 rounded w-full text-gray-700"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
          >
            <option value="">Select...</option>
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                {q}Q
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Year</label>
          <input
            type="number"
            className="border p-2 rounded w-full text-gray-700"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Preview"}
        </button>

        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleExport}
        >
          Export CSV
        </button>
      </form>

      {rows.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Employee</th>
                <th className="border p-2">Activity</th>
                <th className="border p-2">Machine</th>
                <th className="border p-2">Shift</th>
                <th className="border p-2">Duration</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{r.emp_name}</td>
                  <td className="border p-2">{r.my_activity}</td>
                  <td className="border p-2">{r.machine || "N/A"}</td>
                  <td className="border p-2">{r.shift}</td>
                  <td className="border p-2">{computeDuration(r.log_time, r.time_out)}</td>
                  <td className="border p-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </AuthenticatedLayout>
  );
}
