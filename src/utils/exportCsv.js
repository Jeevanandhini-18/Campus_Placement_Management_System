/**
 * Shared CSV Export Helper
 * - Prefixes UTF-8 BOM ("\uFEFF") so Excel displays Unicode characters (like ₹) correctly.
 * - Adheres to RFC 4180: wraps fields containing commas, quotes, or newlines in double quotes,
 *   and escapes inner quotes by doubling them ("").
 * 
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - Download file name
 */
export function exportToCSV(data, filename = 'campus_placement_report.csv') {
  if (!data || !data.length) {
    throw new Error('No data available to export');
  }

  // Extract column headers from the first record
  const headers = Object.keys(data[0]);

  const formatField = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Wrap in quotes if it contains comma, double quote, carriage return, or newline
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [];

  // 1. Header row
  csvRows.push(headers.map(formatField).join(','));

  // 2. Data rows
  for (const row of data) {
    const rowValues = headers.map((header) => formatField(row[header]));
    csvRows.push(rowValues.join(','));
  }

  const csvContent = csvRows.join('\r\n');

  // Prepend UTF-8 BOM ("\uFEFF") to force Excel to open in UTF-8 mode
  const utf8BOM = '\uFEFF';
  const blob = new Blob([utf8BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
