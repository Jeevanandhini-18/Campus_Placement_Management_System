import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary:
    'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow active:bg-brand-800 focus-visible:ring-brand-500',
  secondary:
    'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow active:bg-teal-800 focus-visible:ring-teal-500',
  white:
    'bg-white hover:bg-brand-50 text-brand-950 hover:text-brand-900 font-bold shadow-md hover:shadow-lg active:bg-slate-100 focus-visible:ring-white border border-white/90',
  outline:
    'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 focus-visible:ring-slate-400',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:bg-rose-800 focus-visible:ring-rose-500',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-slate-400',
  subtle:
    'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 focus-visible:ring-slate-400',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
