import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { titleCase } from '../../lib/format';

const COLORS = ['#0b3d7b', '#FF9933', '#138808', '#2a5fa3', '#e07d1a', '#1fae12', '#7ba6d8', '#aecae9', '#d6336c', '#6741d9'];

export function ChartCard({ title, children }: { title: string; children: any }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold text-ink">{title}</h3>
      <div style={{ width: '100%', height: 260 }}>{children}</div>
    </div>
  );
}

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} isAnimationActive={false}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: any, n: any) => [v, titleCase(String(n))]} />
        <Legend formatter={(v) => titleCase(String(v))} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BarChartH({ data, color = '#0b3d7b' }: { data: { name: string; value: number }[]; color?: string }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} tickFormatter={(v) => titleCase(String(v))} />
        <Tooltip formatter={(v: any) => [v, 'Count']} />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data }: { data: { month: string; count: number }[] }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#FF9933" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
