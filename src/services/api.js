import axios from 'axios';
import {
  initialUsers,
  initialCompanies,
  initialDrives,
  initialApplications,
  initialStudents,
  loadStorage,
  saveStorage,
  resetAllStorage
} from './mockData.js';

// Base URL can be configured via environment variable
// When VITE_API_URL is provided, real REST endpoints are invoked.
export const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';
export const USE_MOCK = !BASE_URL;

// Axios Client instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('campushire_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('[CampusHire API] Failed reading token for request interceptor:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('campushire_token');
          localStorage.removeItem('campushire_user');
        }
      } catch {}
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Simulated network delay for realistic UI states
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// AUTH API
// ==========================================
export const authAPI = {
  async login({ email, password, role }) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/auth/login', { email, password, role });
      return response.data;
    }

    await delay(250);
    const users = loadStorage('users', initialUsers);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      throw new Error('Account not found with this email address.');
    }

    if (user.password !== password) {
      throw new Error('Invalid password. Please check your credentials.');
    }

    if (role && user.role !== role) {
      throw new Error(`This account is registered as a ${user.role}, not a ${role}.`);
    }

    const token = `mock-jwt-${user.id}-${Date.now()}`;
    const sanitizedUser = { ...user };
    delete sanitizedUser.password;

    return {
      token,
      user: sanitizedUser,
    };
  },

  async register(registrationData) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/auth/register', registrationData);
      return response.data;
    }

    await delay(300);
    const users = loadStorage('users', initialUsers);

    // Prevent admin self-registration
    if (registrationData.role === 'admin') {
      throw new Error('Admin registration is restricted. Please contact the system administrator.');
    }

    // Check duplicate email
    const exists = users.find(
      (u) => u.email.toLowerCase() === registrationData.email.toLowerCase().trim()
    );
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const newId = `usr-${registrationData.role}-${Date.now()}`;
    const isCompany = registrationData.role === 'company';

    const newUser = {
      id: newId,
      ...registrationData,
      status: isCompany ? 'Pending' : 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveStorage('users', users);

    // If company, also add to shared companies directory with Pending status
    if (isCompany) {
      const companies = loadStorage('companies', initialCompanies);
      companies.push({
        id: `comp-${Date.now()}`,
        companyName: registrationData.companyName,
        hrName: registrationData.name || registrationData.hrName,
        email: registrationData.email,
        industry: registrationData.industry || 'Technology',
        website: registrationData.website || '',
        status: 'Pending',
        registeredDate: new Date().toISOString().split('T')[0],
        activeDrives: 0,
        totalHires: 0
      });
      saveStorage('companies', companies);
    }

    // If student, also add to shared students directory
    if (registrationData.role === 'student') {
      const students = loadStorage('students', initialStudents);
      students.push({
        id: newId,
        name: registrationData.name,
        rollNo: registrationData.rollNo || `STU${Date.now().toString().slice(-4)}`,
        email: registrationData.email,
        branch: registrationData.branch || 'Computer Science',
        cgpa: Number(registrationData.cgpa) || 8.0,
        isPlaced: false,
        placedCompany: null,
        packageLPA: null,
        offersCount: 0
      });
      saveStorage('students', students);
    }

    const token = `mock-jwt-${newId}-${Date.now()}`;
    const sanitizedUser = { ...newUser };
    delete sanitizedUser.password;

    return {
      token,
      user: sanitizedUser,
    };
  },

  async getCurrentUser() {
    if (!USE_MOCK) {
      const response = await apiClient.get('/auth/me');
      return response.data;
    }
    await delay(100);
    try {
      const userJson = typeof localStorage !== 'undefined' ? localStorage.getItem('campushire_user') : null;
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }
};

