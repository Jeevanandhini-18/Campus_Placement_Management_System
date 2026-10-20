import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Building2,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drivesAPI, applicationsAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatLPA, formatDate } from '../../utils/formatters';

export default function BrowseDrives() {
  const { user } = useAuth();
  const toast = useToast();

  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingDriveId, setApplyingDriveId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [minCGPAFilter, setMinCGPAFilter] = useState('');
  const [selectedDriveForModal, setSelectedDriveForModal] = useState(null);

  const studentCGPA = Number(user?.cgpa) || 8.0;

  useEffect(() => {
    loadDrivesAndApplications();
  }, [user.id]);

  const loadDrivesAndApplications = async () => {
    try {
      setIsLoading(true);
      const [drivesData, appsData] = await Promise.all([
        drivesAPI.getAll(),
        applicationsAPI.getStudentApplications(user.id),
      ]);
      setDrives(drivesData);
      setApplications(appsData);
    } catch (err) {
      toast.error('Failed to load placement drives', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const appliedDriveIds = new Set(applications.map((a) => a.driveId));

  // Filtered drives
  const filteredDrives = drives.filter((drive) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      drive.role.toLowerCase().includes(q) ||
      drive.companyName.toLowerCase().includes(q) ||
      (drive.description && drive.description.toLowerCase().includes(q));

    const matchCGPA =
      !minCGPAFilter || drive.minCGPA <= Number(minCGPAFilter);

    return matchSearch && matchCGPA;
  });

  const handleApply = async () => {
    if (!selectedDriveForModal) return;
    const drive = selectedDriveForModal;

    setApplyingDriveId(drive.id);
    try {
      const newApp = await applicationsAPI.apply({
        driveId: drive.id,
        student: user,
      });

      setApplications((prev) => [newApp, ...prev]);
      toast.success(
        `Application submitted for ${drive.role} at ${drive.companyName}!`,
        'Application Sent'
      );
      setSelectedDriveForModal(null);
    } catch (err) {
      toast.error(err.message || 'Failed to submit application', 'Application Error');
    } finally {
      setApplyingDriveId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Browse Placement Drives
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Discover and apply to verified companies recruiting on campus.
          </p>
        </div>

        {/* Candidate CGPA Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold shrink-0">
          <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Your CGPA: <strong>{studentCGPA.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company, role title, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
          />
        </div>

        {/* Min CGPA filter */}
        <div className="w-full md:w-56 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={minCGPAFilter}
            onChange={(e) => setMinCGPAFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
          >
            <option value="">All CGPA Cutoffs</option>
            <option value="7.0">Max Cutoff: 7.0 & below</option>
            <option value="7.5">Max Cutoff: 7.5 & below</option>
            <option value="8.0">Max Cutoff: 8.0 & below</option>
            <option value="8.5">Max Cutoff: 8.5 & below</option>
            <option value="9.0">Max Cutoff: 9.0 & below</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || minCGPAFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setMinCGPAFilter('');
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Drives Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading placement drives..." />
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No drives match your filters"
          description="Try broadening your search keywords or clearing the CGPA cutoff filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setMinCGPAFilter('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => {
            const hasApplied = appliedDriveIds.has(drive.id);
            const isEligibleCGPA = studentCGPA >= drive.minCGPA;

            return (
              <div
                key={drive.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group hover:border-brand-300 dark:hover:border-brand-700"
              >
                {/* Header: Company & Role */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {drive.companyName}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {drive.role}
                      </h3>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>

                  {drive.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                      {drive.description}
                    </p>
                  )}
                </div>

                {/* Key metadata pills */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">CTC Package</p>
                      <p className="text-sm font-black text-teal-700 dark:text-teal-400">
                        {formatLPA(drive.packageLPA)}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Min CGPA</p>
                      <p className={`text-sm font-black ${isEligibleCGPA ? 'text-slate-800 dark:text-slate-200' : 'text-rose-700 dark:text-rose-400'}`}>
                        {drive.minCGPA.toFixed(1)}+
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Deadline: <strong className="text-slate-900 dark:text-slate-100">{formatDate(drive.deadline)}</strong></span>
                    </div>

                    {drive.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{drive.location}</span>
                      </div>
                    )}

                    {drive.eligibleBranches && (
                      <div className="flex items-start gap-1.5 pt-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {drive.eligibleBranches.map((b) => (
                            <span
                              key={b}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-2">
                  {hasApplied ? (
                    <Button
                      variant="subtle"
                      fullWidth
                      disabled
                      icon={CheckCircle}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800 font-bold"
                    >
                      Applied
                    </Button>
                  ) : !isEligibleCGPA ? (
                    <Button
                      variant="outline"
                      fullWidth
                      disabled
                      icon={XCircle}
                      className="text-rose-800 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-200 font-bold cursor-not-allowed"
                    >
                      Not eligible (Min {drive.minCGPA})
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => setSelectedDriveForModal(drive)}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedDriveForModal}
        onClose={() => setSelectedDriveForModal(null)}
        title="Confirm Drive Application"
        subtitle="Review your details before submitting to the recruiting team"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDriveForModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={!!applyingDriveId}
              onClick={handleApply}
            >
              Submit Application
            </Button>
          </>
        }
      >
        {selectedDriveForModal && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {selectedDriveForModal.companyName}
                </span>
                <span className="font-black text-teal-700 dark:text-teal-400">
                  {formatLPA(selectedDriveForModal.packageLPA)}
                </span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-bold">
                Role: {selectedDriveForModal.role}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                Minimum CGPA required: <strong>{selectedDriveForModal.minCGPA}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Your Candidate Profile Attached:
              </p>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-900">
                <p>• <strong>Name:</strong> {user.name} ({user.rollNo || 'CS22B042'})</p>
                <p>• <strong>Branch:</strong> {user.branch || 'Computer Science'}</p>
                <p>• <strong>Verified CGPA:</strong> {studentCGPA.toFixed(2)} (Eligible ✓)</p>
                <p>• <strong>Resume:</strong> {user.resumeUrl || 'Aarav_Sharma_Resume.pdf'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              By submitting, your resume and academic credentials will be forwarded to {selectedDriveForModal.companyName} HR.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
