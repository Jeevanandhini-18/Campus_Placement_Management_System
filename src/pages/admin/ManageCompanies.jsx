import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Mail,
  ExternalLink,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

export default function ManageCompanies() {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getCompanies();
      setCompanies(data);
    } catch (err) {
      toast.error('Failed to load companies.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (companyId, newStatus, companyName) => {
    try {
      await adminAPI.updateCompanyStatus(companyId, newStatus);
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, status: newStatus } : c))
      );
      toast.success(
        `${companyName} registration has been ${newStatus.toLowerCase()}!`,
        'Company Status Updated'
      );
    } catch (err) {
      toast.error('Failed to update company status.', 'Error');
    }
  };

  const filteredCompanies = companies.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const pendingCount = companies.filter((c) => c.status === 'Pending').length;

  const columns = [
    {
      key: 'companyName',
      label: 'Company Information',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-extrabold text-slate-900 dark:text-white">{val}</p>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            <span>{row.industry}</span>
            {row.website && (
              <a
                href={row.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Website <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'hrName',
      label: 'HR Contact',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{val}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'registeredDate',
      label: 'Registered On',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Registration Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Admin Action',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'Pending' ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={CheckCircle}
                onClick={() => handleUpdateStatus(row.id, 'Approved', row.companyName)}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm"
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={XCircle}
                onClick={() => handleUpdateStatus(row.id, 'Rejected', row.companyName)}
                className="text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40 font-bold"
              >
                Reject
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                handleUpdateStatus(
                  row.id,
                  row.status === 'Approved' ? 'Pending' : 'Approved',
                  row.companyName
                )
              }
              className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 underline"
            >
              Reopen
            </button>
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
          <Building2 className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          Company Registrations & Approvals
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Review inbound corporate registration requests before allowing them to post campus recruitment drives.
        </p>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => {
            const count =
              status === 'All'
                ? companies.length
                : companies.filter((c) => c.status.toLowerCase() === status.toLowerCase()).length;
            const isSelected = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    status === 'Pending' && count > 0
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-black'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {pendingCount > 0 && (
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 px-3">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{pendingCount} companies awaiting approval</span>
          </div>
        )}
      </div>

      {/* Companies Table */}
      <DataTable
        columns={columns}
        data={filteredCompanies}
        isLoading={isLoading}
        searchPlaceholder="Search by company name, HR name, or email..."
        emptyTitle="No companies found"
        emptyDescription="There are no company registrations matching the current status filter."
      />
    </div>
  );
}
