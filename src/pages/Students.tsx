import { useState, useEffect, useMemo } from "react";
import { Search, Download, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { fetchAttendanceFromFirebase } from "@/data/firebaseAttendance";
import { AttendanceRecord, StudentSummary } from "@/types/attendance";

import { StudentDetailDialog } from "@/components/students/StudentDetailDialog";
import {
  defaultFilters,
  StudentFilterValues,
  StudentFilters,
} from "@/components/students/StudentFilters";

const Students = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] =
    useState<StudentFilterValues>(defaultFilters);

  const [selectedStudent, setSelectedStudent] =
    useState<StudentSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ======================= LOAD DATA ======================= */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const firebaseData = await fetchAttendanceFromFirebase();
      setData(firebaseData ?? []);
      setIsLoading(false);
    };
    loadData();
  }, []);

  /* ======================= BUILD STUDENT SUMMARY ======================= */
  const students = useMemo((): StudentSummary[] => {
    const studentMap = new Map<string, StudentSummary>();

    for (const record of data) {
      if (!record.userId) continue;

      const status = record.status?.toLowerCase();
      const existing = studentMap.get(record.userId);

      if (!existing) {
        studentMap.set(record.userId, {
          userId: record.userId,
          fullName: record.fullName ?? "Unknown",
          image: record.image ?? "",

          totalDays: 1,
          presentDays: status === "present" ? 1 : 0,
          lateDays: status === "late" ? 1 : 0,
          absentDays: status === "absent" ? 1 : 0,

          attendanceRate: 0,
          lastSeen: record.date ?? "",
        });
      } else {
        existing.totalDays++;

        if (status === "present") existing.presentDays++;
        if (status === "late") existing.lateDays++;
        if (status === "absent") existing.absentDays++;

        if (record.date && record.date > existing.lastSeen) {
          existing.lastSeen = record.date;
        }
      }
    }

    return Array.from(studentMap.values())
      .map((s) => ({
        ...s,
        attendanceRate:
          s.totalDays > 0
            ? Math.round(
                ((s.presentDays + s.lateDays) / s.totalDays) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [data]);

  /* ======================= FILTERING ======================= */
  const filteredStudents = useMemo(() => {
    let result = students;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.userId.toLowerCase().includes(q)
      );
    }

    result = result.filter(
      (s) =>
        s.attendanceRate >= filters.attendanceRateMin &&
        s.attendanceRate <= filters.attendanceRateMax
    );

    if (filters.hasPerfectAttendance) {
      result = result.filter((s) => s.attendanceRate === 100);
    }

    if (filters.hasAbsences) {
      result = result.filter((s) => s.absentDays > 0);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "name":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "id":
          comparison = a.userId.localeCompare(b.userId);
          break;
        case "rate":
          comparison = a.attendanceRate - b.attendanceRate;
          break;
        case "lastSeen":
          comparison = a.lastSeen.localeCompare(b.lastSeen);
          break;
      }

      return filters.sortOrder === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [students, searchQuery, filters]);

  /* ======================= HELPERS ======================= */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.attendanceRateMin > 0 || filters.attendanceRateMax < 100)
      count++;
    if (filters.hasPerfectAttendance) count++;
    if (filters.hasAbsences) count++;
    if (filters.sortBy !== "rate" || filters.sortOrder !== "desc")
      count++;
    return count;
  }, [filters]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return "text-success";
    if (rate >= 75) return "text-warning";
    return "text-destructive";
  };

  /* ======================= RENDER ======================= */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Students
          </h1>
          <p className="text-muted-foreground">
            Manage and view all registered students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2 sm:gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <StudentFilters
          filters={filters}
          onFiltersChange={setFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Student Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {!isLoading &&
          filteredStudents.map((student) => (
            <Card
              key={student.userId}
              className="cursor-pointer hover:shadow-md"
              onClick={() => {
                setSelectedStudent(student);
                setDialogOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.image} />
                    <AvatarFallback>
                      {getInitials(student.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-semibold truncate">
                      {student.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {student.userId}
                    </p>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span>Attendance</span>
                        <span
                          className={`font-semibold ${getStatusColor(
                            student.attendanceRate
                          )}`}
                        >
                          {student.attendanceRate}%
                        </span>
                      </div>
                      <Progress
                        value={student.attendanceRate}
                        className="h-1.5"
                      />
                    </div>

                    <div className="mt-3 flex gap-1">
                      <Badge variant="present">
                        {student.presentDays} P
                      </Badge>
                      <Badge variant="late">
                        {student.lateDays} L
                      </Badge>
                      <Badge variant="absent">
                        {student.absentDays} A
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <StudentDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={selectedStudent}
        records={data}
      />
    </div>
  );
};

export default Students;