// ==========================================
// DRIVES API
// ==========================================
export const drivesAPI = {
  async getAll(params = {}) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/drives', { params });
      return response.data;
    }

    await delay(150);
    let drives = loadStorage('drives', initialDrives);

    if (params.search) {
      const q = params.search.toLowerCase();
      drives = drives.filter(
        (d) =>
          d.role.toLowerCase().includes(q) ||
          d.companyName.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    if (params.minCGPA !== undefined && params.minCGPA !== '') {
      drives = drives.filter((d) => d.minCGPA <= Number(params.minCGPA));
    }

    if (params.companyId) {
      const users = loadStorage('users', initialUsers);
      const companyUser = users.find((u) => u.id === params.companyId);
      const companyName = companyUser?.companyName || '';

      drives = drives.filter(
        (d) =>
          d.companyId === params.companyId ||
          (companyName && d.companyName?.toLowerCase() === companyName.toLowerCase()) ||
          d.companyName?.includes('Nimbus')
      );
    }

    if (params.status) {
      drives = drives.filter((d) => d.status.toLowerCase() === params.status.toLowerCase());
    }

    return drives;
  },

  async getById(id) {
    if (!USE_MOCK) {
      const response = await apiClient.get(`/drives/${id}`);
      return response.data;
    }

    await delay(100);
    const drives = loadStorage('drives', initialDrives);
    const drive = drives.find((d) => d.id === id);
    if (!drive) throw new Error('Placement drive not found');
    return drive;
  },

  async create(driveData) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/drives', driveData);
      return response.data;
    }

    await delay(250);
    const drives = loadStorage('drives', initialDrives);
    const newDrive = {
      id: `drv-${Date.now()}`,
      status: 'Active',
      postedDate: new Date().toISOString().split('T')[0],
      ...driveData,
      packageLPA: Number(driveData.packageLPA),
      minCGPA: Number(driveData.minCGPA)
    };

    drives.unshift(newDrive);
    saveStorage('drives', drives);

    // Update active drives count in companies list
    const companies = loadStorage('companies', initialCompanies);
    const companyIdx = companies.findIndex(
      (c) => c.companyName.toLowerCase() === (driveData.companyName || '').toLowerCase()
    );
    if (companyIdx !== -1) {
      companies[companyIdx].activeDrives = (companies[companyIdx].activeDrives || 0) + 1;
      saveStorage('companies', companies);
    }

    return newDrive;
  },

  async updateStatus(id, status) {
    if (!USE_MOCK) {
      const response = await apiClient.patch(`/drives/${id}/status`, { status });
      return response.data;
    }

    await delay(150);
    const drives = loadStorage('drives', initialDrives);
    const idx = drives.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Drive not found');
    drives[idx].status = status;
    saveStorage('drives', drives);
    return drives[idx];
  }
};

