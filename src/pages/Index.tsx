import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import { format } from "date-fns";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceFilters } from "@/components/dashboard/AttendanceFilters";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { DailyAttendanceChart } from "@/components/dashboard/DailyAttendanceChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";

import { fetchAttendanceFromFirebase } from "@/data/firebaseAttendance";
import { AttendanceRecord } from "@/types/attendance";

/* ======================
   Types / Utils
====================== */

type NormalizedStatus = "present" | "late" | "absent";

const normalizeStatus = (status?: string): NormalizedStatus => {
  const value = status?.trim().toLowerCase();
  if (value === "present") return "present";
  if (value === "late") return "late";
  return "absent";
};

/* ======================
   Page
====================== */

const Index = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [userIdSearch, setUserIdSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<NormalizedStatus | "all">("all");

  /* ======================
     Load data
  ====================== */

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const firebaseData = await fetchAttendanceFromFirebase();

    const normalized = firebaseData
      .filter((r) => r.date) // กัน null
      .map((r) => ({
        ...r,
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
      if (!record.date) return false;

      if (
        selectedDate &&
        record.date !== format(selectedDate, "yyyy-MM-dd")
      ) {
        return false;
      }

      if (
        userIdSearch &&
        !record.userId
          .toLowerCase()
          .includes(userIdSearch.toLowerCase())
      ) {
        return false;
      }

      if (
        selectedStatus !== "all" &&
        record.status !== selectedStatus
      ) {
        return false;
      }

      return true;
    });
  }, [data, selectedDate, userIdSearch, selectedStatus]);

  /* ======================
     Today Stats
  ====================== */

  const todayStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayRecords = data.filter((r) => r.date && format(new Date(r.date), "yyyy-MM-dd") === today);

    // เอา record ล่าสุดของแต่ละ user
    const latestMap = new Map<string, AttendanceRecord>();

    for (const record of todayRecords) {
      if (!record.createdAt) continue;

      const existing = latestMap.get(record.userId);
      if (
        !existing ||
        (existing.createdAt &&
          new Date(record.createdAt).getTime() >
            new Date(existing.createdAt).getTime())
      ) {
        latestMap.set(record.userId, record);
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

  const uniqueUsers = useMemo(() => {
    return new Set(data.map((r) => r.userId)).size;
  }, [data]);

  /* ======================
     Render
  ====================== */

  return (
    <div className="space-y-6 px-3 sm:px-6 lg:px-8 animate-fade-in">
      <DashboardHeader onRefresh={loadData} isLoading={isLoading} />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={uniqueUsers}
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
          subtitle="Arrived after class time"
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
          studentIdSearch={userIdSearch}          // reuse component เดิม
          onStudentIdSearchChange={setUserIdSearch}
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
