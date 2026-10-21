/**
 * Recruitment Drives Module
 * Drive listing, details view, filter by department/status, and lifecycle actions
 */

const Drives = {
  state: {
    drives: [],
    companies: [],
    loading: false,
    filters: {
      search: '',
      status: '',
      department: ''
    },
    currentPage: 0,
    totalPages: 1
  },

  async initList() {
    this.bindListEvents();
    await this.loadCompaniesDropdown();
    await this.loadDrives();
  },

  bindListEvents() {
    const searchInput = document.getElementById('drive-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.state.filters.search = e.target.value.trim();
        this.state.currentPage = 0;
        this.loadDrives();
      }, 350));
    }

    const statusFilter = document.getElementById('drive-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.state.filters.status = e.target.value;
        this.state.currentPage = 0;
        this.loadDrives();
      });
    }

    const deptFilter = document.getElementById('drive-dept-filter');
    if (deptFilter) {
      deptFilter.addEventListener('change', (e) => {
        this.state.filters.department = e.target.value;
        this.state.currentPage = 0;
        this.loadDrives();
      });
    }

    const createForm = document.getElementById('create-drive-form');
    if (createForm) {
      createForm.addEventListener('submit', (e) => this.handleCreateDrive(e));
    }
  },

  async loadCompaniesDropdown() {
    const companySelect = document.getElementById('create-drive-company-select');
    if (!companySelect) return;

    try {
      const response = await Api.get(CONFIG.ENDPOINTS.COMPANIES);
      const list = Array.isArray(response) ? response : (response.content || []);
      this.state.companies = list;

      let options = `<option value="">-- Choose Company --</option>`;
      list.forEach(c => {
        options += `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`;
      });
      companySelect.innerHTML = options;
    } catch (e) {
      // Fallback
    }
  },

  async loadDrives() {
    const container = document.getElementById('drives-list-container');
    if (!container) return;

    this.state.loading = true;
    UI.renderSpinner(container, 'Loading recruitment drives...');

    try {
      const params = {
        page: this.state.currentPage,
        size: CONFIG.DEFAULT_PAGE_SIZE,
        search: this.state.filters.search,
        status: this.state.filters.status,
        department: this.state.filters.department
      };

      const response = await Api.get(CONFIG.ENDPOINTS.DRIVES, params);
      
      if (Array.isArray(response)) {
        this.state.drives = response;
        this.state.totalPages = 1;
      } else if (response && response.content) {
        this.state.drives = response.content;
        this.state.totalPages = response.totalPages || 1;
      } else {
        this.state.drives = [];
      }

      this.renderDrivesList();
    } catch (err) {
      UI.renderErrorBanner(
        container,
        err.message || 'Failed to load recruitment drives from backend.',
        () => this.loadDrives()
      );
    } finally {
      this.state.loading = false;
    }
  },

  renderDrivesList() {
    const container = document.getElementById('drives-list-container');
    if (!container) return;

    if (this.state.drives.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Recruitment Drives Available',
        message: 'No recruitment drives match the selected search or filter criteria.',
        actionText: Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]) ? '+ Create Recruitment Drive' : null,
        onAction: () => Modal.open('create-drive-modal')
      });
      return;
    }

    let html = `<div class="d-flex flex-column gap-3">`;

    this.state.drives.forEach(drive => {
      const title = Utils.escapeHtml(drive.title || drive.jobRole || 'Opportunity');
      const companyName = Utils.escapeHtml(drive.companyName || drive.company?.name || 'Recruiting Organization');
      const companyId = drive.companyId || drive.company?.id;
      const location = Utils.escapeHtml(drive.location || 'Pan India');
      const ctc = Utils.formatCtc(drive.ctc || drive.salary);
      const deadline = Utils.formatDate(drive.applicationDeadline);
      const statusBadge = Utils.getDriveStatusBadge(drive.status);

      html += `
        <div class="card" style="padding:1.35rem;">
          <div class="d-flex justify-between align-start flex-wrap gap-2">
            <div>
              <div class="d-flex align-center gap-2">
                <h3 style="font-size:1.2rem;font-weight:700;">${title}</h3>
                ${statusBadge}
              </div>

              <div class="d-flex align-center gap-2 mt-1">
                <span class="text-bold" style="color:var(--primary-700);">${companyName}</span>
                ${companyId ? `
                  <a href="company-folder.html?id=${companyId}" class="badge badge-draft" title="Open Dedicated Company Folder">
                    📁 Company Folder
                  </a>
                ` : ''}
              </div>

              <div class="d-flex flex-wrap gap-3 mt-2 text-sm text-secondary">
                <span>📍 ${location}</span>
                <span>💰 <strong>${ctc}</strong></span>
                <span>⏳ Apply By: ${deadline}</span>
              </div>
            </div>

            <div class="d-flex gap-2 align-center">
              <a href="drive-details.html?id=${drive.id}" class="btn btn-primary btn-sm">
                View & Apply
              </a>
            </div>
          </div>

          <div class="mt-3 pt-3" style="border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; gap:1.25rem; flex-wrap:wrap;">
              <span><strong>Min CGPA:</strong> ${drive.minCgpa ?? 'N/A'}</span>
              <span><strong>Max Backlogs:</strong> ${drive.maxBacklogs ?? 0}</span>
              <span><strong>Batch:</strong> ${drive.graduationYear || 'All'}</span>
              <span><strong>Departments:</strong> ${(drive.eligibleDepartments || []).join(', ') || 'All'}</span>
            </div>

            <div class="d-flex gap-1 flex-wrap">
              ${(drive.requiredSkills || []).slice(0, 4).map(s => `<span class="skill-tag">${Utils.escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  async handleCreateDrive(e) {
    e.preventDefault();
    const form = e.target;
    Validation.clearFieldErrors(form);

    const compSelect = form.querySelector('[name="companyId"]');
    const titleInput = form.querySelector('[name="title"]');
    const ctcInput = form.querySelector('[name="ctc"]');
    const locationInput = form.querySelector('[name="location"]');
    const minCgpaInput = form.querySelector('[name="minCgpa"]');
    const maxBacklogsInput = form.querySelector('[name="maxBacklogs"]');
    const gradYearInput = form.querySelector('[name="graduationYear"]');
    const deadlineInput = form.querySelector('[name="applicationDeadline"]');
    const departmentsSelect = form.querySelector('[name="eligibleDepartments"]');
    const skillsInput = form.querySelector('[name="requiredSkills"]');
    const descInput = form.querySelector('[name="description"]');

    if (!compSelect.value) {
      Validation.showFieldError(compSelect, 'Please select a company.');
      return;
    }
    if (!titleInput.value.trim()) {
      Validation.showFieldError(titleInput, 'Drive title is required.');
      return;
    }

    const payload = {
      companyId: parseInt(compSelect.value, 10),
      title: titleInput.value.trim(),
      description: descInput ? descInput.value.trim() : '',
      location: locationInput ? locationInput.value.trim() : 'On-Site',
      ctc: ctcInput.value ? parseFloat(ctcInput.value) : null,
      minCgpa: minCgpaInput.value ? parseFloat(minCgpaInput.value) : 0,
      maxBacklogs: maxBacklogsInput.value ? parseInt(maxBacklogsInput.value, 10) : 0,
      graduationYear: gradYearInput.value ? parseInt(gradYearInput.value, 10) : new Date().getFullYear(),
      applicationDeadline: deadlineInput.value ? new Date(deadlineInput.value).toISOString() : null,
      eligibleDepartments: departmentsSelect ? Array.from(departmentsSelect.selectedOptions).map(o => o.value) : [],
      requiredSkills: skillsInput.value ? skillsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [],
      status: 'DRAFT'
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await Api.post(CONFIG.ENDPOINTS.DRIVES, payload);
      Toast.success('Drive Created', `Drive "${payload.title}" created successfully.`);
      Modal.close('create-drive-modal');
      form.reset();
      this.loadDrives();
    } catch (err) {
      Toast.error('Drive Creation Failed', err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  /**
   * Detail Page: drive-details.html
   */
  async initDetail() {
    const driveId = Utils.getQueryParam('id');
    if (!driveId) {
      Toast.error('Missing ID', 'No drive specified.');
      setTimeout(() => window.location.href = 'drive-list.html', 1500);
      return;
    }

    const container = document.getElementById('drive-detail-container');
    UI.renderSpinner(container, 'Loading drive details...');

    try {
      const drive = await Api.get(CONFIG.ENDPOINTS.DRIVE_BY_ID(driveId));
      
      const companyId = drive.companyId || drive.company?.id;
      const companyName = drive.companyName || drive.company?.name || 'Company';

      Layout.renderBreadcrumbs([
        { label: 'Drives', url: 'drive-list.html' },
        ...(companyId ? [{ label: `${companyName} Folder`, url: `company-folder.html?id=${companyId}` }] : []),
        { label: drive.title || 'Drive Details', url: `drive-details.html?id=${driveId}` }
      ]);

      // Check student eligibility if student
      let eligibilityData = null;
      let matchData = null;

      if (Auth.hasRole(CONFIG.ROLES.STUDENT)) {
        try {
          eligibilityData = await Api.get(CONFIG.ENDPOINTS.STUDENT_ELIGIBILITY(driveId));
        } catch (e) {}

        try {
          matchData = await Api.get(CONFIG.ENDPOINTS.STUDENT_MATCH(driveId));
        } catch (e) {}
      }

      this.renderDriveDetails(container, drive, eligibilityData, matchData);
    } catch (err) {
      UI.renderErrorBanner(
        container,
        `Failed to load drive: ${err.message}`,
        () => this.initDetail()
      );
    }
  },

  renderDriveDetails(container, drive, eligibility, match) {
    const title = Utils.escapeHtml(drive.title || 'Recruitment Opportunity');
    const companyName = Utils.escapeHtml(drive.companyName || drive.company?.name || 'Company');
    const companyId = drive.companyId || drive.company?.id;
    const ctc = Utils.formatCtc(drive.ctc || drive.salary);
    const deadline = Utils.formatDate(drive.applicationDeadline, true);
    const statusBadge = Utils.getDriveStatusBadge(drive.status);

    const isStudent = Auth.hasRole(CONFIG.ROLES.STUDENT);
    const isEligible = eligibility ? eligibility.isEligible : true;

    container.innerHTML = `
      <div class="card" style="padding:2rem; margin-bottom:1.5rem;">
        <div class="d-flex justify-between align-start flex-wrap gap-3">
          <div>
            <div class="d-flex align-center gap-2">
              <h1 style="font-size:1.75rem;">${title}</h1>
              ${statusBadge}
            </div>

            <div class="d-flex align-center gap-3 mt-2">
              <span style="font-size:1.1rem;font-weight:600;color:var(--primary-700);">${companyName}</span>
              ${companyId ? `
                <a href="company-folder.html?id=${companyId}" class="btn btn-sm btn-outline">
                  📁 Open Dedicated Company Folder
                </a>
              ` : ''}
            </div>

            <div class="d-flex flex-wrap gap-4 mt-3 text-secondary" style="font-size:0.95rem;">
              <span>📍 Location: <strong>${Utils.escapeHtml(drive.location || 'On-site')}</strong></span>
              <span>💰 Compensation: <strong>${ctc}</strong></span>
              <span>⏳ Deadline: <strong>${deadline}</strong></span>
            </div>
          </div>

          <div>
            ${isStudent ? `
              <button type="button" class="btn btn-primary btn-lg" id="apply-drive-btn">
                Apply for this Drive
              </button>
            ` : `
              <a href="company-folder.html?id=${companyId}#drives" class="btn btn-secondary">
                Manage in Folder
              </a>
            `}
          </div>
        </div>
      </div>

      ${isStudent && (eligibility || match) ? `
        <div class="dashboard-grid">
          <!-- Eligibility Widget -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Eligibility Evaluation</h3>
              ${Utils.getEligibilityBadge(isEligible)}
            </div>
            <div class="card-body">
              ${eligibility ? `
                <p style="font-size:0.9rem;margin-bottom:0.75rem;">${Utils.escapeHtml(eligibility.reason || (isEligible ? 'You satisfy all academic criteria.' : 'Academic criteria not met.'))}</p>
                <div style="font-size:0.85rem;display:flex;flex-direction:column;gap:0.4rem;">
                  <div>Min CGPA Required: <strong>${drive.minCgpa ?? 'N/A'}</strong> (Your CGPA: <strong>${eligibility.studentCgpa ?? '—'}</strong>)</div>
                  <div>Max Backlogs Allowed: <strong>${drive.maxBacklogs ?? 0}</strong> (Your Backlogs: <strong>${eligibility.studentBacklogs ?? 0}</strong>)</div>
                  <div>Department: <strong>${(drive.eligibleDepartments || []).join(', ') || 'All'}</strong></div>
                </div>
              ` : `
                <p class="text-sm text-secondary">Authoritative check will be verified during submission.</p>
              `}
            </div>
          </div>

          <!-- AI Match Widget -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">AI Resume–JD Compatibility</h3>
              <a href="match-results.html?driveId=${drive.id}" class="text-sm">Detailed Analysis &rarr;</a>
            </div>
            <div class="card-body">
              ${match ? `
                <div class="d-flex align-center gap-3">
                  <div class="score-circle" style="width:70px;height:70px;">
                    <span class="score-number" style="font-size:1.3rem;">${match.matchScore || match.score || 0}%</span>
                  </div>
                  <div>
                    <div style="font-weight:600;">Overall Match Score</div>
                    <div class="text-xs text-secondary mt-1">
                      ${match.explanation ? Utils.escapeHtml(Utils.truncate(match.explanation, 80)) : 'AI semantic alignment with JD.'}
                    </div>
                  </div>
                </div>
              ` : `
                <p class="text-sm text-secondary">Upload your resume to receive AI match score analysis.</p>
                <a href="resume-analysis.html" class="btn btn-sm btn-outline mt-2">Upload Resume</a>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Detailed JD Content -->
      <div class="card" style="padding:1.75rem; margin-top:1.5rem;">
        <h3 class="mb-3">Job Description & Responsibilities</h3>
        <p style="white-space:pre-line;line-height:1.6;color:var(--text-primary);font-size:0.95rem;">
          ${Utils.escapeHtml(drive.description || 'Detailed job description is available via the uploaded document.')}
        </p>

        <h4 class="mt-4 mb-2">Required Skills</h4>
        <div class="d-flex gap-2 flex-wrap mb-3">
          ${(drive.requiredSkills || []).map(s => `<span class="skill-tag">${Utils.escapeHtml(s)}</span>`).join('') || '<span class="text-sm text-muted">No specific skills listed.</span>'}
        </div>

        <h4 class="mt-4 mb-2">Preferred Skills</h4>
        <div class="d-flex gap-2 flex-wrap mb-3">
          ${(drive.preferredSkills || []).map(s => `<span class="skill-tag preferred">${Utils.escapeHtml(s)}</span>`).join('') || '<span class="text-sm text-muted">None specified.</span>'}
        </div>
      </div>
    `;

    // Apply button click
    const applyBtn = document.getElementById('apply-drive-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        Applications.openApplyModal(drive.id, title, companyName);
      });
    }
  }
};

window.Drives = Drives;
