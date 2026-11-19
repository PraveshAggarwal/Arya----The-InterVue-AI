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
      className={`theme-toggle inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${isDay ? 'border-[#d7dfd8] text-[#526159] hover:bg-[#eaf0e9]' : 'border-[#26344a] text-slate-300 hover:bg-[#101729]'} ${className}`}
    >
      {isDay ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{isDay ? 'Day' : 'Night'} mode</span>
    </button>
  );
};
