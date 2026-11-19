import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Heart, ExternalLink, Sparkles } from 'lucide-react';
import { GithubIcon, LinkedinIcon, XIcon } from '../common/SocialIcons';

export const Footer = () => {
  return (
    <footer className="bg-[#05070c] border-t border-[#121929] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Creator Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-sky-400" />
                </div>
              </div>
              <span className="font-bold text-base text-white tracking-tight">InterVue <span className="text-sky-400 font-extrabold">AI</span></span>
            </Link>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An intelligent, conversational mock interview platform built for engineers and professionals. Practice with human-like AI, receive real-time follow-ups, and master your technical communication.
            </p>

            {/* Developer Tag */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0f1d] border border-[#1b2742] text-[11px] text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Crafted by <strong className="text-white font-semibold">Pravesh Aggarwal</strong></span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/PraveshAggarwal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1424] hover:bg-[#162038] text-slate-300 hover:text-white border border-[#1b2742] hover:border-sky-500/40 transition-all text-xs"
                title="Pravesh Aggarwal on GitHub"
              >
                <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/praveshaggarwal10/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1424] hover:bg-[#162038] text-slate-300 hover:text-white border border-[#1b2742] hover:border-sky-500/40 transition-all text-xs"
                title="Pravesh Aggarwal on LinkedIn"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://x.com/ImPraveshAgg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1424] hover:bg-[#162038] text-slate-300 hover:text-white border border-[#1b2742] hover:border-sky-500/40 transition-all text-xs"
                title="Pravesh Aggarwal on X"
              >
                <XIcon className="w-3.5 h-3.5 text-slate-300" />
                <span>@ImPraveshAgg</span>
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#features" className="hover:text-sky-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-sky-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-sky-400 transition-colors">FAQ</a>
              </li>
              <li>
                <Link to="/interview/setup" className="hover:text-sky-400 transition-colors">Start Mock Interview</Link>
              </li>
            </ul>
          </div>

          {/* Quick Resources */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Candidate Portal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/dashboard" className="hover:text-sky-400 transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-sky-400 transition-colors">Interview History</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-sky-400 transition-colors">Candidate Profile</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-400 transition-colors">Account Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Developer & Connect */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Connect With Pravesh</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/PraveshAggarwal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
                >
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/praveshaggarwal10/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/ImPraveshAgg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
                >
                  <span>X (@ImPraveshAgg)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-10 mt-12 border-t border-[#12192a] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} InterVue AI. Built with precision for aspiring candidates worldwide.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Designed & developed by</span>
            <a 
              href="https://github.com/PraveshAggarwal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-sky-400 font-semibold underline underline-offset-2 transition-colors"
            >
              Pravesh Aggarwal
            </a>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 ml-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
