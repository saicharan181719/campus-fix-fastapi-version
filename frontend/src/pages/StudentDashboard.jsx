import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import IssueDetailModal from '../components/IssueDetailModal';
import ReportIssueModal from '../components/ReportIssueModal';
import { formatDate, formatLocation } from '../utils/helpers';
import { Plus, FileText, AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/issues/');
      setIssues(data.issues || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total: issues.length,
    open: issues.filter((i) => ['reported', 'assigned', 'reviewed', 'reopened'].includes(i.status)).length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    closed: issues.filter((i) => i.status === 'closed').length,
  };

  const filtered = filter === 'all'
    ? issues
    : issues.filter((i) => i.status === filter || (filter === 'open' && ['reported', 'assigned', 'reviewed', 'reopened'].includes(i.status)));

  return (
    <DashboardLayout title="Student Dashboard">
      {/* Welcome */}
      <div className="welcome-section">
        <div>
          <div className="welcome-greeting">Welcome back 👋</div>
          <div className="welcome-name">{user?.username}</div>
          <div className="welcome-desc">Track and manage your campus issue reports</div>
        </div>
        <button
          className="btn btn-role"
          id="report-new-issue-btn"
          onClick={() => setShowReport(true)}
          style={{ flexShrink: 0 }}
        >
          <Plus size={16} />
          Report Issue
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Total Issues" value={stats.total} icon={FileText} color="var(--student-400)" />
        <StatCard label="Open Issues" value={stats.open} icon={AlertCircle} color="#4F7CFF" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="#4F9F8A" />
        <StatCard label="Closed" value={stats.closed} icon={XCircle} color="var(--gray-500)" />
      </div>

      {/* Issues Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">My Reported Issues</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No issues found"
            desc={filter === 'all' ? "You haven't reported any issues yet." : `No ${filter} issues.`}
            action={
              filter === 'all' && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowReport(true)}>
                  <Plus size={14} /> Report your first issue
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue) => (
                  <tr key={issue.issue_id}>
                    <td className="td-mono td-bold">{issue.ticket_id}</td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontWeight: 500, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {issue.title}
                      </div>
                    </td>
                    <td>{issue.category}</td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{formatLocation(issue.location)}</td>
                    <td><PriorityBadge priority={issue.priority} /></td>
                    <td><StatusBadge status={issue.status} /></td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{formatDate(issue.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        title="View Details"
                        onClick={() => setSelectedIssueId(issue.issue_id)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedIssueId && (
        <IssueDetailModal
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onRefresh={load}
        />
      )}

      {showReport && (
        <ReportIssueModal
          onClose={() => setShowReport(false)}
          onSuccess={load}
        />
      )}
    </DashboardLayout>
  );
}
