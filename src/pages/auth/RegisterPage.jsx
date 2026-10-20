import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  ShieldAlert,
  Mail,
  Lock,
  User,
  Hash,
  BookOpen,
  Award,
  Globe,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

const branches = [
  'Computer Science',
  'Information Technology',
  'Electronics & Comm.',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // 'student' | 'company'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    branch: 'Computer Science',
    cgpa: '8.5',
    gradYear: '2026'
  });

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    name: '', // HR Contact
    email: '',
    password: '',
    industry: 'Cloud Software & SaaS',
    website: '',
    location: 'Bangalore, India'
  });

  const handleStudentChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const handleCompanyChange = (e) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'student') {
      if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.password) {
        setErrorMsg('Please fill in all mandatory fields.');
        return;
      }
      const cgpaNum = parseFloat(studentForm.cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        setErrorMsg('Please enter a valid CGPA between 0.0 and 10.0');
        return;
      }
    } else {
      if (!companyForm.companyName.trim() || !companyForm.name.trim() || !companyForm.email.trim() || !companyForm.password) {
        setErrorMsg('Please fill in all mandatory fields.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload =
        role === 'student'
          ? { ...studentForm, role: 'student', cgpa: parseFloat(studentForm.cgpa) }
          : { ...companyForm, role: 'company' };

      const user = await register(payload);
      toast.success(
        role === 'student'
          ? 'Registration successful! Welcome to CampusHire.'
          : 'Company registered successfully! Account is submitted for TPO approval.',
        'Account Created'
      );

      navigate(role === 'student' ? '/student/dashboard' : '/company/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-brand-600 text-white shadow-lg shadow-teal-500/25 mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create an Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join CampusHire to participate in upcoming campus placement drives
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'student'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('company')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'company'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Recruiting Company
              </button>
            </div>
          </div>

          {/* Admin Registration Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold">Placement Officer (Admin) accounts cannot self-register.</span> They are provisioned centrally by the college administration.
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'student' ? (
              // Student Fields
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={studentForm.name}
                        onChange={handleStudentChange}
                        placeholder="e.g. Aarav Sharma"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Roll Number *
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        name="rollNo"
                        required
                        value={studentForm.rollNo}
                        onChange={handleStudentChange}
                        placeholder="e.g. CS22B042"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      College Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={studentForm.email}
                        onChange={handleStudentChange}
                        placeholder="student@campus.edu"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        value={studentForm.password}
                        onChange={handleStudentChange}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Branch
                    </label>
                    <div className="relative">
                      <select
                        name="branch"
                        value={studentForm.branch}
                        onChange={handleStudentChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {branches.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      required
                      value={studentForm.cgpa}
                      onChange={handleStudentChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Graduation Year
                    </label>
                    <select
                      name="gradYear"
                      value={studentForm.gradYear}
                      onChange={handleStudentChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              // Company Fields
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={companyForm.companyName}
                        onChange={handleCompanyChange}
                        placeholder="e.g. Acme Innovations Inc."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      HR / Recruiter Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={companyForm.name}
                        onChange={handleCompanyChange}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Work Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={companyForm.email}
                        onChange={handleCompanyChange}
                        placeholder="hr@company.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        value={companyForm.password}
                        onChange={handleCompanyChange}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={companyForm.industry}
                      onChange={handleCompanyChange}
                      placeholder="e.g. FinTech / AI"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        name="website"
                        value={companyForm.website}
                        onChange={handleCompanyChange}
                        placeholder="https://company.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      HQ / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        name="location"
                        value={companyForm.location}
                        onChange={handleCompanyChange}
                        placeholder="Bangalore / Remote"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-2"
            >
              Complete Registration
            </Button>
          </form>

          {/* Sign In link */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
