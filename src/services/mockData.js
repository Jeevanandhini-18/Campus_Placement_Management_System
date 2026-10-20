const STORAGE_KEY_PREFIX = 'campushire_';

// In-memory fallback in case localStorage is disabled or restricted
const memoryStorage = {};

export const initialUsers = [
  {
    id: 'usr-student-1',
    email: 'student@campus.edu',
    password: 'student123',
    role: 'student',
    name: 'Aarav Sharma',
    rollNo: 'CS22B042',
    branch: 'Computer Science',
    cgpa: 8.75,
    gradYear: 2026,
    phone: '+91 98765 43210',
    skills: ['React', 'JavaScript', 'Node.js', 'Python', 'Tailwind CSS', 'PostgreSQL'],
    resumeUrl: 'Aarav_Sharma_Resume.pdf',
    resumeSize: '412 KB',
    resumeUploadedAt: '2026-10-18',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-company-1',
    email: 'company@nimbus.com',
    password: 'company123',
    role: 'company',
    name: 'Sarah Jenkins',
    companyName: 'Nimbus Cloud Technologies',
    industry: 'Cloud & SaaS Solutions',
    website: 'https://nimbus-cloud.example.com',
    location: 'Bangalore, India',
    status: 'Approved',
    description: 'Next-generation hyper-scale distributed cloud infrastructure provider.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-admin-1',
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'admin',
    name: 'Dr. Rajesh Rao',
    title: 'Dean of Training & Placements',
    department: 'Career & Placement Cell',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  }
];

export const initialCompanies = [
  {
    id: 'comp-1',
    companyName: 'Nimbus Cloud Technologies',
    hrName: 'Sarah Jenkins',
    email: 'company@nimbus.com',
    industry: 'Cloud Software',
    website: 'https://nimbus.com',
    status: 'Approved',
    registeredDate: '2026-08-10',
    activeDrives: 2,
    totalHires: 14
  },
  {
    id: 'comp-2',
    companyName: 'Razorpay Systems',
    hrName: 'Vikram Malhotra',
    email: 'careers@razorpay.example.com',
    industry: 'FinTech & Payments',
    website: 'https://razorpay.example.com',
    status: 'Approved',
    registeredDate: '2026-08-18',
    activeDrives: 1,
    totalHires: 9
  },
  {
    id: 'comp-3',
    companyName: 'AeroDynamics Global',
    hrName: 'Meera Kulkarni',
    email: 'hr@aerodynamics.io',
    industry: 'Aerospace & Robotics',
    website: 'https://aerodynamics.io',
    status: 'Pending',
    registeredDate: '2026-10-18',
    activeDrives: 0,
    totalHires: 0
  },
  {
    id: 'comp-4',
    companyName: 'NeuroSync AI Labs',
    hrName: 'David Chen',
    email: 'talent@neurosync.ai',
    industry: 'Artificial Intelligence',
    website: 'https://neurosync.ai',
    status: 'Pending',
    registeredDate: '2026-10-19',
    activeDrives: 0,
    totalHires: 0
  },
  {
    id: 'comp-5',
    companyName: 'Apex Data Networks',
    hrName: 'Rohan Verma',
    email: 'recruit@apexnetworks.com',
    industry: 'Telecommunications',
    website: 'https://apexnetworks.com',
    status: 'Rejected',
    registeredDate: '2026-09-02',
    activeDrives: 0,
    totalHires: 0
  },
  {
    id: 'comp-6',
    companyName: 'TCS Digital',
    hrName: 'Ananya Deshmukh',
    email: 'digital@tcs.example.com',
    industry: 'IT Services & Consulting',
    website: 'https://tcs.example.com',
    status: 'Approved',
    registeredDate: '2026-07-20',
    activeDrives: 1,
    totalHires: 38
  }
];

