import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  UserCheck,
  PlusCircle,
  Layers,
  Users,
  BarChart3,
  Building,
  GraduationCap,
  FileSpreadsheet,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationConfigs = {
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Browse Drives', path: '/student/drives', icon: Briefcase },
    { label: 'My Applications', path: '/student/applications', icon: FileCheck },
    { label: 'Profile & Resume', path: '/student/profile', icon: UserCheck },
  ],
  company: [
    { label: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Post a Drive', path: '/company/post-drive', icon: PlusCircle },
    { label: 'Manage Drives', path: '/company/drives', icon: Layers },
    { label: 'Applicants', path: '/company/applicants', icon: Users },
  ],
  admin: [
    { label: 'Overview', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Companies', path: '/admin/companies', icon: Building },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Placement Reports', path: '/admin/reports', icon: FileSpreadsheet },
  ],
};

export default function Sidebar({ onCloseMobile }) {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const links = navigationConfigs[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top Nav section */}
      <div className="p-4 space-y-6">
        {/* Role identifier card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50/50 dark:from-brand-950/40 dark:to-teal-950/20 border border-brand-100/80 dark:border-brand-900/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {role === 'admin'
              ? 'Admin Console'
              : role === 'company'
              ? 'Corporate Portal'
              : 'Student Portal'}
          </p>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
            {user?.name || user?.companyName || 'Welcome'}
          </p>
          {role === 'student' && user?.cgpa && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Current CGPA: <span className="font-bold text-teal-600 dark:text-teal-400">{user.cgpa}</span>
            </p>
          )}
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5" aria-label="Sidebar navigation">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'
                        }`}
                      />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'opacity-80 text-white' : 'text-slate-400'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sign-out section */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
          CampusHire v1.0 • College ERP
        </p>
      </div>
    </aside>
  );
}