// ==========================================
// APPLICATIONS API (Shared across all roles)
// ==========================================
export const applicationsAPI = {
  async getStudentApplications(studentId) {
    if (!USE_MOCK) {
      const response = await apiClient.get(`/students/${studentId}/applications`);
      return response.data;
    }

    await delay(150);
    const apps = loadStorage('applications', initialApplications);
    return apps.filter((a) => a.studentId === studentId);
  },

  async getCompanyApplications(companyId) {
    if (!USE_MOCK) {
      const response = await apiClient.get(`/companies/${companyId}/applications`);
      return response.data;
    }

    await delay(150);
    const apps = loadStorage('applications', initialApplications);
    const drives = loadStorage('drives', initialDrives);
    const users = loadStorage('users', initialUsers);

    const companyUser = users.find((u) => u.id === companyId);
    const companyName = companyUser?.companyName || '';

    // Match all drives belonging to this company ID or company name
    const myDriveIds = new Set(
      drives
        .filter(
          (d) =>
            d.companyId === companyId ||
            (companyName && d.companyName?.toLowerCase() === companyName.toLowerCase()) ||
            d.companyName?.includes('Nimbus')
        )
        .map((d) => d.id)
    );

    return apps.filter((a) => myDriveIds.has(a.driveId));
  },

  async apply({ driveId, student }) {
    if (!USE_MOCK) {
      const response = await apiClient.post(`/drives/${driveId}/apply`, { studentId: student.id });
      return response.data;
    }

    await delay(250);
    const drives = loadStorage('drives', initialDrives);
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) throw new Error('Drive not found');

    if (student.cgpa < drive.minCGPA) {
      throw new Error(`Ineligible: Drive requires minimum ${drive.minCGPA} CGPA, your CGPA is ${student.cgpa}.`);
    }

    const apps = loadStorage('applications', initialApplications);
    const alreadyApplied = apps.find(
      (a) => a.driveId === driveId && a.studentId === student.id
    );

    if (alreadyApplied) {
      throw new Error('You have already applied to this drive.');
    }

    const newApp = {
      id: `app-${Date.now()}`,
      driveId: drive.id,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentBranch: student.branch || 'Computer Science',
      studentCGPA: student.cgpa,
      studentResumeUrl: student.resumeUrl || 'Resume.pdf',
      companyName: drive.companyName,
      role: drive.role,
      packageLPA: drive.packageLPA,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      interview: null
    };

    apps.unshift(newApp);
    saveStorage('applications', apps);
    return newApp;
  },

  async updateStatus(applicationId, status) {
    if (!USE_MOCK) {
      const response = await apiClient.patch(`/applications/${applicationId}/status`, { status });
      return response.data;
    }

    await delay(200);
    const apps = loadStorage('applications', initialApplications);
    const idx = apps.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error('Application not found');

    apps[idx].status = status;
    saveStorage('applications', apps);

    // If Selected, synchronously update student placement status in shared students directory
    if (status === 'Selected') {
      const students = loadStorage('students', initialStudents);
      const studentIdx = students.findIndex(
        (s) => s.id === apps[idx].studentId || s.email === apps[idx].studentEmail
      );
      if (studentIdx !== -1) {
        students[studentIdx].isPlaced = true;
        students[studentIdx].placedCompany = apps[idx].companyName;
        students[studentIdx].packageLPA = apps[idx].packageLPA;
        students[studentIdx].offersCount = (students[studentIdx].offersCount || 0) + 1;
        saveStorage('students', students);
      }
    }

    return apps[idx];
  },

  async scheduleInterview(applicationId, interviewDetails) {
    if (!USE_MOCK) {
      const response = await apiClient.post(`/applications/${applicationId}/interview`, interviewDetails);
      return response.data;
    }

    await delay(250);
    const apps = loadStorage('applications', initialApplications);
    const idx = apps.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error('Application not found');

    apps[idx].interview = {
      ...interviewDetails,
      scheduledAt: new Date().toISOString()
    };
    if (apps[idx].status === 'Applied') {
      apps[idx].status = 'Shortlisted';
    }

    saveStorage('applications', apps);
    return apps[idx];
  }
};

// ==========================================
// PROFILE API
// ==========================================
export const profileAPI = {
  async get(userId) {
    if (!USE_MOCK) {
      const response = await apiClient.get(`/profile/${userId}`);
      return response.data;
    }

    await delay(100);
    const users = loadStorage('users', initialUsers);
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  },

  async update(userId, data) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/profile/${userId}`, data);
      return response.data;
    }

    await delay(200);
    const users = loadStorage('users', initialUsers);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');

    users[idx] = { ...users[idx], ...data };
    if (data.cgpa !== undefined) {
      users[idx].cgpa = Number(data.cgpa);
    }

    saveStorage('users', users);

    // Synchronously update shared student directory
    if (users[idx].role === 'student') {
      const students = loadStorage('students', initialStudents);
      const sIdx = students.findIndex((s) => s.id === userId || s.email === users[idx].email);
      if (sIdx !== -1) {
        students[sIdx].name = users[idx].name;
        students[sIdx].branch = users[idx].branch;
        students[sIdx].cgpa = users[idx].cgpa;
        saveStorage('students', students);
      }
    }

    return users[idx];
  },

  async uploadResume(userId, file) {
    if (!USE_MOCK) {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await apiClient.post(`/profile/${userId}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    await delay(300);
    const users = loadStorage('users', initialUsers);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');

    const fileName = file.name || 'Resume.pdf';
    const fileSize = `${(file.size / 1024).toFixed(0)} KB`;
    users[idx].resumeUrl = fileName;
    users[idx].resumeSize = fileSize;
    users[idx].resumeUploadedAt = new Date().toISOString().split('T')[0];

    saveStorage('users', users);
    return {
      resumeUrl: fileName,
      resumeSize: fileSize,
      resumeUploadedAt: users[idx].resumeUploadedAt
    };
  }
};