export const initialDrives = [
  {
    id: 'drv-1',
    companyId: 'usr-company-1',
    companyName: 'Nimbus Cloud Technologies',
    role: 'Software Development Engineer I (Cloud)',
    packageLPA: 16.5,
    minCGPA: 8.0,
    deadline: '2026-11-15',
    status: 'Active',
    location: 'Bangalore / Hybrid',
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm.'],
    description: 'Looking for enthusiastic engineers to build distributed multi-tenant storage services using Go and React.',
    rounds: ['Online Assessment', 'Technical Round 1', 'System Design & Bar Raiser', 'HR Round'],
    postedDate: '2026-10-01'
  },
  {
    id: 'drv-2',
    companyId: 'usr-company-1',
    companyName: 'Nimbus Cloud Technologies',
    role: 'Site Reliability & DevOps Engineer',
    packageLPA: 14.0,
    minCGPA: 7.5,
    deadline: '2026-11-20',
    status: 'Active',
    location: 'Hyderabad / On-site',
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm.', 'Electrical Engineering'],
    description: 'Build observability pipelines, Kubernetes automation, and resilience test suites.',
    rounds: ['Online Coding Test', 'Technical Architecture', 'Managerial Interview'],
    postedDate: '2026-10-05'
  },
  {
    id: 'drv-3',
    companyId: 'comp-2',
    companyName: 'Razorpay Systems',
    role: 'Associate Frontend Engineer',
    packageLPA: 18.0,
    minCGPA: 8.5,
    deadline: '2026-11-05',
    status: 'Active',
    location: 'Bangalore, India',
    eligibleBranches: ['Computer Science', 'Information Technology'],
    description: 'Design intuitive, lightning-fast payment checkouts used by millions of merchants worldwide.',
    rounds: ['Online Machine Coding Round', 'Core JS & React Architecture', 'Culture Fit'],
    postedDate: '2026-10-10'
  },
  {
    id: 'drv-4',
    companyId: 'comp-6',
    companyName: 'TCS Digital',
    role: 'Systems Engineer — Digital Specialist',
    packageLPA: 9.0,
    minCGPA: 7.0,
    deadline: '2026-11-30',
    status: 'Active',
    location: 'Pan India (Pune / Mumbai / Chennai)',
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm.', 'Mechanical Engineering', 'Civil Engineering'],
    description: 'Fast-track engineering track focusing on enterprise digital transformation and cloud enablement.',
    rounds: ['NQT Cognitive & Coding Test', 'Technical Interview', 'HR Interview'],
    postedDate: '2026-09-25'
  },
  {
    id: 'drv-5',
    companyId: 'comp-google',
    companyName: 'Google India',
    role: 'Software Engineer (Early Career)',
    packageLPA: 32.0,
    minCGPA: 9.0,
    deadline: '2026-11-10',
    status: 'Active',
    location: 'Bangalore / Hyderabad',
    eligibleBranches: ['Computer Science', 'Information Technology'],
    description: 'Build systems that impact billions of people worldwide. Strong algorithms and distributed systems background required.',
    rounds: ['Online Coding Challenge', 'Data Structures Interview 1', 'Data Structures Interview 2', 'Googliness & Leadership'],
    postedDate: '2026-10-08'
  },
  {
    id: 'drv-6',
    companyId: 'comp-deloitte',
    companyName: 'Deloitte Consulting',
    role: 'Analyst — Technology Consulting',
    packageLPA: 10.5,
    minCGPA: 7.0,
    deadline: '2026-10-25',
    status: 'Active',
    location: 'Gurgaon / Hyderabad',
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm.', 'Electrical Engineering', 'Mechanical Engineering'],
    description: 'Partner with global enterprises on enterprise architecture, ERP solutions, and cyber risk management.',
    rounds: ['Aptitude & Technical Test', 'Case Study Round', 'Partner Interview'],
    postedDate: '2026-09-15'
  }
];

