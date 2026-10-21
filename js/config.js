/**
 * Configuration Module
 * AI-Powered Campus Placement Management and Recommendation System
 */

const CONFIG = {
  // Base URL for the Spring Boot REST backend
  API_BASE: window.API_BASE_OVERRIDE || 'http://localhost:8080',

  // Storage keys for JWT and user session
  STORAGE_KEYS: {
    AUTH_TOKEN: 'campus_hire_token',
    USER_DATA: 'campus_hire_user',
    DEMO_MODE: 'campus_hire_demo_mode'
  },

  // Defined User Roles
  ROLES: {
    OFFICER: 'PLACEMENT_OFFICER',
    COORDINATOR: 'PLACEMENT_COORDINATOR',
    STUDENT: 'STUDENT'
  },

  // API Endpoints Mapping
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',

    // Dashboard
    DASHBOARD_STATS: '/api/dashboard/stats',

    // Companies & Dedicated Folders
    COMPANIES: '/api/companies',
    COMPANY_BY_ID: (id) => `/api/companies/${id}`,
    COMPANY_DRIVES: (id) => `/api/companies/${id}/drives`,
    COMPANY_DOCUMENTS: (id) => `/api/companies/${id}/documents`,
    COMPANY_DEACTIVATE: (id) => `/api/companies/${id}/deactivate`,

    // Recruitment Drives
    DRIVES: '/api/drives',
    DRIVE_BY_ID: (id) => `/api/drives/${id}`,
    DRIVE_PUBLISH: (id) => `/api/drives/${id}/publish`,
    DRIVE_CLOSE: (id) => `/api/drives/${id}/close`,
    DRIVE_CANCEL: (id) => `/api/drives/${id}/cancel`,

    // Job Descriptions & AI Summaries
    DRIVE_JD_UPLOAD: (driveId) => `/api/drives/${driveId}/jd`,
    DRIVE_JD_SUMMARIZE: (driveId) => `/api/drives/${driveId}/jd/summarize`,
    DRIVE_JD_SUMMARY: (driveId) => `/api/drives/${driveId}/jd/summary`,

    // Student Profile & Resume
    STUDENT_ME: '/api/students/me',
    STUDENT_RESUME: '/api/students/me/resume',
    STUDENT_RESUME_RETRY: '/api/students/me/resume/analyze',

    // Eligibility & Matching
    STUDENT_ELIGIBILITY: (driveId) => `/api/students/me/eligibility/${driveId}`,
    STUDENT_MATCH: (driveId) => `/api/students/me/matches/${driveId}`,
    STUDENT_RECOMMENDATIONS: '/api/students/me/recommendations',

    // Applications
    STUDENT_APPLICATIONS: '/api/students/me/applications',
    DRIVE_APPLICATIONS: (driveId) => `/api/drives/${driveId}/applications`,
    APPLICATION_APPLY: (driveId) => `/api/drives/${driveId}/applications`,
    APPLICATION_STATUS: (appId) => `/api/applications/${appId}/status`,

    // Placement & Policies
    STUDENT_PLACEMENT_STATUS: (studentId) => `/api/students/${studentId}/placement-status`,
    PLACEMENT_POLICY: '/api/placement-policy',
    PLACEMENT_RECORDS: '/api/placement/records'
  },

  // Pagination default
  DEFAULT_PAGE_SIZE: 10,

  // Demo / offline fallback mode flag (can be toggled by the user in the UI)
  isDemoMode: function() {
    return localStorage.getItem(this.STORAGE_KEYS.DEMO_MODE) === 'true';
  },
  setDemoMode: function(enabled) {
    if (enabled) {
      localStorage.setItem(this.STORAGE_KEYS.DEMO_MODE, 'true');
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.DEMO_MODE);
    }
  }
};

window.CONFIG = CONFIG;
