/**
 * Application Layout & Navigation Manager
 * Handles responsive sidebar, dynamic breadcrumbs, user status pills, and role-aware navigation
 */

const Layout = {
  /**
   * Initialize layout on page load
   * @param {Object} options - { pageTitle, breadcrumbs: [{ label, url }] }
   */
  init(options = {}) {
    const user = Auth.getCurrentUser();
    this.renderSidebar(user);
    this.renderTopbar(user, options);
    this.renderBreadcrumbs(options.breadcrumbs || []);
    this.bindEvents();
    Guards.applyDomPermissions();
  },

  /**
   * Render or populate sidebar
   */
  renderSidebar(user) {
    const sidebarEl = document.querySelector('.app-sidebar');
    if (!sidebarEl) return;

    const role = user ? user.role : null;
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Build role-specific navigation items
    let navItemsHtml = '';

    // Placement Officer / Coordinator items
    if (role === CONFIG.ROLES.OFFICER || role === CONFIG.ROLES.COORDINATOR) {
      const isOfficer = role === CONFIG.ROLES.OFFICER;
      const dashboardLink = isOfficer ? 'officer-dashboard.html' : 'coordinator-dashboard.html';

      navItemsHtml += `
        <div class="nav-section">
          <div class="nav-section-title">Core Management</div>
          <ul class="nav-item-list">
            <li>
              <a href="${dashboardLink}" class="nav-link ${currentPath === dashboardLink ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="companies.html" class="nav-link ${currentPath === 'companies.html' || currentPath === 'company-folder.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Company Folders</span>
              </a>
            </li>
            <li>
              <a href="drive-list.html" class="nav-link ${currentPath === 'drive-list.html' || currentPath === 'drive-details.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Recruitment Drives</span>
              </a>
            </li>
            <li>
              <a href="applications.html" class="nav-link ${currentPath === 'applications.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Candidate Applications</span>
              </a>
            </li>
          </ul>
        </div>
      `;

      if (isOfficer) {
        navItemsHtml += `
          <div class="nav-section">
            <div class="nav-section-title">Administration & Policy</div>
            <ul class="nav-item-list">
              <li>
                <a href="placement-management.html" class="nav-link ${currentPath === 'placement-management.html' ? 'active' : ''}">
                  <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Placement & Policies</span>
                </a>
              </li>
            </ul>
          </div>
        `;
      }
    } else {
      // Student Navigation Items
      navItemsHtml += `
        <div class="nav-section">
          <div class="nav-section-title">Student Portal</div>
          <ul class="nav-item-list">
            <li>
              <a href="student-dashboard.html" class="nav-link ${currentPath === 'student-dashboard.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>My Dashboard</span>
              </a>
            </li>
            <li>
              <a href="recommendations.html" class="nav-link ${currentPath === 'recommendations.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Recommendations</span>
              </a>
            </li>
            <li>
              <a href="drive-list.html" class="nav-link ${currentPath === 'drive-list.html' || currentPath === 'drive-details.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Browse Drives</span>
              </a>
            </li>
            <li>
              <a href="companies.html" class="nav-link ${currentPath === 'companies.html' || currentPath === 'company-folder.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Company Directory</span>
              </a>
            </li>
            <li>
              <a href="applications.html" class="nav-link ${currentPath === 'applications.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>My Applications</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Profile & Resume</div>
          <ul class="nav-item-list">
            <li>
              <a href="student-profile.html" class="nav-link ${currentPath === 'student-profile.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Academic Profile</span>
              </a>
            </li>
            <li>
              <a href="resume-analysis.html" class="nav-link ${currentPath === 'resume-analysis.html' ? 'active' : ''}">
                <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Resume & AI Skills</span>
              </a>
            </li>
          </ul>
        </div>
      `;
    }

    sidebarEl.innerHTML = `
      <div class="sidebar-brand">
        <div class="brand-icon">CP</div>
        <div>
          <div class="brand-title">CampusHire AI</div>
          <div class="brand-subtitle">Placement Portal</div>
        </div>
      </div>
      <div class="sidebar-nav">
        ${navItemsHtml}
      </div>
      <div class="sidebar-footer">
        <div>AI Campus Placement System</div>
        <div style="font-size:0.7rem;margin-top:2px;">Spring Boot REST &bull; JWT Secured</div>
      </div>
    `;
  },

  /**
   * Render or populate topbar
   */
  renderTopbar(user, options) {
    const topbarEl = document.querySelector('.app-topbar');
    if (!topbarEl) return;

    let roleBadgeClass = 'badge-student';
    let roleTitle = 'Student';

    if (user && user.role === CONFIG.ROLES.OFFICER) {
      roleBadgeClass = 'badge-officer';
      roleTitle = 'Placement Officer';
    } else if (user && user.role === CONFIG.ROLES.COORDINATOR) {
      roleBadgeClass = 'badge-coordinator';
      roleTitle = 'Placement Coordinator';
    }

    const userName = user ? user.name : 'Guest User';
    const userInitials = (userName || 'U').substring(0, 2).toUpperCase();

    topbarEl.innerHTML = `
      <div class="topbar-left">
        <button class="sidebar-toggle-btn" id="sidebar-toggle-btn" aria-label="Toggle navigation menu">
          <svg style="width:24px;height:24px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 style="font-size:1.15rem;font-weight:700;">${Utils.escapeHtml(options.pageTitle || 'Placement Portal')}</h2>
      </div>

      <div class="topbar-right">
        ${user ? `
          <div class="user-profile-widget">
            <div class="user-avatar">${userInitials}</div>
            <div class="user-meta">
              <span class="user-name">${Utils.escapeHtml(userName)}</span>
              <span class="user-role-badge ${roleBadgeClass}">${roleTitle}</span>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" id="logout-btn" title="Sign out of placement portal">
            <svg style="width:16px;height:16px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        ` : `
          <a href="login.html" class="btn btn-sm btn-primary">Login</a>
        `}
      </div>
    `;

    // Logout listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        ConfirmDialog.show({
          title: 'Sign Out',
          message: 'Are you sure you want to log out of your session?',
          confirmText: 'Logout',
          confirmClass: 'btn-danger',
          onConfirm: () => Auth.logout()
        });
      });
    }
  },

  /**
   * Render breadcrumbs bar
   */
  renderBreadcrumbs(breadcrumbs) {
    const container = document.querySelector('.breadcrumb-container');
    if (!container) return;

    if (!breadcrumbs || breadcrumbs.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    let html = `<ul class="breadcrumbs">`;
    html += `<li class="breadcrumb-item"><a href="index.html">Home</a></li>`;

    breadcrumbs.forEach((item, index) => {
      html += `<li class="breadcrumb-separator">/</li>`;
      const isLast = index === breadcrumbs.length - 1;
      if (isLast || !item.url) {
        html += `<li class="breadcrumb-item active" aria-current="page">${Utils.escapeHtml(item.label)}</li>`;
      } else {
        html += `<li class="breadcrumb-item"><a href="${item.url}">${Utils.escapeHtml(item.label)}</a></li>`;
      }
    });

    html += `</ul>`;
    container.innerHTML = html;
  },

  /**
   * Bind layout events (drawer toggle, backdrop)
   */
  bindEvents() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.querySelector('.app-sidebar');

    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('drawer-open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('drawer-open');
        backdrop.classList.remove('active');
      });
    }
  }
};

window.Layout = Layout;
