import React, { useState, useRef } from 'react';
import {
  UserCheck,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Save,
  Trash2,
  Download,
  Award,
  Hash,
  Mail,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { profileAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const branchOptions = [
  'Computer Science',
  'Information Technology',
  'Electronics & Comm.',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function StudentProfile() {
  const { user, updateUserData } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    branch: user?.branch || 'Computer Science',
    cgpa: user?.cgpa !== undefined ? String(user.cgpa) : '8.5',
    rollNo: user?.rollNo || '',
    phone: user?.phone || '',
    skills: user?.skills ? user.skills.join(', ') : 'React, Node.js, Python, PostgreSQL',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeInfo, setResumeInfo] = useState({
    url: user?.resumeUrl || 'Aarav_Sharma_Resume.pdf',
    size: user?.resumeSize || '412 KB',
    uploadedAt: user?.resumeUploadedAt || '2026-10-12',
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    const cgpaVal = parseFloat(formData.cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      setErrorMsg('Please enter a valid CGPA between 0.0 and 10.0');
      return;
    }

    setIsSavingProfile(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await profileAPI.update(user.id, {
        name: formData.name,
        branch: formData.branch,
        cgpa: cgpaVal,
        rollNo: formData.rollNo,
        phone: formData.phone,
        skills: skillsArray,
      });

      updateUserData(updated);
      toast.success('Your profile has been successfully updated!', 'Profile Saved');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
      toast.error('Failed to save profile changes.', 'Error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Only PDF documents are supported for resumes.', 'Invalid Format');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume PDF file size cannot exceed 5MB.', 'File Too Large');
      return;
    }

    setIsUploadingResume(true);
    try {
      const res = await profileAPI.uploadResume(user.id, file);
      setResumeInfo({
        url: res.resumeUrl,
        size: res.resumeSize,
        uploadedAt: res.resumeUploadedAt,
      });
      updateUserData({
        resumeUrl: res.resumeUrl,
        resumeSize: res.resumeSize,
        resumeUploadedAt: res.resumeUploadedAt,
      });
      toast.success(`Resume "${file.name}" uploaded successfully!`, 'Resume Updated');
    } catch (err) {
      toast.error('Failed to upload resume. Please try again.', 'Upload Error');
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <UserCheck className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          Candidate Profile & Resume
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Keep your academic record and resume up-to-date for campus recruiters.
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Resume Upload Section Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Active Resume Document
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This resume is automatically attached when you apply to placement drives.
          </p>
        </div>

        {/* Resume Preview Box */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {resumeInfo.url || 'No resume uploaded yet'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {resumeInfo.size} • Uploaded on {formatDate(resumeInfo.uploadedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
              isLoading={isUploadingResume}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload New PDF
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          * Accepted file format: PDF only. Maximum size: 5 MB.
        </p>
      </div>

      {/* Edit Profile Form Card */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Academic & Personal Information
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your registered name, academic branch, and CGPA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              College Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'student@campus.edu'}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Roll Number
            </label>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              placeholder="e.g. CS22B042"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Engineering Branch *
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Cumulative CGPA * (0-10)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              name="cgpa"
              required
              value={formData.cgpa}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Technical Skills (comma-separated tags)
          </label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, Python, PostgreSQL, AWS"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          {formData.skills && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {formData.skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            isLoading={isSavingProfile}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
