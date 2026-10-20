import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  Users,
  Layers,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { drivesAPI, applicationsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { formatLPA, formatDate } from '../../utils/formatters';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [drivesData, appsData] = await Promise.all([
          drivesAPI.getAll({ companyId: user.id }),
          applicationsAPI.getCompanyApplications(user.id),
        ]);
        if (mounted) {
          setDrives(drivesData);
          setApplications(appsData);
        }
      } catch (err) {
        console.error('Failed to load company dashboard:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [user.id]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading company dashboard..." />;
  }

  const activeDrives = drives.filter((d) => d.status === 'Active');
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const selectedCount = applications.filter((a) => a.status === 'Selected').length;
  const interviewsCount = applications.filter((a) => a.interview?.date).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-800 via-indigo-800 to-teal-800 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
            Corporate Partner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {user.companyName || 'Corporate Partner'} 🏢
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed font-medium">
            Welcome, {user.name || 'HR Team'}. Manage your recruitment drives, shortlist eligible student candidates, and schedule campus interviews.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/company/post-drive">
              <Button
                variant="white"
                size="sm"
                icon={PlusCircle}
              >
                Post New Placement Drive
              </Button>
            </Link>
            <Link to="/company/applicants">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/70 hover:bg-white/20 font-semibold"
              >
                Review Applicants ({applications.length})
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Drives"
          value={activeDrives.length}
          subtitle={`${drives.length} total drives posted`}
          icon={Layers}
          colorScheme="indigo"
        />

        <StatCard
          title="Total Applicants"
          value={applications.length}
          subtitle="Across all campus drives"
          icon={Users}
          colorScheme="teal"
        />

        <StatCard
          title="Shortlisted Candidates"
          value={shortlistedCount}
          subtitle={`${selectedCount} hired / selected`}
          icon={CheckCircle2}
          colorScheme="emerald"
        />

        <StatCard
          title="Scheduled Interviews"
          value={interviewsCount}
          subtitle="Upcoming slots"
          icon={Calendar}
          colorScheme="amber"
        />
      </div>

      {/* Two columns: Drives list + Recent applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Drives (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Your Drives
              </h2>
              <Link
                to="/company/drives"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {drives.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 text-xs font-medium">
                No drives created yet. Click "Post New Placement Drive" to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {drives.map((drv) => {
                  const driveApps = applications.filter((a) => a.driveId === drv.id);
                  return (
                    <div
                      key={drv.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2 hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                            {drv.role}
                          </p>
                          <p className="text-[11px] text-teal-700 dark:text-teal-300 font-extrabold mt-0.5">
                            {formatLPA(drv.packageLPA)} • Min CGPA: {drv.minCGPA}
                          </p>
                        </div>
                        <StatusBadge status={drv.status} size="sm" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800 font-medium">
                        <span>{driveApps.length} Applicants</span>
                        <Link
                          to={`/company/applicants?driveId=${drv.id}`}
                          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          View Candidates →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Applicants (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Recent Candidate Submissions
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Students who applied to your open recruitment drives
                </p>
              </div>

              <Link
                to="/company/applicants"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                All applicants <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 text-xs font-medium">
                No candidate applications received yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {app.studentName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 font-bold border border-teal-200 dark:border-teal-800">
                          CGPA: {app.studentCGPA}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                        {app.studentBranch} • Applied for <strong className="text-slate-800 dark:text-slate-200">{app.role}</strong> on {formatDate(app.appliedDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={app.status} size="sm" />
                      <Link to="/company/applicants">
                        <Button variant="outline" size="sm" className="font-semibold text-slate-800 dark:text-slate-200">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
