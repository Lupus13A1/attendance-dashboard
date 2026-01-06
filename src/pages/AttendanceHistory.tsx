import { useState, useEffect, useMemo, useCallback } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AttendanceFilters } from "@/components/dashboard/AttendanceFilters";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { fetchAttendanceFromSheet } from "@/data/googleSheetAttendance";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { cn } from "@/lib/utils";

const AttendanceHistory = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
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
      const recordDate = new Date(record.date);
      if (recordDate < dateRange.from || recordDate > dateRange.to) {
        return false;
      }
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
  }, [data, dateRange, selectedDate, studentIdSearch, selectedStatus]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter((r) => r.status === "Present").length;
    const late = filteredData.filter((r) => r.status === "Late").length;
    const absent = filteredData.filter((r) => r.status === "Absent").length;

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance History</h1>
          <p className="text-muted-foreground">
            View and analyze historical attendance records
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Records</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Present</p>
          <p className="text-2xl font-bold text-success">
            {stats.present} <span className="text-sm font-normal">({stats.presentRate}%)</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Late</p>
          <p className="text-2xl font-bold text-warning">
            {stats.late} <span className="text-sm font-normal">({stats.lateRate}%)</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Absent</p>
          <p className="text-2xl font-bold text-destructive">
            {stats.absent} <span className="text-sm font-normal">({stats.absentRate}%)</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <AttendanceFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        studentIdSearch={studentIdSearch}
        onStudentIdSearchChange={setStudentIdSearch}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <AttendanceTable data={filteredData} />
      )}
    </div>
  );
};

export default AttendanceHistory;
