import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ─── Agents ───────────────────────────────────────────────────────────────────
export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/agents');
      setAgents(res.data.agents || []);
      setError(null);
    } catch (e) {
      setError('Backend offline — start the backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 10000); // poll every 10s
    return () => clearInterval(id);
  }, [fetch]);

  return { agents, loading, error, refetch: fetch };
}

// ─── System Status ─────────────────────────────────────────────────────────────
export function useSystemStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/status');
      setStatus(res.data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, [fetch]);

  return { status, loading, refetch: fetch };
}

// ─── n8n Workflows ─────────────────────────────────────────────────────────────
export function useWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [n8nOnline, setN8nOnline] = useState(false);

  const fetch = useCallback(async () => {
    try {
      // Check n8n status first
      const statusRes = await api.get('/n8n/status');
      setN8nOnline(statusRes.data.status === 'online');

      const res = await api.get('/n8n/workflows');
      setWorkflows(res.data.workflows || []);
      setError(null);
    } catch (e) {
      setN8nOnline(false);
      setError(e.response?.data?.error || 'Cannot reach n8n');
    } finally {
      setLoading(false);
    }
  }, []);

  const activate = async (id) => {
    await api.patch(`/n8n/workflows/${id}/activate`);
    fetch();
  };

  const deactivate = async (id) => {
    await api.patch(`/n8n/workflows/${id}/deactivate`);
    fetch();
  };

  const triggerRun = async (id) => {
    return api.post(`/n8n/workflows/${id}/run`);
  };

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, [fetch]);

  return { workflows, loading, error, n8nOnline, refetch: fetch, activate, deactivate, triggerRun };
}

// ─── n8n Executions (Activity Logs) ───────────────────────────────────────────
export function useExecutions(limit = 50) {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get(`/n8n/executions?limit=${limit}`);
      setExecutions(res.data.executions || []);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.error || 'Cannot reach n8n');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 8000); // poll every 8s for live feel
    return () => clearInterval(id);
  }, [fetch]);

  return { executions, loading, error, refetch: fetch };
}

// ─── Providers Health ─────────────────────────────────────────────────────────
export function useProviders() {
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/providers/health');
      setProviders(res.data.providers || {});
    } catch {
      setProviders({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 20000);
    return () => clearInterval(id);
  }, [fetch]);

  return { providers, loading, refetch: fetch };
}

// ─── Ollama Models ─────────────────────────────────────────────────────────────
export function useOllamaModels() {
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    api.get('/ollama/models')
      .then(res => { setModels(res.data.models || []); setStatus('online'); })
      .catch(() => { setModels([]); setStatus('offline'); });
  }, []);

  return { models, status };
}
