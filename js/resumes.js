/**
 * Student Resume Upload & AI Analysis Module
 * Handles PDF/DOCX resume upload, AI skill extraction, education/projects breakdown
 */

const Resumes = {
  state: {
    resumeData: null,
    selectedFile: null,
    loading: false
  },

  async init() {
    this.bindEvents();
    await this.loadResumeStatus();
  },

  bindEvents() {
    const fileInput = document.getElementById('resume-file-input');
    const dropzone = document.getElementById('resume-dropzone');
    const uploadBtn = document.getElementById('resume-upload-btn');
    const retryBtn = document.getElementById('resume-retry-btn');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (dropzone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length > 0) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.handleUpload());
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.handleRetryAnalysis());
    }
  },

  handleFileSelected(file) {
    const val = Validation.validateFile(file, ['pdf', 'docx'], 10 * 1024 * 1024);
    if (!val.valid) {
      Toast.error('Invalid File', val.error);
      return;
    }

    this.state.selectedFile = file;

    const fileNameEl = document.getElementById('resume-selected-filename');
    if (fileNameEl) {
      fileNameEl.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      fileNameEl.style.display = 'block';
    }

    const uploadBtn = document.getElementById('resume-upload-btn');
    if (uploadBtn) uploadBtn.disabled = false;
  },

  async loadResumeStatus() {
    const container = document.getElementById('resume-analysis-container');
    this.state.loading = true;

    try {
      const data = await Api.get(CONFIG.ENDPOINTS.STUDENT_RESUME);
      this.state.resumeData = data;
      this.renderAnalysis(data);
    } catch (err) {
      if (container) {
        UI.renderEmptyState(container, {
          title: 'No Resume Uploaded',
          message: 'Upload your latest resume (PDF or DOCX) to enable AI skill extraction and personalized drive matching.'
        });
      }
    } finally {
      this.state.loading = false;
    }
  },

  async handleUpload() {
    if (!this.state.selectedFile) return;

    const uploadBtn = document.getElementById('resume-upload-btn');
    const statusContainer = document.getElementById('resume-upload-status');

    if (uploadBtn) uploadBtn.disabled = true;
    if (statusContainer) {
      statusContainer.innerHTML = `
        <div class="loading-container" style="padding:1rem;">
          <div class="spinner"></div>
          <span>Uploading and parsing resume with AI NLP service...</span>
        </div>
      `;
    }

    const formData = new FormData();
    formData.append('file', this.state.selectedFile);

    try {
      const result = await Api.upload(CONFIG.ENDPOINTS.STUDENT_RESUME, formData);
      Toast.success('Resume Uploaded', 'AI parsing completed successfully.');
      this.state.resumeData = result;
      this.renderAnalysis(result);
      if (statusContainer) statusContainer.innerHTML = '';
    } catch (err) {
      Toast.error('Upload Failed', err.message);
      if (statusContainer) {
        statusContainer.innerHTML = `<div class="text-danger text-sm mt-2">${Utils.escapeHtml(err.message)}</div>`;
      }
    } finally {
      if (uploadBtn) uploadBtn.disabled = false;
    }
  },

  async handleRetryAnalysis() {
    const retryBtn = document.getElementById('resume-retry-btn');
    if (retryBtn) retryBtn.disabled = true;

    try {
      const result = await Api.post(CONFIG.ENDPOINTS.STUDENT_RESUME_RETRY, {});
      Toast.success('Analysis Refreshed', 'AI skills extraction updated.');
      this.state.resumeData = result;
      this.renderAnalysis(result);
    } catch (err) {
      Toast.error('Retry Failed', err.message);
    } finally {
      if (retryBtn) retryBtn.disabled = false;
    }
  },

  renderAnalysis(data) {
    const container = document.getElementById('resume-analysis-container');
    if (!container || !data) return;

    const skills = data.extractedSkills || data.skills || [];
    const education = data.education || [];
    const projects = data.projects || [];
    const experience = data.experience || [];
    const uploadDate = Utils.formatDate(data.uploadedAt || data.updatedAt);

    container.innerHTML = `
      <div class="card" style="padding:1.5rem; margin-bottom:1.5rem;">
        <div class="d-flex justify-between align-center flex-wrap gap-2">
          <div class="d-flex align-center gap-3">
            <div class="doc-type-icon">PDF</div>
            <div>
              <h3 style="font-size:1.15rem;">${Utils.escapeHtml(data.fileName || 'Student_Resume.pdf')}</h3>
              <div class="text-xs text-secondary mt-1">Uploaded: ${uploadDate} &bull; Status: <strong class="text-success">AI Processed</strong></div>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-secondary" id="resume-retry-btn">
              🔄 Reprocess AI Analysis
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Extracted Skills -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🤖 AI-Extracted Skills</h3>
            <span class="badge badge-published">${skills.length} Detected</span>
          </div>
          <div class="card-body">
            <p class="text-xs text-secondary mb-3">Extracted automatically using semantic entity recognition.</p>
            <div class="d-flex gap-2 flex-wrap">
              ${skills.length > 0 
                ? skills.map(s => `<span class="skill-tag">${Utils.escapeHtml(s)}</span>`).join('') 
                : '<span class="text-sm text-muted">No specific skills detected.</span>'}
            </div>
          </div>
        </div>

        <!-- Academic & Experience Summary -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Relevant Projects & Experience</h3>
          </div>
          <div class="card-body">
            ${projects.length > 0 ? `
              <h4 class="text-sm text-bold mb-2">Projects:</h4>
              <ul style="padding-left:1.25rem; font-size:0.88rem; display:flex; flex-direction:column; gap:0.4rem;" class="mb-3">
                ${projects.map(p => `<li>${Utils.escapeHtml(typeof p === 'string' ? p : (p.title || p.name))}</li>`).join('')}
              </ul>
            ` : '<p class="text-xs text-secondary">No key projects highlighted in resume.</p>'}

            ${experience.length > 0 ? `
              <h4 class="text-sm text-bold mb-2">Internships & Roles:</h4>
              <ul style="padding-left:1.25rem; font-size:0.88rem; display:flex; flex-direction:column; gap:0.4rem;">
                ${experience.map(e => `<li>${Utils.escapeHtml(typeof e === 'string' ? e : (e.role || e.company))}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Re-bind retry button
    const retryBtn = document.getElementById('resume-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.handleRetryAnalysis());
    }
  }
};

window.Resumes = Resumes;
