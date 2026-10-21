/**
 * Applications Management & Tracking Module
 * Student application submissions, student tracking dashboard, and coordinator application management
 */

const Applications = {
  state: {
    applications: [],
    drives: [],
    selectedDriveFilter: '',
    selectedStatusFilter: '',
    search: '',
    loading: false
  },

  init() {
    if (Auth.hasRole(CONFIG.ROLES.STUDENT)) {
      this.initStudentTracking();
    } else {
      this.initCoordinatorManagement();
    }
  },

  /**
   * Apply Modal & Submission (for Students)
   */
  openApplyModal(driveId, driveTitle, companyName) {
    ConfirmDialog.show({
      title: 'Confirm Placement Application',
      message: `Are you sure you want to submit your application for "${driveTitle}" at ${companyName}? Your registered profile and parsed resume will be submitted to the recruiter.`,
      confirmText: 'Submit Application',
      confirmClass: 'btn-primary',
      onConfirm: async () => {
        try {
          await Api.post(CONFIG.ENDPOINTS.APPLICATION_APPLY(driveId), {});
          Toast.success('Application Submitted', `You have successfully applied to ${companyName}.`);
          setTimeout(() => {
            window.location.href = 'applications.html';
          }, 1200);
        } catch (err) {
          if (err.status === 409 || err.message.includes('already')) {
            Toast.warning('Already Applied', 'You have already submitted an application for this recruitment drive.');
          } else {
            Toast.error('Submission Failed', err.message || 'Could not submit application.');
          }
          throw err;
        }
      }
    });
  },

  /**
   * Student Application Tracker
   */
  async initStudentTracking() {
    const container = document.getElementById('applications-container');
    UI.renderSpinner(container, 'Loading your applications...');

    try {
      const response = await Api.get(CONFIG.ENDPOINTS.STUDENT_APPLICATIONS);
      const apps = Array.isArray(response) ? response : (response.content || []);
      this.state.applications = apps;
      this.renderStudentApplications(container);
    } catch (err) {
      UI.renderErrorBanner(
        container,
        `Could not retrieve applications: ${err.message}`,
        () => this.initStudentTracking()
      );
    }
  },

  renderStudentApplications(container) {
    if (this.state.applications.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Applications Submitted',
        message: 'You have not submitted applications to any recruitment drives yet. Explore recommended opportunities to get started!',
        actionText: 'Browse Recommended Drives',
        onAction: () => window.location.href = 'recommendations.html'
      });
      return;
    }

    let html = `
      <div class="card" style="padding:1.5rem; margin-bottom:1.5rem;">
        <h2>My Placement Applications (${this.state.applications.length})</h2>
        <p class="text-sm text-secondary mt-1">Live tracking of your recruitment progress and round statuses.</p>
      </div>
      <div class="d-flex flex-column gap-3">
    `;

    this.state.applications.forEach(app => {
      const drive = app.drive || {};
      const companyName = Utils.escapeHtml(app.companyName || drive.companyName || drive.company?.name || 'Company');
      const companyId = app.companyId || drive.companyId || drive.company?.id;
      const role = Utils.escapeHtml(app.driveTitle || drive.title || 'Recruitment Opportunity');
      const appliedDate = Utils.formatDate(app.appliedAt || app.createdAt);
      const status = (app.status || 'APPLIED').toUpperCase();
      const statusBadge = Utils.getApplicationStatusBadge(status);
      const currentStage = Utils.escapeHtml(app.currentStage || app.stage || (status === 'SELECTED' ? 'Final Offer Extended' : 'Application Review'));

      html += `
        <div class="card" style="padding:1.35rem;">
          <div class="d-flex justify-between align-start flex-wrap gap-2">
            <div>
              <div class="d-flex align-center gap-2">
                <h3 style="font-size:1.15rem;font-weight:700;">${role}</h3>
                ${statusBadge}
              </div>

              <div class="d-flex align-center gap-2 mt-1">
                <span class="text-bold" style="color:var(--primary-700);">${companyName}</span>
                ${companyId ? `
                  <a href="company-folder.html?id=${companyId}" class="badge badge-draft" title="View Company Folder">
                    📁 Company Folder
                  </a>
                ` : ''}
              </div>

              <div class="text-xs text-secondary mt-2">
                Applied on: <strong>${appliedDate}</strong> &bull; Current Stage: <span class="badge badge-draft">${currentStage}</span>
              </div>
            </div>

            <div class="d-flex gap-2">
              <a href="drive-details.html?id=${drive.id || app.driveId}" class="btn btn-sm btn-outline">
                View Drive Details
              </a>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  /**
   * Coordinator Application Management
   */
  async initCoordinatorManagement() {
    const container = document.getElementById('applications-container');
    UI.renderSpinner(container, 'Loading candidates and recruitment records...');

    try {
      const [drivesRes, appsRes] = await Promise.all([
        Api.get(CONFIG.ENDPOINTS.DRIVES).catch(() => []),
        Api.get(CONFIG.ENDPOINTS.STUDENT_APPLICATIONS).catch(() => [])
      ]);

      this.state.drives = Array.isArray(drivesRes) ? drivesRes : (drivesRes.content || []);
      this.state.applications = Array.isArray(appsRes) ? appsRes : (appsRes.content || []);

      this.bindCoordinatorFilters();
      this.renderCoordinatorTable();
    } catch (err) {
      UI.renderErrorBanner(container, err.message);
    }
  },

  bindCoordinatorFilters() {
    const searchInput = document.getElementById('coordinator-app-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.state.search = e.target.value.trim().toLowerCase();
        this.renderCoordinatorTable();
      }, 300));
    }

    const driveFilter = document.getElementById('coordinator-app-drive-filter');
    if (driveFilter) {
      let options = `<option value="">-- All Recruitment Drives --</option>`;
      this.state.drives.forEach(d => {
        options += `<option value="${d.id}">${Utils.escapeHtml(d.title)} (${Utils.escapeHtml(d.companyName || 'Company')})</option>`;
      });
      driveFilter.innerHTML = options;
      driveFilter.addEventListener('change', (e) => {
        this.state.selectedDriveFilter = e.target.value;
        this.renderCoordinatorTable();
      });
    }

    const statusFilter = document.getElementById('coordinator-app-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.state.selectedStatusFilter = e.target.value;
        this.renderCoordinatorTable();
      });
    }

    // Modal submit
    const statusForm = document.getElementById('update-status-form');
    if (statusForm) {
      statusForm.addEventListener('submit', (e) => this.handleUpdateStatusSubmit(e));
    }
  },

  renderCoordinatorTable() {
    const container = document.getElementById('applications-container');
    if (!container) return;

    let filtered = [...this.state.applications];

    if (this.state.selectedDriveFilter) {
      filtered = filtered.filter(a => String(a.driveId || a.drive?.id) === String(this.state.selectedDriveFilter));
    }

    if (this.state.selectedStatusFilter) {
      filtered = filtered.filter(a => (a.status || '').toUpperCase() === this.state.selectedStatusFilter.toUpperCase());
    }

    if (this.state.search) {
      filtered = filtered.filter(a => {
        const name = (a.studentName || a.student?.name || '').toLowerCase();
        const role = (a.driveTitle || a.drive?.title || '').toLowerCase();
        const comp = (a.companyName || a.drive?.companyName || '').toLowerCase();
        return name.includes(this.state.search) || role.includes(this.state.search) || comp.includes(this.state.search);
      });
    }

    if (filtered.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Matching Applications',
        message: 'No candidate applications found for the selected drive or status filters.'
      });
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Applicant Name</th>
              <th>Department & Academic Info</th>
              <th>Drive & Company</th>
              <th>Applied Date</th>
              <th>Current Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    filtered.forEach(app => {
      const studentName = Utils.escapeHtml(app.studentName || app.student?.name || 'Student Candidate');
      const dept = Utils.escapeHtml(app.department || app.student?.department || 'Engineering');
      const cgpa = app.cgpa || app.student?.cgpa || '—';
      const role = Utils.escapeHtml(app.driveTitle || app.drive?.title || 'Drive');
      const company = Utils.escapeHtml(app.companyName || app.drive?.companyName || 'Company');
      const appliedDate = Utils.formatDate(app.appliedAt || app.createdAt);
      const statusBadge = Utils.getApplicationStatusBadge(app.status);

      html += `
        <tr>
          <td>
            <strong>${studentName}</strong>
            <div class="text-xs text-secondary">${Utils.escapeHtml(app.email || app.student?.email || '')}</div>
          </td>
          <td>
            <div>${dept}</div>
            <div class="text-xs text-secondary">CGPA: <strong>${cgpa}</strong></div>
          </td>
          <td>
            <div>${role}</div>
            <div class="text-xs text-bold" style="color:var(--primary-700);">${company}</div>
          </td>
          <td>${appliedDate}</td>
          <td>${statusBadge}</td>
          <td>
            <button type="button" class="btn btn-sm btn-secondary" onclick="Applications.openStatusModal(${app.id}, '${app.status}')">
              Change Status
            </button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  },

  openStatusModal(appId, currentStatus) {
    const appIdInput = document.getElementById('update-app-id');
    const select = document.getElementById('update-status-select');

    if (appIdInput) appIdInput.value = appId;
    if (select) select.value = (currentStatus || 'APPLIED').toUpperCase();

    Modal.open('update-app-status-modal');
  },

  async handleUpdateStatusSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const appId = form.querySelector('#update-app-id')?.value;
    const newStatus = form.querySelector('#update-status-select')?.value;

    if (!appId || !newStatus) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await Api.patch(CONFIG.ENDPOINTS.APPLICATION_STATUS(appId), { status: newStatus });
      Toast.success('Status Updated', `Candidate application marked as ${newStatus}.`);
      Modal.close('update-app-status-modal');
      
      // Update in local state
      const match = this.state.applications.find(a => String(a.id) === String(appId));
      if (match) match.status = newStatus;
      this.renderCoordinatorTable();
    } catch (err) {
      Toast.error('Update Failed', err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
};

window.Applications = Applications;
