import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { StatusBadge, PriorityBadge } from './Badges';
import { LoadingState, ErrorState } from './States';
import { formatDateTime, formatLocation } from '../utils/helpers';
import api from '../api/client';
import { toast } from './Toast';
import { Image, Clock, CheckCircle, RotateCcw } from 'lucide-react';

function StarRating({ value, onChange }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="star"
          style={{ color: n <= value ? '#f59e0b' : '#d1d5db' }}
          onClick={() => onChange && onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function IssueDetailModal({ issueId, onClose, onRefresh }) {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Feedback form state
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbRating, setFbRating] = useState(0);
  const [fbText, setFbText] = useState('');
  const [fbLoading, setFbLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/issues/${issueId}`);
      setIssue(data);
      setHistory(data.history || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (issueId) load(); }, [issueId]);

  const handleConfirmResolution = async (verified) => {
    if (verified && fbRating === 0) {
      toast('Please give a rating before confirming.', 'error');
      return;
    }
    setFbLoading(true);
    try {
      await api.patch(`/issues/${issueId}/feedback`, {
        verified,
        rating: fbRating || null,
        feedback: fbText || null,
      });
      toast(verified ? 'Issue closed successfully!' : 'Issue reopened.', 'success');
      setShowFeedback(false);
      onRefresh?.();
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setFbLoading(false);
    }
  };

  if (loading) return (
    <Modal title="Issue Details" onClose={onClose} size="lg">
      <LoadingState />
    </Modal>
  );

  if (error) return (
    <Modal title="Issue Details" onClose={onClose} size="lg">
      <ErrorState message={error} onRetry={load} />
    </Modal>
  );

  if (!issue) return null;

  const canGiveFeedback = issue.status === 'resolved' && !issue.student_verified;

  return (
    <Modal title={`Issue: ${issue.ticket_id}`} onClose={onClose} size="lg">
      {/* Status row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
        {issue.category && (
          <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
            {issue.category}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
          {issue.title}
        </div>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>{issue.description}</p>
      </div>

      <hr style={{ borderColor: 'var(--gray-100)', marginBottom: 20 }} />

      {/* Detail grid */}
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
          <span className="detail-label">Reported By</span>
          <span className="detail-value">{issue.reporter || '—'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Assigned To</span>
          <span className="detail-value">{issue.assigned_to || 'Unassigned'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Created</span>
          <span className="detail-value">{formatDateTime(issue.created_at)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Last Updated</span>
          <span className="detail-value">{formatDateTime(issue.updated_at)}</span>
        </div>
      </div>

      {/* Images */}
      {(issue.image || issue.resolution_image) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: issue.image && issue.resolution_image ? '1fr 1fr' : '1fr', gap: 12 }}>
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
        </div>
      )}

      {/* Resolution Notes */}
      {issue.resolution_notes && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
          <div className="detail-label" style={{ marginBottom: 6 }}>Resolution Notes</div>
          <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7 }}>{issue.resolution_notes}</p>
        </div>
      )}

      {/* Existing Feedback */}
      {issue.student_verified && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
          <div className="detail-label" style={{ marginBottom: 8, color: '#15803d' }}>Feedback Submitted</div>
          {issue.student_rating && <StarRating value={issue.student_rating} />}
          {issue.student_feedback && (
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 6 }}>{issue.student_feedback}</p>
          )}
        </div>
      )}

      {/* Feedback form */}
      {canGiveFeedback && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)', marginBottom: 12 }}>Verify Resolution</div>

          <div className="form-group">
            <label className="form-label">Rating *</label>
            <StarRating value={fbRating} onChange={setFbRating} />
          </div>

          <div className="form-group">
            <label className="form-label">Feedback (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Share your feedback about the resolution..."
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-primary"
              disabled={fbLoading}
              onClick={() => handleConfirmResolution(true)}
            >
              <CheckCircle size={15} />
              {fbLoading ? 'Saving...' : 'Confirm Resolved'}
            </button>
            <button
              className="btn btn-danger"
              disabled={fbLoading}
              onClick={() => handleConfirmResolution(false)}
            >
              <RotateCcw size={15} />
              Reopen Issue
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={15} />
            Issue History
          </div>
          <div className="timeline">
            {history.map((h, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot">
                  <StatusBadge status={h.status} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-status">
                    <StatusBadge status={h.status} />
                  </div>
                  {h.comment && <div className="timeline-comment">{h.comment}</div>}
                  <div className="timeline-time">{formatDateTime(h.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
