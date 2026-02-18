import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMockData } from '../hooks/useMockData';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'];

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
        {sub && <div style={styles.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { active: '#10b981', idle: '#f59e0b', error: '#ef4444', processing: '#6366f1' };
  return (
    <span style={{ ...styles.badge, background: `${colors[status]}22`, color: colors[status], border: `1px solid ${colors[status]}44` }}>
      {status === 'active' && '● '}{status}
    </span>
  );
}

export default function DashboardPage() {
  const { agents, logs, stats } = useMockData();
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const recentLogs = logs.slice(0, 5);
  const pieData = [
    { name: 'Local', value: stats.localVsCloud.local },
    { name: 'Cloud', value: stats.localVsCloud.cloud },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Overview</h1>
        <div style={styles.liveIndicator}><span style={styles.liveDot} />Live</div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        <StatCard icon="🤖" label="Active Agents" value={activeAgents} sub={`of ${agents.length} total`} color="#6366f1" />
        <StatCard icon="📤" label="Posts Today" value={stats.postsToday} sub={`${stats.totalPosts} total`} color="#10b981" />
        <StatCard icon="🖼️" label="Images Generated" value={stats.imagesGenerated} color="#8b5cf6" />
        <StatCard icon="🎬" label="Videos Generated" value={stats.videosGenerated} color="#06b6d4" />
        <StatCard icon="📈" label="Avg Engagement" value={stats.avgEngagement} sub={`Best: ${stats.topPlatform}`} color="#f59e0b" />
        <StatCard icon="🏠" label="Local AI Usage" value={`${stats.localVsCloud.local}%`} sub="vs cloud" color="#10b981" />
      </div>

      <div style={styles.row}>
        {/* Weekly Activity Chart */}
        <div style={styles.chartCard}>
          <h2 style={styles.cardTitle}>Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="posts" fill="#6366f1" radius={4} name="Posts" />
              <Bar dataKey="images" fill="#8b5cf6" radius={4} name="Images" />
              <Bar dataKey="videos" fill="#06b6d4" radius={4} name="Videos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Local vs Cloud Pie */}
        <div style={{ ...styles.chartCard, width: 240, flexShrink: 0 }}>
          <h2 style={styles.cardTitle}>Local vs Cloud</h2>
          <PieChart width={200} height={200}>
            <Pie data={pieData} cx={100} cy={100} innerRadius={55} outerRadius={85} dataKey="value">
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
          </PieChart>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                {d.name} {d.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.row}>
        {/* Agent Status */}
        <div style={styles.listCard}>
          <h2 style={styles.cardTitle}>Agent Status</h2>
          <div style={styles.agentList}>
            {agents.map(agent => (
              <div key={agent.id} style={styles.agentRow}>
                <div>
                  <div style={styles.agentName}>{agent.name}</div>
                  <div style={styles.agentMeta}>{agent.provider} · {agent.model}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={agent.status} />
                  <div style={styles.agentTasks}>{agent.tasksCompleted} tasks</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div style={styles.listCard}>
          <h2 style={styles.cardTitle}>Recent Activity</h2>
          <div style={styles.logList}>
            {recentLogs.map(log => (
              <div key={log.id} style={styles.logRow}>
                <span style={{ ...styles.logLevel, color: { info: '#6366f1', success: '#10b981', warning: '#f59e0b', error: '#ef4444' }[log.level] }}>
                  {log.level.toUpperCase()}
                </span>
                <div>
                  <div style={styles.logMsg}>{log.message}</div>
                  <div style={styles.logMeta}>{log.agent} · {new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', overflowY: 'auto', height: '100vh' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9' },
  liveIndicator: { display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 500 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#1e293b', borderRadius: 12, padding: '20px 24px', border: '1px solid #334155', display: 'flex', gap: 16, alignItems: 'center' },
  statIcon: { fontSize: 32 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#f1f5f9' },
  statLabel: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  statSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  row: { display: 'flex', gap: 16, marginBottom: 24 },
  chartCard: { flex: 1, background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155' },
  listCard: { flex: 1, background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 },
  agentList: { display: 'flex', flexDirection: 'column', gap: 12 },
  agentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' },
  agentName: { color: '#f1f5f9', fontSize: 14, fontWeight: 500 },
  agentMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  agentTasks: { color: '#64748b', fontSize: 12, marginTop: 4 },
  badge: { fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20 },
  logList: { display: 'flex', flexDirection: 'column', gap: 12 },
  logRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  logLevel: { fontSize: 11, fontWeight: 700, minWidth: 52, paddingTop: 1 },
  logMsg: { color: '#e2e8f0', fontSize: 13 },
  logMeta: { color: '#64748b', fontSize: 11, marginTop: 2 },
};
