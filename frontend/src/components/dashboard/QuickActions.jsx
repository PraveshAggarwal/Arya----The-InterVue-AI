import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, BarChart3, ArrowRight, FileSearch } from 'lucide-react';
import { Card } from '../common/Card';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Start New Mock Interview',
      desc: 'Upload your resume, enter a job title and description to generate tailored questions.',
      icon: PlayCircle,
      path: '/interview/setup',
      gradient: 'from-blue-600 to-sky-500',
      badge: 'Recommended',
    },
    {
      title: 'Interview History',
      desc: 'Review all previous mock sessions and track your progress over time.',
      icon: BarChart3,
      path: '/history',
      gradient: 'from-indigo-600 to-blue-500',
      badge: null,
    },
    {
      title: 'Resume Analysis',
      desc: 'Review ATS readiness, role keywords, strong points, gaps, and ways to improve your resume.',
      icon: FileSearch,
      path: '/resume-analysis',
      gradient: 'from-cyan-600 to-sky-500',
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Card key={act.title} interactive onClick={() => navigate(act.path)} className="p-5 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${act.gradient} p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
                {act.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {act.badge}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors mb-1">{act.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{act.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#162138] flex items-center justify-between text-xs font-medium text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Go</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
