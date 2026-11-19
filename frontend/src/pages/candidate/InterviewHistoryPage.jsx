import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Calendar, Clock3, Timer, FileText, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { interviewService } from '../../services/api';
import { formatDuration, getStatusBadgeStyle } from '../../utils/formatters';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatStartTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const InterviewHistoryPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    interviewService.getAll()
      .then((res) => setInterviews(res.data || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = interviews.filter((item) => {
    const matchesSearch = item.jobRole?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleItemClick = (item) => {
    navigate(`/interview/${item._id}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#141d33]">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-600/15 text-sky-400 border border-blue-500/30">
            History
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">Interview History</h1>
          <p className="text-xs text-slate-400 mt-1">Review all previous mock sessions.</p>
        </div>
        <button
          onClick={() => navigate('/interview/setup')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Interview</span>
        </button>
      </div>

      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job role..."
            className="w-full bg-[#080c16] border border-[#1b253e] focus:border-sky-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#080c16] border border-[#1b253e] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer">
            <option value="All">All</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading interviews...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No interviews found</h4>
            <p className="text-xs text-slate-500 mt-1">
              {interviews.length === 0 ? 'Start your first mock interview to see it here.' : 'Try adjusting your filters.'}
            </p>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card key={item._id} interactive onClick={() => handleItemClick(item)} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#11192e] border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-white break-words">{item.jobRole}</h3>
                      <span className={`status-${item.status} text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(item.status)}`}>{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 flex-wrap">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatDate(item.startedAt || item.createdAt)}</span>
                      <Clock3 className="w-3.5 h-3.5 shrink-0 ml-1" />
                      <span>{formatStartTime(item.startedAt || item.createdAt)}</span>
                      <span>|</span>
                      <Timer className="w-3.5 h-3.5 shrink-0 ml-1" />
                      <span>Duration {formatDuration(item.duration)}</span>
                      {item.overallScore != null && <><span>|</span><span className="font-bold text-sky-400">{item.overallScore}/100</span></>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121c33] hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:border-sky-400 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                >
                  <span>Open Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
