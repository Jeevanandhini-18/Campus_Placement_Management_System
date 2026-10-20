import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Award,
  Filter,
  FileText,
  Mail,
  UserCheck,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { applicationsAPI, drivesAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

export default function ManageApplicants() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const initialDriveId = searchParams.get('driveId') || 'All';
  const [selectedDriveFilter, setSelectedDriveFilter] = useState(initialDriveId);
  const [statusFilter, setStatusFilter] = useState('All');

  // Schedule Interview Modal State
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '2026-10-30',
    time: '14:00',
    mode: 'Google Meet',
    link: 'https://meet.google.com/xyz-campushire-interview',
    notes: 'Live coding & problem-solving discussion.',
  });
  const [isSubmittingInterview, setIsSubmittingInterview] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appsData, drivesData] = await Promise.all([
        applicationsAPI.getCompanyApplications(user.id),
        drivesAPI.getAll({ companyId: user.id }),
      ]);
      setApplications(appsData);
      setDrives(drivesData);
    } catch (err) {
      toast.error('Failed to load candidate applications.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const updated = await applicationsAPI.updateStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: updated.status } : a))
      );
      toast.success(
        `Application marked as ${newStatus}.`,
        'Status Updated'
      );
    } catch (err) {
      toast.error('Failed to update applicant status.', 'Error');
    }
  };

  const handleOpenInterviewModal = (app) => {
    setInterviewModalApp(app);
    setInterviewForm({
      date: app.interview?.date || '2026-10-30',
      time: app.interview?.time || '14:00',
      mode: app.interview?.mode || 'Google Meet',
      link: app.interview?.link || 'https://meet.google.com/xyz-campushire-interview',
      notes: app.interview?.notes || 'Live coding & problem-solving discussion.',
    });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewForm.date) {
      toast.error('Please select an interview date between 22 Oct 2026 and 15 Nov 2026.', 'Missing Date');
      return;
    }

    setIsSubmittingInterview(true);
    try {
      const updated = await applicationsAPI.scheduleInterview(interviewModalApp.id, interviewForm);
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      toast.success(
        `Interview scheduled with ${interviewModalApp.studentName} on ${formatDate(interviewForm.date)}!`,
        'Interview Confirmed'
      );
      setInterviewModalApp(null);
    } catch (err) {
      toast.error('Failed to schedule interview.', 'Error');
    } finally {
      setIsSubmittingInterview(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchDrive =
      selectedDriveFilter === 'All' || app.driveId === selectedDriveFilter;
    const matchStatus =
      statusFilter === 'All' || app.status.toLowerCase() === statusFilter.toLowerCase();
    return matchDrive && matchStatus;
  });

  const columns = [
    {
      key: 'studentName',
      label: 'Candidate Details',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{val}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {row.studentEmail} • {row.studentBranch}
          </p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Applied Role',
      sortable: true,
      render: (val) => <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{val}</span>,
    },
    {
      key: 'studentCGPA',
      label: 'CGPA',
      sortable: true,
      render: (val) => (
        <span className="font-black text-teal-700 dark:text-teal-400">
          {val}
        </span>
      ),
    },
    {
      key: 'appliedDate',
      label: 'Applied Date',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'interview',
      label: 'Interview',
      sortable: false,
      render: (val, row) => {
        if (val && val.date) {
          return (
            <button
              type="button"
              onClick={() => handleOpenInterviewModal(row)}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(val.date)}</span>
            </button>
          );
        }
        if (row.status === 'Shortlisted') {
          return (
            <button
              type="button"
              onClick={() => handleOpenInterviewModal(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-800 dark:bg-brand-950/70 dark:text-brand-300 hover:bg-brand-100 transition-colors border border-brand-200 dark:border-brand-800"
            >
              <Calendar className="w-3 h-3" />
              Schedule
            </button>
          );
        }
        return <span className="text-xs text-slate-500 font-medium">—</span>;
      },
    },
    {
      key: 'actions',
      label: 'Hiring Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status !== 'Shortlisted' && row.status !== 'Selected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(row.id, 'Shortlisted')}
              className="hover:text-brand-700 hover:border-brand-500 font-bold"
            >
              Shortlist
            </Button>
          )}

          {row.status === 'Shortlisted' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenInterviewModal(row)}
              icon={Calendar}
            >
              Schedule
            </Button>
          )}

          {row.status !== 'Selected' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleStatusChange(row.id, 'Selected')}
              className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm"
            >
              Select
            </Button>
          )}

          {row.status !== 'Rejected' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(row.id, 'Rejected')}
              className="text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40 font-bold"
            >
              Reject
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Users className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          Review Applicants
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Evaluate candidates, shortlist top performers, and schedule interview rounds.
        </p>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Drive Filter */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Filter by Drive
          </label>
          <select
            value={selectedDriveFilter}
            onChange={(e) => {
              setSelectedDriveFilter(e.target.value);
              setSearchParams(e.target.value === 'All' ? {} : { driveId: e.target.value });
            }}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
          >
            <option value="All">All Placement Drives ({drives.length})</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.role}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-56">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {(selectedDriveFilter !== 'All' || statusFilter !== 'All') && (
          <div className="sm:self-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDriveFilter('All');
                setStatusFilter('All');
                setSearchParams({});
              }}
              className="font-bold text-brand-600 dark:text-brand-400"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredApplications}
        isLoading={isLoading}
        searchPlaceholder="Search candidates by name, email, branch..."
        emptyTitle="No candidates match your criteria"
        emptyDescription="Try selecting a different drive or resetting the status filters."
      />

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={!!interviewModalApp}
        onClose={() => setInterviewModalApp(null)}
        title="Schedule Candidate Interview"
        subtitle={interviewModalApp ? `Interviewing ${interviewModalApp.studentName} for ${interviewModalApp.role}` : ''}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInterviewModalApp(null)}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmittingInterview}
              onClick={handleScheduleSubmit}
            >
              Confirm & Save Slot
            </Button>
          </>
        }
      >
        {interviewModalApp && (
          <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="font-extrabold text-slate-900 dark:text-white">
                {interviewModalApp.studentName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {interviewModalApp.studentBranch} • CGPA: <strong className="text-teal-700 dark:text-teal-400">{interviewModalApp.studentCGPA}</strong> • {interviewModalApp.studentEmail}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Interview Date * (Between 22 Oct - 15 Nov 2026)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    min="2026-10-22"
                    max="2026-11-15"
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Time Slot *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Meeting Mode / Platform
              </label>
              <select
                value={interviewForm.mode}
                onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Zoom">Zoom</option>
                <option value="Campus Placement Cell (Hall A)">Campus Placement Cell (Hall A)</option>
                <option value="Campus Placement Cell (Hall B)">Campus Placement Cell (Hall B)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Meeting Link or Venue Details
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={interviewForm.link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Preparation Notes for Candidate
              </label>
              <textarea
                rows={2}
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                placeholder="e.g. Please join 5 mins before time with screenshare enabled..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
