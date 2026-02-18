import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = login(username, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🤖</span>
          <h1 style={styles.logoTitle}>Content AI</h1>
          <p style={styles.logoSub}>Automation Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              style={styles.input}
              autoComplete="username"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.hint}>
          <p style={styles.hintText}>Default: admin / openclaw2026</p>
          <p style={styles.hintText}>Change credentials in <code>src/context/AuthContext.js</code></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  logo: { textAlign: 'center', marginBottom: 40 },
  logoIcon: { fontSize: 48 },
  logoTitle: { color: '#f1f5f9', fontSize: 28, fontWeight: 700, marginTop: 8 },
  logoSub: { color: '#64748b', fontSize: 14, marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: 500 },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 15, padding: '12px 14px', outline: 'none', transition: 'border-color 0.2s' },
  error: { background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, color: '#fca5a5', fontSize: 13, padding: '10px 14px' },
  btn: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: '14px', marginTop: 8 },
  hint: { marginTop: 24, textAlign: 'center' },
  hintText: { color: '#475569', fontSize: 12, marginBottom: 4 },
};
