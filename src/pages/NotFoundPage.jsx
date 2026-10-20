import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const { role, isAuthenticated } = useAuth();

  const destination = !isAuthenticated
    ? '/login'
    : role === 'student'
    ? '/student/dashboard'
    : role === 'company'
    ? '/company/dashboard'
    : '/admin/dashboard';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
          <Compass className="w-9 h-9 animate-spin-slow" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          404 — Page Not Found
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested page does not exist or has been relocated within the placement portal.
        </p>

        <div className="pt-2">
          <Link to={destination}>
            <Button variant="primary" icon={ArrowLeft}>
              Back to CampusHire
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
