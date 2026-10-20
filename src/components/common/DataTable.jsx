import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  pageSize = 10,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();

    return data.filter((row) => {
      return columns.some((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lower);
      });
    });
  }, [data, searchTerm, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Header */}
      {searchable && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold">{paginatedData.length}</span> of{' '}
            <span className="font-semibold">{filteredData.length}</span> results
          </p>
        </div>
      )}

      {/* Table container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {isLoading ? (
          <LoadingSpinner message="Fetching data..." />
        ) : paginatedData.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`px-4 sm:px-6 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                        col.sortable !== false ? 'cursor-pointer select-none hover:text-brand-600 dark:hover:text-brand-400' : ''
                      } ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end w-full' : ''}`}>
                        <span>{col.label}</span>
                        {col.sortable !== false && (
                          <span className="text-slate-400">
                            {sortConfig.key === col.key ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 sm:px-6 py-4 text-slate-700 dark:text-slate-300 ${
                          col.align === 'right' ? 'text-right' : ''
                        }`}
                      >
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!isLoading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)
                .map((p, index, array) => {
                  const showEllipsis = index > 0 && p - array[index - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                          currentPage === p
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
