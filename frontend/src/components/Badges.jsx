import React from 'react';

const STATUS_LABELS = {
  reported: 'Reported',
  assigned: 'Assigned',
  reviewed: 'Reviewed',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  reopened: 'Reopened',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge badge-${priority}`}>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export function RoleBadge({ role }) {
  const labels = {
    student: 'Student',
    faculty: 'Faculty',
    maintenance: 'Maintenance',
    administrator: 'Admin',
  };
  return (
    <span className={`badge badge-${role}`}>
      {labels[role] || role}
    </span>
  );
}

export function ActiveBadge({ isActive }) {
  return isActive ? (
    <span className="badge" style={{ background: '#f0fdf4', color: '#15803d' }}>Active</span>
  ) : (
    <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c' }}>Inactive</span>
  );
}