export const initialApplications = [
  {
    id: 'app-1',
    driveId: 'drv-1',
    studentId: 'usr-student-1',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@campus.edu',
    studentBranch: 'Computer Science',
    studentCGPA: 8.75,
    studentResumeUrl: 'Aarav_Sharma_Resume.pdf',
    companyName: 'Nimbus Cloud Technologies',
    role: 'Software Development Engineer I (Cloud)',
    packageLPA: 16.5,
    status: 'Shortlisted',
    appliedDate: '2026-10-03',
    interview: {
      date: '2026-10-28', // Falls between 22 Oct 2026 and 15 Nov 2026
      time: '14:30',
      mode: 'Google Meet',
      link: 'https://meet.google.com/xyz-campushire-test',
      notes: 'Please prepare your laptop with screenshare and IDE ready for live coding.'
    }
  },
  {
    id: 'app-2',
    driveId: 'drv-3',
    studentId: 'usr-student-1',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@campus.edu',
    studentBranch: 'Computer Science',
    studentCGPA: 8.75,
    studentResumeUrl: 'Aarav_Sharma_Resume.pdf',
    companyName: 'Razorpay Systems',
    role: 'Associate Frontend Engineer',
    packageLPA: 18.0,
    status: 'Applied',
    appliedDate: '2026-10-11',
    interview: null
  },
  {
    id: 'app-3',
    driveId: 'drv-6',
    studentId: 'usr-student-1',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@campus.edu',
    studentBranch: 'Computer Science',
    studentCGPA: 8.75,
    studentResumeUrl: 'Aarav_Sharma_Resume.pdf',
    companyName: 'Deloitte Consulting',
    role: 'Analyst — Technology Consulting',
    packageLPA: 10.5,
    status: 'Selected',
    appliedDate: '2026-09-18',
    interview: {
      date: '2026-10-25', // Falls between 22 Oct and 15 Nov 2026
      time: '11:00',
      mode: 'Campus Placement Cell (Hall B)',
      link: '',
      notes: 'Selected! Formal offer letter released by placement cell. Candidate onboarding begins Summer 2027.'
    }
  },
  {
    id: 'app-4',
    driveId: 'drv-1',
    studentId: 'stu-2',
    studentName: 'Priya Nambiar',
    studentEmail: 'priya.n@campus.edu',
    studentBranch: 'Computer Science',
    studentCGPA: 9.2,
    studentResumeUrl: 'Priya_Nambiar_Resume.pdf',
    companyName: 'Nimbus Cloud Technologies',
    role: 'Software Development Engineer I (Cloud)',
    packageLPA: 16.5,
    status: 'Selected',
    appliedDate: '2026-10-02',
    interview: {
      date: '2026-10-26', // Falls between 22 Oct and 15 Nov 2026
      time: '10:00',
      mode: 'Google Meet',
      link: 'https://meet.google.com/priya-nimbus',
      notes: 'Selected for Cloud Storage Team.'
    }
  },
  {
    id: 'app-5',
    driveId: 'drv-1',
    studentId: 'stu-3',
    studentName: 'Karthik Subramanian',
    studentEmail: 'karthik.s@campus.edu',
    studentBranch: 'Information Technology',
    studentCGPA: 8.1,
    studentResumeUrl: 'Karthik_S_Resume.pdf',
    companyName: 'Nimbus Cloud Technologies',
    role: 'Software Development Engineer I (Cloud)',
    packageLPA: 16.5,
    status: 'Applied',
    appliedDate: '2026-10-04',
    interview: null
  },
  {
    id: 'app-6',
    driveId: 'drv-1',
    studentId: 'stu-4',
    studentName: 'Rohan Mehra',
    studentEmail: 'rohan.m@campus.edu',
    studentBranch: 'Electronics & Comm.',
    studentCGPA: 8.4,
    studentResumeUrl: 'Rohan_Mehra_Resume.pdf',
    companyName: 'Nimbus Cloud Technologies',
    role: 'Software Development Engineer I (Cloud)',
    packageLPA: 16.5,
    status: 'Rejected',
    appliedDate: '2026-10-03',
    interview: null
  },
  {
    id: 'app-7',
    driveId: 'drv-2',
    studentId: 'stu-5',
    studentName: 'Ananya Saxena',
    studentEmail: 'ananya.s@campus.edu',
    studentBranch: 'Computer Science',
    studentCGPA: 8.9,
    studentResumeUrl: 'Ananya_Saxena_Resume.pdf',
    companyName: 'Nimbus Cloud Technologies',
    role: 'Site Reliability & DevOps Engineer',
    packageLPA: 14.0,
    status: 'Shortlisted',
    appliedDate: '2026-10-06',
    interview: {
      date: '2026-10-29', // Falls between 22 Oct and 15 Nov 2026
      time: '16:00',
      mode: 'Microsoft Teams',
      link: 'https://teams.microsoft.com/l/meetup-join/ananya-devops',
      notes: 'Linux internals and container orchestration discussion.'
    }
  }
];

