"use client";

import { useMemo } from "react";
import { AttendanceLog, AttendanceStatus } from "@/types/attendance";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

/* ======================
   PROPS
====================== */
interface StatusDistributionChartProps {
  data: AttendanceLog[];
}

/* ======================
   HELPERS
====================== */

const normalizeStatus = (status?: AttendanceStatus): AttendanceStatus => {
  if (status === "present") return "present";
  if (status === "late") return "late";
  return "absent";
};

const normalizeDate = (timestamp: string) =>
  format(new Date(timestamp), "yyyy-MM-dd");

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
};

const COLORS: Record<AttendanceStatus, string> = {
  present: "hsl(142, 76%, 36%)",
  late: "hsl(38, 92%, 50%)",
  absent: "hsl(0, 84%, 60%)",
};

/* ======================
   COMPONENT
====================== */
export function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  const chartData = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");

    /* ---------- filter today ---------- */
    const todayRecords = data.filter(
      (r) => normalizeDate(r.timestamp) === today,
    );

    /* ---------- keep latest record per student ---------- */
    const latestPerStudent = new Map<string, AttendanceLog>();

    for (const record of todayRecords) {
      const existing = latestPerStudent.get(record.studentId);

      if (
        !existing ||
        new Date(record.timestamp).getTime() >
          new Date(existing.timestamp).getTime()
      ) {
        latestPerStudent.set(record.studentId, record);
      }
    }

    /* ---------- count by status ---------- */
    const counts: Record<AttendanceStatus, number> = {
      present: 0,
      late: 0,
      absent: 0,
    };

    for (const record of latestPerStudent.values()) {
      const status = normalizeStatus(record.status);
      counts[status]++;
    }

    /* ---------- build chart data ---------- */
    return (Object.keys(counts) as AttendanceStatus[])
      .map((status) => ({
        name: STATUS_LABEL[status],
        status,
        value: counts[status],
      }))
      .filter((item) => item.value > 0);
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Today's Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Status breakdown for today
        </p>
      </div>

      <div className="h-[300px]">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
