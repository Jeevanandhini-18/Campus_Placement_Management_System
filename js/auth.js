/**
 * Authentication & Session Management Module
 */

const Auth = {
  /**
   * Check if a user is currently authenticated
   */
  isAuthenticated: function() {
    return !!sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Get JWT auth token
   */
  getToken: function() {
    return sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Get current authenticated user details
   */
  getCurrentUser: function() {
    try {
      const data = sessionStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Verify if current user possesses any of the required roles
   */
  hasRole: function(allowedRoles) {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    if (typeof allowedRoles === 'string') {
      return user.role === allowedRoles;
    }
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return false;
  },

  /**
   * Authenticate user against Spring Boot backend
   */
  login: async function(email, password) {
    const response = await Api.post(CONFIG.ENDPOINTS.LOGIN, {
      email: email,
      password: password
    });

    // Handle token format: response may be { token, role, name, email } or { accessToken, ... }
    const token = response.token || response.accessToken || response.jwt;
    if (!token) {
      throw new Error('Authentication succeeded but no authorization token was received.');
    }

    // Determine user role and details from response or parse from JWT
    let role = response.role;
    let name = response.name;
    let studentId = response.studentId || response.id;

    if (!role) {
      try {
        // Fallback: decode JWT payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonPayload);
        role = decoded.role || decoded.authorities?.[0] || CONFIG.ROLES.STUDENT;
        name = name || decoded.sub || decoded.name;
      } catch (e) {
        role = CONFIG.ROLES.STUDENT;
      }
    }

    const userData = {
      email: email,
      name: name || email.split('@')[0],
      role: role,
      id: studentId
    };

    sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

    return userData;
  },

  /**
   * Register a new student
   */
  register: async function(studentData) {
    return await Api.post(CONFIG.ENDPOINTS.REGISTER, studentData);
  },

  /**
   * Log out user and clean session
   */
  logout: function() {
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    window.location.href = 'login.html';
  },

  /**
   * Role-based destination redirect
   */
  redirectToRoleDashboard: function() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    if (user.role === CONFIG.ROLES.OFFICER) {
      window.location.href = 'officer-dashboard.html';
    } else if (user.role === CONFIG.ROLES.COORDINATOR) {
      window.location.href = 'coordinator-dashboard.html';
    } else {
      window.location.href = 'student-dashboard.html';
    }
  }
};

window.Auth = Auth;
