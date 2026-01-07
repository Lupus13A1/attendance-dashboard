export type AttendanceStatus = "Present" | "Late" | "Absent";

export interface AttendanceRecord {
  studentId: string;
  fullName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  image: string;
  createdAt: string;
}


export interface DailyAttendanceSummary {
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface StatusDistribution {
  status: AttendanceStatus;
  count: number;
  percentage: number;
}

export interface StudentSummary {
  studentId: string;
  fullName: string;
  image: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
  lastSeen: string;
}


export type TimeRange =
  | "today"
  | "7days"
  | "1month"
  | "3months"
  | "1year";
