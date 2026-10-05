import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { RoleBadge, ActiveBadge } from '../../components/Badges';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import { UserPlus, Edit2, Search } from 'lucide-react';
import { specLabel } from '../../utils/helpers';

const ROLES = ['student', 'faculty', 'maintenance', 'administrator'];
const SPECIALIZATIONS = ['electrical', 'plumbing', 'cleaning', 'wifi_it', 'classroom_equipment', 'security', 'other'];

function UserFormModal({ user, onClose, onSuccess }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
    specialization: user?.specialization || '',
    is_active: user?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!isEdit && !form.username.trim()) errs.username = 'Required';
    if (!isEdit && !form.email.trim()) errs.email = 'Required';
    if (!isEdit && !form.password.trim()) errs.password = 'Required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/users/${user.id}`, {
          role: form.role,
          specialization: form.role === 'maintenance' ? form.specialization || undefined : null,
          is_active: form.is_active,
        });
      } else {
        await api.post('/admin/users', {
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
          specialization: form.role === 'maintenance' ? form.specialization || undefined : undefined,
        });
      }
      toast(`User ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
      onSuccess?.();
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit User: ${user.username}` : 'Create New User'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </>
      }
    >
      {!isEdit && (
        <>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input className="form-input" name="username" value={form.username} onChange={handleChange} placeholder="Username" />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
        </>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" name="role" value={form.role} onChange={handleChange}>
            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>

        {form.role === 'maintenance' && (
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <select className="form-select" name="specialization" value={form.specialization} onChange={handleChange}>
              <option value="">Select...</option>
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{specLabel(s)}</option>)}
            </select>
          </div>
        )}
      </div>

      {isEdit && (
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleChange} style={{ width: 16, height: 16 }} />
          <label htmlFor="is_active" className="form-label" style={{ margin: 0 }}>Active</label>
        </div>
      )}
    </Modal>
  );
}

export default function AdminUsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/users-data');
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-title">User Management</div>
            <div className="page-subtitle">Create and manage user accounts</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <UserPlus size={14} />
            Add User
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">All Users ({filtered.length})</div>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <div className="filters-row">
            <div className="search-input-wrap">
              <Search size={15} className="search-icon" />
              <input
                className="form-input"
                placeholder="Search username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 160 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title="No users found" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{u.id}</td>
                    <td className="td-bold">{u.username}</td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td style={{ fontSize: 13 }}>{specLabel(u.specialization)}</td>
                    <td><ActiveBadge isActive={u.is_active} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setEditUser(u)}>
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <UserFormModal onClose={() => setShowCreate(false)} onSuccess={load} />
      )}

      {editUser && (
        <UserFormModal user={editUser} onClose={() => setEditUser(null)} onSuccess={load} />
      )}
    </>
  );
}
