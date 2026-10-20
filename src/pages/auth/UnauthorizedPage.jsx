import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export default function UnauthorizedPage() {
  const { role } = useAuth();

  const homePath =
    role === 'student'
      ? '/student/dashboard'
      : role === 'company'
      ? '/company/dashboard'
      : role === 'admin'
      ? '/admin/dashboard'
      : '/login';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <ShieldX className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Access Restricted
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          You don't have authorization to view this section of the portal. Your current account role is{' '}
          <strong className="text-slate-800 dark:text-slate-200 capitalize">{role || 'unassigned'}</strong>.
        </p>

        <div className="pt-2">
          <Link to={homePath}>
            <Button variant="primary" icon={ArrowLeft}>
              Back to My Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
