import { AttendanceRecord } from "@/types/attendance";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYHpuT5PdvNg2axDVukqkymvqnQWVxoBKqDQXwsXYhX3XLU2IVWEWPAxZG-Hx9wrDwWTmTnYGVpeMD/pub?output=csv";

export async function fetchAttendanceFromSheet(): Promise<AttendanceRecord[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });

  if (!res.ok) {
    console.error("Failed to fetch Google Sheet CSV:", res.statusText);
    return [];
  }

  const csvText = await res.text();
  const lines = csvText.trim().split("\n");
  const headers = lines.shift()?.split(",").map((h) => h.trim()) ?? [];

  return lines.map((line) => {
    const cols = line.split(",");
    const obj: any = {};

    headers.forEach((key, i) => {
      obj[key] = cols[i] ?? "";
    });

    return {
      studentId: obj.studentId || "",
      fullName: obj.fullName || "",
      date: obj.date || "",
      checkInTime: obj.checkInTime || null,
      checkOutTime: obj.checkOutTime || null,
      status: obj.status as "Present" | "Late" | "Absent",
      image: obj.image || "",
    };
  }).filter((r) => r.studentId);
}
