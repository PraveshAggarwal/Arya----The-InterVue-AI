import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';

const RECOMMENDED = [
  {
    id: 1,
    category: 'Technical',
    title: 'System Design: Scalable Architecture',
    role: 'Senior Backend / System Design Engineer',
    experienceYears: 4,
    description: 'Design highly scalable distributed systems, microservices architectures, caching strategies with Redis, database sharding, and high-availability load balancing.',
    estimatedTime: '30 min',
    topics: ['Microservices', 'Redis', 'Load Balancing']
  },
  {
    id: 2,
    category: 'Behavioral',
    title: 'Navigating Tight Deadlines & Trade-offs',
    role: 'Engineering Lead & Project Management',
    experienceYears: 3,
    description: 'Behavioral and situational interview covering the STAR method, managing cross-functional stakeholder conflict, delivering under tight constraints, and engineering trade-offs.',
    estimatedTime: '20 min',
    topics: ['STAR Method', 'Prioritization']
  },
  {
    id: 3,
    category: 'Technical',
    title: 'Frontend Mastery: React & Performance',
    role: 'Senior Frontend Engineer (React)',
    experienceYears: 3,
    description: 'Frontend architectural principles, React 19 concurrent features, performance profiling, DOM rendering optimization, memoization, and modern state management.',
    estimatedTime: '25 min',
    topics: ['React', 'Memoization', 'Profiling']
  },
];

export const UpcomingSessions = () => {
  const navigate = useNavigate();

  const handleSelectSession = (session) => {
    navigate('/interview/setup', {
      state: {
        jobRole: session.role,
        experienceYears: session.experienceYears,
        jobDescription: session.description,
        fromRecommendation: true,
        recommendationTitle: session.title
      }
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Recommended Sessions</h3>
          <p className="text-xs text-slate-400">Click any session to auto-fill interview setup</p>
        </div>
        <span className="p-1 rounded-full bg-sky-500/10 text-sky-400">
          <Sparkles className="w-4 h-4" />
        </span>
      </div>

      <div className="space-y-3">
        {RECOMMENDED.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSelectSession(session)}
            className="p-3.5 rounded-xl bg-[#0b101c] hover:bg-[#121a2d] border border-[#162138] hover:border-sky-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600/15 text-sky-400 border border-blue-500/30">
                {session.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{session.estimatedTime}</span>
              </span>
            </div>

            <h4 className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-1 mb-1">
              {session.title}
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 mb-2 font-normal">
              {session.role} · {session.experienceYears} YOE
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#141d33]">
              <div className="flex items-center gap-1.5 flex-wrap">
                {session.topics.slice(0, 2).map((t) => (
                  <span key={t} className="text-[10px] text-slate-400 bg-[#141d33] px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <div className="text-xs text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                <span>Auto-fill & Start</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
