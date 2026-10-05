import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, AlertCircle, Users, Tag, MapPin,
  LogOut, Menu, X, Settings, ClipboardList, Wrench
} from 'lucide-react';

const roleTheme = {
  student: 'theme-student',
  faculty: 'theme-faculty',
  maintenance: 'theme-maintenance',
  administrator: 'theme-admin',
};

const roleLabel = {
  student: 'Student Portal',
  faculty: 'Faculty Portal',
  maintenance: 'Maintenance',
  administrator: 'Admin Panel',
};

const navConfig = {
  student: [
    { label: 'Dashboard', to: '/student', icon: LayoutDashboard },
  ],
  faculty: [
    { label: 'Dashboard', to: '/faculty', icon: LayoutDashboard },
  ],
  maintenance: [
    { label: 'My Work Queue', to: '/maintenance', icon: ClipboardList },
  ],
  administrator: [
    { label: 'Dashboard', to: '/admin', end: true, icon: LayoutDashboard },
    { group: 'MANAGEMENT' },
    { label: 'Issues', to: '/admin/issues', icon: AlertCircle },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Categories', to: '/admin/categories', icon: Tag },
    { label: 'Locations', to: '/admin/locations', icon: MapPin },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const theme = roleTheme[user.role] || '';
  const label = roleLabel[user.role] || user.role;
  const nav = navConfig[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <>
      <aside className={`sidebar ${theme} ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="sidebar-brand-name">Campus Fix</div>
              <div className="sidebar-brand-role">{label}</div>
            </div>
            <button className="btn btn-icon btn-ghost hamburger-btn" style={{ display: 'flex' }} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="topnav-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{user.username}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map((item, i) => {
            if (item.group) {
              return <div key={i} className="sidebar-section-label">{item.group}</div>;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--gray-500)' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      <div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={onClose} />
    </>
  );
}
