import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Protected Route
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseDrives from './pages/student/BrowseDrives';
import MyApplications from './pages/student/MyApplications';
import StudentProfile from './pages/student/StudentProfile';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import PostDrive from './pages/company/PostDrive';
import ManageDrives from './pages/company/ManageDrives';
import ManageApplicants from './pages/company/ManageApplicants';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCompanies from './pages/admin/ManageCompanies';
import ManageStudents from './pages/admin/ManageStudents';
import ReportsPage from './pages/admin/ReportsPage';

// Not Found
import NotFoundPage from './pages/NotFoundPage';

// Root redirect component
function RootRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading CampusHire..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (role === 'company') return <Navigate to="/company/dashboard" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="drives" element={<BrowseDrives />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Company Protected Routes */}
      <Route
        path="/company"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/company/dashboard" replace />} />
        <Route path="dashboard" element={<CompanyDashboard />} />
        <Route path="post-drive" element={<PostDrive />} />
        <Route path="drives" element={<ManageDrives />} />
        <Route path="applicants" element={<ManageApplicants />} />
      </Route>

      {/* Placement Officer (Admin) Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="companies" element={<ManageCompanies />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <AppLayout>
            <NotFoundPage />
          </AppLayout>
        }
      />
    </Routes>
  );
}
