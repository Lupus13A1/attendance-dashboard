import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceFilters } from "@/components/dashboard/AttendanceFilters";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { DailyAttendanceChart } from "@/components/dashboard/DailyAttendanceChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { fetchAttendanceFromSheet } from "@/data/googleSheetAttendance";
import { AttendanceStatus, AttendanceRecord } from "@/types/attendance";
import { format } from "date-fns";

const Index = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | "all">("all");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const sheetData = await fetchAttendanceFromSheet();
    setData(sheetData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      if (selectedDate && record.date !== format(selectedDate, "yyyy-MM-dd")) {
        return false;
      }
      if (
        studentIdSearch &&
        !record.studentId.toLowerCase().includes(studentIdSearch.toLowerCase())
      ) {
        return false;
      }
      if (selectedStatus !== "all" && record.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [data, selectedDate, studentIdSearch, selectedStatus]);

  const todayStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayRecords = data.filter((r) => r.date === today);

    const latestMap = new Map<string, AttendanceRecord>();
    for (const record of todayRecords) {
      const existing = latestMap.get(record.studentId);
      if (!existing || new Date(record.createdAt) > new Date(existing.createdAt)) {
        latestMap.set(record.studentId, record);
      }
    }

    const latestRecords = Array.from(latestMap.values());

    return {
      total: latestRecords.length,
      present: latestRecords.filter((r) => r.status === "Present").length,
      late: latestRecords.filter((r) => r.status === "Late").length,
      absent: latestRecords.filter((r) => r.status === "Absent").length,
    };
  }, [data]);

  const uniqueStudents = useMemo(() => {
    return new Set(data.map((r) => r.studentId)).size;
  }, [data]);

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardHeader onRefresh={loadData} isLoading={isLoading} />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={uniqueStudents}
          subtitle="Registered students"
          icon={Users}
          variant="info"
        />
        <StatCard
          title="Present Today"
          value={todayStats.present}
          subtitle={`${todayStats.total > 0 ? Math.round((todayStats.present / todayStats.total) * 100) : 0}% attendance`}
          icon={UserCheck}
          variant="present"
          trend={todayStats.total > 0 ? { value: 5, isPositive: true } : undefined}
        />
        <StatCard
          title="Late Today"
          value={todayStats.late}
          subtitle="Arrived after 9:00 AM"
          icon={Clock}
          variant="late"
        />
        <StatCard
          title="Absent Today"
          value={todayStats.absent}
          subtitle="Not checked in"
          icon={UserX}
          variant="absent"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyAttendanceChart data={data} />
        </div>
        <div>
          <StatusDistributionChart data={data} />
        </div>
      </div>

      {/* Records Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Attendance Records</h2>
            <p className="text-sm text-muted-foreground">
              View and filter all attendance records
            </p>
          </div>
        </div>

        <AttendanceFilters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          studentIdSearch={studentIdSearch}
          onStudentIdSearchChange={setStudentIdSearch}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <AttendanceTable data={filteredData} />

        {filteredData.length > 50 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing 50 of {filteredData.length} records
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
