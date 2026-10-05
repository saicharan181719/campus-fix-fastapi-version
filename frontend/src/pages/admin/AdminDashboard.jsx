import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardContent from './AdminDashboardContent';
import AdminIssuesContent from './AdminIssuesContent';
import AdminUsersContent from './AdminUsersContent';
import AdminCategoriesContent from './AdminCategoriesContent';
import AdminLocationsContent from './AdminLocationsContent';

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Panel">
      <Routes>
        <Route index element={<AdminDashboardContent />} />
        <Route path="issues" element={<AdminIssuesContent />} />
        <Route path="users" element={<AdminUsersContent />} />
        <Route path="categories" element={<AdminCategoriesContent />} />
        <Route path="locations" element={<AdminLocationsContent />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
