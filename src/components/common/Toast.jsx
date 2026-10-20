import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-800',
  error: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/80 dark:text-rose-100 dark:border-rose-800',
  info: 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-100 dark:border-indigo-800',
  warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/80 dark:text-amber-100 dark:border-amber-800',
};

const iconColors = {
  success: 'text-emerald-500 dark:text-emerald-400',
  error: 'text-rose-500 dark:text-rose-400',
  info: 'text-indigo-500 dark:text-indigo-400',
  warning: 'text-amber-500 dark:text-amber-400',
};

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-up ${styles[t.type] || styles.info}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[t.type]}`} />
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className="font-semibold text-sm leading-tight mb-1">{t.title}</p>
              )}
              <p className="text-sm opacity-90 break-words">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:ring-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
