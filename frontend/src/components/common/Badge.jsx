import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  dotColor = 'bg-sky-400',
  className = '',
  icon: Icon
}) => {
  const variants = {
    default: 'bg-[#141d33] text-slate-300 border-[#223055]',
    primary: 'bg-blue-600/15 text-blue-400 border-blue-500/30',
    cyan: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    ghost: 'bg-transparent text-slate-400 border-slate-700/50'
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-sm px-3 py-1.5 gap-2 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
