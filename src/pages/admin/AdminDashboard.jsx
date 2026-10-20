import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  Building2,
  Layers,
  TrendingUp,
  Download,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminAPI } from '../../services/api';
import { exportToCSV } from '../../utils/exportCsv';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatLPA } from '../../utils/formatters';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Reset Demo Data Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        setIsLoading(true);
        const data = await adminAPI.getStats();
        if (mounted) setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadStats();
    return () => { mounted = false; };
  }, []);

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      const data = await adminAPI.getReportData();
      const timestamp = new Date().toISOString().split('T')[0];
      exportToCSV(data, `CampusHire_Placement_Report_${timestamp}.csv`);
      toast.success(
        'Placement report downloaded with proper currency encoding (₹).',
        'CSV Exported'
      );
    } catch (err) {
      toast.error('Failed to export placement report.', 'Export Error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await adminAPI.resetDemoData();
      logout();
      toast.success('All demo data has been restored to factory defaults.', 'System Reset');
      setIsResetModalOpen(false);
      // Hard redirect to login so entire application state and memory reloads cleanly
      window.location.href = '/login?reset=1';
    } catch (err) {
      toast.error('Failed to reset demo data.', 'Reset Error');
      setIsResetting(false);
    }
  };

  if (isLoading || !stats) {
    return <LoadingSpinner fullScreen message="Loading placement officer analytics..." />;
  }

  const pieData = [
    { name: 'Placed', value: stats.placedCount },
    { name: 'Unplaced', value: stats.unplacedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-teal-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Placement Cell Head Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Campus Placement Analytics
          </h1>
          <p className="text-sm text-purple-100 leading-relaxed font-medium">
            Monitor real-time campus hiring statistics, approve corporate recruiters, and oversee student offer acceptances for Academic Year 2026.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="white"
              size="sm"
              icon={Download}
              isLoading={isExporting}
              onClick={handleDownloadCSV}
            >
              Download Placement Report (CSV)
            </Button>
            <Link to="/admin/companies">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/70 hover:bg-white/20 font-semibold"
              >
                Pending Approvals ({stats.pendingCompanies})
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle={`${stats.placedCount} placed candidates`}
          icon={Users}
          colorScheme="indigo"
        />

        <StatCard
          title="Offers Released"
          value={stats.totalOffers}
          subtitle={`Placement rate: ${stats.placementRate}%`}
          trend={{ direction: 'up', text: `${stats.placementRate}% placed` }}
          icon={Award}
          colorScheme="teal"
        />

        <StatCard
          title="Approved Companies"
          value={stats.approvedCompanies}
          subtitle={`${stats.pendingCompanies} pending approvals`}
          badge={stats.pendingCompanies > 0 ? `${stats.pendingCompanies} Pending` : 'Up to date'}
          icon={Building2}
          colorScheme="emerald"
        />

        <StatCard
          title="Active Drives"
          value={stats.activeDrives}
          subtitle={`Avg CTC: ${formatLPA(stats.avgPackage)}`}
          icon={Layers}
          colorScheme="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Offers by Branch (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Total Offers by Engineering Branch
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Comparison of placed students and total job offers received
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950/70 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
              Highest CTC: {formatLPA(stats.highestPackage)}
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.branchStats}
                margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="branch"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  dataKey="placed"
                  name="Placed Students"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="offers"
                  name="Total Offers"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie / Ratio Card: Placement Status (1 col) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Placement Conversion
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Placed vs Unplaced student distribution
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#0d9488" />
                  <Cell fill="#64748b" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.placementRate}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Placed
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                Placed Students
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {stats.placedCount} ({stats.placementRate}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Unplaced Students
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {stats.unplacedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions & Demo Reset Section */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            System Management & Demo Controls
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            Restore sample data to original presets, wipe test applications, and reset credentials.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/admin/reports">
            <Button variant="outline" size="sm" icon={FileSpreadsheet}>
              Detailed Reports
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={() => setIsResetModalOpen(true)}
            className="text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 font-bold border border-rose-200 dark:border-rose-900"
          >
            Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Demo Data */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => !isResetting && setIsResetModalOpen(false)}
        title="Reset System to Demo Defaults?"
        subtitle="This will erase all changes and restore the original sample data"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isResetting}
              onClick={() => setIsResetModalOpen(false)}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isResetting}
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="font-medium">
              This action will permanently discard all created placement drives, new student applications, scheduled interviews, and company approvals.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">The following seeds will be restored:</p>
            <p>• <strong>Student account:</strong> Aarav Sharma (student@campus.edu)</p>
            <p>• <strong>Company account:</strong> Sarah Jenkins (company@nimbus.com)</p>
            <p>• <strong>Admin account:</strong> Dr. Rajesh Rao (admin@campus.edu)</p>
            <p>• <strong>6 Campus Drives:</strong> Google, Razorpay, Nimbus, TCS, Deloitte</p>
            <p>• All active sessions will be signed out cleanly.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
