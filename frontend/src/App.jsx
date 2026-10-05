import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';

import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import MaintenanceDashboard from './pages/MaintenanceDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import './styles/global.css';

const ROLE_ROUTES = {
  student: '/student',
  faculty: '/faculty',
  maintenance: '/maintenance',
  administrator: '/admin',
};

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={ROLE_ROUTES[user.role] || '/login'}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>

          <Routes>

            {/* =========================
                PUBLIC ROUTES
            ========================== */}

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/register"
              element={<RegisterPage />}
            />

            {/* Landing Page */}
            <Route
              path="/"
              element={<LandingPage />}
            />


            {/* =========================
                STUDENT
            ========================== */}

            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />


            {/* =========================
                FACULTY
            ========================== */}

            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />


            {/* =========================
                MAINTENANCE
            ========================== */}

            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRoles={['maintenance']}>
                  <MaintenanceDashboard />
                </ProtectedRoute>
              }
            />


            {/* =========================
                ADMINISTRATOR
            ========================== */}

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['administrator']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />


            {/* =========================
                FALLBACK
            ========================== */}

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}