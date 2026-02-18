import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/dashboard', icon: '📊', label: 'Overview' },
  { path: '/agents', icon: '🤖', label: 'Agents' },
  { path: '/logs', icon: '📋', label: 'Activity Logs' },
  { path: '/files', icon: '🗂️', label: 'Generated Files' },
  { path: '/providers', icon: '⚙️', label: 'Providers' },
  { path: '/workflows', icon: '🔄', label: 'Workflows' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🤖</span>
        <div>
          <div style={styles.brandName}>Content AI</div>
          <div style={styles.brandSub}>Dashboard</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {NAV.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{user?.username}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>Sign out</button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: { width: 240, background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px', borderBottom: '1px solid #334155' },
  brandIcon: { fontSize: 32 },
  brandName: { color: '#f1f5f9', fontWeight: 700, fontSize: 16 },
  brandSub: { color: '#64748b', fontSize: 12 },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 500, textAlign: 'left', width: '100%', transition: 'all 0.15s' },
  navItemActive: { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  navIcon: { fontSize: 18, width: 22 },
  userSection: { padding: '16px', borderTop: '1px solid #334155' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  userAvatar: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 },
  userName: { color: '#f1f5f9', fontSize: 14, fontWeight: 500 },
  userRole: { color: '#64748b', fontSize: 12, textTransform: 'capitalize' },
  logoutBtn: { width: '100%', padding: '8px', background: 'transparent', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', cursor: 'pointer', fontSize: 13 },
};
