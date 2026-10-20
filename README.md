# CampusHire — College Placement Management System

CampusHire is a comprehensive, responsive, and modern frontend application for collegiate placement management built with **React**, **Vite**, **React Router**, **Tailwind CSS**, **Axios**, and **Recharts**.

It supports full role-based access control for **Students**, **Recruiting Companies**, and **Placement Officers (Admin)**, features light and dark mode, keyboard navigation with visible focus indicators, and includes an offline-first shared mock API layer with localStorage persistence and Excel-compatible CSV exports.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Build for Production
```bash
npm run build
npm run preview
```

### 4. Run Automated Workflow & Persistence Tests
```bash
npm run test:flows
```

---

## 👥 Demo Credentials

The login page includes **1-click quick-fill demo chips** for instant access:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `student123` | Aarav Sharma (CS, 8.75 CGPA) |
| **Company** | `company@nimbus.com` | `company123` | Sarah Jenkins (Nimbus Cloud Technologies) |
| **Placement Officer (Admin)** | `admin@campus.edu` | `admin123` | Dr. Rajesh Rao (Placement Director) |

---

## 📱 Modules & Features

### 🎓 1. Student Module
- **Dashboard**:
  - Live metric cards: Verified CGPA, Total Applications, Shortlisted count, and Eligible Drives to apply to.
  - **Offers & Selection Results Card**: Highlights confirmed placements with company name, offered CTC in LPA, and formal release notes.
  - Upcoming scheduled interviews tracker with date (strictly between 22 Oct - 15 Nov 2026), time slot, and meeting link.
- **Browse Placement Drives**:
  - Search by role title, company name, or keywords.
  - Filter by minimum CGPA cutoff and view eligible branches, CTC in LPA, and rounds.
  - **Dynamic Apply Button**:
    - Shows **"Applied"** (disabled) if already applied.
    - Shows **"Not eligible (Min X.X)"** (disabled) if the student's CGPA is below the minimum required.
    - Shows **"Apply Now"** with confirmation dialog for eligible drives.
- **My Applications**:
  - Complete application records table with status badges (`Applied`, `Shortlisted`, `Selected`, `Rejected`).
  - Interview round details modal with meeting link and preparation notes.
- **Student Profile**:
  - Edit personal details, engineering branch, and cumulative CGPA.
  - Technical skills tags editor.
  - **Resume PDF Upload**: File size checking (<5MB), format validation, preview of active document, and replace functionality.

### 🏢 2. Company Module
- **Dashboard**:
  - Active drives count, total candidates applied, shortlisted applicants, and upcoming interview slots.
  - Quick shortcuts to post drives and review candidates.
- **Post a Placement Drive**:
  - Form: Role title, package in LPA (₹), minimum CGPA cutoff, application deadline date, location/remote mode, and job description.
  - Multi-select checkboxes for eligible engineering branches.
  - Form validation with error alerts.
- **Manage Drives**:
  - List of company drives with applicant counters and status toggles (**Active** / **Closed**).
- **Manage Applicants**:
  - Shared candidate pipeline updated in real-time when students apply.
  - Instant action buttons: **Shortlist**, **Select**, and **Reject**.
  - **Schedule Interview Modal**: Pick date (between 22 Oct - 15 Nov 2026), time, meeting platform (Google Meet, Teams, Campus Hall), meeting URL, and instructions.

### 🏛️ 3. Placement Officer (Admin) Module
- **Overview Analytics**:
  - Stat cards: Total Students, Offers Released, Approved Companies, Active Drives, Average Package, and Placement Rate (%).
  - **Direct CSV Download**: 1-click export right from the Overview dashboard with UTF-8 BOM for Microsoft Excel compatibility.
  - **Recharts Bar Chart**: Offers by Engineering Branch (placed students vs total job offers).
  - **Placement Conversion Ratio Chart**: Visual breakdown of placed vs unplaced candidates.
- **Company Approvals**:
  - Review inbound recruiter company registrations.
  - **Approve** or **Reject** pending accounts with one click; updates dashboard counters and recruiter access immediately.
  - Segmented status tabs (`All`, `Pending`, `Approved`, `Rejected`).
- **Student Directory**:
  - Searchable directory of students across departments.
  - Filter by branch and placement status (**Placed** / **Unplaced**).
  - Displays placed company and package (LPA).
- **Official Placement Reports**:
  - **Download Placement Report (CSV)**: Shared RFC 4180 exporter that encodes the Rupee symbol (`₹`) properly for Excel.
- **Reset Demo Data**:
  - Admin button and confirmation modal to wipe custom applications, restore original factory presets, sign out active sessions, and reload data cleanly.

---

## 💾 Data Persistence & Shared Store
All mock data is managed centrally in [`src/services/mockData.js`](file:///c:/Users/shitu/OneDrive/Desktop/campus%20hire/src/services/mockData.js) and [`src/services/api.js`](file:///c:/Users/shitu/OneDrive/Desktop/campus%20hire/src/services/api.js):
- **Cross-Role Reactivity**: When a student applies, the company sees the application immediately. When the company shortlists or selects, the student's dashboard and the admin analytics update in sync.
- **Persistence Across Reloads**: Stored in `localStorage` with in-memory fallbacks and comprehensive `try/catch` wrappers.
- **Auto-Migration**: Normalizes dates so all scheduled interviews fall in the active recruitment window (22 Oct - 15 Nov 2026).

---

## 📊 CSV Export & Excel Compatibility
- Implemented in [`src/utils/exportCsv.js`](file:///c:/Users/shitu/OneDrive/Desktop/campus%20hire/src/utils/exportCsv.js).
- Prefixes content with the **UTF-8 Byte Order Mark (`\uFEFF`)** and MIME type `text/csv;charset=utf-8;`.
- Enforces RFC 4180 escaping (wraps fields with commas, quotes, or newlines in double quotes, and escapes inner quotes by doubling them `""`).
- Guarantees that the Indian Rupee symbol (`₹`) renders correctly in all versions of Microsoft Excel without garbled text.
