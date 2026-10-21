/**
 * AI Job Description Processing Module
 * Upload PDF/DOCX JDs, view AI extraction, edit structured summary, and verify
 */

const JobDescriptions = {
  state: {
    selectedFile: null,
    driveId: null,
    isUploading: false
  },

  initUploadModal(driveId) {
    this.state.driveId = driveId;
    this.state.selectedFile = null;

    const fileInput = document.getElementById('jd-file-input');
    const dropzone = document.getElementById('jd-dropzone');
    const uploadBtn = document.getElementById('jd-upload-submit-btn');

    if (!fileInput || !dropzone) return;

    // File picker change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelected(e.target.files[0]);
      }
    });

    // Drag and drop
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) {
        this.handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.submitUpload());
    }
  },

  handleFileSelected(file) {
    const validation = Validation.validateFile(file, ['pdf', 'docx'], 10 * 1024 * 1024);
    if (!validation.valid) {
      Toast.error('Invalid File', validation.error);
      return;
    }

    this.state.selectedFile = file;

    const fileNameEl = document.getElementById('jd-selected-filename');
    if (fileNameEl) {
      fileNameEl.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      fileNameEl.style.display = 'block';
    }

    const uploadBtn = document.getElementById('jd-upload-submit-btn');
    if (uploadBtn) uploadBtn.disabled = false;
  },

  async submitUpload() {
    if (!this.state.selectedFile || !this.state.driveId) {
      Toast.warning('File Required', 'Please select a PDF or DOCX file to upload.');
      return;
    }

    const progressContainer = document.getElementById('jd-upload-progress');
    const uploadBtn = document.getElementById('jd-upload-submit-btn');

    if (progressContainer) {
      progressContainer.innerHTML = `
        <div class="loading-container" style="padding:1rem;">
          <div class="spinner"></div>
          <span>Uploading and processing JD with AI NLP engine...</span>
        </div>
      `;
    }

    if (uploadBtn) uploadBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', this.state.selectedFile);

    try {
      const response = await Api.upload(CONFIG.ENDPOINTS.DRIVE_JD_UPLOAD(this.state.driveId), formData);
      Toast.success('Upload Successful', 'Job description document uploaded and parsed.');
      Modal.close('upload-jd-modal');

      // If in company folder, reload
      if (window.CompanyFolder && window.CompanyFolder.loadFolderData) {
        window.CompanyFolder.loadFolderData();
      }
    } catch (err) {
      Toast.error('Upload Failed', err.message);
      if (progressContainer) {
        progressContainer.innerHTML = `
          <div class="text-danger text-sm mt-2">
            Failed: ${Utils.escapeHtml(err.message)}
          </div>
        `;
      }
    } finally {
      if (uploadBtn) uploadBtn.disabled = false;
    }
  }
};

window.JobDescriptions = JobDescriptions;
