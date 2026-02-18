import React, { useState } from 'react';
import { useAgents } from '../hooks/useRealData';

const STATUS_COLORS = { active: '#10b981', offline: '#ef4444', idle: '#f59e0b' };

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#64748b';
  return (
    <span style={{ color, fontSize: 13, fontWeight: 600 }}>
      {status === 'active' ? '● ' : '○ '}{status}
    </span>
  );
}

export default function AgentsPage() {
  const { agents, loading, error, refetch } = useAgents();
  const [selected, setSelected] = useState(null);

  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Agents</h1>
          <p style={styles.sub}>Real-time status of all AI agents. Auto-refreshes every 10s.</p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.activeBadge}>{activeCount} / {agents.length} online</span>
          <button style={styles.refreshBtn} onClick={refetch}>↺ Refresh</button>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ⚠️ {error}
          <span style={styles.errorHint}> — Run: <code>cd backend && npm install && node server.js</code></span>
        </div>
      )}

      {loading && <div style={styles.loading}>Checking all services...</div>}

      {!loading && (
        <div style={styles.grid}>
          {agents.map(agent => (
            <div
              key={agent.id}
              style={{ ...styles.card, borderTop: `3px solid ${STATUS_COLORS[agent.status] || '#334155'}` }}
              onClick={() => setSelected(agent)}
            >
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.agentName}>{agent.name}</div>
                  <div style={styles.agentProvider}>{agent.provider}</div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              <div style={styles.modelRow}>
                <span style={styles.modelTag}>{agent.model}</span>
                <span style={styles.portTag}>:{agent.port}</span>
              </div>

              <div style={styles.desc}>{agent.description}</div>

              <div style={styles.linkRow}>
                {agent.port && (
                  <a
                    href={`http://localhost:${agent.port}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                    onClick={e => e.stopPropagation()}
                  >
                    Open UI ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={styles.modal} onClick={() => setSelected(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{selected.name}</h2>
            <div style={{ ...styles.statusRow, color: STATUS_COLORS[selected.status] || '#64748b' }}>
              ● {selected.status}
            </div>
            <table style={styles.table}>
              <tbody>
                {[
                  ['Provider', selected.provider],
                  ['Model', selected.model],
                  ['Port', selected.port],
                  ['Description', selected.description],
                  ['URL', `http://localhost:${selected.port}`],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={styles.td1}>{k}</td>
                    <td style={styles.td2}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.modalActions}>
              {selected.port && (
                <a href={`http://localhost:${selected.port}`} target="_blank" rel="noreferrer" style={styles.openBtn}>
                  Open Service ↗
                </a>
              )}
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', height: '100vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 13 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  activeBadge: { background: '#10b98122', color: '#10b981', border: '1px solid #10b98144', borderRadius: 20, fontSize: 13, fontWeight: 600, padding: '6px 14px' },
  refreshBtn: { background: '#334155', border: 'none', borderRadius: 8, color: '#f1f5f9', cursor: 'pointer', fontSize: 13, padding: '8px 14px' },
  errorBanner: { background: '#450a0a', border: '1px solid #991b1b', borderRadius: 10, color: '#fca5a5', fontSize: 13, marginBottom: 20, padding: '12px 16px' },
  errorHint: { color: '#f87171' },
  loading: { color: '#64748b', textAlign: 'center', padding: '40px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  agentName: { fontSize: 15, fontWeight: 600, color: '#f1f5f9' },
  agentProvider: { fontSize: 12, color: '#64748b', marginTop: 2 },
  modelRow: { display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' },
  modelTag: { background: '#0f172a', color: '#6366f1', fontSize: 12, padding: '3px 8px', borderRadius: 4 },
  portTag: { background: '#0f172a', color: '#64748b', fontSize: 12, padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' },
  desc: { color: '#64748b', fontSize: 13, marginBottom: 14, lineHeight: 1.4 },
  linkRow: { display: 'flex', gap: 8 },
  link: { background: '#334155', borderRadius: 6, color: '#94a3b8', fontSize: 12, padding: '4px 10px', textDecoration: 'none' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalBox: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, minWidth: 380 },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' },
  statusRow: { fontSize: 14, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  td1: { color: '#64748b', fontSize: 13, padding: '8px 0', width: '35%', verticalAlign: 'top' },
  td2: { color: '#f1f5f9', fontSize: 13, padding: '8px 0', wordBreak: 'break-all' },
  modalActions: { display: 'flex', gap: 10, marginTop: 24 },
  openBtn: { background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, padding: '10px 20px', textDecoration: 'none' },
  closeBtn: { background: '#334155', border: 'none', borderRadius: 8, color: '#f1f5f9', cursor: 'pointer', fontSize: 14, padding: '10px 24px' },
};
