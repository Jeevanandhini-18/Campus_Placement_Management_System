/**
 * Reusable UI Components Module: Toast, Modals, Confirm Dialogs, Spinners & States
 */

const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(title, message, type = 'info', duration = 4000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${Utils.escapeHtml(title)}</div>
        <div class="toast-message">${Utils.escapeHtml(message)}</div>
      </div>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      toast.remove();
    });

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.opacity = '0';
          toast.style.transition = 'opacity 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }
  },

  success(title, message) { this.show(title, message, 'success'); },
  error(title, message) { this.show(title, message, 'error', 6000); },
  warning(title, message) { this.show(title, message, 'warning'); },
  info(title, message) { this.show(title, message, 'info'); }
};

const Modal = {
  open(modalId) {
    const backdrop = document.getElementById(modalId);
    if (backdrop) {
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Auto focus first input if exists
      const firstInput = backdrop.querySelector('input, select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  },

  close(modalId) {
    const backdrop = document.getElementById(modalId);
    if (backdrop) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  initListeners() {
    document.addEventListener('click', (e) => {
      // Backdrop click closes modal
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
      }
      // Close button with data-modal-close
      if (e.target.closest('[data-modal-close]')) {
        const btn = e.target.closest('[data-modal-close]');
        const modalId = btn.getAttribute('data-modal-close');
        if (modalId) {
          Modal.close(modalId);
        } else {
          const parentBackdrop = btn.closest('.modal-backdrop');
          if (parentBackdrop) parentBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop.active');
        if (activeModal) {
          activeModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  }
};

const ConfirmDialog = {
  show({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'btn-primary', onConfirm }) {
    let dialogEl = document.getElementById('global-confirm-dialog');
    if (!dialogEl) {
      dialogEl = document.createElement('div');
      dialogEl.id = 'global-confirm-dialog';
      dialogEl.className = 'modal-backdrop';
      dialogEl.innerHTML = `
        <div class="modal-dialog" style="max-width: 440px;">
          <div class="modal-header">
            <h3 class="modal-title" id="confirm-dialog-title"></h3>
            <button class="modal-close-btn" data-modal-close="global-confirm-dialog">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirm-dialog-message" style="color: var(--text-secondary); line-height: 1.5;"></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="confirm-dialog-cancel"></button>
            <button type="button" class="btn" id="confirm-dialog-confirm"></button>
          </div>
        </div>
      `;
      document.body.appendChild(dialogEl);
    }

    dialogEl.querySelector('#confirm-dialog-title').textContent = title || 'Confirmation Required';
    dialogEl.querySelector('#confirm-dialog-message').textContent = message || 'Are you sure you want to proceed?';
    
    const cancelBtn = dialogEl.querySelector('#confirm-dialog-cancel');
    cancelBtn.textContent = cancelText;

    const confirmBtn = dialogEl.querySelector('#confirm-dialog-confirm');
    confirmBtn.className = `btn ${confirmClass}`;
    confirmBtn.textContent = confirmText;

    // Remove existing event listeners by cloning
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newCancelBtn.addEventListener('click', () => {
      Modal.close('global-confirm-dialog');
    });

    newConfirmBtn.addEventListener('click', async () => {
      newConfirmBtn.disabled = true;
      try {
        if (onConfirm) await onConfirm();
        Modal.close('global-confirm-dialog');
      } catch (err) {
        Toast.error('Action Failed', err.message);
      } finally {
        newConfirmBtn.disabled = false;
      }
    });

    Modal.open('global-confirm-dialog');
  }
};

const UI = {
  renderSpinner(container, text = 'Loading details...') {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <span>${Utils.escapeHtml(text)}</span>
      </div>
    `;
  },

  renderEmptyState(container, { title = 'No Records Found', message = 'There is currently no information to display here.', actionText = null, onAction = null }) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;

    let actionHtml = '';
    if (actionText) {
      actionHtml = `<button type="button" class="btn btn-primary btn-sm mt-3" id="empty-state-action-btn">${Utils.escapeHtml(actionText)}</button>`;
    }

    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h4 class="empty-state-title">${Utils.escapeHtml(title)}</h4>
        <p class="empty-state-text">${Utils.escapeHtml(message)}</p>
        ${actionHtml}
      </div>
    `;

    if (actionText && onAction) {
      const btn = container.querySelector('#empty-state-action-btn');
      if (btn) btn.addEventListener('click', onAction);
    }
  },

  renderErrorBanner(container, message, onRetry = null) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;

    const retryBtn = onRetry ? `<button type="button" class="btn btn-sm btn-secondary retry-btn">Retry</button>` : '';

    container.innerHTML = `
      <div class="error-banner">
        <div class="error-banner-content">
          <svg style="width:20px;height:20px;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${Utils.escapeHtml(message)}</span>
        </div>
        ${retryBtn}
      </div>
    `;

    if (onRetry) {
      const btn = container.querySelector('.retry-btn');
      if (btn) btn.addEventListener('click', onRetry);
    }
  }
};

// Initialize modal listeners on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Modal.initListeners();
});

window.Toast = Toast;
window.Modal = Modal;
window.ConfirmDialog = ConfirmDialog;
window.UI = UI;
