/**
 * Format number into Indian Rupee LPA format
 * e.g., 14.5 -> "₹14.5 LPA"
 */
export function formatLPA(val) {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `₹${Number(val).toFixed(1).replace(/\.0$/, '')} LPA`;
}

/**
 * Format ISO or date string to readable format
 * e.g., "2026-11-15" -> "15 Nov 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date + time
 * e.g. "2026-11-15T14:30:00" -> "15 Nov 2026, 02:30 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
