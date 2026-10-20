import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Users,
  Calendar,
  Award,
  CheckCircle,
  Power,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drivesAPI, applicationsAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { formatLPA, formatDate } from '../../utils/formatters';

export default function ManageDrives() {
  const { user } = useAuth();
  const toast = useToast();

  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrives();
  }, [user.id]);

  const loadDrives = async () => {
    try {
      setIsLoading(true);
      const [drivesData, appsData] = await Promise.all([
        drivesAPI.getAll({ companyId: user.id }),
        applicationsAPI.getCompanyApplications(user.id),
      ]);
      setDrives(drivesData);
      setApplications(appsData);
    } catch (err) {
      toast.error('Failed to load company drives.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (drive) => {
    const nextStatus = drive.status === 'Active' ? 'Closed' : 'Active';
    try {
      await drivesAPI.updateStatus(drive.id, nextStatus);
      setDrives((prev) =>
        prev.map((d) => (d.id === drive.id ? { ...d, status: nextStatus } : d))
      );
      toast.success(
        `Drive status changed to ${nextStatus}.`,
        'Drive Updated'
      );
    } catch (err) {
      toast.error('Failed to update drive status.', 'Error');
    }
  };

  const columns = [
    {
      key: 'role',
      label: 'Drive Role',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.role}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {row.location || 'Campus / Hybrid'}
          </p>
        </div>
      ),
    },
    {
      key: 'packageLPA',
      label: 'CTC Package',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-teal-600 dark:text-teal-400">
          {formatLPA(val)}
        </span>
      ),
    },
    {
      key: 'minCGPA',
      label: 'Min CGPA',
      sortable: true,
      render: (val) => <span className="font-semibold">{val}</span>,
    },
    {
      key: 'deadline',
      label: 'Deadline',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: 'applicantCount',
      label: 'Applicants',
      sortable: true,
      render: (_, row) => {
        const count = applications.filter((a) => a.driveId === row.id).length;
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Users className="w-3 h-3 text-slate-400" />
            {count}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/company/applicants?driveId=${row.id}`}>
            <Button variant="outline" size="sm">
              Applicants
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'Active' ? 'Close drive' : 'Reopen drive'}
            className={row.status === 'Active' ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40' : 'text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40'}
          >
            {row.status === 'Active' ? 'Close' : 'Reactivate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Manage Placement Drives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track published campus drives, applicant numbers, and hiring status.
          </p>
        </div>

        <Link to="/company/post-drive">
          <Button variant="primary" icon={PlusCircle}>
            Post New Drive
          </Button>
        </Link>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={drives}
        isLoading={isLoading}
        searchPlaceholder="Search drives by role, location..."
        emptyTitle="No drives posted yet"
        emptyDescription="Start recruiting students by posting your first placement drive!"
      />
    </div>
  );
}
