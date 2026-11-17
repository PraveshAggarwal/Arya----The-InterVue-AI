import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';
import { Card } from '../common/Card';
export const RadarSkillChart = ({ data = [] }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Competency Mapping</h3>
          <p className="text-xs text-slate-400">Five-dimensional evaluation of assessed candidate skills</p>
        </div>
        <span className="text-xs text-sky-400 font-mono">360° Radar</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#1b2847" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Radar
              name="Your Score"
              dataKey="value"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="#2563eb"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
