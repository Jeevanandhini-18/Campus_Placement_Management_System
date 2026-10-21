# AI-Powered Campus Placement Management and Recommendation System — Frontend

A production-grade, responsive, and accessible enterprise frontend for a college Training & Placement Cell. Built strictly using **HTML5, CSS3, and Vanilla JavaScript (ES6+)** with **Fetch API** for REST communication with a Spring Boot backend secured by JWT.

---

## 1. Architectural Highlights

- **Pure Vanilla Stack**: Zero framework dependencies (no React, Angular, Vue, Next.js, or TypeScript). Zero build tools required.
- **Dedicated Company Folders**: Every recruiting company possesses its own logical folder backed by database IDs (`company-folder.html?id=...`). The folder acts as an all-in-one workspace unifying:
  1. **Company Overview** (metrics, description, recruitment contacts).
  2. **Recruitment Drives** (associated job openings, CTC, deadlines, status).
  3. **Job Descriptions & Documents** (PDF/DOCX uploads, AI extraction, staff review/verify).
  4. **Eligibility Criteria** (CGPA cutoffs, backlog restrictions, department filters).
  5. **Recruitment Stages & Timeline** (stage pipeline from application to final offer).
  6. **Applications & Activity** (candidate progress and status updating for authorized staff).
  7. **Folder Actions** (add drive for this company, edit company, upload JD, deactivate).
- **Role-Based Access Control**:
  - `PLACEMENT_OFFICER`: Institutional placement statistics, policy configuration, dream job rules, company & drive administration, and final placement confirmation.
  - `PLACEMENT_COORDINATOR`: Company folder management, drive creation, AI JD summary review, round status updates.
  - `STUDENT`: Profile & CGPA maintenance, PDF/DOCX resume upload with AI skill extraction, eligibility checks, explainable resume–JD matching, AI opportunity recommendations, and application tracking.
- **Security & Integrity**: JWT authentication via `sessionStorage` (cleared upon tab close). Strict HTML entity escaping (`Utils.escapeHtml`) to prevent Cross-Site Scripting (XSS). No database credentials or AI API keys in frontend code.

---

## 2. Directory Structure

```text
frontend/
├── index.html                  # Portal landing & role selection
├── login.html                  # Authentication with 1-click test role autofill
├── register.html               # Student academic registration
├── officer-dashboard.html      # TPO dashboard & institutional analytics
├── coordinator-dashboard.html  # Placement coordinator drive management
├── student-dashboard.html      # Student dashboard & AI recommendations preview
├── companies.html              # Company directory & folder launcher (Grid/Table)
├── company-folder.html         # Mandatory dedicated company folder workspace
├── drive-list.html             # Recruitment drives directory with search/filters
├── drive-details.html          # Drive details, eligibility check & 1-click apply
├── student-profile.html        # Academic profile, CGPA, backlogs, skills tagger
├── resume-analysis.html        # Resume upload (PDF/DOCX) & AI NLP skills parser
├── eligibility.html            # Authoritative criteria-by-criteria check
├── match-results.html          # Deep AI Resume–JD semantic compatibility analysis
├── recommendations.html        # Ranked smart recommendations with sorting
├── applications.html           # Dual-role tracker (student view & staff review table)
├── placement-management.html   # Placement policy engine & final placed registry
├── css/
│   ├── variables.css           # Design tokens, color palette, radii, shadows
│   ├── base.css                # CSS reset, typography, accessible focus states
│   ├── layout.css              # App shell, responsive sidebar, topbar, breadcrumbs
│   ├── components.css          # Buttons, forms, badges, modals, toasts, tables, dropzones
│   ├── dashboard.css           # Stats grid, meters, activity stream, recommendation cards
│   ├── company-folders.css     # Dedicated folder hero banner, tabs, pipelines
│   └── responsive.css          # Breakpoints for desktop, tablet, and mobile drawer
├── js/
│   ├── config.js               # Centralized API base URL, endpoints & roles
│   ├── utils.js                # XSS escaping, date/currency formatting, badges
│   ├── api.js                  # Centralized Fetch wrapper, JWT bearer, multipart, error handling
│   ├── auth.js                 # Session management, login, register, logout, role checking
│   ├── guards.js               # Route guards & DOM element role filtering
│   ├── layout.js               # Dynamic sidebar, topbar, user badge, breadcrumb generator
│   ├── components.js           # Toast notifications, accessible Modals, ConfirmDialog
│   ├── validation.js           # Client-side input and file validation
│   ├── companies.js            # Company list, search, filter, creation modal
│   ├── company-folder.js       # Complete logic for dedicated company folders
│   ├── drives.js               # Drive listing, details, creation, lifecycle actions
│   ├── job-descriptions.js     # Multipart PDF/DOCX JD upload & AI summary review
│   ├── students.js             # Student academic profile viewing and editing
│   ├── resumes.js              # Resume upload & AI-extracted skill viewing
│   ├── eligibility.js          # Authoritative eligibility breakdown
│   ├── matching.js             # Resume–JD match score (0-100%) and skill gaps
│   ├── recommendations.js      # Ranked opportunities by AI matching engine
│   ├── applications.js         # Student application submissions & coordinator tracking
│   └── placement.js            # Final placement confirmation & policy settings
└── README.md
```

---

## 3. Quick Start & Setup

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari).
- A local HTTP server (such as Python, Node.js `serve`, or VS Code Live Server).

### 1. Configure the Backend URL
Open `js/config.js` and ensure `API_BASE` points to your running Spring Boot server:
```javascript
const CONFIG = {
  API_BASE: window.API_BASE_OVERRIDE || 'http://localhost:8080',
  // ...
};
```

