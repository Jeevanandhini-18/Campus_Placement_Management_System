/**
 * Centralized API Client Module
 * Communicates with Spring Boot REST Backend via Fetch API with JWT Bearer Token
 */

const Api = {
  /**
   * Internal request executor
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE}${endpoint}`;
    
    // Default headers
    const headers = options.headers || {};
    
    // Attach JWT Bearer token if available
    const token = sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Set JSON content-type if body is an object and not FormData
    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body === 'object') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    const fetchConfig = {
      method: options.method || 'GET',
      headers: headers,
      body: body
    };

    try {
      const response = await fetch(url, fetchConfig);

      // Handle 401 Unauthorized: Session expired or invalid token
      if (response.status === 401) {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        
        // Only redirect if not already on login or register page
        const currentPage = window.location.pathname;
        if (!currentPage.includes('login.html') && !currentPage.includes('register.html') && !currentPage.includes('index.html')) {
          window.location.href = `login.html?expired=1&redirect=${encodeURIComponent(window.location.href)}`;
        }
        throw new Error('Your session has expired. Please log in again.');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('Access denied: You do not have permission to perform this action.');
      }

      // Parse response JSON or text
      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      // Handle HTTP errors
      if (!response.ok) {
        const errorMessage = (data && (data.message || data.error)) || `Server returned error (${response.status})`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Catch network connection failures (e.g. backend server is not running or CORS blocked)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const netErr = new Error(`Cannot connect to backend server at ${CONFIG.API_BASE}. Please ensure the Spring Boot application is running and CORS is enabled.`);
        netErr.isNetworkError = true;
        throw netErr;
      }
      throw err;
    }
  },

  /**
   * HTTP GET
   */
  get(endpoint, params = {}) {
    let url = endpoint;
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }

    return this.request(url, { method: 'GET' });
  },

  /**
   * HTTP POST
   */
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body
    });
  },

  /**
   * HTTP PUT
   */
  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body
    });
  },

  /**
   * HTTP PATCH
   */
  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: body
    });
  },

  /**
   * HTTP DELETE
   */
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  },

  /**
   * Multipart file upload (for PDF / DOCX Job Descriptions & Resumes)
   */
  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData
    });
  }
};

window.Api = Api;
