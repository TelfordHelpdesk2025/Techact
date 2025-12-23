import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useRef, useState } from "react";

// ✅ Correct icon imports (FontAwesome 5)
import {
  FaClipboardList,
  FaCheckCircle,
  FaSpinner,
  FaCalendarDay,
  FaClipboardCheck,
} from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard({
  totalActivities,
  completedActivities,
  ongoingActivities,
  totalActivitiesToday,
  totalActivitiesAdmin,
  completedActivitiesAdmin,
  ongoingActivitiesAdmin,
  totalActivitiesTodayAdmin,
  totalApprovalAdmin,
  emp_data,
  barChartData,
  barChartDataAdmin,
  barChartDataAdminPerTechnician,
  ranked,
  selectedDate,
}) {
  const role = emp_data?.emp_role;

  // Chart refs
  const adminPerTechChartRef = useRef(null);

  // Date controls
  const [date, setDate] = useState(selectedDate || new Date().toISOString().slice(0, 10));
  const [tempDate, setTempDate] = useState(date);

  const handleTempDateChange = (e) => setTempDate(e.target.value);

  const applyDateFilter = () => {
    setDate(tempDate);
    router.get(route("dashboard"), { date: tempDate }, { preserveState: true });
  };

  // ✅ Stacked chart options
  const stackedOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Daily Activities (Stacked per Technician)" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const totalMinutes = Math.round(context.raw * 60);
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            return `${context.dataset.label}: ${h}h ${m}m`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            const mins = Math.round(value * 60);
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h ${m}m`;
          },
        },
      },
    },
  };

  // Auto random bar colors every 60s
  useEffect(() => {
    const chart = adminPerTechChartRef.current;
    if (!chart) return;

    const interval = setInterval(() => {
      chart.data.datasets.forEach((dataset) => {
        dataset.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      });
      chart.update();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {["superadmin", "admin", "approver", "engineer"].includes(role) ? (
        <div>
          <p className="mb-4">Welcome back Admin, {emp_data?.emp_firstname}!</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
           
            <SummaryCard
              title="Total Activities"
              value={totalActivitiesAdmin}
              color="bg-cyan-200"
              icon={<FaClipboardList className="text-4xl animate-bounce" />}
              onClick={() => router.visit(route("tech.activity"))}
            />

             <SummaryCard
              title="Total For Approval"
              value={totalApprovalAdmin}
              color="bg-blue-400"
              icon={<FaClipboardCheck className="text-4xl animate-bounce" />}
              onClick={() => router.visit(route("tech.forApproval"))}
            />
            <SummaryCard
              title="Total Activities Today"
              value={totalActivitiesTodayAdmin}
              color="bg-blue-200"
              icon={<FaCalendarDay className="text-4xl animate-bounce" />}
            />
            <SummaryCard
              title="Completed"
              value={completedActivitiesAdmin}
              color="bg-sky-200"
              icon={<FaCheckCircle className="text-4xl animate-bounce" />}
            />
            <SummaryCard
              title="Ongoing"
              value={ongoingActivitiesAdmin}
              color="bg-emerald-200"
              icon={<FaSpinner className="text-4xl animate-spin" />}
            />
            
            
          </div>

          {/* Date Filter */}
          <div className="mb-4 flex items-center gap-2">
            <label className="font-medium text-md">Select Date:</label>
            <input
              type="date"
              value={tempDate}
              onChange={handleTempDateChange}
              className="px-3 py-1 border rounded dark:text-black dark:bg-white"
            />
            <button
              onClick={applyDateFilter}
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <i className="fa-solid fa-filter mr-1"></i> Filter
            </button>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Admin Summary Chart */}
            <div className="p-4 bg-white rounded-lg shadow">
              <Bar ref={adminPerTechChartRef} data={barChartDataAdmin} options={stackedOptions} />
            </div>

            {/* Per Technician Stacked Chart */}
            <div className="p-4 bg-white rounded-lg shadow">
              <Bar
                ref={adminPerTechChartRef}
                data={barChartDataAdminPerTechnician}
                options={{ ...stackedOptions, title: { display: true, text: "Daily Activity Duration per Technician" } }}
              />
            </div>
          </div>

          {/* Ranking */}
          <div className="p-4 bg-white rounded-lg shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">
              <i className="fas fa-trophy mr-2"></i>
              Completion Ranking (
              {(() => {
                const d = new Date(date);
                return `${(d.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()}`;
              })()}
              )
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-center border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border">Rank</th>
                    <th className="py-2 px-4 border">Technician</th>
                    <th className="py-2 px-4 border">Avg Completion</th>
                    <th className="py-2 px-4 border">Total Completed</th>
                    <th className="py-2 px-4 border">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {ranked?.length > 0 ? (
                    ranked.map((tech, index) => (
                      <tr
                        key={index}
                        className={`${
                          tech.rank === 1
                            ? "bg-green-100 font-bold"
                            : tech.rank === 2
                            ? "bg-yellow-100 font-medium"
                            : tech.rank === 3
                            ? "bg-orange-100 font-medium"
                            : "bg-white"
                        } border-b`}
                      >
                        <td className="py-2 px-4 border">{tech.rank}</td>
                        <td className="py-2 px-4 border">{tech.emp_name}</td>
                        <td className="py-2 px-4 border">
                          {parseFloat(tech.avg_completion_minutes).toFixed(2)}
                        </td>
                        <td className="py-2 px-4 border">{tech.total_completed}</td>
                        <td className="py-2 px-4 border">
                          {tech.activity_date
                            ? new Date(tech.activity_date).toLocaleDateString("en-US")
                            : ""}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-3 text-gray-500 italic">
                        No data available for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // USER SIDE
        <div>
          <p className="text-gray-600 mb-4">
            Welcome back, {emp_data?.emp_firstname}! Here are your activities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Total Activities"
              value={totalActivities}
              color="bg-cyan-200"
              icon={<FaClipboardList className="text-4xl animate-bounce" />}
            />
            <SummaryCard
              title="Completed"
              value={completedActivities}
              color="bg-sky-200"
              icon={<FaCheckCircle className="text-4xl animate-bounce" />}
            />
            <SummaryCard
              title="Ongoing"
              value={ongoingActivities}
              color="bg-emerald-200"
              icon={<FaSpinner className="text-4xl animate-spin" />}
            />
            <SummaryCard
              title="Total Activities Today"
              value={totalActivitiesToday}
              color="bg-blue-200"
              icon={<FaCalendarDay className="text-4xl animate-bounce" />}
            />
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <Bar data={barChartData} options={stackedOptions} />
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}

// 🔹 Summary Card Component
function SummaryCard({ title, value, color, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${color} cursor-pointer rounded-xl p-5 shadow-md
        hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
    >
    <div className={`p-4 ${color} rounded-lg shadow text-gray-700`}>
      <div>{icon}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl font-bold flex justify-end">{value}</p>
    </div>
    </div>
  );
}
