import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AttendanceRecord } from '@/types/attendance';

interface StatusDistributionChartProps {
  data: AttendanceRecord[];
}

const COLORS = {
  Present: 'hsl(152, 60%, 45%)',
  Late: 'hsl(38, 92%, 50%)',
  Absent: 'hsl(0, 72%, 55%)',
};

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = useMemo(() => {
    const counts = data.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = data.length;
    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: COLORS[data.name as keyof typeof COLORS] }}
            />
            <span className="font-semibold text-foreground">{data.name}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {data.value} students ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
          <span className="text-sm font-medium text-foreground">
            ({chartData.find(d => d.name === entry.value)?.value || 0})
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Status Distribution</h3>
        <p className="text-sm text-muted-foreground">Overall attendance status breakdown</p>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
