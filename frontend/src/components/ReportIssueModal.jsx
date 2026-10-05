import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { toast } from './Toast';
import api from '../api/client';
import { Upload } from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function ReportIssueModal({ onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    location_id: '',
    priority: 'medium',
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/issues/categories'),
      api.get('/issues/locations'),
    ]).then(([cats, locs]) => {
      setCategories(cats);
      setLocations(locs);
    }).catch((e) => {
      toast('Failed to load form data: ' + e.message, 'error');
    }).finally(() => setLoadingData(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category_id) errs.category_id = 'Category is required';
    if (!form.location_id) errs.location_id = 'Location is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category_id', form.category_id);
      fd.append('location_id', form.location_id);
      fd.append('priority', form.priority);
      if (imageFile) fd.append('image', imageFile);

      await api.post('/issues/', fd, { isFormData: true });
      toast('Issue reported successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatLoc = (l) => {
    const parts = [l.block, l.building, l.room, l.area];
    return parts.filter(Boolean).join(' › ');
  };

  return (
    <Modal
      title="Report New Issue"
      onClose={onClose}
      size="md"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || loadingData}
            id="report-issue-submit"
          >
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </>
      }
    >
      {loadingData ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>Loading form…</div>
      ) : (
        <form onSubmit={handleSubmit} id="report-issue-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              name="title"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={handleChange}
              maxLength={200}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <div className="form-error">{errors.category_id}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <select
              className="form-select"
              name="location_id"
              value={form.location_id}
              onChange={handleChange}
            >
              <option value="">Select location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{formatLoc(l)}</option>
              ))}
            </select>
            {errors.location_id && <div className="form-error">{errors.location_id}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              name="description"
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Upload size={14} style={{ display: 'inline', marginRight: 4 }} />
              Attach Image (optional)
            </label>
            <input
              type="file"
              className="form-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              style={{ padding: '7px 12px' }}
            />
            {imageFile && (
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                Selected: {imageFile.name}
              </div>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