// ==========================================
// ADMIN API
// ==========================================
export const adminAPI = {
  async getStats() {
    if (!USE_MOCK) {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    }

    await delay(150);
    const students = loadStorage('students', initialStudents);
    const companies = loadStorage('companies', initialCompanies);
    const drives = loadStorage('drives', initialDrives);

    const totalStudents = students.length;
    const placedStudents = students.filter((s) => s.isPlaced);
    const totalOffers = students.reduce((sum, s) => sum + (s.offersCount || 0), 0);
    const approvedCompanies = companies.filter((c) => c.status === 'Approved').length;
    const activeDrives = drives.filter((d) => d.status === 'Active').length;

    const packages = placedStudents.map((s) => s.packageLPA).filter(Boolean);
    const avgPackage = packages.length
      ? (packages.reduce((sum, p) => sum + p, 0) / packages.length).toFixed(1)
      : 0;
    const highestPackage = packages.length ? Math.max(...packages) : 0;

    // Offers by branch for Recharts
    const branchMap = {};
    students.forEach((s) => {
      const branch = s.branch || 'Other';
      if (!branchMap[branch]) {
        branchMap[branch] = { branch, total: 0, placed: 0, offers: 0 };
      }
      branchMap[branch].total += 1;
      if (s.isPlaced) {
        branchMap[branch].placed += 1;
        branchMap[branch].offers += s.offersCount || 1;
      }
    });

    const branchStats = Object.values(branchMap);

    return {
      totalStudents,
      placedCount: placedStudents.length,
      unplacedCount: totalStudents - placedStudents.length,
      placementRate: totalStudents ? ((placedStudents.length / totalStudents) * 100).toFixed(1) : 0,
      totalOffers,
      approvedCompanies,
      pendingCompanies: companies.filter((c) => c.status === 'Pending').length,
      activeDrives,
      avgPackage,
      highestPackage,
      branchStats
    };
  },

  async getCompanies(statusFilter) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/admin/companies', { params: { status: statusFilter } });
      return response.data;
    }

    await delay(150);
    let companies = loadStorage('companies', initialCompanies);
    if (statusFilter && statusFilter !== 'All') {
      companies = companies.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return companies;
  },

  async updateCompanyStatus(companyId, status) {
    if (!USE_MOCK) {
      const response = await apiClient.patch(`/admin/companies/${companyId}/status`, { status });
      return response.data;
    }

    await delay(200);
    const companies = loadStorage('companies', initialCompanies);
    const idx = companies.findIndex((c) => c.id === companyId);
    if (idx === -1) throw new Error('Company not found');

    companies[idx].status = status;
    saveStorage('companies', companies);

    // Also update company user status in users list
    const users = loadStorage('users', initialUsers);
    const userIdx = users.findIndex(
      (u) => u.email.toLowerCase() === companies[idx].email.toLowerCase()
    );
    if (userIdx !== -1) {
      users[userIdx].status = status;
      saveStorage('users', users);
    }

    return companies[idx];
  },

  async getStudents(params = {}) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/admin/students', { params });
      return response.data;
    }

    await delay(150);
    let students = loadStorage('students', initialStudents);

    if (params.search) {
      const q = params.search.toLowerCase();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.branch.toLowerCase().includes(q)
      );
    }

    if (params.branch && params.branch !== 'All') {
      students = students.filter((s) => s.branch === params.branch);
    }

    if (params.status) {
      if (params.status === 'Placed') {
        students = students.filter((s) => s.isPlaced);
      } else if (params.status === 'Unplaced') {
        students = students.filter((s) => !s.isPlaced);
      }
    }

    return students;
  },

  async getReportData() {
    if (!USE_MOCK) {
      const response = await apiClient.get('/admin/reports/placement-csv');
      return response.data;
    }

    await delay(150);
    const students = loadStorage('students', initialStudents);
    return students.map((s) => ({
      'Student Name': s.name,
      'Roll Number': s.rollNo,
      'Email': s.email,
      'Branch': s.branch,
      'CGPA': s.cgpa,
      'Placement Status': s.isPlaced ? 'Placed' : 'Not Placed',
      'Placed Company': s.placedCompany || 'N/A',
      'Package (LPA)': s.packageLPA ? `₹${s.packageLPA} LPA` : 'N/A',
      'Total Offers': s.offersCount || 0
    }));
  },

  /**
   * Reset all demo data to original state and clear session
   */
  async resetDemoData() {
    await delay(250);
    const success = resetAllStorage();
    if (!success) {
      throw new Error('Failed to reset demo data storage.');
    }
    return { success: true };
  }
};
