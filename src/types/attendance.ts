import { Timestamp } from "firebase/firestore";



export type AttendanceStatus = "present" | "late" | "absent";

export interface AttendanceRecord {
  id: string;               // doc id
  uid: string;

  studentId: string;        // users.id
  fullName: string;
  image?: string | null;

  timestamp: Date | null;
  type: string;             // check-in | check-out
  status: AttendanceStatus;

  createdAt?: Date | null;
}

export interface StudentSummary {
  userId: string;
  fullName: string;
  image: string;

  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;

  attendanceRate: number;
  lastSeen: Date;
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

// export interface StudentSummary {
//   studentId: string;
//   fullName: string;
//   image: string;
//   totalDays: number;
//   presentDays: number;
//   lateDays: number;
//   absentDays: number;
//   attendanceRate: number;
//   lastSeen: string;
// }




export type TimeRange =
  | "today"
  | "7days"
  | "1month"
  | "3months"
  | "1year";
