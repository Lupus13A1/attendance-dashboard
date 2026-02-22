import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceFilters } from "@/components/dashboard/AttendanceFilters";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { DailyAttendanceChart } from "@/components/dashboard/DailyAttendanceChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { fetchAttendanceFromSheet } from "@/data/googleSheetAttendance";
import { AttendanceRecord } from "@/types/attendance";
import { format } from "date-fns";


type NormalizedStatus = "present" | "late" | "absent";

const normalizeStatus = (status?: string): NormalizedStatus => {
  const value = status?.trim().toLowerCase();
  if (value === "present") return "present";
  if (value === "late") return "late";
  return "absent";
};

const normalizeDate = (date: string) =>
  format(new Date(date), "yyyy-MM-dd");

/* ======================
   Page
====================== */

const Index = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<NormalizedStatus | "all">("all");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const sheetData = await fetchAttendanceFromSheet();

    /* 🔥 Normalize ตั้งแต่ตรงนี้ */
    const normalized = sheetData.map((r) => ({
      ...r,
      date: normalizeDate(r.date),
      status: normalizeStatus(r.status),
    }));

    setData(normalized);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ======================
     Filters
  ====================== */

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      if (
        selectedDate &&
        record.date !== format(selectedDate, "yyyy-MM-dd")
      )
        return false;

      if (
        studentIdSearch &&
        !record.studentId
          .toLowerCase()
          .includes(studentIdSearch.toLowerCase())
      )
        return false;

      if (
        selectedStatus !== "all" &&
        record.status !== selectedStatus
      )
        return false;

      return true;
    });
  }, [data, selectedDate, studentIdSearch, selectedStatus]);

  /* ======================
     Today Stats
  ====================== */

  const todayStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayRecords = data.filter((r) => r.date === today);

    const latestMap = new Map<string, AttendanceRecord>();

    for (const record of todayRecords) {
      const existing = latestMap.get(record.studentId);
      if (
        !existing ||
        new Date(record.createdAt).getTime() >
          new Date(existing.createdAt).getTime()
      ) {
        latestMap.set(record.studentId, record);
      }
    }

    const latestRecords = Array.from(latestMap.values());

    const counts = {
      present: 0,
      late: 0,
      absent: 0,
    };

    for (const r of latestRecords) {
      counts[r.status as NormalizedStatus]++;
    }

    return {
      total: latestRecords.length,
      present: counts.present,
      late: counts.late,
      absent: counts.absent,
    };
  }, [data]);

  const uniqueStudents = useMemo(() => {
    return new Set(data.map((r) => r.studentId)).size;
  }, [data]);

  /* ======================
     Render
  ====================== */

  return (
    <div className="space-y-6 px-3 sm:px-6 lg:px-8 animate-fade-in">
      {/* <DashboardHeader onRefresh={loadData} isLoading={isLoading} /> */}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          subtitle={`${
            todayStats.total > 0
              ? Math.round(
                  (todayStats.present / todayStats.total) * 100
                )
              : 0
          }% attendance`}
          icon={UserCheck}
          variant="present"
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-x-auto">
          <DailyAttendanceChart data={data} />
        </div>
        <div className="overflow-x-auto">
          <StatusDistributionChart data={data} />
        </div>
      </div>

      {/* Records */}
      <div className="space-y-4">
        <AttendanceFilters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          studentIdSearch={studentIdSearch}
          onStudentIdSearchChange={setStudentIdSearch}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <div className="overflow-x-auto rounded-lg border">
          <AttendanceTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
