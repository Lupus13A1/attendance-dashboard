import { useState, useEffect, useMemo, useCallback } from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { AttendanceFilters } from "@/components/dashboard/AttendanceFilters";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";

import { fetchAttendanceFromFirebase } from "@/data/firebaseAttendance";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { useAuth } from "@/context/AuthContext";

const AttendanceHistory = () => {
  const { user } = useAuth();

  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [userIdSearch, setUserIdSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceStatus | "all">("all");

  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    const firebaseData = await fetchAttendanceFromFirebase(
      user.uid,
      user.role
    );

    const normalized = firebaseData.map((r) => ({
      ...r,
      status: r.status.toLowerCase() as AttendanceStatus,
    }));

    setData(normalized);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      if (!record.timestamp) return false;

      const recordDate = new Date(record.timestamp);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      if (recordDate < dateRange.from || recordDate > toDate)
        return false;

      if (selectedDate) {
        if (
          format(recordDate, "yyyy-MM-dd") !==
          format(selectedDate, "yyyy-MM-dd")
        ) {
          return false;
        }
      }

      if (
        userIdSearch &&
        !record.studentId
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
  }, [data, dateRange, selectedDate, userIdSearch, selectedStatus]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter(
      (r) => r.status === "present"
    ).length;
    const late = filteredData.filter(
      (r) => r.status === "late"
    ).length;
    const absent = filteredData.filter(
      (r) => r.status === "absent"
    ).length;

    return {
      total,
      present,
      late,
      absent,
      presentRate: total > 0 ? Math.round((present / total) * 100) : 0,
      lateRate: total > 0 ? Math.round((late / total) * 100) : 0,
      absentRate: total > 0 ? Math.round((absent / total) * 100) : 0,
    };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Attendance History</h1>
          <p className="text-muted-foreground">
            View and analyze historical attendance records
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(dateRange.from, "MMM d")} -{" "}
              {format(dateRange.to, "MMM d")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total" value={stats.total} />
        <Stat
          label="Present"
          value={`${stats.present} (${stats.presentRate}%)`}
          color="text-success"
        />
        <Stat
          label="Late"
          value={`${stats.late} (${stats.lateRate}%)`}
          color="text-warning"
        />
        <Stat
          label="Absent"
          value={`${stats.absent} (${stats.absentRate}%)`}
          color="text-destructive"
        />
      </div>

      <AttendanceFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        studentIdSearch={userIdSearch}            // 👈 ใช้ช่องเดิมได้
        onStudentIdSearchChange={setUserIdSearch}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <AttendanceTable data={filteredData} />
      )}
    </div>
  );
};

const Stat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="rounded-xl border bg-card p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold ${color ?? ""}`}>{value}</p>
  </div>
);

export default AttendanceHistory;
