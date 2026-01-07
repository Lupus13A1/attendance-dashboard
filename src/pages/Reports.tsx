import { useState, useEffect, useMemo } from "react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
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
import { fetchAttendanceFromSheet } from "@/data/googleSheetAttendance";
import { AttendanceRecord } from "@/types/attendance";

const Reports = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const sheetData = await fetchAttendanceFromSheet();
      setData(sheetData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const weeklyData = useMemo(() => {
    const days = parseInt(timeRange);
    const dateArray = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return format(date, "yyyy-MM-dd");
    });

    return dateArray.map((date) => {
      const dayRecords = data.filter((r) => r.date === date);
      const uniqueStudents = new Map<string, AttendanceRecord>();

      for (const record of dayRecords) {
        const existing = uniqueStudents.get(record.studentId);
        if (!existing || new Date(record.createdAt) > new Date(existing.createdAt)) {
          uniqueStudents.set(record.studentId, record);
        }
      }

      const records = Array.from(uniqueStudents.values());

      return {
        date: format(new Date(date), "MMM d"),
        present: records.filter((r) => r.status === "Present").length,
        late: records.filter((r) => r.status === "Late").length,
        absent: records.filter((r) => r.status === "Absent").length,
        total: records.length,
        attendanceRate:
          records.length > 0
            ? Math.round(
                ((records.filter((r) => r.status === "Present").length +
                  records.filter((r) => r.status === "Late").length) /
                  records.length) *
                  100
              )
            : 0,
      };
    });
  }, [data, timeRange]);

  const overallStats = useMemo(() => {
    const allRecords = weeklyData.reduce(
      (acc, day) => ({
        present: acc.present + day.present,
        late: acc.late + day.late,
        absent: acc.absent + day.absent,
        total: acc.total + day.total,
      }),
      { present: 0, late: 0, absent: 0, total: 0 }
    );

    const avgAttendanceRate =
      weeklyData.length > 0
        ? Math.round(
            weeklyData.reduce((sum, day) => sum + day.attendanceRate, 0) /
              weeklyData.filter((d) => d.total > 0).length || 0
          )
        : 0;

    // Calculate trend
    const recentDays = weeklyData.slice(-3);
    const earlierDays = weeklyData.slice(0, 3);
    const recentAvg =
      recentDays.length > 0
        ? recentDays.reduce((sum, d) => sum + d.attendanceRate, 0) / recentDays.length
        : 0;
    const earlierAvg =
      earlierDays.length > 0
        ? earlierDays.reduce((sum, d) => sum + d.attendanceRate, 0) / earlierDays.length
        : 0;
    const trend = recentAvg - earlierAvg;

    return {
      ...allRecords,
      avgAttendanceRate,
      trend,
    };
  }, [weeklyData]);

  const TrendIcon = () => {
    if (overallStats.trend > 2) return <TrendingUp className="h-4 w-4 text-success" />;
    if (overallStats.trend < -2) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze attendance trends and patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Attendance</CardDescription>
            <div className="flex items-center gap-2">
              <CardTitle className="text-3xl">{overallStats.avgAttendanceRate}%</CardTitle>
              <TrendIcon />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {overallStats.trend > 0 ? "+" : ""}
              {overallStats.trend.toFixed(1)}% vs previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Present</CardDescription>
            <CardTitle className="text-3xl text-success">{overallStats.present}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {overallStats.total > 0
                ? Math.round((overallStats.present / overallStats.total) * 100)
                : 0}
              % of all records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Late</CardDescription>
            <CardTitle className="text-3xl text-warning">{overallStats.late}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {overallStats.total > 0
                ? Math.round((overallStats.late / overallStats.total) * 100)
                : 0}
              % of all records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Absent</CardDescription>
            <CardTitle className="text-3xl text-destructive">{overallStats.absent}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {overallStats.total > 0
                ? Math.round((overallStats.absent / overallStats.total) * 100)
                : 0}
              % of all records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>Attendance status by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="hsl(142, 76%, 36%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="late"
                    name="Late"
                    fill="hsl(38, 92%, 50%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="hsl(0, 84%, 60%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate Trend</CardTitle>
            <CardDescription>Overall attendance percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Attendance Rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendanceRate"
                    name="Attendance Rate"
                    stroke="hsl(221, 83%, 53%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(221, 83%, 53%)", strokeWidth: 2 }}
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
