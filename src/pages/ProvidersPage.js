import React from 'react';
import { useProviders, useOllamaModels } from '../hooks/useRealData';

const PROVIDER_META = {
  ollama:        { name: 'Ollama', icon: '🦙', type: 'chat',  port: 11434, desc: 'Local LLM server' },
  comfyui:       { name: 'ComfyUI', icon: '🎨', type: 'image', port: 8188,  desc: 'Node-based image gen + InstantID' },
  automatic1111: { name: 'Automatic1111', icon: '🖼️', type: 'image', port: 7860, desc: 'SD WebUI with API' },
  fooocus:       { name: 'Fooocus', icon: '🎯', type: 'image', port: 7865,  desc: 'Simple Midjourney-like UI' },
  wan2:          { name: 'Wan2.1', icon: '🎬', type: 'video', port: 8085,  desc: 'Best local video gen 2025' },
  cogvideox:     { name: 'CogVideoX', icon: '🧠', type: 'video', port: 8086, desc: 'HuggingFace video gen' },
  lmstudio:      { name: 'LM Studio', icon: '🖥️', type: 'chat',  port: 1234,  desc: 'GUI-managed local LLM' },
  airllm:        { name: 'AirLLM', icon: '💨', type: 'chat',  port: 8080,  desc: 'Low-memory large model runner' },
  openclaw:      { name: 'OpenClaw Gateway', icon: '🤖', type: 'gateway', port: 18789, desc: 'Claude AI gateway (running)' },
};

const CLOUD_PROVIDERS = [
  { id: 'claude',       name: 'Claude Opus 4.6', icon: '🤖', type: 'chat',    model: 'claude-opus-4-6',    envKey: 'ANTHROPIC_API_KEY' },
  { id: 'openai',       name: 'OpenAI GPT-4o',  icon: '💬', type: 'chat',    model: 'gpt-4o',             envKey: 'OPENAI_API_KEY' },
  { id: 'higgsfield',   name: 'HiggsField',      icon: '✨', type: 'image',   model: 'higgsfield-v1',      envKey: 'HIGGSFIELD_API_KEY' },
  { id: 'nanobanana',   name: 'NanoBanana',       icon: '🍌', type: 'image',   model: 'nano-v1',            envKey: 'NANOBANANA_API_KEY' },
  { id: 'seedance',     name: 'Seedance',         icon: '🌱', type: 'video',   model: 'seedance-v1',        envKey: 'SEEDANCE_API_KEY' },
  { id: 'runway',       name: 'Runway ML Gen-3',  icon: '🛫', type: 'video',   model: 'gen-3-alpha',        envKey: 'RUNWAY_API_KEY' },
  { id: 'elevenlabs',   name: 'ElevenLabs',       icon: '🎙️', type: 'audio',   model: 'eleven-turbo-v2',    envKey: 'ELEVENLABS_API_KEY' },
];

const TYPE_COLORS = { chat: '#6366f1', image: '#8b5cf6', video: '#06b6d4', audio: '#10b981', gateway: '#f59e0b' };

function LocalCard({ id, data, refetch }) {
  const meta = PROVIDER_META[id] || { name: id, icon: '⚙️', type: 'unknown', port: '?', desc: '' };
  const online = data?.status === 'online';

  return (
    <div style={{ ...styles.card, borderLeft: `3px solid ${online ? '#10b981' : '#ef4444'}` }}>
      <div style={styles.cardTop}>
        <span style={styles.icon}>{meta.icon}</span>
        <div style={styles.cardInfo}>
          <div style={styles.cardName}>{meta.name}</div>
          <div style={styles.cardDesc}>{meta.desc}</div>
        </div>
        <div style={styles.cardRight}>
          <span style={{ ...styles.typeBadge, background: `${TYPE_COLORS[meta.type]}22`, color: TYPE_COLORS[meta.type] }}>
            {meta.type}
          </span>
          <span style={{ color: online ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: 600, marginTop: 4 }}>
            {online ? '● online' : '○ offline'}
          </span>
        </div>
      </div>

      <div style={styles.cardMeta}>
        <span style={styles.metaChip}>:{meta.port}</span>
        {data?.data?.models && (
          <span style={styles.metaChip}>
            {Array.isArray(data.data.models) ? `${data.data.models.length} models` : data.data.models}
          </span>
        )}
        {data?.data?.vram_used && (
          <span style={styles.metaChip}>
            VRAM: {(data.data.vram_used / 1e9).toFixed(1)}GB / {(data.data.vram_total / 1e9).toFixed(1)}GB
          </span>
        )}
      </div>

      {online && (
        <a href={`http://localhost:${meta.port}`} target="_blank" rel="noreferrer" style={styles.openLink}>
          Open UI ↗
        </a>
      )}
      {!online && (
        <div style={styles.offlineHint}>
          Not running — see <code style={styles.code}>docs/local-llm-setup.md</code>
        </div>
      )}
    </div>
  );
}

