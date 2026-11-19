import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export const KeyTakeaways = ({ report }) => {
  const strengths = report?.strengths || [];
  const improvements = report?.weaknesses || [];
  const recommendations = report?.recommendations || [];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <h4 className="text-sm font-bold text-white tracking-tight">Key Strengths</h4>
        </div>
        <ul className="space-y-3">
          {strengths.length ? strengths.map((str, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>{str}</span>
            </li>
          )) : <li className="text-xs text-slate-400">Complete more answers to receive evidence-based strengths.</li>}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="text-sm font-bold text-white tracking-tight">Areas to Improve</h4>
        </div>
        <ul className="space-y-3">
          {improvements.length ? improvements.map((w, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{w}</span>
            </li>
          )) : <li className="text-xs text-slate-400">No clear improvement area was identified from this interview. Keep practicing and review the question feedback below.</li>}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 text-sky-400">
          <Lightbulb className="w-5 h-5" />
          <h4 className="text-sm font-bold text-white tracking-tight">Recommendations</h4>
        </div>
        <ul className="space-y-3">
          {recommendations.length ? recommendations.map((rec, idx) => (
            <li key={idx} className="p-3 rounded-xl bg-[#090e1b] border border-[#162138] text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-blue-600/20 text-sky-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{rec}</span>
            </li>
          )) : <li className="text-xs text-slate-400">Review your answer feedback and practice applying it to a new example.</li>}
        </ul>
      </Card>
    </div>
  );
};
