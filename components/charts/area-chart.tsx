'use client';

import { ResponsiveContainer, AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AreaChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  areas: { dataKey: string; color: string; name: string }[];
  height?: number;
}

export function AreaChart({ data, xKey, areas, height = 300 }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        {areas.map((a) => (
          <Area key={a.dataKey} type="monotone" dataKey={a.dataKey} stroke={a.color} fill={a.color} fillOpacity={0.15} name={a.name} />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  );
}