export default function ProvidersPage() {
  const { providers, loading, refetch } = useProviders();
  const { models: ollamaModels, status: ollamaStatus } = useOllamaModels();

  const onlineCount = Object.values(providers).filter(p => p?.status === 'online').length;
  const totalCount = Object.keys(PROVIDER_META).length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Providers</h1>
          <p style={styles.sub}>{onlineCount}/{totalCount} local services online · auto-refreshes every 20s</p>
        </div>
        <button style={styles.refreshBtn} onClick={refetch}>↺ Refresh All</button>
      </div>

      {/* Local Providers */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          🏠 Local Providers
          <span style={styles.badge}>{onlineCount} online</span>
        </h2>

        {loading ? (
          <div style={styles.loading}>Checking all local services...</div>
        ) : (
          <div style={styles.grid}>
            {Object.keys(PROVIDER_META).map(id => (
              <LocalCard key={id} id={id} data={providers[id]} refetch={refetch} />
            ))}
          </div>
        )}
      </section>

      {/* Ollama Models Detail */}
      {ollamaStatus === 'online' && ollamaModels.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🦙 Ollama Models Installed</h2>
          <div style={styles.modelsGrid}>
            {ollamaModels.map(m => (
              <div key={m.name} style={styles.modelCard}>
                <div style={styles.modelName}>{m.name}</div>
                <div style={styles.modelSize}>{m.size ? `${(m.size / 1e9).toFixed(1)} GB` : '—'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cloud Providers */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          ☁️ Cloud Providers
          <span style={{ ...styles.badge, background: '#f59e0b22', color: '#f59e0b' }}>requires API keys in .env</span>
        </h2>
        <div style={styles.grid}>
          {CLOUD_PROVIDERS.map(p => (
            <div key={p.id} style={{ ...styles.card, borderLeft: '3px solid #334155' }}>
              <div style={styles.cardTop}>
                <span style={styles.icon}>{p.icon}</span>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{p.name}</div>
                  <div style={styles.cardDesc}>{p.model}</div>
                </div>
                <div style={styles.cardRight}>
                  <span style={{ ...styles.typeBadge, background: `${TYPE_COLORS[p.type]}22`, color: TYPE_COLORS[p.type] }}>
                    {p.type}
                  </span>
                </div>
              </div>
              <div style={styles.cardMeta}>
                <span style={styles.metaChip}>env: {p.envKey}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', height: '100vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 13 },
  refreshBtn: { background: '#334155', border: 'none', borderRadius: 8, color: '#f1f5f9', cursor: 'pointer', fontSize: 13, padding: '8px 14px' },
  section: { marginBottom: 36 },
  sectionTitle: { fontSize: 17, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 },
  badge: { background: '#10b98122', color: '#10b981', fontSize: 12, padding: '2px 10px', borderRadius: 20, fontWeight: 500 },
  loading: { color: '#64748b', padding: '20px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16 },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  icon: { fontSize: 24, marginTop: 2 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: 600, color: '#f1f5f9' },
  cardDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  typeBadge: { fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  cardMeta: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  metaChip: { background: '#0f172a', color: '#64748b', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' },
  openLink: { background: '#6366f122', borderRadius: 6, color: '#a5b4fc', fontSize: 12, padding: '4px 10px', textDecoration: 'none', display: 'inline-block' },
  offlineHint: { color: '#475569', fontSize: 12 },
  code: { fontFamily: 'monospace', fontSize: 11 },
  modelsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  modelCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '12px 14px' },
  modelName: { fontSize: 13, fontWeight: 500, color: '#f1f5f9', marginBottom: 4 },
  modelSize: { color: '#64748b', fontSize: 12 },
};
