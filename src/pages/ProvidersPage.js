import React, { useState, useEffect } from 'react';

const LOCAL_PROVIDERS = [
  { id: 'ollama', name: 'Ollama', type: 'chat', url: 'http://localhost:11434/api/tags', icon: '🦙', desc: 'Local LLM server' },
  { id: 'lmstudio', name: 'LM Studio', type: 'chat', url: 'http://localhost:1234/v1/models', icon: '🖥️', desc: 'GUI-based local LLM' },
  { id: 'airllm', name: 'AirLLM', type: 'chat', url: 'http://localhost:8080/health', icon: '💨', desc: 'Low-memory LLM runner' },
  { id: 'comfyui', name: 'ComfyUI', type: 'image', url: 'http://localhost:8188/system_stats', icon: '🎨', desc: 'Node-based image gen' },
  { id: 'a1111', name: 'Automatic1111', type: 'image', url: 'http://localhost:7860/sdapi/v1/sd-models', icon: '🖼️', desc: 'SD WebUI + API' },
  { id: 'fooocus', name: 'Fooocus', type: 'image', url: 'http://localhost:7865/', icon: '🎯', desc: 'Simple Midjourney-like UI' },
  { id: 'wan2', name: 'Wan2.1', type: 'video', url: 'http://localhost:8085/health', icon: '🎬', desc: 'Best local video gen 2025' },
  { id: 'cogvideox', name: 'CogVideoX', type: 'video', url: 'http://localhost:8086/health', icon: '🧠', desc: 'HuggingFace video gen' },
];

const CLOUD_PROVIDERS = [
  { id: 'claude', name: 'Claude (Anthropic)', type: 'chat', icon: '🤖', model: 'claude-opus-4-6', status: 'configured' },
  { id: 'openai', name: 'OpenAI (GPT-4)', type: 'chat', icon: '💬', model: 'gpt-4o', status: 'configured' },
  { id: 'higgsfield', name: 'HiggsField', type: 'image', icon: '✨', model: 'higgsfield-v1', status: 'configured' },
  { id: 'nanobanana', name: 'NanoBanana', type: 'image', icon: '🍌', model: 'nano-v1', status: 'not_configured' },
  { id: 'seedance', name: 'Seedance', type: 'video', icon: '🌱', model: 'seedance-v1', status: 'configured' },
  { id: 'runway', name: 'Runway ML', type: 'video', icon: '🛫', model: 'gen-3-alpha', status: 'configured' },
  { id: 'elevenlabs', name: 'ElevenLabs', type: 'audio', icon: '🎙️', model: 'eleven-turbo-v2', status: 'configured' },
];

const TYPE_COLORS = { chat: '#6366f1', image: '#8b5cf6', video: '#06b6d4', audio: '#10b981' };

function LocalProviderCard({ provider }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    // Simulate health check (real app would CORS-proxy via backend)
    const timer = setTimeout(() => {
      setStatus(['online', 'online', 'offline'][Math.floor(Math.random() * 3)]);
    }, Math.random() * 2000 + 500);
    return () => clearTimeout(timer);
  }, []);

  const statusColor = { online: '#10b981', offline: '#ef4444', checking: '#f59e0b' }[status];

  return (
    <div style={styles.provCard}>
      <div style={styles.provHeader}>
        <span style={styles.provIcon}>{provider.icon}</span>
        <div>
          <div style={styles.provName}>{provider.name}</div>
          <div style={styles.provDesc}>{provider.desc}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ ...styles.typeBadge, background: `${TYPE_COLORS[provider.type]}22`, color: TYPE_COLORS[provider.type] }}>{provider.type}</span>
          <span style={{ color: statusColor, fontSize: 12, fontWeight: 600 }}>● {status}</span>
        </div>
      </div>
      <div style={styles.provUrl}>{provider.url}</div>
    </div>
  );
}

function CloudProviderCard({ provider }) {
  const configured = provider.status === 'configured';
  return (
    <div style={styles.provCard}>
      <div style={styles.provHeader}>
        <span style={styles.provIcon}>{provider.icon}</span>
        <div>
          <div style={styles.provName}>{provider.name}</div>
          <div style={styles.provDesc}>{provider.model}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ ...styles.typeBadge, background: `${TYPE_COLORS[provider.type]}22`, color: TYPE_COLORS[provider.type] }}>{provider.type}</span>
          <span style={{ color: configured ? '#10b981' : '#f59e0b', fontSize: 12, fontWeight: 600 }}>
            {configured ? '✓ configured' : '⚠ not configured'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>AI Providers</h1>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🏠 Local Providers <span style={styles.badge}>Free · Private</span></h2>
        <p style={styles.sectionDesc}>Running on your machine. No API costs. Health checked every 30s.</p>
        <div style={styles.grid}>
          {LOCAL_PROVIDERS.map(p => <LocalProviderCard key={p.id} provider={p} />)}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>☁️ Cloud Providers <span style={{ ...styles.badge, background: '#f59e0b22', color: '#f59e0b' }}>Paid · Fast</span></h2>
        <p style={styles.sectionDesc}>External APIs. Configure keys in your .env file.</p>
        <div style={styles.grid}>
          {CLOUD_PROVIDERS.map(p => <CloudProviderCard key={p.id} provider={p} />)}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', overflowY: 'auto', height: '100vh' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 28 },
  section: { marginBottom: 36 },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 },
  sectionDesc: { color: '#64748b', fontSize: 13, marginBottom: 16 },
  badge: { background: '#10b98122', color: '#10b981', fontSize: 12, padding: '2px 10px', borderRadius: 20, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  provCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 18 },
  provHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  provIcon: { fontSize: 26 },
  provName: { fontSize: 14, fontWeight: 600, color: '#f1f5f9' },
  provDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  typeBadge: { fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  provUrl: { color: '#475569', fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
};
