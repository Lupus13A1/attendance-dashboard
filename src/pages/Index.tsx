import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import { format } from "date-fns";

import { useAuth } from "@/context/AuthContext";

import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceFilters } from "@/components/dashboard/AttendanceFilters";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { DailyAttendanceChart } from "@/components/dashboard/DailyAttendanceChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { AttendanceRecord } from "@/types/attendance";
import { fetchAttendanceFromFirebase } from "@/data/firebaseAttendance";

const Index = () => {
  const { user } = useAuth();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchStudentId, setSearchStudentId] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<"present" | "late" | "absent" | "all">("all");

  /* ======================
     LOAD DATA
  ====================== */
  const loadAttendance = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const data = await fetchAttendanceFromFirebase(user.uid, user.role);
    setRecords(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /* ======================
     FILTER FOR TABLE
     (แสดงทุก type รวม out)
  ====================== */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (
        selectedDate &&
        format(new Date(r.date), "yyyy-MM-dd") !==
          format(selectedDate, "yyyy-MM-dd")
      )
        return false;

      if (
        searchStudentId &&
        !r.studentId
          .toLowerCase()
          .includes(searchStudentId.toLowerCase())
      )
        return false;

      if (filterStatus !== "all" && r.status !== filterStatus)
        return false;

      return true;
    });
  }, [records, selectedDate, searchStudentId, filterStatus]);

  /* ======================
     BASE FOR STATS / CHARTS
     (ตัด out + check-out ออก)
  ====================== */
  const statsBaseRecords = useMemo(() => {
    return records.filter(
      (r) => !(r.status === "out" && r.type === "check-out")
    );
  }, [records]);

  /* ======================
     TODAY STATS
  ====================== */
  const todayStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");

    const todayRecords = statsBaseRecords.filter(
      (r) => format(new Date(r.date), "yyyy-MM-dd") === today
    );

    const latestPerStudent = new Map<string, AttendanceRecord>();

    for (const r of todayRecords) {
      const existing = latestPerStudent.get(r.studentId);

      if (
        !existing ||
        new Date(r.createdAt).getTime() >
          new Date(existing.createdAt).getTime()
      ) {
        latestPerStudent.set(r.studentId, r);
      }
    }

    const latest = Array.from(latestPerStudent.values());

    return {
      total: latest.length,
      present: latest.filter((r) => r.status === "present").length,
      late: latest.filter((r) => r.status === "late").length,
      absent: latest.filter((r) => r.status === "absent").length,
    };
  }, [statsBaseRecords]);

  /* ======================
     TOTAL STUDENTS
     (ไม่นับ out+checkout)
  ====================== */
  const totalStudents = useMemo(
    () => new Set(statsBaseRecords.map((r) => r.studentId)).size,
    [statsBaseRecords]
  );

  /* ======================
     RENDER
  ====================== */

  return (
    <div className="space-y-6 px-4 animate-fade-in">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
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
          subtitle="Arrived late"
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

      {/* Charts (ไม่เอา out) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-x-auto">
          <DailyAttendanceChart data={statsBaseRecords} />
        </div>

        <div className="overflow-x-auto">
          <StatusDistributionChart data={statsBaseRecords} />
        </div>
      </div>

      {/* Table (แสดงทุกอย่างรวม out) */}
      <div className="space-y-4">
        <AttendanceFilters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          studentIdSearch={searchStudentId}
          onStudentIdSearchChange={setSearchStudentId}
          selectedStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />

        <AttendanceTable data={filteredRecords} />
      </div>
    </div>
  );
};

export default Index;