### 2. Configure Spring Boot Backend CORS
Ensure your Spring Boot backend allows requests from your frontend origin (e.g. `http://localhost:5500` or `http://127.0.0.1:5500`):
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5500", "http://127.0.0.1:5500")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 3. Serve the Application
From the `frontend` folder, run a local web server:

**Using Python:**
```bash
python -m http.server 5500
```

**Using Node.js:**
```bash
npx serve -l 5500
```

Open your browser and navigate to:
**[http://localhost:5500](http://localhost:5500)**

---

## 4. Test User Credentials

The login screen (`login.html`) features **1-click autofill buttons** for rapid testing:

| Role | Email | Password | Intended Workflow |
| :--- | :--- | :--- | :--- |
| **Placement Officer** | `officer@campus.edu` | `admin123` | Institutional dashboard, company folders, drives, policy enforcement, final placement confirmations |
| **Placement Coordinator** | `coordinator@campus.edu` | `coord123` | Day-to-day folder operations, JD upload & AI verification, application round progress |
| **Student Candidate** | `student@campus.edu` | `student123` | Academic profile, resume parsing, eligibility checks, AI match scores, recommendations, 1-click apply |

---

## 5. Implementation Summary Across Core Use Cases

### Use Case 1: Centralized Placement Management, Company Folders & AI JD Processing
- **Dedicated Company Folders**: Every company has a permanent logical folder (`company-folder.html?id=X`) preserving relationships across drives, documents, eligibility rules, stages, and applications.
- **Company Management**: Card grid and table views, live search, location filter, creation modal with backend duplicate validation, deactivation action.
- **Drive Management**: Full lifecycle management (`DRAFT`, `PUBLISHED`, `CLOSED`, `CANCELLED`). Drives can be created both globally and directly within a specific company folder.
- **AI JD Processing**: Drag-and-drop PDF and DOCX uploads via `FormData`, parsing status indicator, structured summary extraction (role, responsibilities, salary, skills, stages), and staff review/verification.

### Use Case 2: Student Profiles, Eligibility Checking & AI Resume–JD Matching
- **Student Profile**: Editable CGPA, active backlogs, department, graduation year, and an interactive skills tagger with dynamic completion percentage calculation.
- **Resume Upload & AI Parsing**: PDF/DOCX file upload, file validation (type & size <= 10MB), display of extracted skills, education, and relevant projects. Includes a retry button.
- **Authoritative Eligibility Check**: Criteria-by-criteria evaluation comparing student CGPA, backlogs, department, and batch against drive rules with detailed pass/fail feedback.
- **Resume–JD Compatibility**: Visual radial meter (0–100%), color-coded skill badges (matched, partial, missing, preferred), and an explainable narrative. Clearly indicates that high match scores do not override failed eligibility.

### Use Case 3: Smart Recommendations, Applications & Placement Rules
- **AI Recommendation Engine**: Drives ranked by match percentage and eligibility. Sortable by score, CTC, and urgency of deadline.
- **Drive Details & 1-Click Apply**: Complete JD view, requirements, eligibility check, confirmation dialog, duplicate-submission prevention, and deadline validation.
- **Application Tracking**: Real-time progress tracker for students across recruitment stages (`APPLIED`, `SHORTLISTED`, `SELECTED`, `REJECTED`, `WITHDRAWN`).
- **Coordinator Round Management**: Staff table grouped by drive with applicant search, stage status updates, and audit timestamps.
- **Placement Rules & Policies**: Placement officer interface to define dream job thresholds, maximum offers per student, auto-freeze policies, and official confirmation of placed students.

---

## 6. API Integration Report & Missing Backend Endpoints

The frontend integrates with standard Spring Boot REST conventions. Where specific aggregated endpoints may vary, the frontend includes graceful fallbacks:

| Frontend Feature | Primary Endpoint | Fallback / Behavior when Missing |
| :--- | :--- | :--- |
| **Login & JWT** | `POST /api/auth/login` | Decodes JWT payload if role or name is not returned in the JSON body |
| **Registration** | `POST /api/auth/register` | Displays backend duplicate-email validation errors |
| **Company Folders** | `GET /api/companies/{id}` | Displays error banner with retry button |
| **Company Drives** | `GET /api/companies/{id}/drives` | Falls back to `GET /api/drives?companyId={id}` |
| **Dashboard Stats** | `GET /api/dashboard/stats` | Automatically aggregates counts from `/api/companies`, `/api/drives`, and `/api/placement/records` |
| **AI JD Upload** | `POST /api/drives/{id}/jd` | Multipart `file` upload |
| **AI JD Summary** | `GET /api/drives/{id}/jd/summary` | Falls back to drive's extracted description and skills |
| **Save Verified Summary** | `PUT /api/drives/{id}/jd/summary` | Sends verified fields `{ role, responsibilities, requiredSkills, preferredSkills, verified: true }` |
| **Eligibility Check** | `GET /api/students/me/eligibility/{driveId}` | Evaluates client-side against student profile if endpoint is pending implementation |
| **Resume AI Analysis** | `POST /api/students/me/resume` | Multipart upload for `.pdf` and `.docx` |
| **Placement Policies** | `GET /api/placement-policy` | Defaults to institutional standard (2 offers, 10 LPA dream threshold) |
| **Final Placement** | `PUT /api/students/{id}/placement-status` | Records confirmation and updates placement registry |

---

## 7. Verification & Testing

Every file and feature was constructed with proper error handling, accessible markup, responsive breakpoints, and role guards.
When running against a live backend, ensure Spring Boot is running on port 8080 or configure `CONFIG.API_BASE` accordingly.
