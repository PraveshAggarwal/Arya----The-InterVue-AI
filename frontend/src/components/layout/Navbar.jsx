import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openSection = (id) => { setMobileOpen(false); navigate(`/#${id}`); };
  return (
    <nav className="site-nav sticky top-0 z-50 w-full bg-[#f7f6f2]/95 backdrop-blur-md border-b border-[#e2e8e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#1f6447] flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></span>
          <span><span className="font-bold text-base text-[#18382b] tracking-tight">InterVue</span><span className="ml-1.5 text-[10px] font-bold uppercase text-[#347354]">AI</span><span className="block text-[10px] text-[#77857d]">Practice for every profession</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#627068]">
          <button onClick={() => openSection('roles')} className="hover:text-[#1f6447]">Job families</button>
          <button onClick={() => openSection('how-it-works')} className="hover:text-[#1f6447]">How it works</button>
          <button onClick={() => openSection('developer')} className="hover:text-[#1f6447]">About Pravesh</button>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1f6447] hover:bg-[#184f38] text-white">My practice <ArrowRight className="w-3.5 h-3.5" /></button> : <><Link to="/login" className="text-xs font-semibold text-[#526159] hover:text-[#1f6447]">Sign in</Link><Link to="/register" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1f6447] hover:bg-[#184f38] text-white">Start practicing <ArrowRight className="w-3.5 h-3.5" /></Link></>}
        </div>
        <button onClick={() => setMobileOpen((value) => !value)} className="md:hidden p-2 text-[#526159]" aria-label="Toggle menu">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {mobileOpen && <div className="site-mobile-menu md:hidden bg-[#f7f6f2] border-t border-[#e2e8e1] px-5 py-4 space-y-3"><button onClick={() => openSection('roles')} className="block text-sm text-[#526159]">Job families</button><button onClick={() => openSection('how-it-works')} className="block text-sm text-[#526159]">How it works</button><button onClick={() => openSection('developer')} className="block text-sm text-[#526159]">About the developer</button><ThemeToggle /><button onClick={() => { setMobileOpen(false); navigate(isAuthenticated ? '/dashboard' : '/register'); }} className="block w-full rounded-xl bg-[#1f6447] py-3 text-sm font-semibold text-white">{isAuthenticated ? 'My practice' : 'Start practicing'}</button></div>}
    </nav>
  );
};
