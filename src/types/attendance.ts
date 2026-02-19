export type AttendanceStatus = "present" | "late" | "absent";

/* =========================
   1️⃣ RAW LOG FROM FIREBASE
========================= */
export interface AttendanceLog {
  id: string;
  uid: string;
  studentId: string;
  name: string;
  imgUrl: string | null;
  status: AttendanceStatus;
  timestamp: string;
  type: "check-in" | "check-out";
}

/* =========================
   2️⃣ UI / DASHBOARD RECORD
========================= */
export interface AttendanceRecord {
  studentId: string;
  imgUrl: string;
  rfid: string;
  name: string;
  status: AttendanceStatus;
  timestamp: string;
  type: "check-in" | "check-out";
  uid: string;
  createdAt: string;
  updatedAt: string;
  section: string;
  classroom: string;
}

/* =========================
   3️⃣ SUMMARY TYPES
========================= */
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
  name: string;
  image: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
  lastSeen: string;
}

export type TimeRange = "today" | "7days" | "1month" | "3months" | "1year";
