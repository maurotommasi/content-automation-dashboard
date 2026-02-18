import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';

const LEVEL_COLORS = { info: '#6366f1', success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
const LEVELS = ['all', 'info', 'success', 'warning', 'error'];

export default function LogsPage() {
  const { logs } = useMockData();
  const [levelFilter, setLevelFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [search, setSearch] = useState('');

  const agents = ['all', ...new Set(logs.map(l => l.agent))];

  const filtered = logs.filter(l => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (agentFilter !== 'all' && l.agent !== agentFilter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Activity Logs</h1>

      <div style={styles.filters}>
        <input
          placeholder="Search logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={styles.select}>
          {LEVELS.map(l => <option key={l} value={l}>{l === 'all' ? 'All Levels' : l}</option>)}
        </select>
        <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={styles.select}>
          {agents.map(a => <option key={a} value={a}>{a === 'all' ? 'All Agents' : a}</option>)}
        </select>
        <div style={styles.count}>{filtered.length} entries</div>
      </div>

      <div style={styles.logTable}>
        <div style={styles.logHeader}>
          <span style={{ width: 160 }}>Time</span>
          <span style={{ width: 80 }}>Level</span>
          <span style={{ width: 160 }}>Agent</span>
          <span style={{ flex: 1 }}>Message</span>
          <span style={{ width: 140 }}>Workflow</span>
        </div>
        {filtered.map(log => (
          <div key={log.id} style={{ ...styles.logRow, borderLeft: `3px solid ${LEVEL_COLORS[log.level]}` }}>
            <span style={{ ...styles.cell, width: 160, color: '#64748b', fontSize: 12 }}>
              {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
            </span>
            <span style={{ ...styles.cell, width: 80, color: LEVEL_COLORS[log.level], fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              {log.level}
            </span>
            <span style={{ ...styles.cell, width: 160, color: '#a5b4fc', fontSize: 13 }}>{log.agent}</span>
            <span style={{ ...styles.cell, flex: 1, color: '#e2e8f0', fontSize: 13 }}>{log.message}</span>
            <span style={{ ...styles.cell, width: 140, color: '#64748b', fontSize: 12 }}>{log.workflow}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={styles.empty}>No logs match your filters.</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', height: '100vh', display: 'flex', flexDirection: 'column' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 20 },
  filters: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, padding: '10px 14px', outline: 'none' },
  select: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, padding: '10px 14px', cursor: 'pointer' },
  count: { color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' },
  logTable: { flex: 1, overflowY: 'auto', background: '#1e293b', borderRadius: 12, border: '1px solid #334155' },
  logHeader: { display: 'flex', gap: 0, padding: '12px 16px', background: '#0f172a', borderBottom: '1px solid #334155', color: '#64748b', fontSize: 12, fontWeight: 600, position: 'sticky', top: 0 },
  logRow: { display: 'flex', gap: 0, padding: '10px 16px', borderBottom: '1px solid #1e293b', transition: 'background 0.1s' },
  cell: { display: 'flex', alignItems: 'center', paddingRight: 16 },
  empty: { padding: 40, textAlign: 'center', color: '#64748b' },
};
