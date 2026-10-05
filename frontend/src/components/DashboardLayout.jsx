import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useAuth } from '../context/AuthContext';

const roleTheme = {
  student: 'theme-student',
  faculty: 'theme-faculty',
  maintenance: 'theme-maintenance',
  administrator: 'theme-admin',
};

export default function DashboardLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const theme = roleTheme[user?.role] || '';

  return (
    <div className={`app-layout ${theme}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content page-with-sidebar">
        <TopNav title={title} onMenuClick={() => setSidebarOpen(true)} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
