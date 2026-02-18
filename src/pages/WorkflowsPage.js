import React, { useState } from 'react';
import { useWorkflows } from '../hooks/useRealData';

function StatusDot({ active }) {
  return (
    <span style={{ color: active ? '#10b981' : '#f59e0b', fontSize: 13, fontWeight: 600 }}>
      {active ? '● active' : '○ inactive'}
    </span>
  );
}

function N8nOfflineBanner({ url }) {
  return (
    <div style={styles.banner}>
      <span style={styles.bannerIcon}>⚠️</span>
      <div>
        <strong style={{ color: '#fcd34d' }}>n8n is not reachable</strong>
        <p style={styles.bannerText}>
          Make sure n8n is running at <code style={styles.code}>{url || 'http://localhost:5678'}</code>.
          If you just started it, wait a few seconds and refresh.
        </p>
        <p style={styles.bannerText}>
          If your n8n requires an API key, add it to <code style={styles.code}>backend/.env</code> → <code style={styles.code}>N8N_API_KEY=your_key</code>
        </p>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const { workflows, loading, error, n8nOnline, refetch, activate, deactivate, triggerRun } = useWorkflows();
  const [triggering, setTriggering] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (wf) => {
    setToggling(wf.id);
    try {
      if (wf.active) await deactivate(wf.id);
      else await activate(wf.id);
      showToast(`Workflow "${wf.name}" ${wf.active ? 'deactivated' : 'activated'}`);
    } catch {
      showToast('Failed to toggle workflow', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleRun = async (wf) => {
    setTriggering(wf.id);
    try {
      await triggerRun(wf.id);
      showToast(`Workflow "${wf.name}" triggered`);
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to trigger workflow', 'error');
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Workflows</h1>
          <p style={styles.sub}>
            {n8nOnline
              ? `${workflows.length} workflows loaded from n8n · http://localhost:5678`
              : 'Connecting to n8n...'}
          </p>
        </div>
        <div style={styles.headerRight}>
          <span style={{ ...styles.statusChip, background: n8nOnline ? '#10b98122' : '#f59e0b22', color: n8nOnline ? '#10b981' : '#f59e0b' }}>
            {n8nOnline ? '● n8n online' : '○ n8n offline'}
          </span>
          <button style={styles.refreshBtn} onClick={refetch}>↺ Refresh</button>
          <a href="http://localhost:5678" target="_blank" rel="noreferrer" style={styles.openBtn}>
            Open n8n ↗
          </a>
        </div>
      </div>

      {!n8nOnline && <N8nOfflineBanner />}

      {loading && (
        <div style={styles.loading}>Loading workflows from n8n...</div>
      )}

      {!loading && n8nOnline && workflows.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔄</div>
          <div style={styles.emptyTitle}>No workflows yet</div>
          <p style={styles.emptyText}>Import workflows from the <code style={styles.code}>n8n-exports/</code> folder in your automation project.</p>
          <a href="http://localhost:5678" target="_blank" rel="noreferrer" style={styles.openBtn}>Open n8n to import ↗</a>
        </div>
      )}

      {!loading && workflows.length > 0 && (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 2 }}>Name</span>
            <span style={{ width: 120 }}>Status</span>
            <span style={{ width: 80, textAlign: 'center' }}>Nodes</span>
            <span style={{ width: 180 }}>Updated</span>
            <span style={{ width: 80, textAlign: 'center' }}>Tags</span>
            <span style={{ width: 180, textAlign: 'right' }}>Actions</span>
          </div>

          {workflows.map(wf => (
            <div key={wf.id} style={styles.tableRow}>
              <span style={{ flex: 2 }}>
                <div style={styles.wfName}>{wf.name}</div>
                <div style={styles.wfId}>ID: {wf.id}</div>
              </span>
              <span style={{ width: 120 }}>
                <StatusDot active={wf.active} />
              </span>
              <span style={{ width: 80, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                {wf.nodeCount}
              </span>
              <span style={{ width: 180, color: '#64748b', fontSize: 12 }}>
                {wf.updatedAt ? new Date(wf.updatedAt).toLocaleString() : '—'}
              </span>
              <span style={{ width: 80, textAlign: 'center' }}>
                {wf.tags?.length > 0 && (
                  <span style={styles.tag}>{wf.tags[0]}</span>
                )}
              </span>
              <span style={{ width: 180, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button
                  style={{ ...styles.actionBtn, ...(wf.active ? styles.deactivateBtn : styles.activateBtn) }}
                  onClick={() => handleToggle(wf)}
                  disabled={toggling === wf.id}
                >
                  {toggling === wf.id ? '...' : wf.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  style={{ ...styles.actionBtn, ...styles.runBtn }}
                  onClick={() => handleRun(wf)}
                  disabled={triggering === wf.id || !wf.active}
                  title={!wf.active ? 'Activate workflow first' : 'Trigger workflow now'}
                >
                  {triggering === wf.id ? '...' : '▶ Run'}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div style={{ ...styles.toast, background: toast.type === 'error' ? '#450a0a' : '#052e16', borderColor: toast.type === 'error' ? '#991b1b' : '#166534' }}>
          <span style={{ color: toast.type === 'error' ? '#fca5a5' : '#86efac' }}>{toast.msg}</span>
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
  statusChip: { fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 20 },
  refreshBtn: { background: '#334155', border: 'none', borderRadius: 8, color: '#f1f5f9', cursor: 'pointer', fontSize: 13, padding: '8px 14px' },
  openBtn: { background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, padding: '8px 14px', textDecoration: 'none', display: 'inline-block' },
  banner: { background: '#1c1a09', border: '1px solid #854d0e', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' },
  bannerIcon: { fontSize: 22, marginTop: 2 },
  bannerText: { color: '#d97706', fontSize: 13, margin: '4px 0 0' },
  code: { background: '#0f172a', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 },
  loading: { color: '#64748b', fontSize: 15, padding: '40px 0', textAlign: 'center' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 },
  emptyText: { color: '#64748b', fontSize: 14, marginBottom: 16 },
  table: { background: '#1e293b', borderRadius: 12, border: '1px solid #334155' },
  tableHeader: { display: 'flex', alignItems: 'center', padding: '12px 20px', background: '#0f172a', borderRadius: '12px 12px 0 0', color: '#64748b', fontSize: 12, fontWeight: 600 },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #0f172a' },
  wfName: { color: '#f1f5f9', fontSize: 14, fontWeight: 500 },
  wfId: { color: '#475569', fontSize: 11, marginTop: 2 },
  tag: { background: '#6366f122', color: '#a5b4fc', fontSize: 11, padding: '2px 8px', borderRadius: 20 },
  actionBtn: { border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '5px 10px' },
  activateBtn: { background: '#10b98122', color: '#10b981' },
  deactivateBtn: { background: '#f59e0b22', color: '#f59e0b' },
  runBtn: { background: '#6366f122', color: '#a5b4fc' },
  toast: { position: 'fixed', bottom: 24, right: 24, border: '1px solid', borderRadius: 10, padding: '12px 20px', fontSize: 14, zIndex: 999 },
};
