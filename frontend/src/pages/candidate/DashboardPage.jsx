import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Video, Award, Clock, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { interviewService } from '../../services/api';
import { StatCard } from '../../components/dashboard/StatCard';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';
import { RecentInterviews } from '../../components/dashboard/RecentInterviews';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { Card } from '../../components/common/Card';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewService.getAll()
      .then((res) => setInterviews(res.data || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = interviews.filter((i) => i.status === 'completed');
  const totalInterviews = interviews.length;
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completed.length)
    : 0;
  const practiceHours = completed.length
    ? Math.round((completed.reduce((sum, i) => sum + (i.duration || 0), 0) / 3600) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-[#0c1324] via-[#09101e] to-[#070b15] border-sky-500/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-sky-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600/15 text-sky-400 border border-blue-500/30">
              Candidate Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {completed.length > 0
                ? <>You have completed <strong className="text-white">{completed.length} mock interviews</strong>{avgScore > 0 && <> with an average score of <strong className="text-sky-400">{avgScore} points</strong></>}.</>
                : 'Start your first mock interview to begin tracking your progress.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/interview/setup')}
            className="px-5 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 self-start"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Interview</span>
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard title="Total Interviews" value={loading ? '—' : totalInterviews} change={`${completed.length} completed`} icon={Video} accentColor="text-sky-400" bgGradient="from-sky-500/20 to-transparent" />
        <StatCard title="Average Score" value={loading ? '—' : avgScore > 0 ? `${avgScore}%` : '—'} change={completed.length > 0 ? `${completed.length} sessions scored` : 'No scores yet'} icon={Award} accentColor="text-emerald-400" bgGradient="from-emerald-500/20 to-transparent" />
        <StatCard title="Practice Hours" value={loading ? '—' : `${practiceHours}h`} change={`${completed.length} sessions`} icon={Clock} accentColor="text-blue-400" bgGradient="from-blue-600/20 to-transparent" />
        <StatCard title="Completion Rate" value={loading || totalInterviews === 0 ? '—' : `${Math.round((completed.length / totalInterviews) * 100)}%`} change={`${totalInterviews} total sessions`} icon={TrendingUp} accentColor="text-cyan-400" bgGradient="from-cyan-500/20 to-transparent" />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <PerformanceChart interviews={completed} />
        </div>
        <div className="lg:col-span-4">
          <RecentInterviews interviews={interviews.slice(0, 5)} compact />
        </div>
      </div>

      <RecentInterviews interviews={interviews} />
    </div>
  );
};
