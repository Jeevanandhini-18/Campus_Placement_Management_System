/**
 * Smart Opportunity Recommendations Module
 * Ranks opportunities based on backend AI recommendation engine, compatibility and eligibility
 */

const Recommendations = {
  state: {
    recommendations: [],
    loading: false,
    sortBy: 'score' // 'score', 'deadline', 'ctc'
  },

  async init() {
    this.bindEvents();
    await this.loadRecommendations();
  },

  bindEvents() {
    const sortSelect = document.getElementById('rec-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.sortAndRender();
      });
    }
  },

  async loadRecommendations() {
    const container = document.getElementById('recommendations-container');
    this.state.loading = true;
    UI.renderSpinner(container, 'Consulting AI Recommendation Engine...');

    try {
      const response = await Api.get(CONFIG.ENDPOINTS.STUDENT_RECOMMENDATIONS);
      const list = Array.isArray(response) ? response : (response.content || []);
      this.state.recommendations = list;
      this.sortAndRender();
    } catch (err) {
      UI.renderErrorBanner(
        container,
        `Recommendation service unavailable: ${err.message}`,
        () => this.loadRecommendations()
      );
    } finally {
      this.state.loading = false;
    }
  },

  sortAndRender() {
    const container = document.getElementById('recommendations-container');
    if (!container) return;

    let list = [...this.state.recommendations];

    if (this.state.sortBy === 'score') {
      list.sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0));
    } else if (this.state.sortBy === 'ctc') {
      list.sort((a, b) => (b.ctc || 0) - (a.ctc || 0));
    } else if (this.state.sortBy === 'deadline') {
      list.sort((a, b) => new Date(a.applicationDeadline || a.deadline || 0) - new Date(b.applicationDeadline || b.deadline || 0));
    }

    if (list.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Recommendations Available',
        message: 'No published opportunities match your academic profile or resume skills currently. Keep your resume updated!'
      });
      return;
    }

    let html = `<div class="d-flex flex-column gap-3">`;

    list.forEach(rec => {
      const drive = rec.drive || rec;
      const title = Utils.escapeHtml(drive.title || drive.jobRole || 'Opportunity');
      const companyName = Utils.escapeHtml(rec.companyName || drive.companyName || drive.company?.name || 'Recruiter');
      const companyId = rec.companyId || drive.companyId || drive.company?.id;
      const score = rec.matchScore ?? rec.score ?? 0;
      const isEligible = rec.isEligible !== undefined ? rec.isEligible : true;
      const ctc = Utils.formatCtc(drive.ctc || drive.salary);
      const deadline = Utils.formatDate(drive.applicationDeadline || drive.deadline);
      const location = Utils.escapeHtml(drive.location || 'Multiple');
      const explanation = rec.explanation || rec.reason || 'Strong alignment between your parsed technical skills and core JD requirements.';

      let scoreClass = 'score-high';
      if (score < 60) scoreClass = 'score-low';
      else if (score < 75) scoreClass = 'score-mid';

      html += `
        <div class="recommendation-card">
          <div class="rec-header">
            <div class="d-flex align-center gap-3">
              <div class="rec-company-logo">
                ${(companyName || 'C').charAt(0).toUpperCase()}
              </div>
              <div class="rec-title-wrap">
                <h3 class="rec-job-title">${title}</h3>
                <div class="d-flex align-center gap-2 mt-1">
                  <span class="rec-company-name">${companyName}</span>
                  ${companyId ? `
                    <a href="company-folder.html?id=${companyId}" class="badge badge-draft" title="Open Dedicated Company Folder">
                      📁 Company Folder
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>

            <div class="d-flex align-center gap-2">
              <div class="match-score-badge ${scoreClass}">
                <span>${score}%</span>
                <span class="text-xs" style="font-weight:500;">Match</span>
              </div>
              ${Utils.getEligibilityBadge(isEligible)}
            </div>
          </div>

          <!-- Explainable AI Callout -->
          <div class="rec-explanation-box">
            <strong>🤖 Why this was recommended:</strong> ${Utils.escapeHtml(explanation)}
          </div>

          <div class="rec-meta-row">
            <span class="rec-meta-item">📍 ${location}</span>
            <span class="rec-meta-item">💰 ${ctc}</span>
            <span class="rec-meta-item">⏳ Apply By: ${deadline}</span>
          </div>

          <div class="d-flex justify-between align-center mt-2 pt-3" style="border-top:1px solid var(--border-subtle); flex-wrap:wrap; gap:0.75rem;">
            <div class="d-flex gap-1 flex-wrap">
              ${(rec.matchedSkills || drive.requiredSkills || []).slice(0, 4).map(s => `<span class="skill-tag matched">✓ ${Utils.escapeHtml(s)}</span>`).join('')}
            </div>

            <div class="d-flex gap-2">
              <a href="drive-details.html?id=${drive.id}" class="btn btn-secondary btn-sm">
                View Details
              </a>
              ${isEligible ? `
                <button type="button" class="btn btn-primary btn-sm" onclick="Applications.openApplyModal(${drive.id}, '${title}', '${companyName}')">
                  Apply Now
                </button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm" disabled title="Ineligible based on academic criteria">
                  Ineligible
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }
};

window.Recommendations = Recommendations;
