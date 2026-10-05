import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';
import { formatDate, formatLocation, formatDateTime } from '../utils/helpers';
import { Eye, Play, CheckCircle, Upload, ClipboardList, Clock, AlertCircle } from 'lucide-react';

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

function IssueDetailView({ issue, onClose, onAction }) {
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveImage, setResolveImage] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);

  const handleStartWork = async () => {
    setStarting(true);
    try {
      await api.patch(`/maintenance/issues/${issue.issue_id}/status?status=in_progress`);
      toast('Status updated to In Progress', 'success');
      onAction();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveNotes.trim()) { toast('Resolution notes are required', 'error'); return; }
    setResolving(true);
    try {
      const fd = new FormData();
      fd.append('resolution_notes', resolveNotes.trim());
      fd.append('status', 'resolved');
      if (resolveImage) fd.append('resolution_image', resolveImage);
      await api.patch(`/maintenance/issues/${issue.issue_id}/resolve`, fd, { isFormData: true });
      toast('Issue marked as resolved!', 'success');
      onAction();
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setResolving(false);
    }
  };

  return (
    <Modal title={`Issue: ${issue.ticket_id}`} onClose={onClose} size="lg">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
        {issue.category && (
          <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>{issue.category}</span>
        )}
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>{issue.title}</div>
      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 20 }}>{issue.description}</p>

      <hr style={{ borderColor: 'var(--gray-100)', marginBottom: 20 }} />

      <div className="detail-grid" style={{ marginBottom: 20 }}>
        <div className="detail-item">
          <span className="detail-label">Ticket ID</span>
          <span className="detail-value td-mono">{issue.ticket_id}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Location</span>
          <span className="detail-value">{formatLocation(issue.location)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Category</span>
          <span className="detail-value">{issue.category}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Created</span>
          <span className="detail-value">{formatDateTime(issue.created_at)}</span>
        </div>
      </div>

      {issue.image && (
        <div style={{ marginBottom: 20 }}>
          <div className="detail-label" style={{ marginBottom: 6 }}>Issue Image</div>
          <a href={issue.image} target="_blank" rel="noopener noreferrer">
            <img src={issue.image} alt="Issue" className="detail-image" />
          </a>
        </div>
      )}

      {/* Actions */}
      {issue.status === 'assigned' && (
        <div style={{ background: 'var(--maint-50)', border: '1px solid var(--maint-100)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--maint-600)', marginBottom: 10 }}>
            This issue is assigned to you. Start working on it?
          </p>
          <button className="btn btn-role" onClick={handleStartWork} disabled={starting}>
            <Play size={14} />
            {starting ? 'Updating...' : 'Start Work'}
          </button>
        </div>
      )}

      {(issue.status === 'in_progress' || issue.status === 'assigned') && !showResolveForm && (
        <button
          className="btn btn-primary"
          onClick={() => setShowResolveForm(true)}
          style={{ marginBottom: 16 }}
        >
          <CheckCircle size={14} />
          Mark as Resolved
        </button>
      )}

      {showResolveForm && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)', marginBottom: 12 }}>Resolution Details</div>
          <div className="form-group">
            <label className="form-label">Resolution Notes *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe what was done to fix the issue..."
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <Upload size={13} style={{ display: 'inline', marginRight: 4 }} />
              Resolution Image (optional)
            </label>
            <input
              type="file"
              className="form-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setResolveImage(e.target.files[0] || null)}
              style={{ padding: '7px 12px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleResolve} disabled={resolving}>
              <CheckCircle size={14} />
              {resolving ? 'Submitting...' : 'Submit Resolution'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowResolveForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {issue.resolution_notes && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: 16 }}>
          <div className="detail-label" style={{ color: '#15803d', marginBottom: 6 }}>Resolution Notes</div>
          <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{issue.resolution_notes}</p>
          {issue.resolution_image && (
            <a href={issue.resolution_image} target="_blank" rel="noopener noreferrer">
              <img src={issue.resolution_image} alt="Resolution" className="detail-image" style={{ marginTop: 10 }} />
            </a>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/maintenance/issues');
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
    pending: issues.filter((i) => ['assigned', 'reported'].includes(i.status)).length,
    inProgress: issues.filter((i) => i.status === 'in_progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  };

  const filtered = filter === 'all'
    ? issues
    : issues.filter((i) => i.status === filter);

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...filtered].sort((a, b) =>
    (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
  );

  return (
    <DashboardLayout title="Maintenance Dashboard">
      <div className="welcome-section">
        <div>
          <div className="welcome-greeting">Welcome back 👋</div>
          <div className="welcome-name">{user?.username}</div>
          <div className="welcome-desc">Manage your assigned maintenance tasks</div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Total Assigned" value={stats.total} icon={ClipboardList} color="var(--maint-400)" />
        <StatCard label="Pending" value={stats.pending} icon={AlertCircle} color="#ef4444" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="#D99032" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="#4F9F8A" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Assigned Issues</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'assigned', 'in_progress', 'resolved'].map((f) => (
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
        ) : sorted.length === 0 ? (
          <EmptyState icon="✅" title="No issues" desc="No assigned issues to show." />
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
                {sorted.map((issue) => (
                  <tr key={issue.issue_id} style={
                    issue.priority === 'critical' ? { background: '#fef2f2' } :
                    issue.priority === 'high' ? { background: '#fff7ed' } : {}
                  }>
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
                        title="View & Act"
                        onClick={() => setSelectedIssue(issue)}
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

      {selectedIssue && (
        <IssueDetailView
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onAction={load}
        />
      )}
    </DashboardLayout>
  );
}
