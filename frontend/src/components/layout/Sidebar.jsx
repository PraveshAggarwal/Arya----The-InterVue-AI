import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Sparkles, User, Bot, FileSearch } from 'lucide-react';

export const Sidebar = ({ onNavigate, className = '' }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Interview', path: '/interview/setup', icon: Sparkles },
    { name: 'Interview History', path: '/history', icon: History },
    { name: 'Resume Analysis', path: '/resume-analysis', icon: FileSearch },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className={`w-64 bg-[#080c16] border-r border-[#151f35] flex flex-col justify-between shrink-0 h-full select-none ${className}`}>
      <div>
        <div className="h-18 px-5 flex items-center border-b border-[#131b2e]">
          <NavLink to="/dashboard" onClick={() => onNavigate?.()} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25">
              <div className="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">InterVue</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400">AI Interview Platform</p>
            </div>
          </NavLink>
        </div>

        <nav className="p-3.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => onNavigate?.()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#101729]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
