import { useMemo } from "react";
import { AttendanceRecord } from "@/types/attendance";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

interface DailyAttendanceChartProps {
  data: AttendanceRecord[];
}

/* ======================
   Helpers
====================== */

type NormalizedStatus = "present" | "late" | "absent";

const normalizeStatus = (status?: string): NormalizedStatus => {
  const value = status?.trim().toLowerCase();
  if (value === "present") return "present";
  if (value === "late") return "late";
  return "absent";
};

const normalizeDate = (date: string) =>
  format(new Date(date), "yyyy-MM-dd");

/* ======================
   Component
====================== */

export function DailyAttendanceChart({
  data,
}: DailyAttendanceChartProps) {
  const chartData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) =>
      format(subDays(new Date(), 13 - i), "yyyy-MM-dd")
    );

    return last14Days.map((day) => {
      const dayRecords = data.filter(
        (r) => normalizeDate(r.date) === day
      );

      /* keep latest record per student */
      const latestPerStudent = new Map<string, AttendanceRecord>();

      for (const record of dayRecords) {
        const existing = latestPerStudent.get(record.studentId);
        if (
          !existing ||
          new Date(record.createdAt).getTime() >
            new Date(existing.createdAt).getTime()
        ) {
          latestPerStudent.set(record.studentId, record);
        }
      }

      const counts = {
        present: 0,
        late: 0,
        absent: 0,
      };

      for (const record of latestPerStudent.values()) {
        const status = normalizeStatus(record.status);
        counts[status]++;
      }

      return {
        date: format(new Date(day), "MMM d"),
        present: counts.present,
        late: counts.late,
        absent: counts.absent,
      };
    });
  }, [data]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          Attendance Trend
        </h3>
        <p className="text-sm text-muted-foreground">
          Last 14 days overview
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="colorPresent"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="colorLate"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="colorAbsent"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(0, 84%, 60%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(0, 84%, 60%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-md)",
              }}
              labelStyle={{
                color: "hsl(var(--foreground))",
                fontWeight: 600,
              }}
            />

            <Legend />

            <Area
              type="monotone"
              dataKey="present"
              name="Present"
              stroke="hsl(142, 76%, 36%)"
              fill="url(#colorPresent)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="late"
              name="Late"
              stroke="hsl(38, 92%, 50%)"
              fill="url(#colorLate)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="absent"
              name="Absent"
              stroke="hsl(0, 84%, 60%)"
              fill="url(#colorAbsent)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
