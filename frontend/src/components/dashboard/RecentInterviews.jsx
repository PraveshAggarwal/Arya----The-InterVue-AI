import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Card } from '../common/Card';
import { formatDuration, getStatusBadgeStyle } from '../../utils/formatters';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
export const RecentInterviews = ({ interviews = [], compact = false }) => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.status === 'in_progress') navigate(`/interview/${item._id}`);
    else if (item.status === 'completed') navigate(`/interview/${item._id}`);
  };

  // Dashboard shows up to 5 on desktop, limited to 3 on mobile. Full history is in /history
  const displayList = compact ? interviews.slice(0, 5) : interviews.slice(0, 5);
  const totalCount = interviews.length;

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Recent Activity</h3>
          <p className="text-[11px] sm:text-xs text-slate-400">
            <span className="sm:hidden">Latest sessions ({Math.min(3, totalCount)} of {totalCount})</span>
            <span className="hidden sm:inline">Your latest mock interview sessions and assessments</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <span>View all ({totalCount})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-[#151f36]">
        {displayList.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No interviews yet. Start your first session!</p>
        ) : displayList.map((item, index) => (
          <div
            key={item._id}
            className={`py-3.5 first:pt-0 last:pb-0 ${
              index >= 3 ? 'hidden sm:flex' : 'flex'
            } flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[#10172a]/40 -mx-2 sm:-mx-3 px-2 sm:px-3 rounded-xl transition-all cursor-pointer`}
            onClick={() => handleClick(item)}
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#11192e] border border-sky-500/20 text-sky-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors truncate max-w-[200px] xs:max-w-[260px] sm:max-w-none">
                    {item.jobRole}
                  </h4>
                  <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{formatDate(item.createdAt)}</span>
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1" title="Interview duration">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{formatDuration(item.duration)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#151f36]/70">
              {item.overallScore != null && (
                <div className="text-left sm:text-right">
                  <div className="text-xs sm:text-base font-extrabold text-sky-400">
                    {item.overallScore} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400">AI Score</div>
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleClick(item); }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#141e35] hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 border border-sky-500/20 hover:border-sky-400/40 transition-all cursor-pointer ml-auto sm:ml-0"
              >
                {item.status === 'in_progress' ? 'Resume' : item.status === 'completed' ? 'View Report' : 'Open'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalCount > 3 && (
        <div className="mt-4 pt-3 border-t border-[#151f36] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            onClick={() => navigate('/history')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Card>
  );
};
