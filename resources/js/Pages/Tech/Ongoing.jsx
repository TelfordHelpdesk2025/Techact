import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import { Drawer, Form, Input, Select, Button, Space, Card } from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  ToolOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
ExclamationCircleOutlined,
FileTextTwoTone,
PlusOutlined 
} from "@ant-design/icons";

export default function Activity({ tableData, tableFilters, auth, empData, activityOptions, machineOptions }) {
  const { flash } = usePage().props;
  const [alertVisible, setAlertVisible] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [updateDrawerVisible, setUpdateDrawerVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);





  const empId = empData?.emp_id || "";
  const empName = empData?.emp_name || "";

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  // Set initialValues on mount
  useEffect(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const A_SHIFT_START = 7 * 60;   // 07:00
    const A_SHIFT_END = 19 * 60;    // 19:00

    const shift =
    totalMinutes >= A_SHIFT_START && totalMinutes < A_SHIFT_END
    ? "A-Shift"
    : "C-Shift";

    form.setFieldsValue({
      emp_id: empId,
      emp_name: empName,
      shift,
      status: "Ongoing" // default value
    });
  }, [empId, empName]);

  // Auto-hide flash messages
  useEffect(() => {
    if (flash.success || flash.error) {
      setAlertVisible(true);
      const timer = setTimeout(() => setAlertVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  // Handle New Activity submit
  const handleAddSubmit = (values) => {
    // Auto set status based on machine
    const status = values.machine === "N/A" ? "Ongoing" : "On-Going";

    router.post("/techact/ongoing/add", {
      ...values,
      status
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Activity logged successfully!");
        form.resetFields();
        setDrawerVisible(false);
      },
      onError: () => toast.error("Failed to log activity. Please try again."),
    });
  };

  const currentTime = new Date();
const logTime = selectedActivity?.log_time ? new Date(selectedActivity.log_time) : null;
const isDoneDisabled = !logTime || currentTime < logTime;


  // Handle Update Activity submit

// const handleUpdateSubmit = (values) => {
//   if (!selectedActivity) return;

//   const payload = {
//     my_activity: selectedActivity.my_activity,
//     machine: selectedActivity.machine,
//     note: values.note || selectedActivity.note || "",
//     status: selectedActivity.status,
//     time_out: new Date().toLocaleString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     }),
//   };

//   router.put(`/techact/ongoing/update/${selectedActivity.id}`, payload, {
//     onSuccess: () => {
//       toast.success("Activity updated successfully!");
//       setUpdateDrawerVisible(false);
//       setSelectedActivity(null);
//       window.location.reload();
//     },
//     onError: () => {
//       toast.error("Failed to update activity. Please try again.");
//     },
//   });
// };

const handleUpdateSubmit = (values) => {
  if (!selectedActivity) return;


const formatTimeOut = (date) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const m = months[date.getMonth()];
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");

  return `${m}/${d}/${y} ${h}:${min}:${s}`;
};

// Usage:
const payload = {
  my_activity: selectedActivity.my_activity,
  machine: selectedActivity.machine,
  note: values.note || selectedActivity.note || "",
  status: selectedActivity.status,
  time_out: formatTimeOut(new Date()),
};
  


router.put(`/techact/ongoing/update/${selectedActivity.id}`, payload, {
  onSuccess: () => {
    toast.success("Activity updated successfully!");
    setUpdateDrawerVisible(false);
    setSelectedActivity(null);
  },
  onError: (errors) => {
    // errors object ay galing sa Inertia validation
    if (errors.time_out) {
      toast.error(errors.time_out);
    } else if (errors.error) {
      toast.error(errors.error);
    } else {
      toast.error("Failed to update activity. Please try again.");
    }
    console.error(errors);
  },
});
};


  const filteredData = tableData?.data || [];
  const hasOngoing = filteredData.some(
    (row) =>
      row.emp_id === empId &&
      ["ongoing", "on-going"].includes(row.status?.toLowerCase())
  );

  const getShiftBadge = (row) => {
    let shift = row.shift || "";
    let badgeClass = "badge bg-secondary";
    if (!shift) {
      const logDate = new Date(row.log_time);
      if (!isNaN(logDate)) {
        const hours = logDate.getHours();
        const totalMinutes = hours * 60 + logDate.getMinutes();
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
      if (shift === "A-Shift") badgeClass = "badge bg-primary text-white";
      else if (shift === "C-Shift") badgeClass = "badge bg-warning text-white";
    }
    return <span className={badgeClass}>{shift}</span>;
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge bg-secondary text-white">Unknown</span>;
    const lower = status.toLowerCase();
    if (lower.startsWith("ongoing") || lower === "on-going")
      return <span className="badge bg-info text-white">{status}</span>;
    if (lower === "complete")
      return <span className="badge bg-success text-white">{status}</span>;
    if (lower.startsWith("for engineer approval"))
      return <span className="badge bg-primary text-white">{status}</span>;
    return <span className="badge bg-secondary text-white">{status}</span>;
  };

  const calculateDuration = (row) => {
    const start = row.log_time ? new Date(row.log_time) : null;
    const end = row.time_out ? new Date(row.time_out) : new Date();
    if (!start || isNaN(start) || !end || isNaN(end)) return "-";
    const diffMs = end - start;
    if (diffMs < 0) return "-";
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes > 0) return `${diffMinutes} min`;
    return `${Math.floor(diffMs / 1000)} secs`;
  };

  return (
    <AuthenticatedLayout>
      <Head title="My Ongoing Activities" />
      <div className="p-6">

        <div className="flex flex-col items-center w-full">
         {/* Flash Messages */}
{alertVisible && flash.success && (
  <div className="mb-4 p-3 w-2/5 rounded-md bg-green-50 text-green-600 shadow flex items-center space-x-2 justify-center border-2 border-green-500">
    {/* Icon */}
    <span className="border border-green-400 rounded-full text-center bg-green-100">✅</span>
    <span>{flash.success}</span>
  </div>
)}

{alertVisible && flash.error && (
  <div className="mb-4 p-3 w-2/5 rounded-md bg-red-50 text-red-600 shadow flex items-center space-x-2 justify-center border-2 border-red-500">
    {/* Icon */}
    <span className="border border-red-400 rounded-full text-center bg-red-100">⚠️</span>
    <span>{flash.error}</span>
  </div>
)}
</div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-500"><FileTextTwoTone /> My Ongoing Activities</h1>
          <Button
            type="primary"
            size="large"
            disabled={hasOngoing}
            onClick={() => setDrawerVisible(true)}
            icon={<PlusOutlined />}
          >
            {hasOngoing ? "🚫 You have an ongoing activity" : "Log New Activity"}
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={[
            { key: "emp_name", label: "Technician" },
            { key: "shift", label: "Shift" },
            { key: "my_activity", label: "Activity" },
            { key: "machine", label: "Machine" },
            { key: "log_time", label: "Date Log" },
            { key: "duration", label: "Time Duration" },
            { key: "status", label: "Status" },
            { key: "note", label: "Comment" },
            { key: "viewDetails", label: "Action" },
          ]}
          data={filteredData.map((row, idx) => ({
            ...row,
            i: idx + 1,
            shift: getShiftBadge(row),
            status: getStatusBadge(row.status),
            duration: calculateDuration(row),
            viewDetails: (
              <Button
                type="primary"
                shape="round-full"
                icon={<EyeOutlined />}
                disabled={row.status === "For Engineer Approval"}
                onClick={() => {
                  setSelectedActivity(row);
                  updateForm.setFieldsValue({ note: row.note });
                  setUpdateDrawerVisible(true);
                }}
              >
                View
              </Button>
            ),
          }))}
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

        {/* Drawer: New Activity */}
        <Drawer
          title={<Space className="text-xl font-bold text-emerald-600"><AppstoreOutlined /> New Activity</Space>}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          size="large"
          styles={{ body: { padding: '20px 24px', background: '#f5f5f5', width: '100%' } }}
          footer={
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" style={{ backgroundColor: "#f5222d", borderColor: "#f5222d" }} onClick={() => setDrawerVisible(false)} icon={<CloseCircleOutlined />}>Cancel</Button>
              <Button type="primary" style={{ backgroundColor: "#52c41a", borderColor: "#389e0d"}} onClick={() => form.submit()} icon={<CheckCircleOutlined />}>Save</Button>
            </Space>
          }
        >
          <Card variant="outlined" style={{ background: '#ffffff' }}>
            <Form
              layout="vertical"
              form={form}
              onFinish={handleAddSubmit}
            >
              <Form.Item name="emp_id" label={<Space><IdcardOutlined /> Employee ID</Space>}>
                <Input className="rounded-md bg-gray-100" readOnly />
              </Form.Item>

              <Form.Item name="emp_name" label={<Space><UserOutlined /> Employee Name</Space>}>
                <Input className="rounded-md bg-gray-100" readOnly />
              </Form.Item>

              <Form.Item name="shift" label={<Space><ClockCircleOutlined /> Shift</Space>}>
                <Input className="rounded-md bg-gray-100" readOnly />
              </Form.Item>

              <Form.Item name="my_activity" label={<Space><ToolOutlined /> Activity</Space>} rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder="Select Activity"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  className="p-2 rounded-md border border-gray-500"
                >
                  {activityOptions.map((activity, idx) => (
                    <Select.Option key={idx} value={activity}>{activity}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="machine" label={<Space><AppstoreOutlined /> Machine</Space>} rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder="Select Machine"
                  optionFilterProp="children"
                  onChange={(value) => {
                    // update hidden status field dynamically
                    form.setFieldsValue({ status: value === "N/A" ? "Ongoing" : "On-Going" });
                  }}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  className="p-2 rounded-md border border-gray-500"
                >
                  <Select.Option value="N/A">N/A</Select.Option>
                  {machineOptions.map((m, idx) => (
                    <Select.Option key={idx} value={m}>{m}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="note" label={<Space><FileTextOutlined /> Note</Space>}>
                <Input.TextArea rows={4} placeholder="Optional notes..." className="border border-gray-500"/>
              </Form.Item>

              {/* Hidden status field */}
              <Form.Item name="status" hidden>
                <Input />
              </Form.Item>
            </Form>
          </Card>
        </Drawer>

        {/* Drawer: Update Activity */}
        <Drawer
          title={<Space className="text-xl font-bold text-indigo-600"><InfoCircleOutlined /> My Activity</Space>}
          open={updateDrawerVisible}
          onClose={() => {
            setUpdateDrawerVisible(false);
            setSelectedActivity(null);
          }}
          size="large"
          styles={{ body: { padding: '20px 24px', background: '#f5f5f5' } }}
          footer={
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" style={{ backgroundColor: "#f5222d", borderColor: "#f5222d" }} onClick={() => setUpdateDrawerVisible(false)} icon={<CloseCircleOutlined />}>Close</Button>
              <Button 
              type="primary"
              style={{ backgroundColor: "#52c41a", borderColor: "#389e0d" }} 
              onClick={() => updateForm.submit()} 
              icon={<CheckCircleOutlined />}
              disabled={isDoneDisabled}
              title={isDoneDisabled ? "Cannot mark as Done. Please check and correct your device’s date & time." : ""}
              >Done</Button>

            </Space>
          }
        >
          <Card variant="outlined" style={{ background: '#ffffff' }}>
            <Form layout="vertical" form={updateForm} onFinish={handleUpdateSubmit}>

{["on-going"].includes(
  selectedActivity?.status?.toLowerCase()
) && (
  <div className="flex items-start gap-2 mb-3 p-3 rounded-md bg-orange-50 border border-orange-300">
    <ExclamationCircleOutlined className="text-orange-600 text-lg mt-0.5" />
    <p className="text-sm text-orange-700">
      Please ensure that your Supervisor approves this activity for it to be reflected in your ranking.
    </p>
  </div>
)}


  <Form.Item label={<Space><ToolOutlined /> Activity</Space>}>
    <Input
      value={selectedActivity?.my_activity || ""}
      readOnly
      className="border border-gray-500 rounded-md bg-gray-100"
    />
  </Form.Item>

  <Form.Item label={<Space><AppstoreOutlined /> Machine</Space>}>
    <Input
      value={selectedActivity?.machine || ""}
      readOnly
      className="border border-gray-500 rounded-md bg-gray-100"
    />
  </Form.Item>

  <Form.Item name="note" label={<Space><FileTextOutlined /> Note</Space>}>
    <Input.TextArea rows={4} className="border border-gray-500" />
  </Form.Item>

</Form>

          </Card>
        </Drawer>

      </div>
    </AuthenticatedLayout>
  );
}
