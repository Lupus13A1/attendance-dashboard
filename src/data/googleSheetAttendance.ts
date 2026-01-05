import { AttendanceRecord } from "@/types/attendance";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYHpuT5PdvNg2axDVukqkymvqnQWVxoBKqDQXwsXYhX3XLU2IVWEWPAxZG-Hx9wrDwWTmTnYGVpeMD/pub?output=csv";

/** 🔒 SAFE DATE PARSER (รองรับ Google Sheet) */
function normalizeDate(value?: string): string | null {
  if (!value) return null;

  const d = new Date(value);
  if (isNaN(d.getTime())) return null;

  return d.toISOString();
}

export async function fetchAttendanceFromSheet(): Promise<AttendanceRecord[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });

  if (!res.ok) {
    console.error("Failed to fetch Google Sheet CSV:", res.statusText);
    return [];
  }

  const csvText = await res.text();
  const lines = csvText.trim().split("\n");
  const headers = lines.shift()?.split(",").map(h => h.trim()) ?? [];

  const records: AttendanceRecord[] = lines.map((line) => {
    const cols = line.split(",");
    const obj: any = {};

    headers.forEach((key, i) => {
      obj[key] = cols[i] ?? "";
    });

    return {
      studentId: obj.studentId || "",
      fullName: obj.fullName || "",
      date: obj.date || "", // yyyy-MM-dd
      checkInTime: obj.checkInTime || null,
      checkOutTime: obj.checkOutTime || null,
      status: obj.status,
      image: obj.image || "",
      createdAt: normalizeDate(obj.createdAt),
    };
  });

  records.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return records.filter(r => r.studentId);
}
