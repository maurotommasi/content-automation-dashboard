import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Hardcoded credentials — change these or connect to a real auth API
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'openclaw2026', role: 'admin' },
  { username: 'viewer', password: 'view123', role: 'viewer' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (_) {}
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const match = VALID_CREDENTIALS.find(
      (c) => c.username === username && c.password === password
    );
    if (match) {
      const userData = { username: match.username, role: match.role, loginAt: new Date().toISOString() };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
