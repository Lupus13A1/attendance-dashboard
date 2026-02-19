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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AttendanceLog,
  StudentSummary,
  AttendanceStatus,
} from "@/types/attendance";

/* =======================
   PROPS
======================= */
interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentSummary | null;
  records: AttendanceLog[];
}

/* =======================
   HELPERS
======================= */
const statusLabel = (status: AttendanceStatus) => {
  if (status === "present") return "Present";
  if (status === "late") return "Late";
  return "Absent";
};

const getAttendanceRateColor = (rate: number) => {
  if (rate >= 90) return "text-success";
  if (rate >= 75) return "text-warning";
  return "text-destructive";
};

const normalizeDateKey = (timestamp: string) =>
  format(new Date(timestamp), "yyyy-MM-dd");

/* =======================
   COMPONENT
======================= */
export function StudentDetailDialog({
  open,
  onOpenChange,
  student,
  records,
}: StudentDetailDialogProps) {
  /* =======================
     BUILD DAILY RECORDS
  ======================= */
  const dailyRecords = useMemo(() => {
    if (!student) return [];

    const logs = records.filter((r) => r.studentId === student.studentId);

    const map = new Map<
      string,
      {
        date: string;
        checkIn?: string;
        checkOut?: string;
        status: AttendanceStatus;
        latestTs: number;
      }
    >();

    for (const log of logs) {
      const dayKey = normalizeDateKey(log.timestamp);
      const time = format(new Date(log.timestamp), "HH:mm");

      const existing = map.get(dayKey);

      if (!existing) {
        map.set(dayKey, {
          date: dayKey,
          status: log.status,
          latestTs: new Date(log.timestamp).getTime(),
          checkIn: log.type === "check-in" ? time : undefined,
          checkOut: log.type === "check-out" ? time : undefined,
        });
      } else {
        if (log.type === "check-in") {
          existing.checkIn = time;
        }
        if (log.type === "check-out") {
          existing.checkOut = time;
        }
        if (new Date(log.timestamp).getTime() > existing.latestTs) {
          existing.status = log.status;
          existing.latestTs = new Date(log.timestamp).getTime();
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [student, records]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        {/* ================= Header ================= */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={student.image} alt={student.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <DialogTitle className="text-xl">{student.name}</DialogTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {student.studentId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last seen:{" "}
                {student.lastSeen
                  ? format(new Date(student.lastSeen), "MMMM d, yyyy")
                  : "-"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* ================= Stats ================= */}
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Total Days" value={student.totalDays} />
            <StatBox
              label="Present"
              value={student.presentDays}
              className="bg-success/10 text-success"
            />
            <StatBox
              label="Late"
              value={student.lateDays}
              className="bg-warning/10 text-warning"
            />
            <StatBox
              label="Absent"
              value={student.absentDays}
              className="bg-destructive/10 text-destructive"
            />
          </div>

          {/* ================= Attendance Rate ================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Attendance Rate</span>
              <span
                className={`text-lg font-bold ${getAttendanceRateColor(
                  student.attendanceRate,
                )}`}
              >
                {student.attendanceRate}%
              </span>
            </div>
            <Progress value={student.attendanceRate} className="h-2" />
          </div>

          {/* ================= History Table ================= */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Attendance History
            </h4>

            <ScrollArea className="h-[280px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Date</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {dailyRecords.map((record) => (
                    <TableRow key={record.date}>
                      <TableCell className="font-medium">
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.checkIn ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.checkOut ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.status}>
                          {statusLabel(record.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {dailyRecords.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
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

/* =======================
   SMALL COMPONENT
======================= */
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
