import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { formatDate, formatLocation } from '../../utils/helpers';
import { Eye, Search, X } from 'lucide-react';
import AdminIssueDetailModal from './AdminIssueDetailModal';

const STATUSES = ['reported', 'reviewed', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function AdminIssuesContent() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/issues-data');
      setIssues(data.issues || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = issues.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.ticket_id?.toLowerCase().includes(q) || i.title?.toLowerCase().includes(q) || i.reporter?.toLowerCase().includes(q) || i.assigned_to?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || i.status === statusFilter;
    const matchPriority = !priorityFilter || i.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); };
  const hasFilters = search || statusFilter || priorityFilter;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Issue Management</div>
        <div className="page-subtitle">View, filter, and manage all campus issues</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">All Issues ({filtered.length})</div>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <div className="filters-row">
            <div className="search-input-wrap">
              <Search size={15} className="search-icon" />
              <input
                className="form-input"
                placeholder="Search ticket, title, reporter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ width: 160 }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No issues found" desc={hasFilters ? 'Try adjusting your filters.' : 'No issues have been reported yet.'} />
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
                  <th>Reporter</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Actions</th>
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
                    <td style={{ fontSize: 13 }}>{issue.category}</td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatLocation(issue.location)}
                    </td>
                    <td><PriorityBadge priority={issue.priority} /></td>
                    <td><StatusBadge status={issue.status} /></td>
                    <td style={{ fontSize: 13 }}>{issue.reporter}</td>
                    <td style={{ fontSize: 13 }}>
                      {issue.assigned_to || <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{formatDate(issue.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        title="View Details"
                        onClick={() => setSelectedIssueId(issue.issue_id)}
                      >
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
