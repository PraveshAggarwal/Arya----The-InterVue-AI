import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#07090e]/85 backdrop-blur-xl border-b border-[#141c30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 group-hover:shadow-sky-400/40 transition-all">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">InterVue</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400">AI-Powered Interview Platform</p>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#features" className="hover:text-sky-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-sky-400 transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-sky-400 transition-colors">FAQ</a>
        </div>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white shadow-lg shadow-sky-500/25 transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 transition-all"
              >
                <span>Start Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0f1c] border-b border-[#17223b] px-4 pt-3 pb-6 space-y-3 animate-in fade-in">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-sky-400"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-sky-400"
          >
            How It Works
          </a>
          <a
            href="#faq"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-sky-400"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-[#17223b] flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-medium bg-[#12192a] text-slate-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
