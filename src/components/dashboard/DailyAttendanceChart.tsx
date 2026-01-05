import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AttendanceRecord } from '@/types/attendance';
import { format, parseISO } from 'date-fns';

interface DailyAttendanceChartProps {
  data: AttendanceRecord[];
}

export function DailyAttendanceChart({ data }: DailyAttendanceChartProps) {
  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = { present: 0, late: 0, absent: 0 };
      }
      if (record.status === 'Present') acc[record.date].present++;
      else if (record.status === 'Late') acc[record.date].late++;
      else acc[record.date].absent++;
      return acc;
    }, {} as Record<string, { present: number; late: number; absent: number }>);

    return Object.entries(grouped)
      .map(([date, counts]) => ({
        date,
        displayDate: format(parseISO(date), 'MMM dd'),
        ...counts,
        total: counts.present + counts.late + counts.absent,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Show last 10 days
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Daily Attendance Trend</h3>
        <p className="text-sm text-muted-foreground">Student attendance over the last 10 school days</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-sm capitalize text-muted-foreground">{value}</span>}
            />
            <Bar 
              dataKey="present" 
              stackId="a" 
              fill="hsl(var(--status-present))" 
              radius={[0, 0, 0, 0]}
              name="present"
            />
            <Bar 
              dataKey="late" 
              stackId="a" 
              fill="hsl(var(--status-late))" 
              radius={[0, 0, 0, 0]}
              name="late"
            />
            <Bar 
              dataKey="absent" 
              stackId="a" 
              fill="hsl(var(--status-absent))" 
              radius={[4, 4, 0, 0]}
              name="absent"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
