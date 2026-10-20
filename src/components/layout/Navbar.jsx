import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sun,
  Moon,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  Building2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';

export default function Navbar({ onToggleMobileSidebar, isMobileSidebarOpen }) {
  const { user, logout, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleMeta = {
    student: {
      label: 'Student',
      icon: BookOpen,
      color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    },
    company: {
      label: 'Company HR',
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    },
    admin: {
      label: 'Placement Officer',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    },
  };

  const currentRoleMeta = roleMeta[role] || roleMeta.student;
  const RoleIcon = currentRoleMeta.icon;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Campus<span className="text-teal-600 dark:text-teal-400">Hire</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase leading-none mt-0.5">
                Placement Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Role indicator, Theme toggle, User profile & Sign out */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role badge */}
          {user && (
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentRoleMeta.color}`}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{currentRoleMeta.label}</span>
            </div>
          )}

          {/* Dark/Light toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User profile dropdown */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-200 dark:border-brand-800">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                    {user.name || user.email}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                    {user.branch || user.companyName || user.department || 'Portal User'}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    {role === 'student' && (
                      <Link
                        to="/student/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile & Resume
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
