import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AgentsPage from './pages/AgentsPage';
import LogsPage from './pages/LogsPage';
import FilesPage from './pages/FilesPage';
import ProvidersPage from './pages/ProvidersPage';
import WorkflowsPage from './pages/WorkflowsPage';
import SchedulerPage from './pages/SchedulerPage';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ background: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', background: '#0f172a', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/agents" element={<ProtectedLayout><AgentsPage /></ProtectedLayout>} />
      <Route path="/logs" element={<ProtectedLayout><LogsPage /></ProtectedLayout>} />
      <Route path="/files" element={<ProtectedLayout><FilesPage /></ProtectedLayout>} />
      <Route path="/providers" element={<ProtectedLayout><ProvidersPage /></ProtectedLayout>} />
      <Route path="/workflows" element={<ProtectedLayout><WorkflowsPage /></ProtectedLayout>} />
      <Route path="/scheduler" element={<ProtectedLayout><SchedulerPage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
