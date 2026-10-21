/**
 * Companies Management Module
 * Company listings, search, filtering, creation modal, and folder entry links
 */

const Companies = {
  state: {
    companies: [],
    loading: false,
    search: '',
    viewMode: 'grid', // 'grid' or 'table'
    currentPage: 0,
    totalPages: 1
  },

  init() {
    this.bindEvents();
    this.loadCompanies();
  },

  bindEvents() {
    const searchInput = document.getElementById('company-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.state.search = e.target.value.trim();
        this.state.currentPage = 0;
        this.loadCompanies();
      }, 350));
    }

    const viewToggleGrid = document.getElementById('view-toggle-grid');
    const viewToggleTable = document.getElementById('view-toggle-table');

    if (viewToggleGrid && viewToggleTable) {
      viewToggleGrid.addEventListener('click', () => {
        this.state.viewMode = 'grid';
        viewToggleGrid.classList.add('active');
        viewToggleTable.classList.remove('active');
        this.renderCompanies();
      });

      viewToggleTable.addEventListener('click', () => {
        this.state.viewMode = 'table';
        viewToggleTable.classList.add('active');
        viewToggleGrid.classList.remove('active');
        this.renderCompanies();
      });
    }

    // Create Company Form Submit
    const createForm = document.getElementById('create-company-form');
    if (createForm) {
      createForm.addEventListener('submit', (e) => this.handleCreateCompany(e));
    }
  },

  async loadCompanies() {
    const container = document.getElementById('companies-container');
    if (!container) return;

    this.state.loading = true;
    UI.renderSpinner(container, 'Loading companies...');

    try {
      const params = {
        page: this.state.currentPage,
        size: CONFIG.DEFAULT_PAGE_SIZE,
        search: this.state.search
      };

      const response = await Api.get(CONFIG.ENDPOINTS.COMPANIES, params);
      
      // Support array response or Spring Page { content: [], totalPages: 1 }
      if (Array.isArray(response)) {
        this.state.companies = response;
        this.state.totalPages = 1;
      } else if (response && response.content) {
        this.state.companies = response.content;
        this.state.totalPages = response.totalPages || 1;
      } else {
        this.state.companies = [];
      }

      this.renderCompanies();
    } catch (err) {
      UI.renderErrorBanner(
        container,
        err.message || 'Failed to load companies from backend.',
        () => this.loadCompanies()
      );
    } finally {
      this.state.loading = false;
    }
  },

  renderCompanies() {
    const container = document.getElementById('companies-container');
    if (!container) return;

    if (!this.state.companies || this.state.companies.length === 0) {
      UI.renderEmptyState(container, {
        title: this.state.search ? 'No Matching Companies' : 'No Companies Found',
        message: this.state.search 
          ? `No companies matched your query "${Utils.escapeHtml(this.state.search)}".`
          : 'No recruitment companies have been added to the placement system yet.',
        actionText: Auth.hasRole([CONFIG.ROLES.OFFICER, CONFIG.ROLES.COORDINATOR]) ? '+ Add First Company' : null,
        onAction: () => Modal.open('create-company-modal')
      });
      return;
    }

    if (this.state.viewMode === 'grid') {
      this.renderGridView(container);
    } else {
      this.renderTableView(container);
    }
  },

  renderGridView(container) {
    let html = `<div class="company-folder-grid">`;

    this.state.companies.forEach(company => {
      const name = Utils.escapeHtml(company.name || 'Unnamed Company');
      const location = Utils.escapeHtml(company.location || 'Location Not Specified');
      const drivesCount = company.totalDrives ?? company.drivesCount ?? (company.drives ? company.drives.length : '—');
      const activeDrivesCount = company.activeDrivesCount ?? (company.activeDrives ? company.activeDrives.length : '—');
      const initial = (company.name || 'C').charAt(0).toUpperCase();

      html += `
        <div class="company-folder-card" onclick="window.location.href='company-folder.html?id=${company.id}'" role="button" tabindex="0">
          <div class="folder-tab-accent"></div>
          <div class="folder-card-body">
            <div class="folder-header-row">
              <div class="folder-icon-box">
                <svg style="width:24px;height:24px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div class="folder-title-wrap">
                <div class="folder-company-name" title="${name}">${name}</div>
                <div class="folder-location">
                  <svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>${location}</span>
                </div>
              </div>
            </div>

            <p class="text-sm text-secondary" style="margin: 0.25rem 0;">
              ${Utils.escapeHtml(Utils.truncate(company.description || 'Dedicated recruitment folder and workspace.', 90))}
            </p>

            <div class="folder-stats-row">
              <div class="folder-stat-item">
                <span class="folder-stat-count">${drivesCount}</span>
                <span class="folder-stat-label">Total Drives</span>
              </div>
              <div class="folder-stat-item">
                <span class="folder-stat-count">${activeDrivesCount}</span>
                <span class="folder-stat-label">Active Drives</span>
              </div>
            </div>
          </div>

          <div class="folder-card-footer">
            <span class="text-xs text-muted">ID: #${company.id}</span>
            <span class="folder-open-link">
              <span>Open Folder</span>
              <svg style="width:16px;height:16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  renderTableView(container) {
    let html = `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Location</th>
              <th>Website</th>
              <th>Total Drives</th>
              <th>Active Drives</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.state.companies.forEach(company => {
      const name = Utils.escapeHtml(company.name || 'Unnamed');
      const location = Utils.escapeHtml(company.location || '—');
      const website = company.website ? `<a href="${Utils.escapeHtml(company.website)}" target="_blank" rel="noopener">${Utils.escapeHtml(company.website)}</a>` : '—';
      const drivesCount = company.totalDrives ?? company.drivesCount ?? (company.drives ? company.drives.length : '—');
      const activeCount = company.activeDrivesCount ?? '—';

      html += `
        <tr>
          <td>
            <div class="d-flex align-center gap-2">
              <svg style="width:20px;height:20px;color:var(--primary-600);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <strong>${name}</strong>
            </div>
          </td>
          <td>${location}</td>
          <td>${website}</td>
          <td>${drivesCount}</td>
          <td>${activeCount}</td>
          <td>
            <a href="company-folder.html?id=${company.id}" class="btn btn-sm btn-outline">
              Open Folder
            </a>
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

  async handleCreateCompany(e) {
    e.preventDefault();
    const form = e.target;
    Validation.clearFieldErrors(form);

    const nameInput = form.querySelector('[name="name"]');
    const locationInput = form.querySelector('[name="location"]');
    const websiteInput = form.querySelector('[name="website"]');
    const descriptionInput = form.querySelector('[name="description"]');
    const contactEmailInput = form.querySelector('[name="contactEmail"]');

    const name = nameInput.value.trim();
    if (!name) {
      Validation.showFieldError(nameInput, 'Company name is required.');
      return;
    }

    const payload = {
      name: name,
      location: locationInput ? locationInput.value.trim() : '',
      website: websiteInput ? websiteInput.value.trim() : '',
      description: descriptionInput ? descriptionInput.value.trim() : '',
      contactEmail: contactEmailInput ? contactEmailInput.value.trim() : ''
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const created = await Api.post(CONFIG.ENDPOINTS.COMPANIES, payload);
      Toast.success('Company Created', `Company folder for "${name}" has been established.`);
      Modal.close('create-company-modal');
      form.reset();
      this.loadCompanies();
    } catch (err) {
      Toast.error('Creation Failed', err.message || 'Could not save company. Please check backend errors.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
};

window.Companies = Companies;
