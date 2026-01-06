import { useMemo } from "react";
import { AttendanceRecord } from "@/types/attendance";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { format } from "date-fns";

interface StatusDistributionChartProps {
  data: AttendanceRecord[];
}

const COLORS = {
  Present: "hsl(142, 76%, 36%)",
  Late: "hsl(38, 92%, 50%)",
  Absent: "hsl(0, 84%, 60%)",
};

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayRecords = data.filter((r) => r.date === today);

    const uniqueStudents = new Map<string, AttendanceRecord>();
    for (const record of todayRecords) {
      const existing = uniqueStudents.get(record.studentId);
      if (!existing || new Date(record.createdAt) > new Date(existing.createdAt)) {
        uniqueStudents.set(record.studentId, record);
      }
    }

    const records = Array.from(uniqueStudents.values());

    return [
      { name: "Present", value: records.filter((r) => r.status === "Present").length },
      { name: "Late", value: records.filter((r) => r.status === "Late").length },
      { name: "Absent", value: records.filter((r) => r.status === "Absent").length },
    ].filter((item) => item.value > 0);
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Today's Distribution</h3>
        <p className="text-sm text-muted-foreground">Status breakdown for today</p>
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
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
