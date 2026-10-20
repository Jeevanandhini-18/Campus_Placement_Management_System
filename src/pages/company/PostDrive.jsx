import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Briefcase,
  IndianRupee,
  Award,
  Calendar,
  Layers,
  MapPin,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drivesAPI } from '../../services/api';
import Button from '../../components/common/Button';

const branchOptions = [
  'Computer Science',
  'Information Technology',
  'Electronics & Comm.',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function PostDrive() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: '',
    packageLPA: '',
    minCGPA: '7.5',
    deadline: '',
    location: 'Bangalore / Hybrid',
    description: '',
    rounds: 'Online Test, Technical Round, HR Interview',
    eligibleBranches: ['Computer Science', 'Information Technology'],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBranchToggle = (branch) => {
    setFormData((prev) => {
      const exists = prev.eligibleBranches.includes(branch);
      if (exists) {
        return {
          ...prev,
          eligibleBranches: prev.eligibleBranches.filter((b) => b !== branch),
        };
      } else {
        return {
          ...prev,
          eligibleBranches: [...prev.eligibleBranches, branch],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.role.trim()) {
      setErrorMsg('Job Role title is required.');
      return;
    }

    const pkg = parseFloat(formData.packageLPA);
    if (isNaN(pkg) || pkg <= 0) {
      setErrorMsg('Please enter a valid package in LPA (e.g. 14.5).');
      return;
    }

    const cgpa = parseFloat(formData.minCGPA);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      setErrorMsg('Minimum CGPA must be between 0.0 and 10.0.');
      return;
    }

    if (!formData.deadline) {
      setErrorMsg('Please select an application deadline date.');
      return;
    }

    if (formData.eligibleBranches.length === 0) {
      setErrorMsg('Please select at least one eligible engineering branch.');
      return;
    }

    setIsLoading(true);
    try {
      const roundsArray = formData.rounds
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      await drivesAPI.create({
        companyId: user.id,
        companyName: user.companyName || 'Corporate Partner',
        role: formData.role.trim(),
        packageLPA: pkg,
        minCGPA: cgpa,
        deadline: formData.deadline,
        location: formData.location.trim(),
        description: formData.description.trim(),
        rounds: roundsArray,
        eligibleBranches: formData.eligibleBranches,
      });

      toast.success(
        `Drive for "${formData.role}" has been posted successfully!`,
        'Drive Published'
      );
      navigate('/company/drives');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post recruitment drive.');
      toast.error('Could not post drive. Please try again.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <PlusCircle className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          Post a Campus Placement Drive
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Publish a new job opening to invite applications from verified college students.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6"
      >
        {/* Role title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Role Title *
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Associate Software Engineer / Data Analyst"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </div>
        </div>

        {/* Package & Min CGPA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Annual Package in LPA (₹) *
            </label>
            <div className="relative">
              <span className="text-slate-400 font-bold text-sm absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                step="0.1"
                min="1"
                name="packageLPA"
                required
                value={formData.packageLPA}
                onChange={handleChange}
                placeholder="e.g. 14.5"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Minimum Required CGPA * (0 - 10)
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="minCGPA"
                required
                value={formData.minCGPA}
                onChange={handleChange}
                placeholder="e.g. 7.5"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Deadline & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Application Deadline Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Job Location / Work Mode
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore / Remote / Hybrid"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Eligible Branches Checkbox Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Eligible Engineering Branches *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {branchOptions.map((branch) => {
              const checked = formData.eligibleBranches.includes(branch);
              return (
                <button
                  type="button"
                  key={branch}
                  onClick={() => handleBranchToggle(branch)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                    checked
                      ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-500 text-brand-700 dark:text-brand-300'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{branch}</span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      checked
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hiring Rounds */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Recruitment Process Rounds (comma-separated)
          </label>
          <input
            type="text"
            name="rounds"
            value={formData.rounds}
            onChange={handleChange}
            placeholder="e.g. Online Assessment, Technical Round, System Design, HR Discussion"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Job Description & Candidate Responsibilities
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe role responsibilities, tech stacks, expectations..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/company/drives')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={PlusCircle}
          >
            Publish Placement Drive
          </Button>
        </div>
      </form>
    </div>
  );
}
