import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student'); // 'student' | 'company' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Demo accounts presets
  const demoAccounts = {
    student: { email: 'student@campus.edu', password: 'student123', label: 'Student Demo' },
    company: { email: 'company@nimbus.com', password: 'company123', label: 'Company Demo' },
    admin: { email: 'admin@campus.edu', password: 'admin123', label: 'Admin Demo' },
  };

  const handleFillDemo = (targetRole) => {
    setRole(targetRole);
    setEmail(demoAccounts[targetRole].email);
    setPassword(demoAccounts[targetRole].password);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ email, password, role });
      toast.success(`Welcome back, ${user.name || user.companyName}!`, 'Login Successful');

      // Navigate to respective dashboard or intended redirect
      const destination =
        location.state?.from?.pathname ||
        (user.role === 'student'
          ? '/student/dashboard'
          : user.role === 'company'
          ? '/company/dashboard'
          : '/admin/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white shadow-lg shadow-brand-500/25 mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to CampusHire
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your placement portal
          </p>
        </div>

        {/* Quick demo login chips */}
        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>One-Click Demo Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                role === 'student' && email === demoAccounts.student.email
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('company')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                role === 'company' && email === demoAccounts.company.email
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
              }`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                role === 'admin' && email === demoAccounts.admin.email
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
              }`}
            >
              Admin (TPO)
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-5">
          {/* Role selector segmented control */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'student'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('company')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'company'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Company
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === 'student'
                      ? 'student@campus.edu'
                      : role === 'company'
                      ? 'company@nimbus.com'
                      : 'admin@campus.edu'
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Default: <code className="text-brand-600 dark:text-brand-400">{role}123</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-2"
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to CampusHire?{' '}
              <Link
                to="/register"
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5"
              >
                Register as Student or Company <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
