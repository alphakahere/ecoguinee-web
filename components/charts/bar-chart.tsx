'use client';

import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  bars: { dataKey: string; color: string; name: string }[];
  height?: number;
}

export function BarChart({ data, xKey, bars, height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {bars.map((b) => (
          <Bar key={b.dataKey} dataKey={b.dataKey} fill={b.color} name={b.name} radius={[4, 4, 0, 0]} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}
