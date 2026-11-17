import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Card } from '../common/Card';
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b101d] border border-sky-500/30 p-3 rounded-xl shadow-xl shadow-black/80 backdrop-blur-md text-xs">
        <p className="font-semibold text-slate-200 mb-2">{label} 2026</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const buildChartData = (interviews) => {
  if (!interviews || interviews.length === 0) return [];
  const byMonth = {};
  interviews.forEach((iv) => {
    if (!iv.completedAt || iv.overallScore == null) return;
    const key = new Date(iv.completedAt).toLocaleString('en-US', { month: 'short' });
    if (!byMonth[key]) byMonth[key] = { month: key, scores: [] };
    byMonth[key].scores.push(iv.overallScore);
  });
  return Object.values(byMonth).map((m) => ({
    month: m.month,
    score: Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length),
  }));
};

export const PerformanceChart = ({ interviews = [] }) => {
  const data = buildChartData(interviews);
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Performance Evolution</h3>
          <p className="text-xs text-slate-400">Historical trajectory across overall, technical, and behavioral metrics</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span className="text-slate-300">Overall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            <span className="text-slate-300">Technical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="text-slate-300">Behavioral</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="techArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#162238" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              name="Overall"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreArea)"
            />
            <Area
              type="monotone"
              dataKey="technical"
              name="Technical"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#techArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
