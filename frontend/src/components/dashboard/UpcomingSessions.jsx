import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../context/AuthContext';

const REFRESH_MS = 3 * 60 * 60 * 1000;
const SUGGESTIONS = [
  { id: 'bde-pipeline', category: 'Business development', title: 'Build a customer pipeline', role: 'Business Development Executive', years: 2, description: 'Practice prospect research, outreach, qualification, objection handling, and turning conversations into a healthy pipeline.', time: '20 min', topics: ['Prospecting', 'Negotiation'] },
  { id: 'ux-design-story', category: 'Design', title: 'Tell the story behind your design', role: 'UI/UX Designer', years: 3, description: 'Explore user research, accessibility, design decisions, collaboration, and how you measure outcomes.', time: '25 min', topics: ['User research', 'Portfolio'] },
  { id: 'customer-success', category: 'Customer success', title: 'Turn a difficult customer around', role: 'Customer Success Manager', years: 3, description: 'Practice discovery, de-escalation, relationship building, renewals, and communicating customer needs across teams.', time: '20 min', topics: ['Communication', 'Retention'] },
  { id: 'software-project', category: 'Technology', title: 'Explain a project you are proud of', role: 'Software Developer', years: 3, description: 'Walk through your contribution, trade-offs, collaboration, delivery, and lessons from a project on your resume.', time: '25 min', topics: ['Projects', 'Problem solving'] },
  { id: 'marketing-campaign', category: 'Marketing', title: 'Make a campaign more effective', role: 'Digital Marketing Specialist', years: 2, description: 'Discuss audience insight, channel choices, creative testing, campaign metrics, and how you respond when results miss the target.', time: '20 min', topics: ['Campaigns', 'Analytics'] },
  { id: 'operations-process', category: 'Operations', title: 'Improve a process that slows a team down', role: 'Operations Manager', years: 4, description: 'Practice prioritization, process improvement, stakeholder alignment, and measuring the impact of operational changes.', time: '25 min', topics: ['Prioritization', 'Leadership'] },
  { id: 'sales-objections', category: 'Sales', title: 'Respond to a hesitant buyer', role: 'Sales Executive', years: 2, description: 'Practice asking discovery questions, understanding objections, explaining value, and agreeing on a useful next step.', time: '20 min', topics: ['Discovery', 'Objections'] },
  { id: 'people-interview', category: 'People & culture', title: 'Resolve a team disagreement', role: 'HR Business Partner', years: 4, description: 'Explore listening, confidentiality, fair process, stakeholder communication, and how you follow up on a sensitive workplace issue.', time: '25 min', topics: ['Judgment', 'Communication'] },
  { id: 'teaching', category: 'Education', title: 'Help a learner who is falling behind', role: 'Teacher', years: 3, description: 'Practice adapting instruction, engaging families and colleagues, supporting different learning needs, and tracking progress.', time: '25 min', topics: ['Teaching', 'Student support'] },
  { id: 'finance-analysis', category: 'Finance', title: 'Explain an analysis that changed a decision', role: 'Financial Analyst', years: 3, description: 'Discuss assumptions, data quality, communicating uncertainty, and how your analysis helped a team choose a course of action.', time: '25 min', topics: ['Analysis', 'Communication'] },
  { id: 'product-priority', category: 'Product', title: 'Prioritize competing customer requests', role: 'Product Manager', years: 4, description: 'Practice weighing user needs, business goals, effort, risk, and stakeholder input when deciding what to deliver.', time: '25 min', topics: ['Prioritization', 'Product thinking'] },
  { id: 'healthcare-care', category: 'Healthcare', title: 'Communicate with a worried patient', role: 'Healthcare Professional', years: 3, description: 'Practice empathetic communication, clear explanations, sound judgment, and coordinating care while respecting privacy.', time: '20 min', topics: ['Patient care', 'Communication'] },
];

const storageKey = (userKey) => `intervue-practice-ideas-${userKey}`;

const readQueue = (userKey) => {
  const now = Date.now();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userKey)) || 'null');
    if (saved?.cycleStartedAt && now - saved.cycleStartedAt < REFRESH_MS) {
      return { used: Array.isArray(saved.used) ? saved.used : [], cycleStartedAt: saved.cycleStartedAt, offset: saved.offset || 0 };
    }
    return { used: [], cycleStartedAt: now, offset: ((saved?.offset || Math.floor(now / REFRESH_MS)) + 1) % SUGGESTIONS.length };
  } catch {
    return { used: [], cycleStartedAt: now, offset: Math.floor(now / REFRESH_MS) % SUGGESTIONS.length };
  }
};

export const UpcomingSessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userKey = user?._id || user?.email || 'candidate';
  const [queue, setQueue] = useState(() => readQueue(userKey));

  useEffect(() => { setQueue(readQueue(userKey)); }, [userKey]);
  useEffect(() => {
    try { localStorage.setItem(storageKey(userKey), JSON.stringify(queue)); } catch { /* Suggestions still work if storage is unavailable. */ }
  }, [queue, userKey]);
  useEffect(() => {
    const remaining = Math.max(1, REFRESH_MS - (Date.now() - queue.cycleStartedAt));
    const timer = window.setTimeout(() => setQueue((current) => ({
      used: [],
      cycleStartedAt: Date.now(),
      offset: (current.offset + 1) % SUGGESTIONS.length,
    })), remaining);
    return () => window.clearTimeout(timer);
  }, [queue.cycleStartedAt]);

  const sessions = Array.from({ length: SUGGESTIONS.length }, (_, step) => SUGGESTIONS[(queue.offset + step) % SUGGESTIONS.length])
    .filter((session) => !queue.used.includes(session.id))
    .slice(0, 3);

  const handleSelect = (session) => {
    const used = [...queue.used, session.id];
    const next = used.length >= SUGGESTIONS.length
      ? { used: [], cycleStartedAt: Date.now(), offset: (queue.offset + 1) % SUGGESTIONS.length }
      : { ...queue, used };
    try { localStorage.setItem(storageKey(userKey), JSON.stringify(next)); } catch { /* Keep the current session usable without storage. */ }
    setQueue(next);
    navigate('/interview/setup', { state: {
      jobRole: session.role,
      experienceYears: session.years,
      jobDescription: session.description,
      fromRecommendation: true,
      recommendationTitle: session.title,
    } });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Practice ideas for you</h3>
          <p className="text-xs text-slate-400">Three role ideas | refresh every 3 hours</p>
        </div>
        <span className="p-1 rounded-full bg-sky-500/10 text-sky-400"><Sparkles className="w-4 h-4" /></span>
      </div>
      <div className="space-y-2.5">
        {sessions.map((session) => <button key={session.id} type="button" onClick={() => handleSelect(session)} className="w-full text-left p-3.5 rounded-xl bg-[#0b101c] hover:bg-[#121a2d] border border-[#162138] hover:border-sky-500/40 transition-all group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600/15 text-sky-400 border border-blue-500/30">{session.category}</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{session.time}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 mb-1">{session.title}</h4>
          <p className="text-[11px] text-slate-400">{session.role} | {session.years} years experience</p>
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mt-2">{session.description}</p>
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#141d33] text-[11px]">
            <span className="text-slate-500">{session.topics.join(', ')}</span>
            <span className="text-sky-400 flex items-center gap-1 font-semibold">Use idea <ArrowRight className="w-3 h-3" /></span>
          </div>
        </button>)}
        {sessions.length === 0 && <p className="text-xs text-slate-400">You have used all current ideas. A fresh set will appear shortly.</p>}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-3"><RefreshCw className="w-3 h-3" />Used ideas are removed from your list</div>
    </Card>
  );
};
