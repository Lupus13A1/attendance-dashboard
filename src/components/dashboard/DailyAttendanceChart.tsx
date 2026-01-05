"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AttendanceRecord, TimeRange } from "@/types/attendance";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
} from "date-fns";

interface Props {
  data: AttendanceRecord[];
}

export function DailyAttendanceChart({ data }: Props) {
  /* -------------------- STATE -------------------- */
  const [range, setRange] = useState<TimeRange>("today");

  /* -------------------- FILTER -------------------- */
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "1month":
        startDate = subMonths(now, 1);
        break;
      case "3months":
        startDate = subMonths(now, 3);
        break;
      case "1year":
        startDate = subYears(now, 1);
        break;
      default:
        startDate = startOfDay(now);
    }

    return data.filter((r) => {
      const recordDate = r.createdAt
        ? new Date(r.createdAt)
        : new Date(`${r.date}T00:00:00`);
      return recordDate >= startDate;
    });
  }, [data, range]);

  /* -------------------- GROUP -------------------- */
  const chartData = useMemo(() => {
    const grouped: Record<
      string,
      { present: number; late: number; absent: number }
    > = {};

    filteredData.forEach((r) => {
      const dateObj = r.createdAt
        ? new Date(r.createdAt)
        : new Date(`${r.date}T00:00:00`);

      const key = format(dateObj, "yyyy-MM-dd");

      if (!grouped[key]) {
        grouped[key] = { present: 0, late: 0, absent: 0 };
      }

      if (r.status === "Present") grouped[key].present++;
      else if (r.status === "Late") grouped[key].late++;
      else grouped[key].absent++;
    });

    return Object.entries(grouped)
      .map(([date, counts]) => ({
        date,
        displayDate: format(new Date(date), "MMM dd"),
        ...counts,
        total: counts.present + counts.late + counts.absent,
      }))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [filteredData]);

  /* -------------------- CUSTOM TOOLTIP -------------------- */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-muted-foreground capitalize">
                {entry.dataKey}:
              </span>
              <span className="font-medium text-foreground">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Attendance Trend
          </h3>
          <p className="text-sm text-muted-foreground">
            Student attendance by selected period
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            ["today", "Today"],
            ["7days", "7 Days"],
            ["1month", "1 Month"],
            ["3months", "3 Months"],
            ["1year", "1 Year"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key as TimeRange)}
              className={`px-3 py-1.5 rounded-md text-sm border transition
                ${
                  range === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No attendance data for selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span className="text-sm capitalize text-muted-foreground">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="present"
                stackId="a"
                fill="hsl(var(--status-present))"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="late"
                stackId="a"
                fill="hsl(var(--status-late))"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="absent"
                stackId="a"
                fill="hsl(var(--status-absent))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
