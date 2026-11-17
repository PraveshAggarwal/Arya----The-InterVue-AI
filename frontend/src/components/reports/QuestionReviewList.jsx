import React, { useState } from 'react';
import { Card } from '../common/Card';
import { ChevronDown, ChevronUp, Bot, User } from 'lucide-react';

export const QuestionReviewList = ({ reviews = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (reviews.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Question-by-Question Analysis</h3>
          <p className="text-xs text-slate-400">Your responses with individual AI evaluation</p>
        </div>
        <span className="text-xs text-sky-400 font-semibold">{reviews.length} Questions</span>
      </div>

      <div className="space-y-4">
        {reviews.map((rev, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded ? 'bg-[#0a0f1c] border-sky-500/40' : 'bg-[#090d18] border-[#162138] hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{rev.question}</h4>
                </div>
                <div className="flex items-center gap-3">
                  {rev.score != null && (
                    <span className="text-xs font-bold text-sky-400 font-mono bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                      {rev.score} pts
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#141d33] animate-in fade-in">
                  {rev.answer && (
                    <div className="p-4 rounded-xl bg-[#0e1628] border border-[#1b2742]">
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        <span>Your Response:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans italic">"{rev.answer}"</p>
                    </div>
                  )}

                  {rev.feedback && (
                    <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/25">
                      <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-sky-400">
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI Feedback:</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{rev.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
