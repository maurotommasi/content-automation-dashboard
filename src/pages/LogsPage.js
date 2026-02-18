import React, { useState } from 'react';
import { useExecutions } from '../hooks/useRealData';

const STATUS_COLORS = { success: '#10b981', error: '#ef4444', running: '#6366f1', waiting: '#f59e0b', unknown: '#64748b' };

function duration(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function LogsPage() {
  const { executions, loading, error, refetch } = useExecutions(100);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const statuses = ['all', 'success', 'error', 'running', 'waiting'];

  const filtered = executions.filter(ex => {
    if (statusFilter !== 'all' && ex.status !== statusFilter) return false;
    if (search && !ex.workflowName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Activity Logs</h1>
          <p style={styles.sub}>Real-time n8n workflow executions · auto-refreshes every 8s</p>
        </div>
        <button style={styles.refreshBtn} onClick={refetch}>↺ Refresh</button>
      </div>

      {error && (
        <div style={styles.errorBanner}>⚠️ {error}</div>
      )}

      <div style={styles.filters}>
        <input
          placeholder="Search by workflow name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.statusFilters}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{ ...styles.filterBtn, ...(statusFilter === s ? { background: `${STATUS_COLORS[s] || '#6366f1'}22`, color: STATUS_COLORS[s] || '#a5b4fc', borderColor: STATUS_COLORS[s] || '#6366f1' } : {}) }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={styles.count}>{filtered.length} executions</div>
      </div>

      {loading && <div style={styles.loading}>Loading executions from n8n...</div>}

      {!loading && !error && executions.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No executions yet</div>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Executions will appear here once workflows run in n8n.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={styles.logTable}>
          <div style={styles.logHeader}>
            <span style={{ width: 180 }}>Time</span>
            <span style={{ width: 100 }}>Status</span>
            <span style={{ flex: 2 }}>Workflow</span>
            <span style={{ width: 80 }}>Mode</span>
            <span style={{ width: 90 }}>Duration</span>
            <span style={{ width: 80, textAlign: 'right' }}>ID</span>
          </div>

          {filtered.map(ex => (
            <div
              key={ex.id}
              style={{ ...styles.logRow, borderLeft: `3px solid ${STATUS_COLORS[ex.status] || '#334155'}` }}
            >
              <span style={{ ...styles.cell, width: 180, color: '#64748b', fontSize: 12 }}>
                {ex.startedAt ? new Date(ex.startedAt).toLocaleString() : '—'}
              </span>
              <span style={{ ...styles.cell, width: 100 }}>
                <span style={{
                  background: `${STATUS_COLORS[ex.status] || '#64748b'}22`,
                  color: STATUS_COLORS[ex.status] || '#64748b',
                  fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20
                }}>
                  {ex.status}
                </span>
              </span>
              <span style={{ ...styles.cell, flex: 2, color: '#e2e8f0', fontSize: 13 }}>
                {ex.workflowName}
              </span>
              <span style={{ ...styles.cell, width: 80, color: '#64748b', fontSize: 12 }}>
                {ex.mode}
              </span>
              <span style={{ ...styles.cell, width: 90, color: ex.durationMs > 30000 ? '#f59e0b' : '#94a3b8', fontSize: 12 }}>
                {duration(ex.durationMs)}
              </span>
              <span style={{ ...styles.cell, width: 80, justifyContent: 'flex-end', color: '#475569', fontSize: 11, fontFamily: 'monospace' }}>
                {ex.id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', height: '100vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 13 },
  refreshBtn: { background: '#334155', border: 'none', borderRadius: 8, color: '#f1f5f9', cursor: 'pointer', fontSize: 13, padding: '8px 14px' },
  errorBanner: { background: '#450a0a', border: '1px solid #991b1b', borderRadius: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16, padding: '12px 16px' },
  filters: { display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 200, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, padding: '10px 14px', outline: 'none' },
  statusFilters: { display: 'flex', gap: 6 },
  filterBtn: { background: 'transparent', border: '1px solid #334155', borderRadius: 20, color: '#64748b', cursor: 'pointer', fontSize: 12, padding: '5px 12px' },
  count: { color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' },
  loading: { color: '#64748b', fontSize: 15, padding: '40px 0', textAlign: 'center' },
  empty: { padding: '60px 0', textAlign: 'center', color: '#f1f5f9' },
  logTable: { flex: 1, overflowY: 'auto', background: '#1e293b', borderRadius: 12, border: '1px solid #334155' },
  logHeader: { display: 'flex', padding: '12px 16px', background: '#0f172a', borderBottom: '1px solid #334155', color: '#64748b', fontSize: 12, fontWeight: 600, position: 'sticky', top: 0, zIndex: 1 },
  logRow: { display: 'flex', padding: '11px 16px', borderBottom: '1px solid #1e293b' },
  cell: { display: 'flex', alignItems: 'center', paddingRight: 12 },
};
