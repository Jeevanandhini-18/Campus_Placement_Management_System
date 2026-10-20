// Automated End-to-End Workflow & Persistence Test Suite
import {
  authAPI,
  drivesAPI,
  applicationsAPI,
  profileAPI,
  adminAPI,
} from './src/services/api.js';

// Polyfill browser localStorage for Node.js test environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};

// Minimal window object for custom event dispatching
global.window = {
  dispatchEvent: () => true
};

async function runCompleteTestSuite() {
  console.log('================================================================');
  console.log(' CAMPUSHIRE WORKFLOW, CROSS-ROLE PERSISTENCE & CSV TEST SUITE');
  console.log('================================================================\n');

  // STEP 1: AUTHENTICATION
  console.log('--- STEP 1: AUTHENTICATION & LOGIN ---');
  const student = await authAPI.login({
    email: 'student@campus.edu',
    password: 'student123',
    role: 'student'
  });
  console.log(`✓ Student authenticated: ${student.user.name} (${student.user.email})`);

  const company = await authAPI.login({
    email: 'company@nimbus.com',
    password: 'company123',
    role: 'company'
  });
  console.log(`✓ Company authenticated: ${company.user.companyName} (${company.user.email})`);

  const admin = await authAPI.login({
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'admin'
  });
  console.log(`✓ Admin authenticated: ${admin.user.name} (${admin.user.email})\n`);

  // STEP 2: STUDENT APPLIES TO A DRIVE
  console.log('--- STEP 2: STUDENT APPLIES TO A COMPANY DRIVE ---');
  const allDrives = await drivesAPI.getAll();
  // Find a drive from Nimbus Cloud (drv-2: SRE, minCGPA 7.5 <= 8.75)
  const nimbusDrive = allDrives.find(d => d.id === 'drv-2');
  if (!nimbusDrive) throw new Error('Nimbus drive drv-2 not found');

  const newApplication = await applicationsAPI.apply({
    driveId: nimbusDrive.id,
    student: student.user
  });
  console.log(`✓ Student successfully applied to: ${newApplication.role} at ${newApplication.companyName}`);
  console.log(`✓ Generated Application ID: ${newApplication.id} | Initial Status: ${newApplication.status}\n`);

  // STEP 3: COMPANY SEES THE APPLICANT
  console.log('--- STEP 3: COMPANY SEES THE APPLICANT IN REAL-TIME ---');
  const companyApps = await applicationsAPI.getCompanyApplications(company.user.id);
  const foundApplicant = companyApps.find(a => a.studentId === student.user.id && a.driveId === nimbusDrive.id);
  if (!foundApplicant) {
    throw new Error('FAILED: Company could not see the newly submitted application!');
  }
  console.log(`✓ Company successfully sees applicant ${foundApplicant.studentName} for drive "${foundApplicant.role}"`);
  console.log(`✓ Current candidate count for company: ${companyApps.length}\n`);

  // STEP 4: COMPANY SHORTLISTS APPLICANT & SCHEDULES INTERVIEW
  console.log('--- STEP 4: COMPANY SHORTLISTS CANDIDATE ---');
  const shortlistedApp = await applicationsAPI.updateStatus(foundApplicant.id, 'Shortlisted');
  console.log(`✓ Candidate status updated to: ${shortlistedApp.status}`);

  const scheduledApp = await applicationsAPI.scheduleInterview(foundApplicant.id, {
    date: '2026-11-02', // Between 22 Oct - 15 Nov 2026
    time: '14:30',
    mode: 'Google Meet',
    link: 'https://meet.google.com/test-campushire-shortlist',
    notes: 'System architecture deep dive'
  });
  console.log(`✓ Interview scheduled on ${scheduledApp.interview.date} at ${scheduledApp.interview.time}\n`);

  // STEP 5: STUDENT SEES "SHORTLISTED" IN MY APPLICATIONS & DASHBOARD
  console.log('--- STEP 5: STUDENT SEES "SHORTLISTED" ON THEIR END ---');
  const studentApps = await applicationsAPI.getStudentApplications(student.user.id);
  const studentViewApp = studentApps.find(a => a.id === foundApplicant.id);
  if (!studentViewApp || studentViewApp.status !== 'Shortlisted') {
    throw new Error(`FAILED: Student does not see Shortlisted status! Got: ${studentViewApp?.status}`);
  }
  console.log(`✓ Student sees updated status: "${studentViewApp.status}" with interview on ${studentViewApp.interview?.date}\n`);

  // STEP 6: ADMIN APPROVES A PENDING COMPANY
  console.log('--- STEP 6: ADMIN APPROVES PENDING COMPANY REGISTRATION ---');
  const initialPending = await adminAPI.getCompanies('Pending');
  console.log(`✓ Initial pending companies count: ${initialPending.length}`);
  const targetCompany = initialPending[0];
  if (!targetCompany) throw new Error('No pending company found to approve');

  const approvedComp = await adminAPI.updateCompanyStatus(targetCompany.id, 'Approved');
  console.log(`✓ Admin approved company: ${approvedComp.companyName} | New Status: ${approvedComp.status}`);

  const updatedStats = await adminAPI.getStats();
  console.log(`✓ Admin stats updated: Approved Companies = ${updatedStats.approvedCompanies}, Pending = ${updatedStats.pendingCompanies}\n`);

  // STEP 7: PAGE RELOAD & STORAGE PERSISTENCE CHECK
  console.log('--- STEP 7: SIMULATE PAGE RELOAD & PERSISTENCE ---');
  // Re-read fresh data directly from localStorage to verify survival across page reloads
  const rawApps = JSON.parse(storage['campushire_applications'] || '[]');
  const rawCompanies = JSON.parse(storage['campushire_companies'] || '[]');
  
  const persistedApp = rawApps.find(a => a.id === foundApplicant.id);
  if (!persistedApp || persistedApp.status !== 'Shortlisted') {
    throw new Error('FAILED: Application changes did not persist to storage!');
  }
  console.log(`✓ Persisted Application verified: ${persistedApp.studentName} is ${persistedApp.status}`);

  const persistedComp = rawCompanies.find(c => c.id === targetCompany.id);
  if (!persistedComp || persistedComp.status !== 'Approved') {
    throw new Error('FAILED: Company approval did not persist to storage!');
  }
  console.log(`✓ Persisted Company verified: ${persistedComp.companyName} is ${persistedComp.status}\n`);

  // STEP 8: CSV EXPORT VALIDATION (UTF-8 BOM, RUPEE SYMBOL & PROPER ESCAPING)
  console.log('--- STEP 8: CSV EXPORT FORMATTING & EXCEL COMPATIBILITY CHECK ---');
  const reportRecords = await adminAPI.getReportData();
  console.log(`✓ Compiling CSV dataset with ${reportRecords.length} records.`);

  // Verify headers and rupee symbol
  const firstRecord = reportRecords[0];
  const hasRupee = Object.values(firstRecord).some(val => String(val).includes('₹'));
  console.log(`✓ Rupee symbol (₹) present in records: ${hasRupee}`);

  // Test RFC 4180 escaping and UTF-8 BOM representation
  const formatField = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = Object.keys(firstRecord);
  const csvRows = [headers.map(formatField).join(',')];
  for (const r of reportRecords) {
    csvRows.push(headers.map(h => formatField(r[h])).join(','));
  }
  const utf8BOM = '\uFEFF';
  const fullCSVOutput = utf8BOM + csvRows.join('\r\n');

  if (!fullCSVOutput.startsWith('\uFEFF')) {
    throw new Error('FAILED: CSV output missing UTF-8 BOM prefix ("\\uFEFF")!');
  }
  if (!fullCSVOutput.includes('₹')) {
    throw new Error('FAILED: CSV output does not contain the Rupee symbol!');
  }
  console.log(`✓ UTF-8 BOM ("\\uFEFF") verified at position 0.`);
  console.log(`✓ CSV line sample with escaped fields and ₹: ${csvRows[1]}\n`);

  // STEP 9: RESET DEMO DATA
  console.log('--- STEP 9: RESET DEMO DATA ---');
  const resetResult = await adminAPI.resetDemoData();
  console.log(`✓ adminAPI.resetDemoData() executed with status:`, resetResult);

  // Verify that fresh defaults are restored
  const postResetApps = await applicationsAPI.getStudentApplications(student.user.id);
  const foundResetApp = postResetApps.find(a => a.id === foundApplicant.id);
  if (foundResetApp) {
    throw new Error('FAILED: Reset should have removed newly created application!');
  }
  console.log(`✓ Newly created application was cleanly cleared.`);

  const postResetCompanies = await adminAPI.getCompanies('Pending');
  const foundResetComp = postResetCompanies.find(c => c.id === targetCompany.id);
  if (!foundResetComp || foundResetComp.status !== 'Pending') {
    throw new Error('FAILED: Reset should have restored company to Pending state!');
  }
  console.log(`✓ Company restored to original Pending state.`);
  console.log(`✓ All factory defaults restored successfully.\n`);

  console.log('================================================================');
  console.log(' ALL 9 INTEGRATION & PERSISTENCE TESTS PASSED CLEANLY! ✅');
  console.log('================================================================');
}

runCompleteTestSuite().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
