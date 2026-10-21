/**
 * Route & Role Guards Module
 * Protects pages and actions based on user authentication and backend-authorized roles
 */

const Guards = {
  /**
   * Enforce authentication on protected pages
   */
  requireAuth: function() {
    if (!Auth.isAuthenticated()) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `login.html?redirect=${currentUrl}`;
      return false;
    }
    return true;
  },

  /**
   * Enforce role authorization
   * @param {Array|string} allowedRoles
   */
  requireRole: function(allowedRoles) {
    if (!this.requireAuth()) return false;

    if (!Auth.hasRole(allowedRoles)) {
      alert('Access Denied: Your account does not have permission to view this page.');
      Auth.redirectToRoleDashboard();
      return false;
    }
    return true;
  },

  /**
   * Redirect logged-in users away from guest pages (like login.html / register.html)
   */
  requireGuest: function() {
    if (Auth.isAuthenticated()) {
      Auth.redirectToRoleDashboard();
      return false;
    }
    return true;
  },

  /**
   * Apply UI permission filters to DOM elements
   * Elements with `data-role="PLACEMENT_OFFICER,PLACEMENT_COORDINATOR"` will be visible only to authorized users
   */
  applyDomPermissions: function() {
    const user = Auth.getCurrentUser();
    const userRole = user ? user.role : null;

    document.querySelectorAll('[data-role]').forEach(el => {
      const allowedRoles = el.getAttribute('data-role').split(',').map(r => r.trim());
      if (!userRole || !allowedRoles.includes(userRole)) {
        el.style.display = 'none';
      }
    });

    document.querySelectorAll('[data-auth-only]').forEach(el => {
      if (!Auth.isAuthenticated()) {
        el.style.display = 'none';
      }
    });

    document.querySelectorAll('[data-guest-only]').forEach(el => {
      if (Auth.isAuthenticated()) {
        el.style.display = 'none';
      }
    });
  }
};

window.Guards = Guards;
