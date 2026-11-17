import React from 'react';
import { Card } from '../common/Card';

export const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  accentColor = "text-sky-400",
  bgGradient = "from-sky-500/10 to-transparent"
}) => {
  return (
    <Card className="p-5 relative overflow-hidden group">
      {/* Background soft glow accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${bgGradient} rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          {change && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span>{change}</span>
            </p>
          )}
        </div>

        {Icon && (
          <div className="p-3 rounded-xl bg-[#11192e] border border-sky-500/20 group-hover:border-sky-400/40 transition-colors shadow-inner">
            <Icon className={`w-5 h-5 ${accentColor}`} />
          </div>
        )}
      </div>
    </Card>
  );
};
