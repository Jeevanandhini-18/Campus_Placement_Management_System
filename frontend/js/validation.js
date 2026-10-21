/**
 * Input & File Validation Module
 */

const Validation = {
  isValidEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  isValidCgpa(cgpa) {
    const num = parseFloat(cgpa);
    return !isNaN(num) && num >= 0 && num <= 10;
  },

  isValidBacklogs(backlogs) {
    const num = parseInt(backlogs, 10);
    return !isNaN(num) && num >= 0;
  },

  isValidGraduationYear(year) {
    const num = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(num) && num >= 2020 && num <= currentYear + 6;
  },

  /**
   * Validate file upload for Job Descriptions & Resumes
   */
  validateFile(file, allowedExtensions = ['pdf', 'docx'], maxSizeBytes = 10 * 1024 * 1024) {
    if (!file) {
      return { valid: false, error: 'Please choose a file to upload.' };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(`.${ext}`));
    if (!hasValidExt) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${allowedExtensions.map(e => e.toUpperCase()).join(', ')}`
      };
    }

    if (file.size > maxSizeBytes) {
      const maxSizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is ${maxSizeMb} MB.`
      };
    }

    return { valid: true };
  },

  /**
   * Show validation error under an input field
   */
  showFieldError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('is-invalid');
    
    // Check if error message element already exists
    let errorEl = inputEl.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      inputEl.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  },

  /**
   * Clear all field errors in a form
   */
  clearFieldErrors(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    formEl.querySelectorAll('.form-error').forEach(el => el.remove());
  }
};

window.Validation = Validation;
