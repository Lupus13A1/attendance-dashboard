"use client";

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

import { useAuth } from "@/context/AuthContext";

const Students = () => {
  const { user } = useAuth();

  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] =
    useState<StudentFilterValues>(defaultFilters);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* =======================
     LOAD FIREBASE DATA
  ======================= */
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);

      const firebaseData = await fetchAttendanceFromFirebase(
        user.uid,
        user.role
      );

      setData(firebaseData ?? []);
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  /* =======================
     BUILD STUDENT SUMMARY
  ======================= */
const students = useMemo((): StudentSummary[] => {
  const studentMap = new Map<string, StudentSummary>();

  for (const record of data) {
    if (!record.studentId || !record.name) continue;

    // ❌ ข้าม check-out ทั้งหมด
    if (record.type === "check-out") continue;

    // ❌ ข้าม status out
    if (record.status === "out") continue;

    const dateObj = new Date(record.timestamp);
    if (isNaN(dateObj.getTime())) continue;

    const dayKey = dateObj.toISOString().split("T")[0];

    const key = `${record.studentId}_${dayKey}`;

    const existing = studentMap.get(key);

    if (!existing) {
      studentMap.set(key, {
        studentId: record.studentId,
        fullName: record.name,
        image: record.imgUrl,
        totalDays: 1,
        presentDays: record.status === "present" ? 1 : 0,
        lateDays: record.status === "late" ? 1 : 0,
        absentDays: record.status === "absent" ? 1 : 0,
        attendanceRate: 0,
        lastSeen: record.timestamp,
      });
    }
  }

  const finalMap = new Map<string, StudentSummary>();

  for (const value of studentMap.values()) {
    const existing = finalMap.get(value.studentId);

    if (!existing) {
      finalMap.set(value.studentId, { ...value });
    } else {
      existing.totalDays += value.totalDays;
      existing.presentDays += value.presentDays;
      existing.lateDays += value.lateDays;
      existing.absentDays += value.absentDays;

      if (value.lastSeen > existing.lastSeen) {
        existing.lastSeen = value.lastSeen;
      }
    }
  }

  return Array.from(finalMap.values())
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

  /* =======================
     FILTERING
  ======================= */
  const filteredStudents = useMemo(() => {
    let result = students;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q)
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

    return result;
  }, [students, searchQuery, filters]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /* =======================
     SUMMARY STATS
  ======================= */
  const avgAttendance =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.attendanceRate, 0) /
            students.length
        )
      : 0;

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ================= Header ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage and view all registered students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* ================= Search & Filters ================= */}
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
          activeFilterCount={0}
        />
      </div>

      {/* ================= Summary Cards ================= */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">
              {students.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Attendance</CardDescription>
            <CardTitle className="text-3xl">
              {avgAttendance}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perfect</CardDescription>
            <CardTitle className="text-3xl">
              {students.filter((s) => s.attendanceRate === 100).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* ================= Student Grid ================= */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? null
          : filteredStudents.map((student) => (
              <Card
                key={student.studentId}
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
                        {student.studentId}
                      </p>

                      <div className="mt-3">
                        <div className="flex justify-between text-sm">
                          <span>Attendance</span>
                          <span className="font-semibold">
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