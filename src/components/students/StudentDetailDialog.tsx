"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

import {
  StudentSummary,
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentSummary | null;
  records: AttendanceRecord[];
}

/* ==========================
   HELPERS
========================== */

const statusLabel = (status: AttendanceStatus) => {
  if (status === "present") return "Present";
  if (status === "late") return "Late";
  return "Absent";
};

const getStatusVariant = (
  status: AttendanceStatus
):
  | "present"
  | "late"
  | "absent"
  | "default"
  | "secondary"
  | "destructive"
  | "outline" => {
  if (status === "present") return "present";
  if (status === "late") return "late";
  return "absent";
};

const getAttendanceRateColor = (rate: number) => {
  if (rate >= 90) return "text-success";
  if (rate >= 75) return "text-warning";
  return "text-destructive";
};

const getInitials = (name?: string) => {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/* ==========================
   COMPONENT
========================== */

export function StudentDetailDialog({
  open,
  onOpenChange,
  student,
  records,
}: StudentDetailDialogProps) {
  /* ==========================
     BUILD DAILY RECORDS
     (ignore check-out for status)
  =========================== */
  const dailyRecords = useMemo(() => {
    if (!student) return [];

    const logs = records.filter(
      (r) => r.studentId === student.studentId
    );

    const map = new Map<
      string,
      {
        date: string;
        checkIn?: string;
        checkOut?: string;
        status: AttendanceStatus;
      }
    >();

    for (const log of logs) {
      const dateObj = new Date(log.timestamp);
      if (isNaN(dateObj.getTime())) continue;

      const dayKey = format(dateObj, "yyyy-MM-dd");
      const time = format(dateObj, "HH:mm");

      if (!map.has(dayKey)) {
        map.set(dayKey, {
          date: dayKey,
          status: "absent",
        });
      }

      const dayData = map.get(dayKey)!;

      // ✅ ใช้ check-in เป็นตัวกำหนด status เท่านั้น
      if (log.type === "check-in") {
        dayData.checkIn = time;
        if (log.status !== "out") {
          dayData.status = log.status ?? "absent";
        }
      }

      // ✅ check-out แค่เก็บเวลา ไม่กระทบ status
      if (log.type === "check-out") {
        dayData.checkOut = time;
      }
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [student, records]);

  /* ==========================
     CALCULATE STATS
     (ignore status "out")
  =========================== */
  const stats = useMemo(() => {
    const validDays = dailyRecords.filter(
      (d) => d.status !== "out"
    );

    const totalDays = validDays.length;

    const presentDays = validDays.filter(
      (d) => d.status === "present"
    ).length;

    const lateDays = validDays.filter(
      (d) => d.status === "late"
    ).length;

    const absentDays = validDays.filter(
      (d) => d.status === "absent"
    ).length;
``
    const attendanceRate =
      totalDays > 0
        ? Math.round(((presentDays + lateDays) / totalDays) * 100)
        : 0;

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      attendanceRate,
    };
  }, [dailyRecords]);

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.image || ""} />
              <AvatarFallback>
                {getInitials(student.fullName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <DialogTitle>{student.fullName}</DialogTitle>
              <p className="text-sm text-muted-foreground font-mono">
                {student.studentId}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Total Days" value={stats.totalDays} />
            <StatBox
              label="Present"
              value={stats.presentDays}
              className="bg-success/10 text-success"
            />
            <StatBox
              label="Late"
              value={stats.lateDays}
              className="bg-warning/10 text-warning"
            />
            <StatBox
              label="Absent"
              value={stats.absentDays}
              className="bg-destructive/10 text-destructive"
            />
          </div>

          {/* ATTENDANCE RATE */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Attendance Rate</span>
              <span
                className={`font-bold ${getAttendanceRateColor(
                  stats.attendanceRate
                )}`}
              >
                {stats.attendanceRate}%
              </span>
            </div>
            <Progress value={stats.attendanceRate} className="h-2" />
          </div>

          {/* HISTORY */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" />
              Attendance History
            </h4>

            <ScrollArea className="h-[280px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {dailyRecords.map((record) => (
                    <TableRow key={record.date}>
                      <TableCell>
                        {format(
                          new Date(record.date),
                          "MMM d, yyyy"
                        )}
                      </TableCell>

                      <TableCell>
                        {record.checkIn ?? "—"}
                      </TableCell>

                      <TableCell>
                        {record.checkOut ?? "—"}
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusVariant(record.status)}>
                          {statusLabel(record.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {dailyRecords.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================
   SMALL STAT BOX
========================== */

function StatBox({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`rounded-lg p-3 text-center ${className}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}