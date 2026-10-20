import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { exportToCSV } from '../../utils/exportCsv';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReportsPage() {
  const toast = useToast();
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const [data, statsData] = await Promise.all([
        adminAPI.getReportData(),
        adminAPI.getStats(),
      ]);
      setReportData(data);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to generate placement report data.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!reportData.length) {
      toast.error('No report data available to export.', 'Export Failed');
      return;
    }

    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `CampusHire_Placement_Report_${timestamp}.csv`;
      exportToCSV(reportData, filename);
      toast.success(
        `Placement report exported successfully as ${filename}!`,
        'Report Downloaded'
      );
    } catch (err) {
      toast.error('Failed to export CSV file.', 'Export Error');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    { key: 'Student Name', label: 'Student Name', sortable: true },
    { key: 'Roll Number', label: 'Roll No', sortable: true },
    { key: 'Branch', label: 'Branch', sortable: true },
    {
      key: 'CGPA',
      label: 'CGPA',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900 dark:text-white">{val}</span>
    },
    {
      key: 'Placement Status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            val === 'Placed'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'Placed Company',
      label: 'Placed Company',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-800 dark:text-slate-200">{val}</span>
    },
    {
      key: 'Package (LPA)',
      label: 'Package',
      sortable: true,
      render: (val) => (
        <span className="font-black text-teal-700 dark:text-teal-400">{val}</span>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Compiling official placement report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Official Placement Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Export accredited accreditation data (NAAC / NBA / NIRF) for college placement records.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={Download}
          isLoading={isExporting}
          onClick={handleDownloadCSV}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20"
        >
          Download Placement Report (CSV)
        </Button>
      </div>

      {/* Summary KPI Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Cohort
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalStudents}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Enrolled candidates</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Placed Students
            </p>
            <p className="text-2xl font-black text-teal-700 dark:text-teal-400">
              {stats.placedCount}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stats.placementRate}% conversion rate</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Offers
            </p>
            <p className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {stats.totalOffers}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Including multiple offers</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average CTC
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{stats.avgPackage} LPA
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Max: ₹{stats.highestPackage} LPA</p>
          </div>
        </div>
      )}

      {/* Dataset Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Report Data Preview ({reportData.length} Records)
          </h2>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Click column headers to sort before exporting
          </span>
        </div>

        <DataTable
          columns={columns}
          data={reportData}
          searchPlaceholder="Search report preview..."
        />
      </div>
    </div>
  );
}
