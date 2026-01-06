import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Download, UserPlus } from "lucide-react";
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
import { fetchAttendanceFromSheet } from "@/data/googleSheetAttendance";
import { AttendanceRecord, StudentSummary } from "@/types/attendance";
import { StudentDetailDialog } from "@/components/students/StudentDetailDialog";

const Students = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const sheetData = await fetchAttendanceFromSheet();
      setData(sheetData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const students = useMemo((): StudentSummary[] => {
    const studentMap = new Map<string, StudentSummary>();

    for (const record of data) {
      const existing = studentMap.get(record.studentId);

      if (!existing) {
        studentMap.set(record.studentId, {
          studentId: record.studentId,
          fullName: record.fullName,
          image: record.image,
          totalDays: 1,
          presentDays: record.status === "Present" ? 1 : 0,
          lateDays: record.status === "Late" ? 1 : 0,
          absentDays: record.status === "Absent" ? 1 : 0,
          attendanceRate: 0,
          lastSeen: record.date,
        });
      } else {
        existing.totalDays++;
        if (record.status === "Present") existing.presentDays++;
        if (record.status === "Late") existing.lateDays++;
        if (record.status === "Absent") existing.absentDays++;
        if (record.date > existing.lastSeen) existing.lastSeen = record.date;
      }
    }

    return Array.from(studentMap.values())
      .map((s) => ({
        ...s,
        attendanceRate: Math.round(((s.presentDays + s.lateDays) / s.totalDays) * 100),
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [data]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage and view all registered students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Attendance Rate</CardDescription>
            <CardTitle className="text-3xl">
              {students.length > 0
                ? Math.round(
                    students.reduce((sum, s) => sum + s.attendanceRate, 0) /
                      students.length
                  )
                : 0}
              %
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perfect Attendance</CardDescription>
            <CardTitle className="text-3xl">
              {students.filter((s) => s.attendanceRate === 100).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Student Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : filteredStudents.map((student) => (
              <Card
                key={student.studentId}
                className="group hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedStudent(student);
                  setDialogOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={student.image} alt={student.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(student.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{student.fullName}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {student.studentId}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className={`font-semibold ${getStatusColor(student.attendanceRate)}`}>
                            {student.attendanceRate}%
                          </span>
                        </div>
                        <Progress value={student.attendanceRate} className="h-1.5" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge variant="present" className="text-[10px]">
                          {student.presentDays} Present
                        </Badge>
                        <Badge variant="late" className="text-[10px]">
                          {student.lateDays} Late
                        </Badge>
                        <Badge variant="absent" className="text-[10px]">
                          {student.absentDays} Absent
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {filteredStudents.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No students found</p>
        </div>
      )}

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
