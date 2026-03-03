import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AttendanceRecord } from "@/types/attendance";

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
    let presentDayCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    const row: any[] = [s.studentId, s.name];

    for (const d of dates) {
      const status = s.dailyStatus[d];

      if (!status) {
        row.push(0);
        absentCount++;
        continue;
      }

      if (status === "present") {
        row.push(1);
        presentDayCount++;
      } else if (status === "late") {
        row.push(0.5);
        presentDayCount++;
        lateCount++;
      } else if (status === "absent") {
        row.push(0);
        absentCount++;
      } else {
        row.push(0);
      }
    }

    row.push(presentDayCount);
    row.push(lateCount);
    row.push(absentCount);

    return row;
  });

  return { header, rows };
}

export function exportCSV(header: string[], rows: any[]) {
  const BOM = "\uFEFF";

  const csv =
    BOM +
    [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, "attendance.csv");
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
  binary.forEach((b) => (binaryString += String.fromCharCode(b)));

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
    bodyStyles: {
      font: "THSarabun",
      fontSize: 16,
    },
  });

  doc.save("attendance.pdf");
}