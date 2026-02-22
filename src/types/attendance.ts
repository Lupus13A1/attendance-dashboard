/* =========================
   STATUS
========================= */

export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "out";

/* =========================
   1️⃣ RAW LOG FROM FIREBASE
========================= */

export interface AttendanceLog {
  id: string;
  uid: string;

  studentId: string;
  name: string;
  imgUrl: string | null;
  snapshotImg: string | null;

  status: AttendanceStatus;
  timestamp: string; // ISO string
  type: "check-in" | "check-out";
}

/* =========================
   2️⃣ UI / DASHBOARD RECORD
========================= */

export interface AttendanceRecord {
  id: string;

  uid: string;
  studentId: string;
  rfid: string;

  name: string;
  imgUrl: string;

  snapshotImg: string | null;


  status: AttendanceStatus;
  type: "check-in" | "check-out";

  timestamp: string; // ISO
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
  out: number; // ✅ เพิ่มรองรับ check-out
  total: number;
}

export interface StatusDistribution {
  status: AttendanceStatus;
  count: number;
  percentage: number;
}

export interface StudentSummary {
  // name(fullName: any): import("react").ReactNode;
  fullName(fullName: any): import("react").ReactNode;


  id: string;

  uid: string;
  studentId: string;
  // name: string;
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