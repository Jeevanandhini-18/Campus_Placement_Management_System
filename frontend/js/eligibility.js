/**
 * Eligibility Checking Module
 * Evaluates student eligibility against drives based on authoritative backend rules
 */

const Eligibility = {
  async init() {
    const driveId = Utils.getQueryParam('driveId');
    if (!driveId) {
      await this.loadAllDrivesEligibility();
    } else {
      await this.loadSingleDriveEligibility(driveId);
    }
  },

  async loadSingleDriveEligibility(driveId) {
    const container = document.getElementById('eligibility-container');
    UI.renderSpinner(container, 'Verifying eligibility against recruitment criteria...');

    try {
      const [drive, result] = await Promise.all([
        Api.get(CONFIG.ENDPOINTS.DRIVE_BY_ID(driveId)),
        Api.get(CONFIG.ENDPOINTS.STUDENT_ELIGIBILITY(driveId))
      ]);

      Layout.renderBreadcrumbs([
        { label: 'Drives', url: 'drive-list.html' },
        { label: drive.title || 'Drive', url: `drive-details.html?id=${driveId}` },
        { label: 'Eligibility Check', url: `eligibility.html?driveId=${driveId}` }
      ]);

      this.renderEligibilityDetail(container, drive, result);
    } catch (err) {
      UI.renderErrorBanner(
        container,
        `Could not complete eligibility evaluation: ${err.message}`,
        () => this.loadSingleDriveEligibility(driveId)
      );
    }
  },

  async loadAllDrivesEligibility() {
    const container = document.getElementById('eligibility-container');
    UI.renderSpinner(container, 'Loading your drive eligibility overview...');

    try {
      const drivesRes = await Api.get(CONFIG.ENDPOINTS.DRIVES, { status: 'PUBLISHED' });
      const drives = Array.isArray(drivesRes) ? drivesRes : (drivesRes.content || []);

      if (drives.length === 0) {
        UI.renderEmptyState(container, {
          title: 'No Active Drives',
          message: 'There are currently no published recruitment drives to check eligibility against.'
        });
        return;
      }

      let html = `
        <div class="card" style="padding:1.5rem;margin-bottom:1.5rem;">
          <h2>Eligibility Across Active Drives</h2>
          <p class="text-sm text-secondary mt-1">Authoritative check evaluated against your academic profile.</p>
        </div>
        <div class="d-flex flex-column gap-3">
      `;

      drives.forEach(drive => {
        html += `
          <div class="card" style="padding:1.25rem;">
            <div class="d-flex justify-between align-center flex-wrap gap-2">
              <div>
                <h3 style="font-size:1.1rem;font-weight:700;">${Utils.escapeHtml(drive.title || 'Drive')}</h3>
                <div class="text-sm text-secondary mt-1">
                  Company: <strong>${Utils.escapeHtml(drive.companyName || drive.company?.name || 'Company')}</strong> &bull; Min CGPA: ${drive.minCgpa ?? 'N/A'} &bull; Max Backlogs: ${drive.maxBacklogs ?? 0}
                </div>
              </div>
              <a href="eligibility.html?driveId=${drive.id}" class="btn btn-sm btn-outline">
                Check My Status &rarr;
              </a>
            </div>
          </div>
        `;
      });

      html += `</div>`;
      container.innerHTML = html;
    } catch (e) {
      UI.renderErrorBanner(container, e.message);
    }
  },

  renderEligibilityDetail(container, drive, result) {
    const isEligible = result.isEligible;
    const cgpaPass = result.cgpaSatisfied ?? (result.studentCgpa >= (drive.minCgpa || 0));
    const backlogPass = result.backlogsSatisfied ?? (result.studentBacklogs <= (drive.maxBacklogs || 0));
    const deptPass = result.deptSatisfied ?? (drive.eligibleDepartments && drive.eligibleDepartments.length > 0 ? drive.eligibleDepartments.includes(result.studentDept) : true);

    container.innerHTML = `
      <div class="card" style="padding:1.75rem; margin-bottom:1.5rem;">
        <div class="d-flex justify-between align-start flex-wrap gap-2">
          <div>
            <h1 style="font-size:1.5rem;">Eligibility Status: ${Utils.escapeHtml(drive.title)}</h1>
            <div class="text-sm text-secondary mt-1">
              Company: <strong>${Utils.escapeHtml(drive.companyName || drive.company?.name || 'Recruiter')}</strong>
            </div>
          </div>
          <div>
            ${Utils.getEligibilityBadge(isEligible)}
          </div>
        </div>

        <div class="mt-3 p-3" style="background-color:${isEligible ? 'var(--success-bg)' : 'var(--danger-bg)'};border-radius:var(--radius-md);border:1px solid ${isEligible ? 'var(--success-border)' : 'var(--danger-border)'};">
          <strong style="color:${isEligible ? 'var(--success-text)' : 'var(--danger-text)'};font-size:0.95rem;">
            ${isEligible ? '✅ You are Eligible to Apply' : '❌ Ineligible Based on Institutional Rules'}
          </strong>
          <p class="text-sm mt-1" style="color:var(--text-primary);">
            ${Utils.escapeHtml(result.reason || (isEligible ? 'You satisfy all academic requirements configured by the recruiter and placement cell.' : 'Your current academic profile does not satisfy one or more required criteria.'))}
          </p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Criteria-by-Criteria Breakdown</h3>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="table">
            <thead>
              <tr>
                <th>Criterion</th>
                <th>Requirement</th>
                <th>Your Profile</th>
                <th>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Minimum CGPA</strong></td>
                <td>${drive.minCgpa ?? 'No Cut-off'}</td>
                <td>${result.studentCgpa ?? 'N/A'}</td>
                <td>
                  <span class="badge ${cgpaPass ? 'badge-published' : 'badge-closed'}">
                    ${cgpaPass ? 'Passed' : 'Deficit'}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Backlog Restriction</strong></td>
                <td>Maximum ${drive.maxBacklogs ?? 0} Backlogs</td>
                <td>${result.studentBacklogs ?? 0} Active Backlogs</td>
                <td>
                  <span class="badge ${backlogPass ? 'badge-published' : 'badge-closed'}">
                    ${backlogPass ? 'Passed' : 'Exceeded'}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Department</strong></td>
                <td>${(drive.eligibleDepartments || []).join(', ') || 'All Allowed'}</td>
                <td>${result.studentDept || 'Your Department'}</td>
                <td>
                  <span class="badge ${deptPass ? 'badge-published' : 'badge-closed'}">
                    ${deptPass ? 'Allowed' : 'Excluded'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer">
          <a href="drive-details.html?id=${drive.id}" class="btn btn-secondary btn-sm">&larr; Return to Drive</a>
          ${isEligible ? `
            <a href="match-results.html?driveId=${drive.id}" class="btn btn-primary btn-sm">View AI Resume Match &rarr;</a>
          ` : ''}
        </div>
      </div>
    `;
  }
};

window.Eligibility = Eligibility;