export const initialStudents = [
  {
    id: 'usr-student-1',
    name: 'Aarav Sharma',
    rollNo: 'CS22B042',
    email: 'student@campus.edu',
    branch: 'Computer Science',
    cgpa: 8.75,
    isPlaced: true,
    placedCompany: 'Deloitte Consulting',
    packageLPA: 10.5,
    offersCount: 1
  },
  {
    id: 'stu-2',
    name: 'Priya Nambiar',
    rollNo: 'CS22B008',
    email: 'priya.n@campus.edu',
    branch: 'Computer Science',
    cgpa: 9.2,
    isPlaced: true,
    placedCompany: 'Nimbus Cloud Technologies',
    packageLPA: 16.5,
    offersCount: 2
  },
  {
    id: 'stu-3',
    name: 'Karthik Subramanian',
    rollNo: 'IT22B014',
    email: 'karthik.s@campus.edu',
    branch: 'Information Technology',
    cgpa: 8.1,
    isPlaced: false,
    placedCompany: null,
    packageLPA: null,
    offersCount: 0
  },
  {
    id: 'stu-4',
    name: 'Rohan Mehra',
    rollNo: 'EC22B056',
    email: 'rohan.m@campus.edu',
    branch: 'Electronics & Comm.',
    cgpa: 8.4,
    isPlaced: false,
    placedCompany: null,
    packageLPA: null,
    offersCount: 0
  },
  {
    id: 'stu-5',
    name: 'Ananya Saxena',
    rollNo: 'CS22B019',
    email: 'ananya.s@campus.edu',
    branch: 'Computer Science',
    cgpa: 8.9,
    isPlaced: false,
    placedCompany: null,
    packageLPA: null,
    offersCount: 0
  },
  {
    id: 'stu-6',
    name: 'Devansh Joshi',
    rollNo: 'ME22B031',
    email: 'devansh.j@campus.edu',
    branch: 'Mechanical Engineering',
    cgpa: 7.8,
    isPlaced: true,
    placedCompany: 'Tata Advanced Systems',
    packageLPA: 8.5,
    offersCount: 1
  },
  {
    id: 'stu-7',
    name: 'Shreya Iyer',
    rollNo: 'EE22B022',
    email: 'shreya.i@campus.edu',
    branch: 'Electrical Engineering',
    cgpa: 8.65,
    isPlaced: true,
    placedCompany: 'Schneider Electric',
    packageLPA: 11.0,
    offersCount: 1
  },
  {
    id: 'stu-8',
    name: 'Nikhil Verma',
    rollNo: 'CE22B017',
    email: 'nikhil.v@campus.edu',
    branch: 'Civil Engineering',
    cgpa: 7.2,
    isPlaced: false,
    placedCompany: null,
    packageLPA: null,
    offersCount: 0
  },
  {
    id: 'stu-9',
    name: 'Sanya Mirza',
    rollNo: 'IT22B088',
    email: 'sanya.m@campus.edu',
    branch: 'Information Technology',
    cgpa: 8.8,
    isPlaced: true,
    placedCompany: 'Razorpay Systems',
    packageLPA: 18.0,
    offersCount: 2
  },
  {
    id: 'stu-10',
    name: 'Aditya Birla',
    rollNo: 'EC22B077',
    email: 'aditya.b@campus.edu',
    branch: 'Electronics & Comm.',
    cgpa: 7.9,
    isPlaced: true,
    placedCompany: 'Qualcomm India',
    packageLPA: 21.0,
    offersCount: 1
  }
];

// Helper to deep clone objects
function clone(val) {
  return JSON.parse(JSON.stringify(val));
}

/**
 * Load data from localStorage with in-memory fallback and safe try/catch error handling.
 * Seeds initial demo data if nothing is stored.
 */
export function loadStorage(key, fallback) {
  const fullKey = STORAGE_KEY_PREFIX + key;
  try {
    let item = null;
    if (typeof localStorage !== 'undefined') {
      item = localStorage.getItem(fullKey);
    }

    if (!item) {
      const initial = clone(fallback);
      saveStorage(key, initial);
      return initial;
    }

    const parsed = JSON.parse(item);

    // Auto-migrate dates to fall between 22 Oct 2026 and 15 Nov 2026
    if (key === 'applications' && Array.isArray(parsed)) {
      let modified = false;
      const minDate = new Date('2026-10-22');
      const maxDate = new Date('2026-11-15');

      parsed.forEach((app) => {
        if (app.interview && app.interview.date) {
          const d = new Date(app.interview.date);
          if (d < minDate || d > maxDate) {
            app.interview.date = app.status === 'Selected' ? '2026-10-25' : '2026-10-28';
            modified = true;
          }
        }
      });

      if (modified) {
        saveStorage(key, parsed);
      }
    }

    memoryStorage[fullKey] = parsed;
    return parsed;
  } catch (err) {
    console.warn(`[CampusHire Storage] Error reading key "${key}", falling back:`, err);
    return memoryStorage[fullKey] || clone(fallback);
  }
}

/**
 * Save data to localStorage with in-memory fallback and safe try/catch.
 */
export function saveStorage(key, value) {
  const fullKey = STORAGE_KEY_PREFIX + key;
  try {
    memoryStorage[fullKey] = clone(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(fullKey, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`[CampusHire Storage] Error saving key "${key}":`, err);
  }
}

/**
 * Reset all mock data to demo defaults and clear sessions
 */
export function resetAllStorage() {
  try {
    const keysToRemove = [
      'users',
      'companies',
      'drives',
      'applications',
      'students',
      'token',
      'user'
    ];

    if (typeof localStorage !== 'undefined') {
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(STORAGE_KEY_PREFIX + k);
        } catch {}
      });
    }

    // Clear memory storage
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);

    // Re-seed all fresh initial datasets
    saveStorage('users', clone(initialUsers));
    saveStorage('companies', clone(initialCompanies));
    saveStorage('drives', clone(initialDrives));
    saveStorage('applications', clone(initialApplications));
    saveStorage('students', clone(initialStudents));

    return true;
  } catch (err) {
    console.error('[CampusHire Storage] Reset failed:', err);
    return false;
  }
}
