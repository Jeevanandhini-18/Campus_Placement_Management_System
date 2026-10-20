import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle,
  XCircle,
  Filter,
  Building2,
  Download
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { formatLPA } from '../../utils/formatters';

const branchOptions = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electronics & Comm.',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function ManageStudents() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getStudents();
      setStudents(data);
    } catch (err) {
      toast.error('Failed to load students directory.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchBranch = branchFilter === 'All' || s.branch === branchFilter;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Placed' && s.isPlaced) ||
      (statusFilter === 'Unplaced' && !s.isPlaced);
    return matchBranch && matchStatus;
  });

  const columns = [
    {
      key: 'name',
      label: 'Student Name & Roll No',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{val}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {row.rollNo} • {row.email}
          </p>
        </div>
      ),
    },
    {
      key: 'branch',
      label: 'Engineering Branch',
      sortable: true,
      render: (val) => <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{val}</span>,
    },
    {
      key: 'cgpa',
      label: 'CGPA',
      sortable: true,
      render: (val) => (
        <span className="font-black text-teal-700 dark:text-teal-400">
          {val}
        </span>
      ),
    },
    {
      key: 'isPlaced',
      label: 'Placement Status',
      sortable: true,
      render: (val) => (
        <StatusBadge status={val ? 'Placed' : 'Not Placed'} />
      ),
    },
    {
      key: 'placedCompany',
      label: 'Placed Company',
      sortable: true,
      render: (val, row) => {
        if (!row.isPlaced || !val) {
          return <span className="text-xs text-slate-400 font-medium">—</span>;
        }
        return (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
            <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>{val}</span>
          </div>
        );
      },
    },
    {
      key: 'packageLPA',
      label: 'Package (LPA)',
      sortable: true,
      render: (val, row) => {
        if (!row.isPlaced || !val) {
          return <span className="text-xs text-slate-400 font-medium">—</span>;
        }
        return (
          <span className="font-black text-teal-700 dark:text-teal-400">
            {formatLPA(val)}
          </span>
        );
      },
    },
  ];

  const placedCount = students.filter((s) => s.isPlaced).length;
  const unplacedCount = students.length - placedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Student Placement Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Search candidates across departments and review placed vs unplaced status.
          </p>
        </div>

        {/* Quick summary chip */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
            Placed: {placedCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            Unplaced: {unplacedCount}
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Branch Filter */}
        <div className="w-full sm:w-64">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Engineering Branch
          </label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
          >
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b === 'All' ? 'All Branches' : b}
              </option>
            ))}
          </select>
        </div>

        {/* Placement Status Filter */}
        <div className="w-full sm:w-56">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Placement Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
          >
            <option value="All">All Students ({students.length})</option>
            <option value="Placed">Placed Only ({placedCount})</option>
            <option value="Unplaced">Unplaced Only ({unplacedCount})</option>
          </select>
        </div>

        {(branchFilter !== 'All' || statusFilter !== 'All') && (
          <div className="sm:self-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBranchFilter('All');
                setStatusFilter('All');
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
        data={filteredStudents}
        isLoading={isLoading}
        searchPlaceholder="Search by student name, roll number, or branch..."
        emptyTitle="No students found"
        emptyDescription="Try adjusting your branch or placement status filters."
      />
    </div>
  );
}
