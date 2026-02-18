import React, { useState } from 'react';

const WORKFLOWS = [
  { id: 1, name: 'Daily Viral Video Tracker', status: 'active', schedule: 'Every day 8:00 AM', lastRun: new Date(Date.now() - 7200000).toISOString(), runs: 45, successRate: 98, category: 'research' },
  { id: 2, name: 'AI Video Recreation Pipeline', status: 'active', schedule: 'On demand', lastRun: new Date(Date.now() - 300000).toISOString(), runs: 12, successRate: 92, category: 'video' },
  { id: 3, name: 'Instagram Carousel Generator', status: 'active', schedule: 'On demand', lastRun: new Date(Date.now() - 600000).toISOString(), runs: 28, successRate: 100, category: 'image' },
  { id: 4, name: 'YouTube Shorts Auto-Producer', status: 'paused', schedule: 'Mon/Wed/Fri 10:00', lastRun: new Date(Date.now() - 86400000).toISOString(), runs: 19, successRate: 89, category: 'video' },
  { id: 5, name: 'Brand Image Generator', status: 'active', schedule: 'On demand', lastRun: new Date(Date.now() - 1200000).toISOString(), runs: 67, successRate: 97, category: 'image' },
  { id: 6, name: 'Caption & Hashtag Generator', status: 'active', schedule: 'On demand', lastRun: new Date(Date.now() - 3600000).toISOString(), runs: 134, successRate: 100, category: 'text' },
  { id: 7, name: 'Cross-Platform Repurposer', status: 'active', schedule: 'On demand', lastRun: new Date(Date.now() - 1800000).toISOString(), runs: 23, successRate: 96, category: 'distribution' },
  { id: 8, name: 'AI Voiceover Video Creator', status: 'paused', schedule: 'On demand', lastRun: new Date(Date.now() - 172800000).toISOString(), runs: 8, successRate: 100, category: 'video' },
  { id: 9, name: 'TikTok Trend Pipeline', status: 'active', schedule: 'Every 6 hours', lastRun: new Date(Date.now() - 21600000).toISOString(), runs: 31, successRate: 90, category: 'research' },
  { id: 10, name: 'Weekly Content Calendar', status: 'active', schedule: 'Sunday 6:00 PM', lastRun: new Date(Date.now() - 432000000).toISOString(), runs: 8, successRate: 100, category: 'planning' },
  { id: 11, name: 'Local Provider Router', status: 'active', schedule: 'Always on', lastRun: new Date().toISOString(), runs: 289, successRate: 99, category: 'routing' },
  { id: 12, name: 'Local Image Pipeline', status: 'active', schedule: 'On demand', lastRun: new Date(Date.now() - 900000).toISOString(), runs: 56, successRate: 95, category: 'image' },
  { id: 13, name: 'Local Video Pipeline', status: 'active', schedule: 'On demand', lastRun: new Date(Date.now() - 300000).toISOString(), runs: 18, successRate: 94, category: 'video' },
  { id: 14, name: 'Local Chat Pipeline', status: 'active', schedule: 'Always on', lastRun: new Date().toISOString(), runs: 412, successRate: 99, category: 'routing' },
];

const STATUS_COLORS = { active: '#10b981', paused: '#f59e0b', error: '#ef4444' };
const CATEGORY_COLORS = { research: '#6366f1', video: '#06b6d4', image: '#8b5cf6', text: '#10b981', distribution: '#f59e0b', planning: '#ec4899', routing: '#64748b' };

export default function WorkflowsPage() {
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...new Set(WORKFLOWS.map(w => w.category))];
  const filtered = WORKFLOWS.filter(w => filter === 'all' || w.category === filter);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Workflows</h1>

      <div style={styles.filters}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{ ...styles.filterBtn, ...(filter === c ? styles.filterBtnActive : {}) }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span style={{ flex: 2 }}>Name</span>
          <span style={{ width: 90 }}>Status</span>
          <span style={{ width: 100 }}>Category</span>
          <span style={{ width: 180 }}>Schedule</span>
          <span style={{ width: 80, textAlign: 'right' }}>Runs</span>
          <span style={{ width: 100, textAlign: 'right' }}>Success</span>
          <span style={{ width: 140, textAlign: 'right' }}>Last Run</span>
        </div>

        {filtered.map(wf => (
          <div key={wf.id} style={styles.tableRow}>
            <span style={{ flex: 2, color: '#f1f5f9', fontSize: 14, fontWeight: 500 }}>{wf.name}</span>
            <span style={{ width: 90 }}>
              <span style={{ color: STATUS_COLORS[wf.status], fontSize: 13, fontWeight: 600 }}>● {wf.status}</span>
            </span>
            <span style={{ width: 100 }}>
              <span style={{ background: `${CATEGORY_COLORS[wf.category]}22`, color: CATEGORY_COLORS[wf.category], fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{wf.category}</span>
            </span>
            <span style={{ width: 180, color: '#64748b', fontSize: 12 }}>{wf.schedule}</span>
            <span style={{ width: 80, textAlign: 'right', color: '#94a3b8', fontSize: 13 }}>{wf.runs}</span>
            <span style={{ width: 100, textAlign: 'right', color: wf.successRate >= 95 ? '#10b981' : wf.successRate >= 85 ? '#f59e0b' : '#ef4444', fontSize: 13, fontWeight: 600 }}>{wf.successRate}%</span>
            <span style={{ width: 140, textAlign: 'right', color: '#64748b', fontSize: 12 }}>{new Date(wf.lastRun).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', height: '100vh', overflowY: 'auto' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 20 },
  filters: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  filterBtn: { background: 'transparent', border: '1px solid #334155', borderRadius: 20, color: '#64748b', cursor: 'pointer', fontSize: 13, padding: '6px 16px', textTransform: 'capitalize' },
  filterBtnActive: { background: '#6366f122', borderColor: '#6366f1', color: '#a5b4fc' },
  table: { background: '#1e293b', borderRadius: 12, border: '1px solid #334155' },
  tableHeader: { display: 'flex', alignItems: 'center', padding: '12px 20px', background: '#0f172a', borderRadius: '12px 12px 0 0', color: '#64748b', fontSize: 12, fontWeight: 600, gap: 0 },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1e293b', gap: 0 },
};
