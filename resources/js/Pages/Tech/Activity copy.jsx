import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable"; // Make sure this exists

function calculateDuration(row) {
  const { log_time, time_out, status } = row;

  const start = new Date(log_time);
  // If status is 'Complete', use time_out; otherwise use current time
  const end = status === "Complete" && time_out ? new Date(time_out) : new Date();

  if (isNaN(start) || isNaN(end)) return "-";

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
    // Determine shift from log_time
    const logDate = new Date(row.log_time);
    if (!isNaN(logDate)) {
      const hours = logDate.getHours();
      if (hours >= 7 && hours < 19) {
        shift = "A-Shift";
        badgeClass = "badge bg-primary";
      } else {
        shift = "C-Shift";
        badgeClass = "badge bg-warning";
      }
    } else {
      shift = "Unknown";
      badgeClass = "badge bg-secondary";
    }
  } else {
    if (shift === "A-Shift") badgeClass = "badge bg-primary";
    else if (shift === "C-Shift") badgeClass = "badge bg-warning";
    else badgeClass = "badge bg-secondary";
  }

  return <span className={badgeClass}>{shift}</span>;
}

function getStatusBadge(status) {
  if (!status) return <span className="badge bg-secondary">Unknown</span>;

  const lower = status.toLowerCase();
  if (lower === "ongoing" || lower === "on going") {
    return <span className="badge bg-info">{status}</span>;
  }
  if (lower === "complete") {
    return <span className="badge bg-success">{status}</span>;
  }
  if (lower === "for engineer approval") {
    return <span className="badge bg-primary">{status}</span>;
  }
  return <span className="badge bg-secondary">{status}</span>;
}

export default function Activity({ tableData, tableFilters }) {
  // Include index + 1 as i for the "#" column
  const dataWithBadgesAndDuration = (tableData?.data || []).map((row, index) => ({
    ...row,
    i: index + 1,
    duration: calculateDuration(row),
    shift: getShiftBadge(row),
    status: getStatusBadge(row.status),
  }));

  return (
    <AuthenticatedLayout>
      <Head title="All Activities" />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">All Activities</h1>

        <DataTable
          columns={[
            // { key: "i", label: "#" },
            { key: "emp_name", label: "Technician" },
            { key: "shift", label: "Shift" },
            { key: "my_activity", label: "Activity" },
            { key: "machine", label: "Machine" },
            { key: "log_time", label: "Date Log" },
            { key: "time_out", label: "Done Date" },
            { key: "duration", label: "Time Duration (Minute`s)" },
            { key: "status", label: "Status" },
            { key: "note", label: "Comment" },
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
      </div>
    </AuthenticatedLayout>
  );
}




