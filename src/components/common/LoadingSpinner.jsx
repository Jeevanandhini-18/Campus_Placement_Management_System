import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading data...',
  fullScreen = false,
  className = '',
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 gap-3 text-center ${className}`}
    >
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-600 dark:text-brand-400`} />
      {message && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
