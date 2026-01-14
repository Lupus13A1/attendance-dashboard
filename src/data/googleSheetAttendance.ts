import { AttendanceRecord } from "@/types/attendance";
import { formatISO, parse } from "date-fns";
import Papa from "papaparse";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYHpuT5PdvNg2axDVukqkymvqnQWVxoBKqDQXwsXYhX3XLU2IVWEWPAxZG-Hx9wrDwWTmTnYGVpeMD/pub?output=csv";

function normalizeDate(value?: string): string | null {
  if (!value) return null;

  const parsed = parse(value, "d/M/yyyy", new Date());
  if (isNaN(parsed.getTime())) return null;

  return formatISO(parsed);
}

export async function fetchAttendanceFromSheet(): Promise<AttendanceRecord[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  if (!res.ok) {
    console.error("Failed to fetch Google Sheet CSV:", res.statusText);
    return [];
  }

  const csvText = await res.text();

  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data as any[];

  const normalizedRows = parsed.map(row => {
    const newRow: Record<string, any> = {};
    for (const key in row) {
      const trimmedKey = key.trim(); // ลบ space รอบ key
      newRow[trimmedKey] = row[key];
    }
    return newRow;
  });

  const records: AttendanceRecord[] = normalizedRows.map((row) => ({
    studentId: row.studentId?.trim() || "",
    fullName: row.fullName?.trim() || "",
    date: normalizeDate(row.date),
    checkInTime: row.checkInTime?.trim() || null,
    checkOutTime: row.checkOutTime?.trim() || null,
    status: row.status?.trim().toLowerCase() || "absent",
    image: row.image?.trim() || "",
    createdAt: normalizeDate(row.createdAt),
    updatedAt: normalizeDate(row.updatedAt),
    subjectCode: row.subjectCode?.trim() || "-",
    subjectName: row.subjectName?.trim() || "-",
    section: row.section?.trim() || "-",
    classroom: row.classroom?.trim() || "-",
  }));


  // sort by createdAt desc
  records.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return records.filter((r) => r.studentId);
}
