"use client";

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
  // -------------------- STATE --------------------
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceStatus | "all">("all");

  // -------------------- LOAD DATA --------------------
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const sheetData = await fetchAttendanceFromSheet();
    setData(sheetData);
    setIsLoading(false);
  }, []);

  // -------------------- REALTIME (AUTO REFRESH) --------------------
  useEffect(() => {
    loadData(); // first load

    const interval = setInterval(() => {
      loadData(); // reload 5 seconds
    }, 5000);

    return () => clearInterval(interval);
  }, [loadData]);

  // -------------------- FILTER --------------------
  const filteredData = useMemo(() => {
    return data.filter((record) => {
      if (
        selectedDate &&
        record.date !== format(selectedDate, "yyyy-MM-dd")
      ) {
        return false;
      }
      if (
        studentIdSearch &&
        !record.studentId
          .toLowerCase()
          .includes(studentIdSearch.toLowerCase())
      ) {
        return false;
      }
      if (selectedStatus !== "all" && record.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [data, selectedDate, studentIdSearch, selectedStatus]);

  // -------------------- TODAY STATS --------------------
  const todayStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayRecords = data.filter((r) => r.date === today);

    return {
      total: todayRecords.length,
      present: todayRecords.filter((r) => r.status === "Present").length,
      late: todayRecords.filter((r) => r.status === "Late").length,
      absent: todayRecords.filter((r) => r.status === "Absent").length,
    };
  }, [data]);

  // -------------------- UNIQUE STUDENTS --------------------
  const uniqueStudents = useMemo(() => {
    return new Set(data.map((r) => r.studentId)).size;
  }, [data]);

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        <DashboardHeader onRefresh={loadData} isLoading={isLoading} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={uniqueStudents}
            subtitle="Enrolled in class"
            icon={Users}
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
            subtitle="Arrived after 8:00 AM"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailyAttendanceChart data={data} />
          </div>
          <div>
            <StatusDistributionChart data={filteredData} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <AttendanceFilters
              onDateChange={setSelectedDate}
              onStudentIdChange={setStudentIdSearch}
              onStatusChange={setSelectedStatus}
              selectedDate={selectedDate}
              studentIdSearch={studentIdSearch}
              selectedStatus={selectedStatus}
            />
          </div>

          <AttendanceTable data={filteredData.slice(0, 50)} />

          {filteredData.length > 50 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing 50 of {filteredData.length} records.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
