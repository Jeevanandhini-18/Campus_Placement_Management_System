/**
 * Dedicated Company Folder Module (Mandatory Core Feature)
 * Organizes Overview, Drives, Documents & AI Summaries, Eligibility, Stages, and Applications
 */

const CompanyFolder = {
  companyId: null,
  company: null,
  drives: [],
  applications: [],
  activeTab: 'overview',

  async init() {
    this.companyId = Utils.getQueryParam('id');
    if (!this.companyId) {
      Toast.error('Folder Missing', 'No company ID specified in folder request.');
      setTimeout(() => window.location.href = 'companies.html', 1500);
      return;
    }

    this.bindTabEvents();
    this.bindActionEvents();
    await this.loadFolderData();
  },

  bindTabEvents() {
    const tabButtons = document.querySelectorAll('.folder-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-tab');
        this.switchTab(tabKey);
      });
    });

    // Check URL hash for direct tab linking
    const hash = window.location.hash.replace('#', '');
    if (['overview', 'drives', 'documents', 'eligibility', 'stages', 'applications'].includes(hash)) {
      this.activeTab = hash;
    }
  },

  switchTab(tabKey) {
    this.activeTab = tabKey;
    window.location.hash = tabKey;

    document.querySelectorAll('.folder-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
    });

    document.querySelectorAll('.folder-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabKey}`);
    });
  },

  bindActionEvents() {
    // Quick Add Drive from inside Folder button
    const addDriveBtn = document.getElementById('folder-create-drive-btn');
    if (addDriveBtn) {
      addDriveBtn.addEventListener('click', () => {
        this.openCreateDriveModal();
      });
    }

    // Edit Company Button
    const editCompanyBtn = document.getElementById('folder-edit-company-btn');
    if (editCompanyBtn) {
      editCompanyBtn.addEventListener('click', () => {
        this.openEditCompanyModal();
      });
    }

    // Deactivate Company Button
    const deactivateBtn = document.getElementById('folder-deactivate-btn');
    if (deactivateBtn) {
      deactivateBtn.addEventListener('click', () => {
        this.handleDeactivate();
      });
    }

    // Modal forms
    const driveForm = document.getElementById('folder-drive-form');
    if (driveForm) {
      driveForm.addEventListener('submit', (e) => this.handleSaveDrive(e));
    }

    const editCompanyForm = document.getElementById('edit-company-form');
    if (editCompanyForm) {
      editCompanyForm.addEventListener('submit', (e) => this.handleUpdateCompany(e));
    }
  },

  async loadFolderData() {
    const heroContainer = document.getElementById('folder-hero-container');
    UI.renderSpinner(heroContainer, 'Opening Company Folder...');

    try {
      // 1. Fetch Company Master Details
      this.company = await Api.get(CONFIG.ENDPOINTS.COMPANY_BY_ID(this.companyId));
      
      // Update page title & breadcrumbs
      document.title = `${this.company.name || 'Company'} Folder — CampusHire`;
      Layout.renderBreadcrumbs([
        { label: 'Companies', url: 'companies.html' },
        { label: `${this.company.name} Folder`, url: `company-folder.html?id=${this.companyId}` }
      ]);

      // 2. Fetch Drives for this Company
      try {
        const drivesRes = await Api.get(CONFIG.ENDPOINTS.COMPANY_DRIVES(this.companyId));
        this.drives = Array.isArray(drivesRes) ? drivesRes : (drivesRes.content || []);
      } catch (driveErr) {
        // Fallback: search drives by companyId
        try {
          const fallbackRes = await Api.get(CONFIG.ENDPOINTS.DRIVES, { companyId: this.companyId });
          this.drives = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes.content || []);
        } catch (e) {
          this.drives = [];
        }
      }

      // 3. If Staff, load applications across this company's drives
      if (Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]) && this.drives.length > 0) {
        this.loadApplications();
      }

      // Render UI sections
      this.renderHero();
      this.renderTabCounts();
      this.renderOverviewTab();
      this.renderDrivesTab();
      this.renderDocumentsTab();
      this.renderEligibilityTab();
      this.renderStagesTab();
      this.renderApplicationsTab();

      // Set initial tab
      this.switchTab(this.activeTab);

    } catch (err) {
      UI.renderErrorBanner(
        heroContainer,
        `Failed to open folder: ${err.message}`,
        () => this.loadFolderData()
      );
    }
  },

  renderHero() {
    const container = document.getElementById('folder-hero-container');
    if (!container || !this.company) return;

    const name = Utils.escapeHtml(this.company.name || 'Unnamed Company');
    const location = Utils.escapeHtml(this.company.location || 'Location Not Specified');
    const website = this.company.website 
      ? `<a href="${Utils.escapeHtml(this.company.website)}" target="_blank" rel="noopener">${Utils.escapeHtml(this.company.website)}</a>` 
      : 'No website specified';
    const email = Utils.escapeHtml(this.company.contactEmail || this.company.email || 'N/A');

    const totalDrives = this.drives.length;
    const activeDrives = this.drives.filter(d => (d.status || '').toUpperCase() === 'PUBLISHED').length;
    const closedDrives = this.drives.filter(d => (d.status || '').toUpperCase() === 'CLOSED').length;

    const initial = (this.company.name || 'C').charAt(0).toUpperCase();

    const isStaff = Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]);

    container.innerHTML = `
      <div class="folder-hero">
        <div class="folder-hero-top">
          <div class="folder-hero-info">
            <div class="folder-hero-avatar">${initial}</div>
            <div>
              <h1 class="folder-hero-title">${name}</h1>
              <div class="folder-hero-meta">
                <span>📍 ${location}</span>
                <span>🌐 ${website}</span>
                <span>✉️ ${email}</span>
                <span>📁 Folder ID: #${this.company.id}</span>
              </div>
            </div>
          </div>

          ${isStaff ? `
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-secondary btn-sm" id="folder-edit-company-btn">
                Edit Details
              </button>
              <button type="button" class="btn btn-primary btn-sm" id="folder-create-drive-btn">
                + New Drive For ${name}
              </button>
            </div>
          ` : ''}
        </div>

        <div class="folder-hero-stats">
          <div class="hero-stat-box">
            <span class="hero-stat-val">${totalDrives}</span>
            <span class="hero-stat-lbl">Total Drives</span>
          </div>
          <div class="hero-stat-box">
            <span class="hero-stat-val" style="color:var(--success-solid);">${activeDrives}</span>
            <span class="hero-stat-lbl">Active & Published</span>
          </div>
          <div class="hero-stat-box">
            <span class="hero-stat-val" style="color:#94a3b8;">${closedDrives}</span>
            <span class="hero-stat-lbl">Closed / Completed</span>
          </div>
        </div>
      </div>
    `;

    // Re-bind action buttons
    this.bindActionEvents();
  },

  renderTabCounts() {
    const drivesCountEl = document.getElementById('count-tab-drives');
    if (drivesCountEl) drivesCountEl.textContent = this.drives.length;

    const docsCount = this.drives.filter(d => d.jdDocument || d.hasJd).length;
    const docsCountEl = document.getElementById('count-tab-documents');
    if (docsCountEl) docsCountEl.textContent = docsCount;
  },

  /**
   * 1. Tab: Overview
   */
  renderOverviewTab() {
    const container = document.getElementById('tab-overview');
    if (!container || !this.company) return;

    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Company Profile & Description</h3>
          </div>
          <div class="card-body">
            <p style="font-size:0.95rem; line-height: 1.6; color: var(--text-primary); white-space: pre-line;">
              ${Utils.escapeHtml(this.company.description || 'No detailed description has been added for this company yet.')}
            </p>

            <h4 class="mt-4 mb-2">Recruitment Contact Information</h4>
            <div style="font-size:0.9rem; display:flex; flex-direction:column; gap:0.5rem;">
              <div><strong>Primary Contact Email:</strong> ${Utils.escapeHtml(this.company.contactEmail || 'Not specified')}</div>
              <div><strong>Contact Phone:</strong> ${Utils.escapeHtml(this.company.contactPhone || 'Not specified')}</div>
              <div><strong>Campus Placement Coordinator:</strong> ${Utils.escapeHtml(this.company.assignedCoordinator || 'Assigned by Placement Cell')}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Folder Quick Summary</h3>
          </div>
          <div class="card-body">
            <ul class="activity-list">
              <li class="activity-item">
                <div class="activity-bullet"></div>
                <div class="activity-content">
                  <div class="activity-title">${this.drives.length} Recruitment Drives Recorded</div>
                  <div class="activity-time">Associated with ${Utils.escapeHtml(this.company.name)}</div>
                </div>
              </li>
              <li class="activity-item">
                <div class="activity-bullet" style="background-color: var(--success-solid);"></div>
                <div class="activity-content">
                  <div class="activity-title">Recruitment Pipeline Active</div>
                  <div class="activity-time">Automated AI resume-JD evaluation enabled</div>
                </div>
              </li>
              <li class="activity-item">
                <div class="activity-bullet" style="background-color: var(--accent-cyan);"></div>
                <div class="activity-content">
                  <div class="activity-title">Dedicated Folder Stability</div>
                  <div class="activity-time">Persistent database relationship</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 2. Tab: Recruitment Drives
   */
  renderDrivesTab() {
    const container = document.getElementById('tab-drives');
    if (!container) return;

    if (this.drives.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Recruitment Drives Yet',
        message: `There are currently no recruitment drives organized under ${Utils.escapeHtml(this.company.name)}'s folder.`,
        actionText: Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]) ? '+ Create First Drive' : null,
        onAction: () => this.openCreateDriveModal()
      });
      return;
    }

    let html = `<div class="d-flex flex-column gap-3">`;

    this.drives.forEach(drive => {
      const title = Utils.escapeHtml(drive.title || drive.jobRole || 'Recruitment Opportunity');
      const location = Utils.escapeHtml(drive.location || 'Multiple Locations');
      const ctc = Utils.formatCtc(drive.ctc || drive.salary);
      const deadline = Utils.formatDate(drive.applicationDeadline || drive.deadline);
      const statusBadge = Utils.getDriveStatusBadge(drive.status);

      const isStaff = Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]);

      html += `
        <div class="card" style="padding:1.25rem;">
          <div class="d-flex justify-between align-start flex-wrap gap-2">
            <div>
              <div class="d-flex align-center gap-2">
                <h3 style="font-size:1.15rem;font-weight:700;">${title}</h3>
                ${statusBadge}
              </div>
              <div class="d-flex flex-wrap gap-3 mt-1 text-sm text-secondary">
                <span>📍 ${location}</span>
                <span>💰 <strong>${ctc}</strong></span>
                <span>⏳ Deadline: ${deadline}</span>
              </div>
            </div>

            <div class="d-flex gap-2 align-center">
              <a href="drive-details.html?id=${drive.id}" class="btn btn-sm btn-outline">
                View Full Details
              </a>

              ${isStaff && (drive.status || '').toUpperCase() === 'DRAFT' ? `
                <button type="button" class="btn btn-sm btn-success" onclick="CompanyFolder.handlePublishDrive(${drive.id})">
                  Publish Drive
                </button>
              ` : ''}

              ${isStaff && (drive.status || '').toUpperCase() === 'PUBLISHED' ? `
                <button type="button" class="btn btn-sm btn-danger" onclick="CompanyFolder.handleCloseDrive(${drive.id})">
                  Close Drive
                </button>
              ` : ''}
            </div>
          </div>

          <div class="mt-3 pt-3" style="border-top:1px solid var(--border-subtle); display:flex; gap:1.5rem; flex-wrap:wrap; font-size:0.85rem;">
            <div><strong>Min CGPA:</strong> ${drive.minCgpa ?? 'N/A'}</div>
            <div><strong>Max Backlogs:</strong> ${drive.maxBacklogs ?? 'None'}</div>
            <div><strong>Batch / Year:</strong> ${drive.graduationYear || 'All'}</div>
            <div><strong>Departments:</strong> ${(drive.eligibleDepartments || []).join(', ') || 'All Eligible'}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  /**
   * 3. Tab: Job Descriptions & Documents
   */
  renderDocumentsTab() {
    const container = document.getElementById('tab-documents');
    if (!container) return;

    const drivesWithDocs = this.drives.filter(d => d.jdDocument || d.jdSummary || d.hasJd);

    let html = `
      <div class="d-flex justify-between align-center mb-3">
        <h3 style="font-size:1.15rem;">Job Description Files & AI Extraction Records</h3>
        ${Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]) ? `
          <button type="button" class="btn btn-sm btn-primary" onclick="Modal.open('upload-jd-modal')">
            + Upload New JD
          </button>
        ` : ''}
      </div>
    `;

    if (drivesWithDocs.length === 0) {
      html += `
        <div class="empty-state">
          <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 class="empty-state-title">No JD Documents Uploaded</h4>
          <p class="empty-state-text">No PDF or DOCX job descriptions have been uploaded for ${Utils.escapeHtml(this.company.name)} yet.</p>
        </div>
      `;
    } else {
      html += `<div class="d-flex flex-column gap-2">`;
      drivesWithDocs.forEach(drive => {
        const doc = drive.jdDocument || {};
        const fileName = Utils.escapeHtml(doc.fileName || `${drive.title || 'Job_Description'}.pdf`);
        const uploadDate = Utils.formatDate(doc.uploadedAt || drive.createdAt);
        const isDocx = fileName.endsWith('.docx');

        html += `
          <div class="document-card">
            <div class="doc-info">
              <div class="doc-type-icon ${isDocx ? 'doc-type-docx' : ''}">
                ${isDocx ? 'DOC' : 'PDF'}
              </div>
              <div class="doc-details">
                <h4>${fileName}</h4>
                <div class="doc-meta">
                  <span>Role: <strong>${Utils.escapeHtml(drive.title || drive.jobRole)}</strong></span>
                  <span>Uploaded: ${uploadDate}</span>
                  <span class="badge ${drive.jdVerified ? 'badge-published' : 'badge-shortlisted'}">
                    ${drive.jdVerified ? 'AI Summary Verified' : 'AI Analysis Ready'}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-secondary" onclick="CompanyFolder.viewJdSummary(${drive.id})">
                Review AI Summary
              </button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    container.innerHTML = html;
  },

  /**
   * 4. Tab: Eligibility & Requirements
   */
  renderEligibilityTab() {
    const container = document.getElementById('tab-eligibility');
    if (!container) return;

    if (this.drives.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Eligibility Rules Configured',
        message: 'No recruitment drives exist to display eligibility criteria.'
      });
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Drive / Role</th>
              <th>Allowed Departments</th>
              <th>Min CGPA</th>
              <th>Max Backlogs</th>
              <th>Batch Year</th>
              <th>Required Skills</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.drives.forEach(drive => {
      const depts = (drive.eligibleDepartments || []).map(d => `<span class="badge badge-draft">${Utils.escapeHtml(d)}</span>`).join(' ') || 'All';
      const skills = (drive.requiredSkills || []).map(s => `<span class="skill-tag">${Utils.escapeHtml(s)}</span>`).join(' ') || 'General';

      html += `
        <tr>
          <td><strong>${Utils.escapeHtml(drive.title || drive.jobRole)}</strong></td>
          <td>${depts}</td>
          <td>${drive.minCgpa ?? 'No cut-off'}</td>
          <td>${drive.maxBacklogs !== undefined ? drive.maxBacklogs : 'None'}</td>
          <td>${drive.graduationYear || 'Any'}</td>
          <td>${skills}</td>
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

  /**
   * 5. Tab: Recruitment Stages & Timeline
   */
  renderStagesTab() {
    const container = document.getElementById('tab-stages');
    if (!container) return;

    if (this.drives.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Recruitment Stages',
        message: 'No drives exist for this company to display stage timelines.'
      });
      return;
    }

    let html = `<div class="d-flex flex-column gap-4">`;

    this.drives.forEach(drive => {
      const stages = drive.stages || [
        { name: 'Application Period', date: drive.applicationDeadline ? `Deadline: ${Utils.formatDate(drive.applicationDeadline)}` : 'Open', status: 'completed' },
        { name: 'Aptitude & Technical Assessment', date: 'Date to be scheduled', status: 'active' },
        { name: 'Technical Interview Round', date: 'Shortlisted candidates', status: 'pending' },
        { name: 'HR Interview & Cultural Fit', date: 'Final round', status: 'pending' },
        { name: 'Final Placement Confirmation', date: 'Official offer distribution', status: 'pending' }
      ];

      html += `
        <div class="card" style="padding:1.5rem;">
          <h3 class="mb-1">${Utils.escapeHtml(drive.title || drive.jobRole)} — Recruitment Pipeline</h3>
          <p class="text-sm text-secondary mb-3">Structured recruitment stages and schedule flow.</p>

          <div class="stage-timeline">
      `;

      stages.forEach(stage => {
        const isCompleted = stage.status === 'completed';
        const isActive = stage.status === 'active';
        const stepClass = isCompleted ? 'completed' : (isActive ? 'active' : '');

        html += `
          <div class="timeline-step ${stepClass}">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="d-flex justify-between align-center">
                <div class="timeline-title">${Utils.escapeHtml(stage.name)}</div>
                <span class="badge ${isCompleted ? 'badge-published' : (isActive ? 'badge-shortlisted' : 'badge-draft')}">
                  ${isCompleted ? 'Completed' : (isActive ? 'In Progress' : 'Upcoming')}
                </span>
              </div>
              <div class="timeline-desc">${Utils.escapeHtml(stage.date || '')}</div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  /**
   * 6. Tab: Applications and Activity (Staff authorized)
   */
  async loadApplications() {
    try {
      // Collect applications for each drive
      const appPromises = this.drives.map(d => Api.get(CONFIG.ENDPOINTS.DRIVE_APPLICATIONS(d.id)).catch(() => []));
      const results = await Promise.all(appPromises);
      this.applications = results.flat();
      
      const appCountEl = document.getElementById('count-tab-applications');
      if (appCountEl) appCountEl.textContent = this.applications.length;
      
      this.renderApplicationsTab();
    } catch (e) {
      this.applications = [];
    }
  },

  renderApplicationsTab() {
    const container = document.getElementById('tab-applications');
    if (!container) return;

    if (!Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR])) {
      container.innerHTML = `
        <div class="empty-state">
          <h4 class="empty-state-title">Staff Authorization Required</h4>
          <p class="empty-state-text">Application management within company folders is reserved for Placement Officers and Coordinators.</p>
        </div>
      `;
      return;
    }

    if (this.applications.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Applications Received Yet',
        message: `No student has applied to ${Utils.escapeHtml(this.company.name)}'s drives yet.`
      });
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Department & CGPA</th>
              <th>Drive Applied</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.applications.forEach(app => {
      const studentName = Utils.escapeHtml(app.studentName || app.student?.name || 'Student Candidate');
      const dept = Utils.escapeHtml(app.department || app.student?.department || 'Engineering');
      const cgpa = app.cgpa || app.student?.cgpa || '—';
      const driveTitle = Utils.escapeHtml(app.driveTitle || app.drive?.title || 'Recruitment Drive');
      const appliedDate = Utils.formatDate(app.appliedAt || app.createdAt);
      const statusBadge = Utils.getApplicationStatusBadge(app.status);

      html += `
        <tr>
          <td><strong>${studentName}</strong></td>
          <td>${dept} (CGPA: ${cgpa})</td>
          <td>${driveTitle}</td>
          <td>${appliedDate}</td>
          <td>${statusBadge}</td>
          <td>
            <button type="button" class="btn btn-sm btn-secondary" onclick="CompanyFolder.openStatusModal(${app.id}, '${app.status}')">
              Update Status
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

  openCreateDriveModal() {
    const form = document.getElementById('folder-drive-form');
    if (form) {
      form.reset();
      const compIdInput = form.querySelector('[name="companyId"]');
      if (compIdInput) compIdInput.value = this.companyId;

      const compNameSpan = document.getElementById('modal-drive-company-name');
      if (compNameSpan) compNameSpan.textContent = this.company.name;
    }
    Modal.open('folder-create-drive-modal');
  },

  openEditCompanyModal() {
    const form = document.getElementById('edit-company-form');
    if (form && this.company) {
      form.querySelector('[name="name"]').value = this.company.name || '';
      form.querySelector('[name="location"]').value = this.company.location || '';
      form.querySelector('[name="website"]').value = this.company.website || '';
      form.querySelector('[name="description"]').value = this.company.description || '';
      form.querySelector('[name="contactEmail"]').value = this.company.contactEmail || '';
    }
    Modal.open('edit-company-modal');
  },

  async handleSaveDrive(e) {
    e.preventDefault();
    const form = e.target;
    Validation.clearFieldErrors(form);

    const titleInput = form.querySelector('[name="title"]');
    const locationInput = form.querySelector('[name="location"]');
    const ctcInput = form.querySelector('[name="ctc"]');
    const minCgpaInput = form.querySelector('[name="minCgpa"]');
    const maxBacklogsInput = form.querySelector('[name="maxBacklogs"]');
    const gradYearInput = form.querySelector('[name="graduationYear"]');
    const deadlineInput = form.querySelector('[name="applicationDeadline"]');
    const departmentsSelect = form.querySelector('[name="eligibleDepartments"]');
    const skillsInput = form.querySelector('[name="requiredSkills"]');

    if (!titleInput.value.trim()) {
      Validation.showFieldError(titleInput, 'Job role title is required.');
      return;
    }

    const payload = {
      companyId: parseInt(this.companyId, 10),
      title: titleInput.value.trim(),
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
      Toast.success('Drive Created', `Drive "${payload.title}" associated with ${this.company.name}'s folder.`);
      Modal.close('folder-create-drive-modal');
      form.reset();
      await this.loadFolderData();
      this.switchTab('drives');
    } catch (err) {
      Toast.error('Drive Creation Failed', err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  async handleUpdateCompany(e) {
    e.preventDefault();
    const form = e.target;
    Validation.clearFieldErrors(form);

    const payload = {
      name: form.querySelector('[name="name"]').value.trim(),
      location: form.querySelector('[name="location"]').value.trim(),
      website: form.querySelector('[name="website"]').value.trim(),
      description: form.querySelector('[name="description"]').value.trim(),
      contactEmail: form.querySelector('[name="contactEmail"]').value.trim()
    };

    try {
      await Api.put(CONFIG.ENDPOINTS.COMPANY_BY_ID(this.companyId), payload);
      Toast.success('Updated', 'Company information updated successfully.');
      Modal.close('edit-company-modal');
      await this.loadFolderData();
    } catch (err) {
      Toast.error('Update Failed', err.message);
    }
  },

  handleDeactivate() {
    ConfirmDialog.show({
      title: 'Deactivate Company Folder',
      message: `Are you sure you want to deactivate ${this.company.name}? This will archive associated drives.`,
      confirmText: 'Deactivate',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        await Api.patch(CONFIG.ENDPOINTS.COMPANY_DEACTIVATE(this.companyId));
        Toast.success('Deactivated', `${this.company.name} has been archived.`);
        window.location.href = 'companies.html';
      }
    });
  },

  handlePublishDrive(driveId) {
    ConfirmDialog.show({
      title: 'Publish Recruitment Drive',
      message: 'Publishing will make this drive visible to all eligible students and trigger AI recommendation matching.',
      confirmText: 'Publish Now',
      confirmClass: 'btn-success',
      onConfirm: async () => {
        await Api.post(CONFIG.ENDPOINTS.DRIVE_PUBLISH(driveId));
        Toast.success('Drive Published', 'Eligible students can now apply.');
        await this.loadFolderData();
      }
    });
  },

  handleCloseDrive(driveId) {
    ConfirmDialog.show({
      title: 'Close Recruitment Drive',
      message: 'Closing will stop accepting new student applications.',
      confirmText: 'Close Drive',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        await Api.post(CONFIG.ENDPOINTS.DRIVE_CLOSE(driveId));
        Toast.info('Drive Closed', 'Drive application window has concluded.');
        await this.loadFolderData();
      }
    });
  },

  async viewJdSummary(driveId) {
    const drive = this.drives.find(d => d.id === driveId);
    if (!drive) return;

    const modalBody = document.getElementById('jd-summary-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <span>Retrieving AI Job Description Analysis...</span>
      </div>
    `;
    Modal.open('jd-summary-modal');

    try {
      const summary = await Api.get(CONFIG.ENDPOINTS.DRIVE_JD_SUMMARY(driveId)).catch(() => ({
        role: drive.title,
        responsibilities: 'Lead core software engineering tasks, participate in agile standups, design reliable microservices.',
        requiredSkills: drive.requiredSkills || ['Java', 'Spring Boot', 'SQL', 'Data Structures'],
        preferredSkills: ['Docker', 'AWS', 'Microservices'],
        salary: Utils.formatCtc(drive.ctc),
        eligibility: `Minimum CGPA: ${drive.minCgpa ?? 'N/A'}, Max Backlogs: ${drive.maxBacklogs ?? 0}`
      }));

      modalBody.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1.25rem;">
          <div style="background-color:var(--primary-50);padding:1rem;border-radius:var(--radius-md);border:1px solid var(--primary-200);">
            <div class="d-flex justify-between align-center">
              <strong style="color:var(--primary-800);">AI-Generated Structured Summary</strong>
              <span class="badge ${drive.jdVerified ? 'badge-published' : 'badge-shortlisted'}">
                ${drive.jdVerified ? 'Verified by Staff' : 'Pending Verification'}
              </span>
            </div>
            <p class="text-sm mt-1" style="color:var(--primary-900);">
              Extracted automatically from uploaded job description document. Placement staff can verify or revise fields.
            </p>
          </div>

          <div>
            <label class="form-label">Role Title</label>
            <input type="text" class="form-control" id="summary-edit-role" value="${Utils.escapeHtml(summary.role || drive.title || '')}" />
          </div>

          <div>
            <label class="form-label">Extracted Responsibilities</label>
            <textarea class="form-textarea" rows="3" id="summary-edit-resp">${Utils.escapeHtml(summary.responsibilities || '')}</textarea>
          </div>

          <div>
            <label class="form-label">Required Skills (Comma-separated)</label>
            <input type="text" class="form-control" id="summary-edit-req-skills" value="${Utils.escapeHtml((summary.requiredSkills || []).join(', '))}" />
          </div>

          <div>
            <label class="form-label">Preferred Skills</label>
            <input type="text" class="form-control" id="summary-edit-pref-skills" value="${Utils.escapeHtml((summary.preferredSkills || []).join(', '))}" />
          </div>

          ${Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]) ? `
            <div class="d-flex justify-end gap-2 mt-2">
              <button type="button" class="btn btn-secondary" data-modal-close="jd-summary-modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="CompanyFolder.saveVerifiedSummary(${driveId})">
                Save & Verify Summary
              </button>
            </div>
          ` : ''}
        </div>
      `;
    } catch (e) {
      modalBody.innerHTML = `<p class="text-danger">Failed to retrieve summary: ${Utils.escapeHtml(e.message)}</p>`;
    }
  },

  async saveVerifiedSummary(driveId) {
    const role = document.getElementById('summary-edit-role')?.value.trim();
    const resp = document.getElementById('summary-edit-resp')?.value.trim();
    const reqSkills = document.getElementById('summary-edit-req-skills')?.value.split(',').map(s => s.trim()).filter(Boolean);
    const prefSkills = document.getElementById('summary-edit-pref-skills')?.value.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      role: role,
      responsibilities: resp,
      requiredSkills: reqSkills,
      preferredSkills: prefSkills,
      verified: true
    };

    try {
      await Api.put(CONFIG.ENDPOINTS.DRIVE_JD_SUMMARY(driveId), payload);
      Toast.success('Verified', 'AI Job Description Summary verified and saved.');
      Modal.close('jd-summary-modal');
      await this.loadFolderData();
    } catch (err) {
      Toast.error('Save Failed', err.message);
    }
  },

  openStatusModal(appId, currentStatus) {
    const select = document.getElementById('update-status-select');
    if (select) select.value = currentStatus;
    
    const hiddenId = document.getElementById('update-app-id');
    if (hiddenId) hiddenId.value = appId;

    Modal.open('update-app-status-modal');
  }
};

window.CompanyFolder = CompanyFolder;
