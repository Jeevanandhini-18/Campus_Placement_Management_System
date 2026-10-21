/**
 * Student Profile Module
 * Viewing, updating academic information, skills tagger, and profile completion calculation
 */

const Students = {
  profile: null,

  async initProfile() {
    this.bindEvents();
    await this.loadProfile();
  },

  bindEvents() {
    const form = document.getElementById('student-profile-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveProfile(e));
    }

    // Skill Tag Adder
    const addSkillBtn = document.getElementById('add-skill-btn');
    const skillInput = document.getElementById('new-skill-input');
    if (addSkillBtn && skillInput) {
      const addSkill = () => {
        const val = skillInput.value.trim();
        if (val) {
          this.addSkillTag(val);
          skillInput.value = '';
        }
      };
      addSkillBtn.addEventListener('click', addSkill);
      skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addSkill();
        }
      });
    }
  },

  async loadProfile() {
    const container = document.getElementById('profile-content-container');
    UI.renderSpinner(container, 'Loading academic profile...');

    try {
      this.profile = await Api.get(CONFIG.ENDPOINTS.STUDENT_ME);
      this.populateForm(this.profile);
      this.calculateCompletion(this.profile);
    } catch (err) {
      UI.renderErrorBanner(
        container,
        `Could not retrieve profile: ${err.message}`,
        () => this.loadProfile()
      );
    }
  },

  populateForm(p) {
    const form = document.getElementById('student-profile-form');
    if (!form || !p) return;

    form.querySelector('[name="name"]').value = p.name || '';
    form.querySelector('[name="email"]').value = p.email || '';
    form.querySelector('[name="department"]').value = p.department || '';
    form.querySelector('[name="cgpa"]').value = p.cgpa !== undefined ? p.cgpa : '';
    form.querySelector('[name="backlogs"]').value = p.backlogs !== undefined ? p.backlogs : 0;
    form.querySelector('[name="graduationYear"]').value = p.graduationYear || new Date().getFullYear();

    // Populate skills tags
    const skillsList = p.skills || [];
    const container = document.getElementById('skills-tags-container');
    if (container) {
      container.innerHTML = '';
      skillsList.forEach(s => this.addSkillTag(s));
    }

    const containerWrap = document.getElementById('profile-content-container');
    if (containerWrap) containerWrap.style.display = 'block';
  },

  addSkillTag(skillName) {
    const container = document.getElementById('skills-tags-container');
    if (!container) return;

    // Avoid duplicate
    const existing = Array.from(container.querySelectorAll('.skill-tag-name')).map(el => el.textContent.toLowerCase());
    if (existing.includes(skillName.toLowerCase())) return;

    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      <span class="skill-tag-name">${Utils.escapeHtml(skillName)}</span>
      <button type="button" style="background:none;border:none;color:var(--primary-700);cursor:pointer;font-weight:700;line-height:1;margin-left:4px;" aria-label="Remove skill">&times;</button>
    `;

    tag.querySelector('button').addEventListener('click', () => {
      tag.remove();
      this.calculateCompletion();
    });

    container.appendChild(tag);
  },

  getSkillsArray() {
    const container = document.getElementById('skills-tags-container');
    if (!container) return [];
    return Array.from(container.querySelectorAll('.skill-tag-name')).map(el => el.textContent.trim());
  },

  calculateCompletion(p = null) {
    const form = document.getElementById('student-profile-form');
    if (!form) return;

    const fields = [
      form.querySelector('[name="name"]')?.value.trim(),
      form.querySelector('[name="email"]')?.value.trim(),
      form.querySelector('[name="department"]')?.value,
      form.querySelector('[name="cgpa"]')?.value.trim(),
      form.querySelector('[name="graduationYear"]')?.value.trim(),
      this.getSkillsArray().length > 0 ? 'skills' : ''
    ];

    const filledCount = fields.filter(Boolean).length;
    const percentage = Math.round((filledCount / fields.length) * 100);

    const bar = document.getElementById('profile-completion-bar');
    const label = document.getElementById('profile-completion-text');

    if (bar) bar.style.width = `${percentage}%`;
    if (label) label.textContent = `${percentage}% Complete`;
  },

  async handleSaveProfile(e) {
    e.preventDefault();
    const form = e.target;
    Validation.clearFieldErrors(form);

    const nameInput = form.querySelector('[name="name"]');
    const deptInput = form.querySelector('[name="department"]');
    const cgpaInput = form.querySelector('[name="cgpa"]');
    const backlogsInput = form.querySelector('[name="backlogs"]');
    const gradYearInput = form.querySelector('[name="graduationYear"]');

    if (!nameInput.value.trim()) {
      Validation.showFieldError(nameInput, 'Full name is required.');
      return;
    }
    if (!deptInput.value) {
      Validation.showFieldError(deptInput, 'Please select your department.');
      return;
    }
    if (!Validation.isValidCgpa(cgpaInput.value)) {
      Validation.showFieldError(cgpaInput, 'Enter a valid CGPA between 0.00 and 10.00.');
      return;
    }
    if (!Validation.isValidBacklogs(backlogsInput.value)) {
      Validation.showFieldError(backlogsInput, 'Backlogs must be 0 or a positive integer.');
      return;
    }

    const payload = {
      name: nameInput.value.trim(),
      department: deptInput.value,
      cgpa: parseFloat(cgpaInput.value),
      backlogs: parseInt(backlogsInput.value, 10),
      graduationYear: parseInt(gradYearInput.value, 10),
      skills: this.getSkillsArray()
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await Api.put(CONFIG.ENDPOINTS.STUDENT_ME, payload);
      Toast.success('Profile Saved', 'Your academic profile has been successfully updated.');
      this.calculateCompletion();
    } catch (err) {
      Toast.error('Save Failed', err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
};

window.Students = Students;
