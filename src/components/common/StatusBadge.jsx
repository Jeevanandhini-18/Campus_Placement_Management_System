import React from 'react';

const statusConfigs = {
  Applied: {
    bg: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500',
  },
  Shortlisted: {
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
  },
  Selected: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  Rejected: {
    bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  Pending: {
    bg: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  Approved: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  Active: {
    bg: 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
  },
  Closed: {
    bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  Placed: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  'Not Placed': {
    bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
};

export default function StatusBadge({ status = 'Applied', showDot = true, size = 'md', className = '' }) {
  const normalizedKey =
    Object.keys(statusConfigs).find(
      (k) => k.toLowerCase() === (status || '').toLowerCase()
    ) || 'Applied';

  const config = statusConfigs[normalizedKey] || statusConfigs.Applied;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-bold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClass} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{status}</span>
    </span>
  );
}
