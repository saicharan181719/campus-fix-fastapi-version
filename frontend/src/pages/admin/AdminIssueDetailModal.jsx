import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { LoadingState, ErrorState } from '../../components/States';
import { formatDateTime, formatLocation } from '../../utils/helpers';
import api from '../../api/client';
import { toast } from '../../components/Toast';
import { Clock } from 'lucide-react';

const STATUSES = ['reported', 'reviewed', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function AdminIssueDetailModal({ issueId, onClose, onRefresh }) {
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [maintUsers, setMaintUsers] = useState([]);

  // Action states
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [allIssues, maintData, histData] = await Promise.all([
        api.get('/admin/issues-data'),
        api.get('/admin/maintenance-users'),
        api.get(`/issues/${issueId}/history`).catch(() => ({ history: [] })),
      ]);

      const found = (allIssues.issues || []).find((i) => i.issue_id === issueId);
      if (!found) throw new Error('Issue not found');
      setIssue(found);
      setNewStatus(found.status);
      setNewPriority(found.priority);
      setNewAssignee(found.assigned_to_id || '');
      setMaintUsers(maintData.users || []);
      setHistory(histData.history || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (issueId) load(); }, [issueId]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/issues/${issueId}`, {
        status: newStatus !== issue.status ? newStatus : undefined,
        priority: newPriority !== issue.priority ? newPriority : undefined,
      });
      toast('Issue updated successfully!', 'success');
      onRefresh?.();
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!newAssignee) { toast('Select a maintenance user first.', 'error'); return; }
    setAssigning(true);
    try {
      await api.post(`/admin/issues/${issueId}/assign/${newAssignee}`);
      toast('Issue assigned successfully!', 'success');
      onRefresh?.();
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <Modal title="Issue Details" onClose={onClose} size="xl"><LoadingState /></Modal>;
  if (error) return <Modal title="Issue Details" onClose={onClose} size="xl"><ErrorState message={error} onRetry={load} /></Modal>;
  if (!issue) return null;

  return (
    <Modal title={`Issue: ${issue.ticket_id}`} onClose={onClose} size="xl">
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Left - Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>{issue.category}</span>
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>{issue.title}</div>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 20 }}>{issue.description}</p>

          <hr style={{ borderColor: 'var(--gray-100)', marginBottom: 20 }} />

          <div className="detail-grid" style={{ marginBottom: 20 }}>
            <div className="detail-item">
              <span className="detail-label">Reporter</span>
              <span className="detail-value">{issue.reporter}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned To</span>
              <span className="detail-value">{issue.assigned_to || 'Unassigned'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-value">{formatLocation(issue.location)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">{formatDateTime(issue.created_at)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Updated</span>
              <span className="detail-value">{formatDateTime(issue.updated_at)}</span>
            </div>
          </div>

          {/* Images */}
          {(issue.image || issue.resolution_image) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {issue.image && (
                <div>
                  <div className="detail-label" style={{ marginBottom: 6 }}>Issue Image</div>
                  <a href={issue.image} target="_blank" rel="noopener noreferrer">
                    <img src={issue.image} alt="Issue" className="detail-image" />
                  </a>
                </div>
              )}
              {issue.resolution_image && (
                <div>
                  <div className="detail-label" style={{ marginBottom: 6 }}>Resolution Image</div>
                  <a href={issue.resolution_image} target="_blank" rel="noopener noreferrer">
                    <img src={issue.resolution_image} alt="Resolution" className="detail-image" />
                  </a>
                </div>
              )}
            </div>
          )}

          {issue.resolution_notes && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
              <div className="detail-label" style={{ color: '#15803d', marginBottom: 4 }}>Resolution Notes</div>
              <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>{issue.resolution_notes}</p>
            </div>
          )}

          {issue.student_feedback && (
            <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
              <div className="detail-label" style={{ marginBottom: 4 }}>
                {issue.student_rating && `⭐ ${issue.student_rating}/5 — `}Reporter Feedback
              </div>
              <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>{issue.student_feedback}</p>
            </div>
          )}

          {/* Timeline */}
          {history.length > 0 && (
            <>
              <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} /> Issue History
              </div>
              <div className="timeline">
                {history.map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot">
                      <span style={{ fontSize: 10 }}>●</span>
                    </div>
                    <div className="timeline-content">
                      <div style={{ marginBottom: 2 }}><StatusBadge status={h.status} /></div>
                      {h.comment && <div className="timeline-comment">{h.comment}</div>}
                      <div className="timeline-time">{formatDateTime(h.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right - Admin Actions */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <div style={{ fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>Admin Actions</div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Update Issue'}
            </button>

            <hr style={{ borderColor: 'var(--gray-200)', marginBottom: 16 }} />

            <div style={{ fontWeight: 600, color: 'var(--gray-800)', marginBottom: 10, fontSize: 13 }}>Assign Maintenance</div>
            <div className="form-group">
              <label className="form-label">Maintenance User</label>
              <select className="form-select" value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
                <option value="">Select user...</option>
                {maintUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.specialization?.replace('_', '/') || 'General'})
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleAssign} disabled={assigning}>
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
