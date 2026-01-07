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
import { AttendanceRecord, StudentSummary } from "@/types/attendance";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentSummary | null;
  records: AttendanceRecord[];
}

/* =======================
   Helpers
======================= */

type NormalizedStatus = "present" | "late" | "absent";

const normalizeStatus = (status?: string): NormalizedStatus => {
  const value = status?.trim().toLowerCase();
  if (value === "present") return "present";
  if (value === "late") return "late";
  return "absent";
};

const statusLabel = (status: NormalizedStatus) => {
  if (status === "present") return "Present";
  if (status === "late") return "Late";
  return "Absent";
};

const getAttendanceRateColor = (rate: number) => {
  if (rate >= 90) return "text-success";
  if (rate >= 75) return "text-warning";
  return "text-destructive";
};

export function StudentDetailDialog({
  open,
  onOpenChange,
  student,
  records,
}: StudentDetailDialogProps) {
  const studentRecords = useMemo(() => {
    if (!student) return [];
    return records
      .filter((r) => r.studentId === student.studentId)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
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
              <AvatarImage src={student.image} alt={student.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(student.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {student.fullName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {student.studentId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last seen:{" "}
                {format(new Date(student.lastSeen), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* ================= Stats ================= */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">
                {student.totalDays}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Days
              </p>
            </div>

            <div className="rounded-lg bg-success/10 p-3 text-center">
              <p className="text-2xl font-bold text-success">
                {student.presentDays}
              </p>
              <p className="text-xs text-muted-foreground">
                Present
              </p>
            </div>

            <div className="rounded-lg bg-warning/10 p-3 text-center">
              <p className="text-2xl font-bold text-warning">
                {student.lateDays}
              </p>
              <p className="text-xs text-muted-foreground">
                Late
              </p>
            </div>

            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <p className="text-2xl font-bold text-destructive">
                {student.absentDays}
              </p>
              <p className="text-xs text-muted-foreground">
                Absent
              </p>
            </div>
          </div>

          {/* ================= Attendance Rate ================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Attendance Rate
              </span>
              <span
                className={`text-lg font-bold ${getAttendanceRateColor(
                  student.attendanceRate
                )}`}
              >
                {student.attendanceRate}%
              </span>
            </div>
            <Progress
              value={student.attendanceRate}
              className="h-2"
            />
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
                  {studentRecords.map((record) => {
                    const status = normalizeStatus(record.status);

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(
                            new Date(record.date),
                            "MMM d, yyyy"
                          )}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {record.checkInTime ?? "—"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {record.checkOutTime ?? "—"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              status === "present"
                                ? "present"
                                : status === "late"
                                ? "late"
                                : "absent"
                            }
                          >
                            {statusLabel(status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {studentRecords.length === 0 && (
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
