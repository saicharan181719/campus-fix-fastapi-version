import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

function LocationFormModal({ location, onClose, onSuccess }) {
  const isEdit = Boolean(location);
  const [form, setForm] = useState({
    block: location?.block || '',
    building: location?.building || '',
    room: location?.room || '',
    area: location?.area || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, block: '' }));
  };

  const handleSubmit = async () => {
    if (!form.block.trim()) { setErrors({ block: 'Block is required' }); return; }
    setLoading(true);
    try {
      const payload = {
        block: form.block.trim(),
        building: form.building.trim() || null,
        room: form.room.trim() || null,
        area: form.area.trim() || null,
      };
      if (isEdit) {
        await api.patch(`/admin/locations/${location.id}`, payload);
      } else {
        await api.post('/admin/locations', payload);
      }
      toast(`Location ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
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
      title={isEdit ? 'Edit Location' : 'Add Location'}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Location'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Block *</label>
        <input className="form-input" name="block" placeholder="e.g. Main Block" value={form.block} onChange={handleChange} />
        {errors.block && <div className="form-error">{errors.block}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Building</label>
        <input className="form-input" name="building" placeholder="e.g. Academic Building" value={form.building} onChange={handleChange} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Room</label>
          <input className="form-input" name="room" placeholder="e.g. 204" value={form.room} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Area</label>
          <input className="form-input" name="area" placeholder="e.g. Classroom" value={form.area} onChange={handleChange} />
        </div>
      </div>
    </Modal>
  );
}

function DeleteConfirmModal({ location, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/admin/locations/${location.id}`);
      toast('Location deleted.', 'success');
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
      title="Delete Location"
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>
        Are you sure you want to delete <strong>{location.block}</strong>?
        This cannot be done if issues are linked to this location.
      </p>
    </Modal>
  );
}

export default function AdminLocationsContent() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editLoc, setEditLoc] = useState(null);
  const [deleteLoc, setDeleteLoc] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/locations-data');
      setLocations(data.locations || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-title">Location Management</div>
            <div className="page-subtitle">Manage campus blocks, buildings, rooms and areas</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} />
            Add Location
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">All Locations ({locations.length})</div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : locations.length === 0 ? (
          <EmptyState icon="📍" title="No locations" action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Add First Location</button>
          } />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Block</th>
                  <th>Building</th>
                  <th>Room</th>
                  <th>Area</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{loc.id}</td>
                    <td className="td-bold">{loc.block}</td>
                    <td style={{ fontSize: 13 }}>{loc.building || '—'}</td>
                    <td style={{ fontSize: 13 }}>{loc.room || '—'}</td>
                    <td style={{ fontSize: 13 }}>{loc.area || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setEditLoc(loc)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setDeleteLoc(loc)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <LocationFormModal onClose={() => setShowCreate(false)} onSuccess={load} />}
      {editLoc && <LocationFormModal location={editLoc} onClose={() => setEditLoc(null)} onSuccess={load} />}
      {deleteLoc && <DeleteConfirmModal location={deleteLoc} onClose={() => setDeleteLoc(null)} onSuccess={load} />}
    </>
  );
}
