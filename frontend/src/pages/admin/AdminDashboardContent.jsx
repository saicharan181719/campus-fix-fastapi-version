import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { formatDate, formatLocation } from '../../utils/helpers';
import { FileText, AlertCircle, Clock, CheckCircle, Eye } from 'lucide-react';
import AdminIssueDetailModal from './AdminIssueDetailModal';

function StatCard({ label, value, icon: Icon, color, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {note && <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{note}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashData, issueData] = await Promise.all([
        api.get('/admin/dashboard-data'),
        api.get('/admin/issues-data'),
      ]);
      setStats(dashData);
      setRecentIssues((issueData.issues || []).slice(0, 10));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      {/* Welcome */}
      <div className="welcome-section" style={{ marginBottom: 24 }}>
        <div>
          <div className="welcome-greeting">Administrator Overview</div>
          <div className="welcome-name">Campus Fix Control Center</div>
          <div className="welcome-desc">Monitor and manage all campus issues in real time</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Total Issues" value={stats?.total_issues ?? 0} icon={FileText} color="var(--admin-400)" />
        <StatCard label="Open Issues" value={stats?.open_issues ?? 0} icon={AlertCircle} color="#ef4444" note="Reported, Assigned, Reopened" />
        <StatCard label="In Progress" value={stats?.in_progress_issues ?? 0} icon={Clock} color="#D99032" />
        <StatCard label="Resolved / Closed" value={stats?.resolved_issues ?? 0} icon={CheckCircle} color="#4F9F8A" />
      </div>

      {/* Recent Issues */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Issues</div>
        </div>
        {recentIssues.length === 0 ? (
          <EmptyState icon="📋" title="No issues yet" desc="Issues reported by students and faculty will appear here." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Assigned</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.map((issue) => (
                  <tr key={issue.issue_id}>
                    <td className="td-mono td-bold">{issue.ticket_id}</td>
                    <td style={{ maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--gray-900)' }}>
                        {issue.title}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{issue.category}</td>
                    <td><PriorityBadge priority={issue.priority} /></td>
                    <td><StatusBadge status={issue.status} /></td>
                    <td style={{ fontSize: 13 }}>{issue.reporter}</td>
                    <td style={{ fontSize: 13 }}>{issue.assigned_to || <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{formatDate(issue.created_at)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelectedIssueId(issue.issue_id)}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedIssueId && (
        <AdminIssueDetailModal
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onRefresh={load}
        />
      )}
    </>
  );
}
