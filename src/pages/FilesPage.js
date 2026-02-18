import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';

const STATUS_COLORS = { posted: '#10b981', pending_approval: '#f59e0b', processing: '#6366f1', failed: '#ef4444' };
const TYPE_ICONS = { image: '🖼️', video: '🎬', audio: '🎵', document: '📄' };

export default function FilesPage() {
  const { files } = useMockData();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const types = ['all', 'image', 'video', 'audio'];
  const statuses = ['all', 'posted', 'pending_approval', 'processing', 'failed'];

  const filtered = files.filter(f => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Generated Files</h1>

      <div style={styles.filters}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={styles.select}>
          {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.select}>
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
        </select>
        <div style={styles.count}>{filtered.length} files</div>
      </div>

      <div style={styles.grid}>
        {filtered.map(file => (
          <div key={file.id} style={styles.card}>
            <div style={styles.fileIcon}>{TYPE_ICONS[file.type] || '📄'}</div>
            <div style={styles.fileName}>{file.name}</div>
            <div style={styles.fileMeta}>
              <span>{file.size}</span>
              <span>·</span>
              <span>{file.provider}</span>
            </div>
            <div style={styles.fileWorkflow}>{file.workflow}</div>
            <div style={styles.fileBottom}>
              <span style={{ ...styles.statusBadge, background: `${STATUS_COLORS[file.status]}22`, color: STATUS_COLORS[file.status] }}>
                {file.status.replace('_', ' ')}
              </span>
              <span style={styles.fileDate}>{new Date(file.createdAt).toLocaleTimeString()}</span>
            </div>
            <div style={styles.actions}>
              <button style={styles.actionBtn}>Preview</button>
              {file.status === 'pending_approval' && (
                <>
                  <button style={{ ...styles.actionBtn, background: '#10b98122', color: '#10b981' }}>✓ Post</button>
                  <button style={{ ...styles.actionBtn, background: '#ef444422', color: '#ef4444' }}>✗ Discard</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 20 },
  filters: { display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' },
  select: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, padding: '10px 14px', cursor: 'pointer' },
  count: { color: '#64748b', fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 },
  fileIcon: { fontSize: 36, marginBottom: 12 },
  fileName: { fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 6, wordBreak: 'break-all' },
  fileMeta: { display: 'flex', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 6 },
  fileWorkflow: { color: '#6366f1', fontSize: 12, marginBottom: 12 },
  fileBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20 },
  fileDate: { color: '#475569', fontSize: 12 },
  actions: { display: 'flex', gap: 8 },
  actionBtn: { flex: 1, background: '#334155', border: 'none', borderRadius: 6, color: '#f1f5f9', cursor: 'pointer', fontSize: 12, padding: '6px 8px' },
};
