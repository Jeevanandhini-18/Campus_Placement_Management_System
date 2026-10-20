import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Calendar,
  Building2,
  Video,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatLPA, formatDate } from '../../utils/formatters';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [user.id]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await applicationsAPI.getStudentApplications(user.id);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'role',
      label: 'Role & Company',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.role}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {row.companyName}
          </p>
        </div>
      ),
    },
    {
      key: 'packageLPA',
      label: 'Offered CTC',
      sortable: true,
      render: (val) => (
        <span className="font-extrabold text-teal-700 dark:text-teal-400">
          {formatLPA(val)}
        </span>
      ),
    },
    {
      key: 'appliedDate',
      label: 'Date Applied',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Application Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'interview',
      label: 'Interview Round',
      sortable: false,
      render: (val, row) => {
        if (row.status === 'Selected') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
              <Award className="w-3.5 h-3.5" />
              Offer Confirmed
            </span>
          );
        }
        if (!val || !val.date) {
          return <span className="text-xs text-slate-500 font-medium">—</span>;
        }
        return (
          <button
            type="button"
            onClick={() => setSelectedApp(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-200 dark:hover:bg-indigo-900 transition-colors border border-indigo-200 dark:border-indigo-800"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(val.date)}</span>
          </button>
        );
      },
    },
    {
      key: 'actions',
      label: 'Details',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedApp(row)}
          className="font-semibold text-slate-800 dark:text-slate-200"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileCheck className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          My Applications
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Review all your campus recruitment applications, offer statuses, and scheduled interview rounds.
        </p>
      </div>

      {/* Applications DataTable */}
      <DataTable
        columns={columns}
        data={applications}
        isLoading={isLoading}
        searchPlaceholder="Search by role or company..."
        emptyTitle="No applications found"
        emptyDescription="You haven't submitted any applications yet. Go to Browse Drives to explore openings."
      />

      {/* Application Details Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        subtitle={selectedApp ? `${selectedApp.role} • ${selectedApp.companyName}` : ''}
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)} className="font-semibold">
            Close
          </Button>
        }
      >
        {selectedApp && (
          <div className="space-y-5 text-sm">
            {/* Status bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} size="lg" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offered CTC</p>
                <p className="font-black text-teal-700 dark:text-teal-400 text-lg">
                  {formatLPA(selectedApp.packageLPA)}
                </p>
              </div>
            </div>

            {/* Application Info */}
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p>• <strong>Applied On:</strong> {formatDate(selectedApp.appliedDate)}</p>
              <p>• <strong>Applicant:</strong> {selectedApp.studentName} ({selectedApp.studentEmail})</p>
              <p>• <strong>Branch:</strong> {selectedApp.studentBranch || user.branch}</p>
              <p>• <strong>CGPA at time of application:</strong> {selectedApp.studentCGPA}</p>
            </div>

            {/* Scheduled Interview Section */}
            {selectedApp.interview && selectedApp.interview.date ? (
              <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/60 dark:bg-brand-950/40 space-y-3">
                <div className="flex items-center gap-2 text-brand-800 dark:text-brand-300 font-bold text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {selectedApp.status === 'Selected' ? 'Final Selection & Offer Record' : 'Scheduled Interview Round'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block font-medium">Date</span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {formatDate(selectedApp.interview.date)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block font-medium">Time</span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {selectedApp.interview.time || '10:00 AM'}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs font-medium">Meeting Venue / Mode</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {selectedApp.interview.mode || 'Campus Interview Cell'}
                  </span>
                </div>

                {selectedApp.interview.link && (
                  <div>
                    <a
                      href={selectedApp.interview.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Join Video Meeting
                    </a>
                  </div>
                )}

                {selectedApp.interview.notes && (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-brand-100 dark:border-brand-900/60 text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-bold block mb-0.5 text-slate-900 dark:text-white">Note:</span>
                    {selectedApp.interview.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 text-xs text-center border border-slate-200 dark:border-slate-800 font-medium">
                No interview round scheduled yet for this application.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
