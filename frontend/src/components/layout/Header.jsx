import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Search, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../common/Dropdown';

export const Header = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  return <header className="h-18 px-5 lg:px-8 bg-[#080c16]/95 backdrop-blur-md border-b border-[#141c30] flex items-center justify-between sticky top-0 z-20">
    <div className="flex items-center gap-4"><button onClick={onToggleMobileMenu} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg" aria-label="Open menu"><Menu className="w-5 h-5" /></button><div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0d1424] border border-[#1b2640] text-xs text-slate-400 w-64"><Search className="w-3.5 h-3.5" /><span>Search interviews and questions</span></div></div>
    <div className="flex items-center gap-3"><button onClick={() => navigate('/interview/setup')} className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-500 text-white"><Sparkles className="w-3.5 h-3.5" /><span>Create interview</span></button><Dropdown align="right" width="w-56" trigger={<div className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-[#101729]"><img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-sky-500/40" /><span className="hidden lg:block text-xs text-slate-200">{user.name}</span><Bell className="w-4 h-4 text-slate-400 ml-1" /></div>}><Link to="/profile" className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:bg-[#141e33]"><User className="w-3.5 h-3.5" />My Profile</Link><button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 text-left"><LogOut className="w-3.5 h-3.5" />Sign Out</button></Dropdown></div>
  </header>;
};
