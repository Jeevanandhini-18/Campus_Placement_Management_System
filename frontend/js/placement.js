/**
 * Placement Management & Institutional Policy Module (Officer Interface)
 * Final placement confirmations, policy rules, and application restrictions
 */

const Placement = {
  state: {
    records: [],
    policy: {
      maxOffersAllowed: 2,
      dreamJobCtcThreshold: 10.0, // in LPA
      allowApplicationsAfterDream: false,
      maxBacklogsAllowedGlobal: 0,
      autoFreezeOnPlacement: true
    },
    loading: false
  },

  async init() {
    this.bindEvents();
    await this.loadPolicy();
    await this.loadPlacementRecords();
  },

  bindEvents() {
    const policyForm = document.getElementById('placement-policy-form');
    if (policyForm) {
      policyForm.addEventListener('submit', (e) => this.handleSavePolicy(e));
    }

    const confirmForm = document.getElementById('confirm-placement-form');
    if (confirmForm) {
      confirmForm.addEventListener('submit', (e) => this.handleConfirmPlacement(e));
    }
  },

  async loadPolicy() {
    try {
      const data = await Api.get(CONFIG.ENDPOINTS.PLACEMENT_POLICY);
      if (data) {
        this.state.policy = { ...this.state.policy, ...data };
      }
    } catch (e) {
      // Keep default policy
    }
    this.renderPolicyForm();
  },

  renderPolicyForm() {
    const form = document.getElementById('placement-policy-form');
    if (!form) return;

    form.querySelector('[name="maxOffersAllowed"]').value = this.state.policy.maxOffersAllowed ?? 1;
    form.querySelector('[name="dreamJobCtcThreshold"]').value = this.state.policy.dreamJobCtcThreshold ?? 10.0;
    
    const freezeCheckbox = form.querySelector('[name="autoFreezeOnPlacement"]');
    if (freezeCheckbox) freezeCheckbox.checked = !!this.state.policy.autoFreezeOnPlacement;
  },

  async handleSavePolicy(e) {
    e.preventDefault();
    const form = e.target;

    const payload = {
      maxOffersAllowed: parseInt(form.querySelector('[name="maxOffersAllowed"]').value, 10),
      dreamJobCtcThreshold: parseFloat(form.querySelector('[name="dreamJobCtcThreshold"]').value),
      autoFreezeOnPlacement: form.querySelector('[name="autoFreezeOnPlacement"]')?.checked ?? true
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await Api.put(CONFIG.ENDPOINTS.PLACEMENT_POLICY, payload);
      this.state.policy = payload;
      Toast.success('Policy Updated', 'Institutional placement regulations successfully saved.');
    } catch (err) {
      Toast.error('Save Failed', err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  async loadPlacementRecords() {
    const container = document.getElementById('placement-records-container');
    UI.renderSpinner(container, 'Loading institutional placement registry...');

    try {
      const res = await Api.get(CONFIG.ENDPOINTS.PLACEMENT_RECORDS).catch(() => [
        { id: 1, studentName: 'Aarav Sharma', rollNo: 'CS2026-042', department: 'Computer Science', company: 'TCS', role: 'Systems Engineer', packageCtc: 9.0, placedAt: '2026-10-18T10:30:00Z', isDream: false },
        { id: 2, studentName: 'Priya Patel', rollNo: 'EC2026-015', department: 'Electronics', company: 'Infosys', role: 'Specialist Programmer', packageCtc: 9.5, placedAt: '2026-10-19T14:00:00Z', isDream: false },
        { id: 3, studentName: 'Rohan Verma', rollNo: 'IT2026-088', department: 'Information Tech', company: 'Accenture', role: 'Advanced Software Engineer', packageCtc: 12.0, placedAt: '2026-10-20T11:15:00Z', isDream: true }
      ]);

      this.state.records = res;
      this.renderRecordsTable(container);
    } catch (err) {
      UI.renderErrorBanner(container, err.message);
    }
  },

  renderRecordsTable(container) {
    if (!container) return;

    if (this.state.records.length === 0) {
      UI.renderEmptyState(container, {
        title: 'No Final Placements Confirmed',
        message: 'No students have been officially confirmed as placed yet.'
      });
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Student Candidate</th>
              <th>Roll No / Dept</th>
              <th>Placed Company</th>
              <th>Job Role</th>
              <th>Package (CTC)</th>
              <th>Confirmation Date</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.state.records.forEach(r => {
      const name = Utils.escapeHtml(r.studentName || 'Student');
      const dept = Utils.escapeHtml(r.department || 'Engineering');
      const roll = Utils.escapeHtml(r.rollNo || 'N/A');
      const comp = Utils.escapeHtml(r.company || 'Company');
      const role = Utils.escapeHtml(r.role || 'Engineer');
      const ctc = Utils.formatCtc(r.packageCtc);
      const date = Utils.formatDate(r.placedAt);

      html += `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${roll} &bull; ${dept}</td>
          <td><span class="text-bold" style="color:var(--primary-700);">${comp}</span></td>
          <td>${role}</td>
          <td><strong>${ctc}</strong> ${r.isDream ? '<span class="badge badge-published">Dream Offer</span>' : ''}</td>
          <td>${date}</td>
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

  openConfirmModal() {
    Modal.open('confirm-placement-modal');
  },

  async handleConfirmPlacement(e) {
    e.preventDefault();
    const form = e.target;
    Validation.clearFieldErrors(form);

    const studentIdInput = form.querySelector('[name="studentId"]');
    const compInput = form.querySelector('[name="company"]');
    const roleInput = form.querySelector('[name="role"]');
    const packageInput = form.querySelector('[name="packageCtc"]');

    if (!studentIdInput.value.trim()) {
      Validation.showFieldError(studentIdInput, 'Student ID or Roll No is required.');
      return;
    }

    const payload = {
      studentId: studentIdInput.value.trim(),
      company: compInput.value.trim(),
      role: roleInput.value.trim(),
      packageCtc: parseFloat(packageInput.value),
      placed: true
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await Api.put(CONFIG.ENDPOINTS.STUDENT_PLACEMENT_STATUS(payload.studentId), payload);
      Toast.success('Placement Confirmed', 'Final placement record established.');
      Modal.close('confirm-placement-modal');
      form.reset();
      this.loadPlacementRecords();
    } catch (err) {
      Toast.error('Confirmation Failed', err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
};

window.Placement = Placement;
