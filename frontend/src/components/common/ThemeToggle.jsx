import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDay = theme === 'day';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDay ? 'night' : 'day'} theme`}
      title={`Switch to ${isDay ? 'night' : 'day'} theme`}
      className={`theme-toggle inline-flex items-center gap-2 rounded-xl border border-[#26344a] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-[#101729] transition-colors ${className}`}
    >
      {isDay ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{isDay ? 'Day' : 'Night'} mode</span>
    </button>
  );
};
