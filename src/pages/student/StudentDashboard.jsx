import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Send,
  CheckCircle2,
  Briefcase,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  PartyPopper,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { drivesAPI, applicationsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { formatLPA, formatDate, formatDateTime } from '../../utils/formatters';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [drivesData, appsData] = await Promise.all([
          drivesAPI.getAll(),
          applicationsAPI.getStudentApplications(user.id),
        ]);
        if (mounted) {
          setDrives(drivesData);
          setApplications(appsData);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load dashboard data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [user.id]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading student portal..." />;
  }

  // Metrics computation
  const appliedDriveIds = new Set(applications.map((a) => a.driveId));
  const studentCGPA = Number(user.cgpa) || 8.0;

  // Drives eligible to apply to: active, student CGPA >= minCGPA, and not yet applied
  const eligibleDrivesToApply = drives.filter(
    (d) => d.status === 'Active' && !appliedDriveIds.has(d.id) && studentCGPA >= d.minCGPA
  );

  const shortlistedCount = applications.filter(
    (a) => a.status === 'Shortlisted'
  ).length;

  // Placed / Selected offers (Results)
  const selectedOffers = applications.filter((a) => a.status === 'Selected');

  // Upcoming interviews: active rounds only (excluding already selected/placed offers)
  const upcomingInterviews = applications
    .filter((a) => a.status !== 'Selected' && a.interview && a.interview.date)
    .sort((a, b) => new Date(a.interview.date) - new Date(b.interview.date));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-700 via-brand-800 to-teal-800 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
            Student Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Hello, {user.name}! 🚀
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed font-medium">
            Welcome to the CampusHire Placement Management System. You currently have{' '}
            <strong className="text-white font-bold underline decoration-teal-400 decoration-2">{eligibleDrivesToApply.length} eligible placement drives</strong>{' '}
            open for applications.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* High-contrast solid white button with dark indigo text */}
            <Link to="/student/drives">
              <Button
                variant="white"
                size="sm"
                icon={Briefcase}
              >
                Browse Open Drives
              </Button>
            </Link>
            <Link to="/student/profile">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/70 hover:bg-white/20 font-semibold"
              >
                Update Resume & Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Offers & Selection Results Card (Shown when an application is Selected) */}
      {selectedOffers.length > 0 && (
        <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
                <PartyPopper className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Placement Offer & Selection Results</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                    Offered 🎉
                  </span>
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Congratulations! You have received formal selection from the following recruiting partner.
                </p>
              </div>
            </div>

            <Link to="/student/applications">
              <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/60">
                View Offer Details
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {selectedOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      Selected Candidate
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      {offer.companyName}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {offer.role}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Offered CTC</span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {formatLPA(offer.packageLPA)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-start gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {offer.interview?.notes || 'Selected! Formal offer release letter prepared by campus placement cell.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Selection Confirmed</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Application ID: {offer.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Current CGPA"
          value={studentCGPA.toFixed(2)}
          subtitle="Out of 10.0 scale"
          badge={studentCGPA >= 8.5 ? 'Distinction' : 'Good Standing'}
          icon={Award}
          colorScheme="teal"
        />

        <StatCard
          title="Applications"
          value={applications.length}
          subtitle="Drives applied to date"
          icon={Send}
          colorScheme="indigo"
        />

        <StatCard
          title="Shortlisted"
          value={shortlistedCount}
          subtitle="Active interview rounds"
          icon={CheckCircle2}
          colorScheme="emerald"
        />

        <StatCard
          title="Eligible Drives"
          value={eligibleDrivesToApply.length}
          subtitle="Ready for your application"
          icon={Briefcase}
          colorScheme="amber"
        />
      </div>

      {/* Two-column layout: Upcoming Interviews + Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Upcoming Interviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Scheduled Interviews & Rounds
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Active interview schedules between 22 Oct 2026 and 15 Nov 2026
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {upcomingInterviews.length} Scheduled
              </span>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                No active interview rounds scheduled currently. Shortlisted drive slots will appear here with your assigned meeting link.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-brand-400 dark:hover:border-brand-600"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {app.companyName}
                        </span>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        {app.role} • <span className="text-teal-700 dark:text-teal-400 font-bold">{formatLPA(app.packageLPA)}</span>
                      </p>
                      {app.interview.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                          "{app.interview.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>{formatDate(app.interview.date)}</span>
                        {app.interview.time && (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">at {app.interview.time}</span>
                        )}
                      </div>

                      {app.interview.link ? (
                        <a
                          href={app.interview.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Meeting
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {app.interview.mode || 'Campus Cell'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Applications
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Track the recruitment status of your drives
                </p>
              </div>
              <Link
                to="/student/applications"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                You haven't applied to any drives yet. Browse open drives to begin!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {app.role}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {app.companyName} • Applied on {formatDate(app.appliedDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300 hidden sm:inline">
                        {formatLPA(app.packageLPA)}
                      </span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Recommended Drives */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Drives For You
              </h2>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                {eligibleDrivesToApply.length} Open
              </span>
            </div>

            {eligibleDrivesToApply.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-center font-medium">
                All eligible drives have been applied to! Check back as new companies schedule campus hiring.
              </p>
            ) : (
              <div className="space-y-3">
                {eligibleDrivesToApply.slice(0, 3).map((drv) => (
                  <div
                    key={drv.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2 hover:border-teal-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {drv.role}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          {drv.companyName}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300 shrink-0">
                        {formatLPA(drv.packageLPA)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800 font-medium">
                      <span>Min CGPA: <strong className="text-slate-800 dark:text-slate-200">{drv.minCGPA}</strong></span>
                      <span>Deadline: <strong className="text-slate-800 dark:text-slate-200">{formatDate(drv.deadline)}</strong></span>
                    </div>

                    <Link to="/student/drives" className="block pt-1">
                      <Button variant="outline" size="sm" fullWidth className="font-semibold text-slate-800 dark:text-slate-200">
                        View & Apply
                      </Button>
                    </Link>
                  </div>
                ))}

                {eligibleDrivesToApply.length > 3 && (
                  <Link to="/student/drives" className="block pt-2">
                    <Button variant="ghost" size="sm" fullWidth className="font-bold text-brand-600 dark:text-brand-400">
                      View all {eligibleDrivesToApply.length} drives →
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
