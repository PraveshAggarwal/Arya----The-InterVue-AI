import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { GithubIcon } from '../common/SocialIcons';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavAnchor = (id) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#07090e]/90 backdrop-blur-md border-b border-[#141c2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:shadow-sky-400/40 transition-all">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-base text-white tracking-tight">InterVue</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/25">AI</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal mt-0.5">By Pravesh Aggarwal</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <button
            onClick={() => handleNavAnchor('features')}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Features
          </button>
          <button
            onClick={() => handleNavAnchor('how-it-works')}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavAnchor('faq')}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNavAnchor('developer')}
            className="hover:text-white transition-colors cursor-pointer py-1 flex items-center gap-1"
          >
            <span>Developer</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Right Action / CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/PraveshAggarwal"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0f1728] border border-transparent hover:border-[#1e293b] transition-all"
            title="Pravesh Aggarwal on GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-md shadow-blue-500/25 transition-all active:scale-98"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 border border-blue-400/25 transition-all active:scale-98"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#101729] transition-colors"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#090d16] border-b border-[#17223b] px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => handleNavAnchor('features')}
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-sky-400 font-medium"
          >
            Features
          </button>
          <button
            onClick={() => handleNavAnchor('how-it-works')}
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-sky-400 font-medium"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavAnchor('faq')}
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-sky-400 font-medium"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNavAnchor('developer')}
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-sky-400 font-medium"
          >
            Developer Portfolio
          </button>
          
          <div className="pt-3 border-t border-[#141d33] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-center bg-blue-600 text-white shadow-md"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 text-center text-xs font-medium text-slate-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-center bg-blue-600 text-white shadow-md"
                >
                  Start Practice Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
