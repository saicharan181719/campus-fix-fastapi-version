import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { Tag } from 'lucide-react';

export default function AdminCategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/categories-data');
      setCategories(data.categories || []);
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
        <div className="page-title">Category Management</div>
        <div className="page-subtitle">View issue categories used across the platform</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Issue Categories ({categories.length})</div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : categories.length === 0 ? (
          <EmptyState icon="🏷️" title="No categories" desc="No categories have been created yet." />
        ) : (
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    background: 'var(--gray-50)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{
                    width: 38,
                    height: 38,
                    background: 'var(--admin-50)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--admin-500)',
                    flexShrink: 0,
                  }}>
                    <Tag size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 2 }}>{cat.name}</div>
                    {cat.description && (
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{cat.description}</div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>ID: {cat.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--gray-600)',
          }}
        >
          ℹ️ Categories are seeded and managed server-side. Contact your system administrator to add or modify categories.
        </div>
      </div>
    </>
  );
}
