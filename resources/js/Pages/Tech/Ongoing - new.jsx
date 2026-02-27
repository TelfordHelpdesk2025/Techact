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

  // Auto compute shift for new activity
  useEffect(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const shift = totalMinutes >= 7 * 60 + 1 && totalMinutes <= 19 * 60 ? "A-Shift" : "C-Shift";
    form.setFieldsValue({ shift });
  }, []);

  useEffect(() => {
    if (flash.success || flash.error) {
      setAlertVisible(true);
      const timer = setTimeout(() => setAlertVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const handleAddSubmit = (values) => {
    router.post("/techact/ongoing/add", values, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Activity logged successfully!");
        form.resetFields();
        setDrawerVisible(false);
      },
      onError: () => toast.error("Failed to log activity. Please try again."),
    });
  };

  const handleUpdateSubmit = (values) => {
    if (selectedActivity.statusText === "For Engineer Approval") {
      toast.info(
        "Please inform your Supervisor to approve this activity so it can be counted as complete and included in the daily ranking."
      );
    }

    router.put(`/techact/ongoing/update/${selectedActivity.id}`, {
      ...selectedActivity,
      note: values.note,
      time_out: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }, {
      onSuccess: () => {
        toast.success("Activity updated successfully!");
        setUpdateDrawerVisible(false);
        setSelectedActivity(null);
        window.location.reload();
      },
      onError: () => toast.error("Failed to update activity. Please try again."),
    });
  };

  const filteredData = tableData?.data || [];
  const hasOngoing = filteredData.some(
    (row) =>
      row.emp_id === empId &&
      ["ongoing", "on-going"].includes(row.status?.toLowerCase())
  );

  // Shift badge
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

  // Status badge
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

        {/* Flash Messages */}
        {alertVisible && flash.success && (
          <div className="mb-4 p-3 rounded bg-green-500 text-white shadow">{flash.success}</div>
        )}
        {alertVisible && flash.error && (
          <div className="mb-4 p-3 rounded bg-red-500 text-white shadow">{flash.error}</div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Ongoing Activities</h1>
          <Button
            type="primary"
            size="large"
            disabled={hasOngoing}
            onClick={() => setDrawerVisible(true)}
            icon={<CheckCircleOutlined />}
          >
            {hasOngoing ? "🚫 You have an ongoing activity" : "+ Log New Activity"}
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
                shape="round"
                icon={<AppstoreOutlined />}
                disabled={row.statusText === "For Engineer Approval"}
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
          title={<Space><AppstoreOutlined /> Log New Activity</Space>}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={450}
          bodyStyle={{ padding: '20px 24px', background: '#f5f5f5' }}
          footer={
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setDrawerVisible(false)} icon={<CloseCircleOutlined />}>Cancel</Button>
              <Button type="primary" onClick={() => form.submit()} icon={<CheckCircleOutlined />}>Save</Button>
            </Space>
          }
        >
          <Card bordered={false} style={{ background: '#ffffff' }}>
            <Form layout="vertical" form={form} onFinish={handleAddSubmit}>

              <Form.Item name="emp_id" label={<Space><IdcardOutlined value={empId} /> Employee ID</Space>}>
                <Input className="rounded-md" readOnly value={empId} />
              </Form.Item>

              <Form.Item name="emp_name" label={<Space><UserOutlined value={empName} /> Employee Name</Space>}>
                <Input className="rounded-md" readOnly value={empName} />
              </Form.Item>

              <Form.Item
  name="my_activity"
  label={<Space><ToolOutlined /> Activity</Space>}
  rules={[{ required: true }]}
>
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
      <Select.Option key={idx} value={activity}>
        {activity}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  name="machine"
  label={<Space><AppstoreOutlined /> Machine</Space>}
  rules={[{ required: true }]}
>
  <Select
    showSearch
    placeholder="Select Machine"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().includes(input.toLowerCase())
    }
    className="p-2 rounded-md border border-gray-500"
  >
    <Select.Option value="N/A">N/A</Select.Option>
    {machineOptions.map((m, idx) => (
      <Select.Option key={idx} value={m}>
        {m}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  name="shift"
  label={<Space><ClockCircleOutlined /> Shift</Space>}
  rules={[{ required: true }]}
>
  <Select
    showSearch
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().includes(input.toLowerCase())
    }
    className="p-2 rounded-md border border-gray-500"
  >
    <Select.Option value="A-Shift">A-Shift</Select.Option>
    <Select.Option value="C-Shift">C-Shift</Select.Option>
  </Select>
</Form.Item>


              <Form.Item name="note" label={<Space><FileTextOutlined /> Note</Space>}>
                <Input.TextArea rows={4} placeholder="Optional notes..." className="border border-gray-500"/>
              </Form.Item>

            </Form>
          </Card>
        </Drawer>

        {/* Drawer: Update Activity */}
        <Drawer
          title={<Space><CheckCircleOutlined /> Update Activity</Space>}
          open={updateDrawerVisible}
          onClose={() => {
            setUpdateDrawerVisible(false);
            setSelectedActivity(null);
          }}
          width={450}
          bodyStyle={{ padding: '20px 24px', background: '#f5f5f5' }}
          footer={
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setUpdateDrawerVisible(false)} icon={<CloseCircleOutlined />}>Close</Button>
              <Button type="primary" onClick={() => updateForm.submit()} icon={<CheckCircleOutlined />}>Done</Button>
            </Space>
          }
        >
          <Card bordered={false} style={{ background: '#ffffff' }}>
            <Form layout="vertical" form={updateForm} onFinish={handleUpdateSubmit}>
              <Form.Item label={<Space><ToolOutlined /> Activity</Space>}>
                <Input className="p-2 rounded-md border border-gray-500" value={selectedActivity?.my_activity} readOnly />
              </Form.Item>

              <Form.Item label={<Space><AppstoreOutlined /> Machine</Space>}>
                <Input className="p-2 rounded-md border border-gray-500" value={selectedActivity?.machine} readOnly />
              </Form.Item>

              <Form.Item name="note" label={<Space><FileTextOutlined /> Note</Space>}>
                <Input.TextArea rows={4} className="border border-gray-500"/>
              </Form.Item>

              {selectedActivity?.remarks && (
                <Form.Item label={<Space><FileTextOutlined /> Approval Remarks</Space>}>
                  <Input.TextArea value={selectedActivity.remarks} readOnly className="border border-gray-500"/>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Drawer>

      </div>
    </AuthenticatedLayout>
  );
}
