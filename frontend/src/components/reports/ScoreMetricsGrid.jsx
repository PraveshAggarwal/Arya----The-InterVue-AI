import React from 'react';
import { Card } from '../common/Card';
import { ScoreRing } from '../common/ScoreRing';
import { MessageSquare, BriefcaseBusiness, Shield, Brain } from 'lucide-react';

export const ScoreMetricsGrid = ({ report }) => {
  const perf = report?.performance || {};

  const metricCards = [
    { title: 'Communication', value: perf.communication ?? '—', icon: MessageSquare, desc: 'Rhythm, clarity and pacing', color: 'text-sky-400' },
    { title: 'Role Skills', value: perf.technicalSkills ?? '—', icon: BriefcaseBusiness, desc: 'Craft & role-specific judgment', color: 'text-blue-400' },
    { title: 'Problem Solving', value: perf.problemSolving ?? '—', icon: Brain, desc: 'Analytical structured logic', color: 'text-emerald-400' },
    { title: 'Confidence', value: perf.confidence ?? '—', icon: Shield, desc: 'Presence & assertiveness', color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 bg-gradient-to-r from-[#0d1424] via-[#090f1d] to-[#070b16] border-sky-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <ScoreRing score={report?.overallScore || 0} size={120} strokeWidth={11} />
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Overall Performance: {report?.overallScore ?? '—'} / 100
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mt-2 leading-relaxed">
                {report?.summary || 'No summary available.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="p-4 text-center group hover:border-sky-500/40 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#11192e] border border-sky-500/20 mx-auto flex items-center justify-center mb-2">
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span className="text-xl font-black text-white font-mono block">{m.value}</span>
              <h4 className="text-[11px] font-semibold text-slate-200 mt-1 truncate">{m.title}</h4>
              <p className="text-[9px] text-slate-400 mt-0.5 truncate">{m.desc}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
