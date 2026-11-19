import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, Sparkles, User, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../common/Dropdown';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'C';

  return (
    <header className="h-16 sm:h-18 px-3.5 sm:px-6 lg:px-8 bg-[#080c16]/95 backdrop-blur-md border-b border-[#141c30] flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#101729] transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle className="px-2 sm:px-3" />
        <Dropdown
          align="right"
          width="w-56"
          trigger={
            <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#101729] transition-colors cursor-pointer border border-transparent hover:border-[#1e2a44]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userInitial}
              </div>
              <span className="hidden lg:block text-xs font-medium text-slate-200">
                {user?.name || 'Candidate'}
              </span>
            </div>
          }
        >
          <div className="px-3.5 py-2 border-b border-[#18233b]">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Candidate'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-[#141e33] transition-colors"
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Candidate Profile</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
