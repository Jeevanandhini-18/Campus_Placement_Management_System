import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend, // { direction: 'up' | 'down', text: '12% from last month' }
  colorScheme = 'indigo', // 'indigo' | 'teal' | 'emerald' | 'amber'
  className = '',
}) {
  const schemeStyles = {
    indigo: {
      border: 'hover:border-brand-500/40',
      iconBg: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400',
      glow: 'group-hover:bg-brand-500/5',
    },
    teal: {
      border: 'hover:border-teal-500/40',
      iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
      glow: 'group-hover:bg-teal-500/5',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      glow: 'group-hover:bg-emerald-500/5',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      glow: 'group-hover:bg-amber-500/5',
    },
  };

  const scheme = schemeStyles[colorScheme] || schemeStyles.indigo;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend || badge) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {badge && (
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              {badge}
            </span>
          )}
          {trend && (
            <span
              className={`font-semibold inline-flex items-center gap-0.5 ${
                trend.direction === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.text}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
