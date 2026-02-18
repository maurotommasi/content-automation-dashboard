import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';

function StatusBadge({ status }) {
  const map = { active: ['#10b981', '🟢'], idle: ['#f59e0b', '🟡'], error: ['#ef4444', '🔴'], processing: ['#6366f1', '🔵'] };
  const [color, dot] = map[status] || ['#64748b', '⚪'];
  return <span style={{ color, fontSize: 13, fontWeight: 600 }}>{dot} {status}</span>;
}

export default function AgentsPage() {
  const { agents } = useMockData();
  const [selected, setSelected] = useState(null);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Agents</h1>
      <p style={styles.sub}>All AI agents and their real-time status. Local agents run on your machine; cloud agents use external APIs.</p>

      <div style={styles.grid}>
        {agents.map(agent => (
          <div key={agent.id} style={styles.card} onClick={() => setSelected(agent)}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.agentName}>{agent.name}</div>
                <div style={styles.agentProvider}>{agent.provider}</div>
              </div>
              <StatusBadge status={agent.status} />
            </div>
            <div style={styles.modelTag}>{agent.model}</div>
            <div style={styles.stats}>
              <div style={styles.stat}>
                <div style={styles.statNum}>{agent.tasksCompleted}</div>
                <div style={styles.statLbl}>Completed</div>
              </div>
              <div style={styles.stat}>
                <div style={{ ...styles.statNum, color: agent.tasksFailed > 0 ? '#ef4444' : '#10b981' }}>{agent.tasksFailed}</div>
                <div style={styles.statLbl}>Failed</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNum}>{agent.tasksCompleted > 0 ? Math.round((1 - agent.tasksFailed / agent.tasksCompleted) * 100) : 100}%</div>
                <div style={styles.statLbl}>Success Rate</div>
              </div>
            </div>
            <div style={styles.lastActive}>
              Last active: {new Date(agent.lastActive).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={styles.modal} onClick={() => setSelected(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{selected.name}</h2>
            <table style={styles.table}>
              <tbody>
                {[['Status', selected.status], ['Provider', selected.provider], ['Model', selected.model], ['Tasks Completed', selected.tasksCompleted], ['Tasks Failed', selected.tasksFailed], ['Success Rate', `${Math.round((1 - selected.tasksFailed / (selected.tasksCompleted || 1)) * 100)}%`], ['Last Active', new Date(selected.lastActive).toLocaleString()]].map(([k, v]) => (
                  <tr key={k}>
                    <td style={styles.td1}>{k}</td>
                    <td style={styles.td2}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 8 },
  sub: { color: '#64748b', fontSize: 14, marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  agentName: { fontSize: 15, fontWeight: 600, color: '#f1f5f9' },
  agentProvider: { fontSize: 12, color: '#64748b', marginTop: 2 },
  modelTag: { background: '#0f172a', color: '#6366f1', fontSize: 12, padding: '3px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 14 },
  stats: { display: 'flex', gap: 16, marginBottom: 12 },
  stat: { flex: 1, textAlign: 'center' },
  statNum: { fontSize: 22, fontWeight: 700, color: '#f1f5f9' },
  statLbl: { fontSize: 11, color: '#64748b', marginTop: 2 },
  lastActive: { color: '#475569', fontSize: 12 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalBox: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, minWidth: 360 },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse' },
  td1: { color: '#64748b', fontSize: 13, padding: '8px 0', width: '40%' },
  td2: { color: '#f1f5f9', fontSize: 13, padding: '8px 0' },
  closeBtn: { marginTop: 24, background: '#334155', border: 'none', borderRadius: 8, color: '#f1f5f9', cursor: 'pointer', fontSize: 14, padding: '10px 24px' },
};
