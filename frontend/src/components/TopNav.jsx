import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleTheme = {
  student: 'theme-student',
  faculty: 'theme-faculty',
  maintenance: 'theme-maintenance',
  administrator: 'theme-admin',
};

export default function TopNav({ title, onMenuClick }) {
  const { user } = useAuth();
  if (!user) return null;

  const initials = user.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <header className={`topnav ${roleTheme[user.role] || ''}`}>
      <div className="topnav-left">
        <button className="btn btn-icon btn-ghost hamburger-btn" onClick={onMenuClick} aria-label="Menu">
          <Menu size={18} />
        </button>
        {title && <span className="topnav-title">{title}</span>}
      </div>
      <div className="topnav-right">
        <div className="topnav-user">
          <span style={{ fontSize: 13 }}>{user.username}</span>
          <div className="topnav-avatar">{initials}</div>
        </div>
      </div>
    </header>
  );
}
