export type AttendanceStatus = 'Present' | 'Late' | 'Absent';

export interface AttendanceRecord {
  studentId: string;
  fullName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  image: string;
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
