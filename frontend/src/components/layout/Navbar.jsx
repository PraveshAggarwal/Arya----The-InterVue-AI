import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Bot, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openSection = (id) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <nav className="site-nav sticky top-0 z-50 w-full bg-[#f7f6f2]/95 backdrop-blur-md border-b border-[#e2e8e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all shrink-0">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="nav-brand-name font-bold text-base tracking-tight">InterVue</span>
              <span className="text-sky-400 font-extrabold text-[11px] uppercase tracking-wide">AI</span>
            </div>
            <span className="nav-brand-sub block text-[10px] font-normal mt-0.5">Practice for every profession</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#627068]">
          <button
            onClick={() => openSection("roles")}
            className="nav-link transition-colors cursor-pointer"
          >
            Job families
          </button>
          <button
            onClick={() => openSection("how-it-works")}
            className="nav-link transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={() => openSection("developer")}
            className="nav-link transition-colors cursor-pointer"
          >
            About Pravesh
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="theme-preserve-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <span>Start Practice</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-link text-xs font-semibold transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="theme-preserve-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>
            </>
          )}
        </div>
        <button
          onClick={() => setMobileOpen((value) => !value)}
          className="nav-menu-btn md:hidden p-2 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>
      {mobileOpen && (
        <div className="site-mobile-menu md:hidden border-t px-5 py-4 space-y-3">
          <button
            onClick={() => openSection("roles")}
            className="mobile-nav-link block w-full text-left py-2 text-sm font-semibold transition-colors cursor-pointer"
          >
            Job families
          </button>
          <button
            onClick={() => openSection("how-it-works")}
            className="mobile-nav-link block w-full text-left py-2 text-sm font-semibold transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={() => openSection("developer")}
            className="mobile-nav-link block w-full text-left py-2 text-sm font-semibold transition-colors cursor-pointer"
          >
            About Pravesh
          </button>
          <div className="pt-2 border-t border-inherit flex items-center justify-between">
            <span className="mobile-nav-muted text-xs font-semibold">Appearance</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate(isAuthenticated ? "/dashboard" : "/register");
            }}
            className="theme-preserve-white block w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-semibold text-white text-center shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            Start Practice
          </button>
        </div>
      )}
    </nav>
  );
};
