import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchAttendanceFromFirebase } from "@/data/firebaseAttendance";
import { AttendanceRecord } from "@/types/attendance";

/* =====================
   HELPERS
===================== */

const normalizeDate = (date: string) =>
  format(new Date(date), "yyyy-MM-dd");

const normalizeStatus = (status?: string) => {
  const v = status?.trim().toLowerCase();
  if (v === "present") return "Present";
  if (v === "late") return "Late";
  if (v === "out") return "Out";
  return "Absent";
};

const Reports = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");

  /* =====================
     LOAD FROM FIREBASE
  ===================== */

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const uid = "admin"; // TODO: replace with real auth uid
      const role = "admin";

      const firebaseData = await fetchAttendanceFromFirebase(uid, role);
      setData(firebaseData);

      setIsLoading(false);
    };

    loadData();
  }, []);

  /* =====================
     WEEKLY DATA
  ===================== */

  const weeklyData = useMemo(() => {
    const days = parseInt(timeRange);

    const dateArray = Array.from({ length: days }, (_, i) =>
      format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd")
    );

    return dateArray.map((date) => {
      const dayRecords = data.filter(
        (r) => normalizeDate(r.createdAt) === date
      );

      const uniqueStudents = new Map<string, AttendanceRecord>();

      for (const record of dayRecords) {
        const existing = uniqueStudents.get(record.studentId);

        if (
          !existing ||
          new Date(record.createdAt) >
          new Date(existing.createdAt)
        ) {
          uniqueStudents.set(record.studentId, record);
        }
      }

      const records = Array.from(uniqueStudents.values())
        .map((r) => ({
          ...r,
          status: normalizeStatus(r.status),
        }))
        .filter((r) => r.status !== "Out"); // ❗ ไม่เอา checkout

      const present = records.filter(
        (r) => r.status === "Present"
      ).length;

      const late = records.filter(
        (r) => r.status === "Late"
      ).length;

      const absent = records.filter(
        (r) => r.status === "Absent"
      ).length;

      const total = records.length;

      return {
        date: format(new Date(date), "MMM d"),
        present,
        late,
        absent,
        total,
        attendanceRate:
          total > 0
            ? Math.round(((present + late) / total) * 100)
            : 0,
      };
    });
  }, [data, timeRange]);

  /* =====================
     OVERALL STATS
  ===================== */

  const overallStats = useMemo(() => {
    const validDays = weeklyData.filter((d) => d.total > 0);

    const sum = validDays.reduce(
      (acc, d) => ({
        present: acc.present + d.present,
        late: acc.late + d.late,
        absent: acc.absent + d.absent,
        total: acc.total + d.total,
      }),
      { present: 0, late: 0, absent: 0, total: 0 }
    );

    const avgAttendanceRate =
      validDays.length > 0
        ? Math.round(
          validDays.reduce(
            (s, d) => s + d.attendanceRate,
            0
          ) / validDays.length
        )
        : 0;

    return {
      ...sum,
      avgAttendanceRate,
      trend: 0,
    };
  }, [weeklyData]);

  const TrendIcon = () => {
    if (overallStats.trend > 2)
      return <TrendingUp className="h-4 w-4 text-success" />;
    if (overallStats.trend < -2)
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  /* =====================
     UI
  ===================== */

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Attendance Reports
        </h1>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>
              Average Attendance
            </CardDescription>
            <div className="flex items-center gap-2">
              <CardTitle className="text-3xl">
                {overallStats.avgAttendanceRate}%
              </CardTitle>
              <TrendIcon />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Present</CardDescription>
            <CardTitle className="text-3xl text-success">
              {overallStats.present}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Late</CardDescription>
            <CardTitle className="text-3xl text-warning">
              {overallStats.late}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardDescription>Total Absent</CardDescription>
          <CardHeader>
            <CardTitle className="text-3xl text-destructive">
              {overallStats.absent}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ================= BAR CHART ================= */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>Present / Late / Absent</CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Legend wrapperStyle={{ fontSize: "12px" }} />

                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="late"
                    name="Late"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="#ef4444"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ================= LINE CHART ================= */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Attendance Rate Trend</CardTitle>
            <CardDescription>เปอร์เซ็นต์การมาเรียน</CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Rate"]}
                  />

                  <Line
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;