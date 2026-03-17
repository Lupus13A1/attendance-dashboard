import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AttendanceRecord } from "@/types/attendance";

/* =====================================================
   MATRIX
===================================================== */
export function buildAttendanceMatrix(
  records: AttendanceRecord[],
  selectedIds?: string[]
) {
  const filtered = selectedIds
    ? records.filter((r) => selectedIds.includes(r.studentId))
    : records;

  const dateSet = new Set<string>();

  const dailyMap = new Map<
    string,
    {
      studentId: string;
      name: string;
      dailyStatus: Record<string, string>;
    }
  >();

  for (const r of filtered) {
    if (!r.studentId || !r.name) continue;
    if (r.type === "check-out") continue;
    if (r.status === "out") continue;

    const dateObj = new Date(r.timestamp);
    if (isNaN(dateObj.getTime())) continue;

    const date = dateObj.toLocaleDateString("th-TH");
    dateSet.add(date);

    if (!dailyMap.has(r.studentId)) {
      dailyMap.set(r.studentId, {
        studentId: r.studentId,
        name: r.name,
        dailyStatus: {},
      });
    }

    const student = dailyMap.get(r.studentId)!;
    student.dailyStatus[date] = r.status;
  }

  const dates = Array.from(dateSet).sort(
    (a, b) =>
      new Date(a.split("/").reverse().join("-")).getTime() -
      new Date(b.split("/").reverse().join("-")).getTime()
  );

  const header = [
    "รหัสนักศึกษา",
    "ชื่อ-สกุล",
    ...dates,
    "จำนวนมา",
    "จำนวนสาย",
    "จำนวนขาด",
  ];

  const rows = Array.from(dailyMap.values()).map((s) => {
    let present = 0;
    let late = 0;
    let absent = 0;

    const row: any[] = [s.studentId, s.name];

    for (const d of dates) {
      const status = s.dailyStatus[d];

      if (!status) {
        row.push(0);
        absent++;
        continue;
      }

      if (status === "present") {
        row.push(1);
        present++;
      } else if (status === "late") {
        row.push(1);
        late++;
      } else {
        row.push(0);
        absent++;
      }
    }

    row.push(present, late, absent);
    return row;
  });

  return { header, rows };
}

/* =====================================================
   DAILY (🔥 FIX: เลือกวันได้)
===================================================== */
export function buildDailyAttendance(
  records: AttendanceRecord[],
  selectedIds?: string[],
  selectedDate?: string // ✅ เพิ่ม
) {
  const filtered = selectedIds
    ? records.filter((r) => selectedIds.includes(r.studentId))
    : records;

  const dailyMap = new Map<
    string,
    {
      date: string;
      studentId: string;
      name: string;
      checkIn?: string;
      checkOut?: string;
    }
  >();

  for (const r of filtered) {
    if (!r.studentId || !r.name) continue;

    const dateObj = new Date(r.timestamp);
    if (isNaN(dateObj.getTime())) continue;

    const dateKey = dateObj.toISOString().split("T")[0];

    // ✅ filter เฉพาะวันที่เลือก
    if (selectedDate && dateKey !== selectedDate) continue;

    const key = `${r.studentId}_${dateKey}`;

    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        date: dateKey,
        studentId: r.studentId,
        name: r.name,
      });
    }

    const entry = dailyMap.get(key)!;
    const time = dateObj.toLocaleTimeString("th-TH");

    if (r.type === "check-in") {
      if (!entry.checkIn || time < entry.checkIn) {
        entry.checkIn = time;
      }
    }

    if (r.type === "check-out") {
      if (!entry.checkOut || time > entry.checkOut) {
        entry.checkOut = time;
      }
    }
  }

  const rows = Array.from(dailyMap.values())
    .sort((a, b) => a.studentId.localeCompare(b.studentId)) // ✅ วันเดียว เรียงตามรหัสพอ
    .map((r) => [
      r.date,
      r.studentId,
      r.name,
      r.checkIn ?? "-",
      r.checkOut ?? "-",
    ]);

  const header = [
    "วันที่",
    "รหัสนักศึกษา",
    "ชื่อ-นามสกุล",
    "เวลาเข้า",
    "เวลาออก",
  ];

  return { header, rows };
}

/* =====================================================
   EXPORT
===================================================== */
export function exportCSV(header: string[], rows: any[]) {
  const BOM = "\uFEFF";
  const csv =
    BOM +
    [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "attendance.csv");
}

export function exportExcel(header: string[], rows: any[]) {
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  XLSX.writeFile(wb, "attendance.xlsx");
}

export async function exportPDF(header: string[], rows: any[]) {
  const doc = new jsPDF("l", "pt");

  const response = await fetch("/fonts/THSarabun.ttf");
  const buffer = await response.arrayBuffer();

  const binary = new Uint8Array(buffer);
  let binaryString = "";

  binary.forEach((b) => {
    binaryString += String.fromCharCode(b);
  });

  const fontBase64 = btoa(binaryString);

  doc.addFileToVFS("THSarabun.ttf", fontBase64);
  doc.addFont("THSarabun.ttf", "THSarabun", "normal");
  doc.setFont("THSarabun");

  autoTable(doc, {
    head: [header],
    body: rows,
    styles: {
      font: "THSarabun",
      fontSize: 16,
      halign: "center",
    },
    headStyles: {
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 18,
    },
  });

  doc.save("attendance.pdf");
}