/**
 * Utility Functions Module
 * AI-Powered Campus Placement Management and Recommendation System
 */

const Utils = {
  /**
   * Escape HTML entities to prevent XSS attacks when rendering dynamic API data
   */
  escapeHtml: function(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Format ISO date string or timestamp into human-readable format
   */
  formatDate: function(dateInput, includeTime = false) {
    if (!dateInput) return 'N/A';
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return String(dateInput);
      
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return String(dateInput);
    }
  },

  /**
   * Format CTC / Salary amount into LPA or INR format
   */
  formatCtc: function(ctc) {
    if (ctc === null || ctc === undefined || ctc === '') return 'Not Disclosed';
    if (typeof ctc === 'number') {
      if (ctc >= 100000) {
        return `${(ctc / 100000).toFixed(2)} LPA`;
      }
      return `₹ ${ctc.toLocaleString('en-IN')}`;
    }
    return String(ctc);
  },

  /**
   * Extract query parameter from current URL
   */
  getQueryParam: function(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  },

  /**
   * Set or update query parameter without reloading
   */
  setQueryParam: function(paramName, value) {
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(paramName, value);
    } else {
      url.searchParams.delete(paramName);
    }
    window.history.pushState({}, '', url);
  },

  /**
   * Generate status badge HTML for recruitment drives
   */
  getDriveStatusBadge: function(status) {
    const cleanStatus = (status || 'DRAFT').toUpperCase();
    let badgeClass = 'badge-draft';
    if (cleanStatus === 'PUBLISHED') badgeClass = 'badge-published';
    else if (cleanStatus === 'CLOSED') badgeClass = 'badge-closed';
    else if (cleanStatus === 'CANCELLED') badgeClass = 'badge-cancelled';

    return `<span class="badge ${badgeClass}">${this.escapeHtml(cleanStatus)}</span>`;
  },

  /**
   * Generate status badge HTML for candidate applications
   */
  getApplicationStatusBadge: function(status) {
    const cleanStatus = (status || 'APPLIED').toUpperCase();
    let badgeClass = 'badge-applied';
    if (cleanStatus === 'SHORTLISTED') badgeClass = 'badge-shortlisted';
    else if (cleanStatus === 'SELECTED') badgeClass = 'badge-selected';
    else if (cleanStatus === 'REJECTED') badgeClass = 'badge-rejected';
    else if (cleanStatus === 'WITHDRAWN') badgeClass = 'badge-withdrawn';

    return `<span class="badge ${badgeClass}">${this.escapeHtml(cleanStatus)}</span>`;
  },

  /**
   * Generate eligibility badge HTML
   */
  getEligibilityBadge: function(isEligible) {
    if (isEligible) {
      return `<span class="badge badge-eligible">Eligible</span>`;
    }
    return `<span class="badge badge-ineligible">Ineligible</span>`;
  },

  /**
   * Truncate text with ellipsis
   */
  truncate: function(text, maxLen = 120) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
  },

  /**
   * Debounce execution
   */
  debounce: function(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

window.Utils = Utils;
