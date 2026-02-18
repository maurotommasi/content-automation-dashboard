import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ─── Provider Schema ──────────────────────────────────────────────────────────
const PROVIDER_GROUPS = [
  {
    id: 'core',
    label: '🧠 Core AI',
    desc: 'Primary intelligence and orchestration',
    providers: [
      {
        id: 'openclaw',
        name: 'OpenClaw Gateway',
        icon: '🤖',
        type: 'gateway',
        testKey: 'openclaw',
        fields: [
          { key: 'OPENCLAW_BASE_URL', label: 'Gateway URL', placeholder: 'http://localhost:18789', type: 'url' },
          { key: 'OPENCLAW_GATEWAY_TOKEN', label: 'Gateway Token', placeholder: 'your_gateway_token', type: 'secret' },
        ],
      },
      {
        id: 'anthropic',
        name: 'Claude (Anthropic)',
        icon: '🤖',
        type: 'cloud',
        testKey: 'anthropic',
        fields: [
          { key: 'ANTHROPIC_API_KEY', label: 'API Key', placeholder: 'sk-ant-...', type: 'secret' },
        ],
      },
      {
        id: 'openai',
        name: 'OpenAI (GPT-4)',
        icon: '💬',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'OPENAI_API_KEY', label: 'API Key', placeholder: 'sk-...', type: 'secret' },
        ],
      },
    ],
  },
  {
    id: 'automation',
    label: '🔄 Automation',
    desc: 'Workflow orchestration and messaging',
    providers: [
      {
        id: 'n8n',
        name: 'n8n',
        icon: '🔄',
        type: 'local',
        testKey: 'n8n',
        fields: [
          { key: 'N8N_BASE_URL', label: 'n8n URL', placeholder: 'http://localhost:5678', type: 'url' },
          { key: 'N8N_API_KEY', label: 'API Key (optional)', placeholder: 'Leave empty if auth disabled', type: 'secret' },
        ],
      },
      {
        id: 'telegram',
        name: 'Telegram Bot',
        icon: '✈️',
        type: 'cloud',
        testKey: 'telegram',
        fields: [
          { key: 'TELEGRAM_BOT_TOKEN', label: 'Bot Token', placeholder: '123456:ABC-...', type: 'secret' },
          { key: 'TELEGRAM_CHAT_ID', label: 'Your Chat ID', placeholder: '123456789', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'local_chat',
    label: '🦙 Local Chat LLMs',
    desc: 'Run language models on your machine — no cost',
    providers: [
      {
        id: 'ollama',
        name: 'Ollama',
        icon: '🦙',
        type: 'local',
        testKey: 'ollama',
        fields: [
          { key: 'OLLAMA_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:11434', type: 'url' },
          { key: 'OLLAMA_DEFAULT_MODEL', label: 'Default Model', placeholder: 'llama3.2', type: 'text' },
        ],
      },
      {
        id: 'lmstudio',
        name: 'LM Studio',
        icon: '🖥️',
        type: 'local',
        testKey: 'lmstudio',
        fields: [
          { key: 'LMSTUDIO_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:1234', type: 'url' },
          { key: 'LMSTUDIO_DEFAULT_MODEL', label: 'Default Model', placeholder: 'local-model', type: 'text' },
        ],
      },
      {
        id: 'airllm',
        name: 'AirLLM',
        icon: '💨',
        type: 'local',
        testKey: null,
        fields: [
          { key: 'AIRLLM_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:8080', type: 'url' },
        ],
      },
    ],
  },
  {
    id: 'local_image',
    label: '🎨 Local Image Generation',
    desc: 'Generate images on your hardware — free, private',
    providers: [
      {
        id: 'comfyui',
        name: 'ComfyUI',
        icon: '🎨',
        type: 'local',
        testKey: 'comfyui',
        fields: [
          { key: 'COMFYUI_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:8188', type: 'url' },
          { key: 'COMFYUI_DEFAULT_MODEL', label: 'Default Model', placeholder: 'juggernautXL.safetensors', type: 'text' },
        ],
      },
      {
        id: 'automatic1111',
        name: 'Automatic1111',
        icon: '🖼️',
        type: 'local',
        testKey: 'automatic1111',
        fields: [
          { key: 'AUTOMATIC1111_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:7860', type: 'url' },
          { key: 'AUTOMATIC1111_DEFAULT_MODEL', label: 'Default Model', placeholder: 'sd_xl_base_1.0', type: 'text' },
        ],
      },
      {
        id: 'fooocus',
        name: 'Fooocus',
        icon: '🎯',
        type: 'local',
        testKey: null,
        fields: [
          { key: 'FOOOCUS_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:7865', type: 'url' },
        ],
      },
    ],
  },
  {
    id: 'local_video',
    label: '🎬 Local Video Generation',
    desc: 'Generate videos on your hardware',
    providers: [
      {
        id: 'wan2',
        name: 'Wan2.1',
        icon: '🎬',
        type: 'local',
        testKey: 'wan2',
        fields: [
          { key: 'WAN2_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:8085', type: 'url' },
        ],
      },
      {
        id: 'cogvideox',
        name: 'CogVideoX',
        icon: '🧠',
        type: 'local',
        testKey: null,
        fields: [
          { key: 'COGVIDEOX_BASE_URL', label: 'Base URL', placeholder: 'http://localhost:8086', type: 'url' },
        ],
      },
    ],
  },
  {
    id: 'cloud_image',
    label: '✨ Cloud Image Generation',
    desc: 'External AI image APIs',
    providers: [
      {
        id: 'higgsfield',
        name: 'HiggsField',
        icon: '✨',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'HIGGSFIELD_API_KEY', label: 'API Key', placeholder: 'your_key', type: 'secret' },
        ],
      },
      {
        id: 'nanobanana',
        name: 'NanoBanana',
        icon: '🍌',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'NANOBANANA_API_KEY', label: 'API Key', placeholder: 'your_key', type: 'secret' },
        ],
      },
    ],
  },
  {
    id: 'cloud_video',
    label: '🎥 Cloud Video Generation',
    desc: 'External AI video APIs',
    providers: [
      {
        id: 'seedance',
        name: 'Seedance',
        icon: '🌱',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'SEEDANCE_API_KEY', label: 'API Key', placeholder: 'your_key', type: 'secret' },
        ],
      },
      {
        id: 'runway',
        name: 'Runway ML',
        icon: '🛫',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'RUNWAY_API_KEY', label: 'API Key', placeholder: 'your_key', type: 'secret' },
        ],
      },
    ],
  },
  {
    id: 'social',
    label: '📱 Social Media',
    desc: 'Publishing channels',
    providers: [
      {
        id: 'instagram',
        name: 'Instagram (Meta)',
        icon: '📸',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'META_ACCESS_TOKEN', label: 'Access Token', placeholder: 'long-lived token', type: 'secret' },
          { key: 'META_INSTAGRAM_ACCOUNT_ID', label: 'Instagram Account ID', placeholder: '17841234567890', type: 'text' },
        ],
      },
      {
        id: 'youtube',
        name: 'YouTube',
        icon: '▶️',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'YOUTUBE_CLIENT_ID', label: 'Client ID', placeholder: 'xxx.apps.googleusercontent.com', type: 'text' },
          { key: 'YOUTUBE_CLIENT_SECRET', label: 'Client Secret', placeholder: 'your_secret', type: 'secret' },
          { key: 'YOUTUBE_REFRESH_TOKEN', label: 'Refresh Token', placeholder: 'your_refresh_token', type: 'secret' },
          { key: 'YOUTUBE_DATA_API_KEY', label: 'Data API Key', placeholder: 'AIza...', type: 'secret' },
        ],
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'TIKTOK_CLIENT_KEY', label: 'Client Key', placeholder: 'your_key', type: 'text' },
          { key: 'TIKTOK_CLIENT_SECRET', label: 'Client Secret', placeholder: 'your_secret', type: 'secret' },
        ],
      },
      {
        id: 'twitter',
        name: 'Twitter / X',
        icon: '🐦',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'TWITTER_API_KEY', label: 'API Key', placeholder: 'your_api_key', type: 'text' },
          { key: 'TWITTER_API_SECRET', label: 'API Secret', placeholder: 'your_secret', type: 'secret' },
          { key: 'TWITTER_ACCESS_TOKEN', label: 'Access Token', placeholder: 'your_token', type: 'text' },
          { key: 'TWITTER_ACCESS_SECRET', label: 'Access Secret', placeholder: 'your_secret', type: 'secret' },
        ],
      },
    ],
  },
  {
    id: 'storage',
    label: '☁️ Storage & Research',
    desc: 'Media storage and trend research APIs',
    providers: [
      {
        id: 'aws',
        name: 'AWS S3',
        icon: '🪣',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'AWS_S3_BUCKET', label: 'Bucket Name', placeholder: 'my-content-bucket', type: 'text' },
          { key: 'AWS_ACCESS_KEY_ID', label: 'Access Key ID', placeholder: 'AKIA...', type: 'text' },
          { key: 'AWS_SECRET_ACCESS_KEY', label: 'Secret Access Key', placeholder: 'your_secret', type: 'secret' },
          { key: 'AWS_REGION', label: 'Region', placeholder: 'us-east-1', type: 'text' },
        ],
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        icon: '🎙️',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'ELEVENLABS_API_KEY', label: 'API Key', placeholder: 'your_key', type: 'secret' },
          { key: 'ELEVENLABS_VOICE_ID', label: 'Voice ID', placeholder: 'your_voice_id', type: 'text' },
        ],
      },
      {
        id: 'serpapi',
        name: 'SerpAPI (Trend Research)',
        icon: '🔍',
        type: 'cloud',
        testKey: null,
        fields: [
          { key: 'SERPAPI_KEY', label: 'API Key', placeholder: 'your_key', type: 'secret' },
        ],
      },
    ],
  },
  {
    id: 'routing',
    label: '⚙️ Routing & Preferences',
    desc: 'Control which providers get used by default',
    providers: [
      {
        id: 'routing_prefs',
        name: 'Provider Routing',
        icon: '🔀',
        type: 'config',
        testKey: null,
        fields: [
          { key: 'DEFAULT_CHAT_PROVIDER', label: 'Default Chat Provider', placeholder: 'ollama', type: 'select', options: ['ollama', 'lmstudio', 'airllm', 'claude', 'openai'] },
          { key: 'DEFAULT_IMAGE_PROVIDER', label: 'Default Image Provider', placeholder: 'comfyui', type: 'select', options: ['comfyui', 'automatic1111', 'fooocus', 'higgsfield', 'nanobanana', 'dalle'] },
          { key: 'DEFAULT_VIDEO_PROVIDER', label: 'Default Video Provider', placeholder: 'wan2', type: 'select', options: ['wan2', 'cogvideox', 'animatediff', 'seedance', 'runway', 'kling'] },
          { key: 'PREFER_LOCAL', label: 'Prefer Local (free)', placeholder: 'true', type: 'select', options: ['true', 'false'] },
          { key: 'FALLBACK_TO_CLOUD', label: 'Fallback to Cloud if Local Fails', placeholder: 'true', type: 'select', options: ['true', 'false'] },
          { key: 'USER_NICHE', label: 'Content Niche', placeholder: 'fitness, travel, fashion...', type: 'text' },
          { key: 'USER_PREFERRED_PLATFORMS', label: 'Preferred Platforms', placeholder: 'instagram,tiktok,youtube', type: 'text' },
        ],
      },
    ],
  },
];

const TYPE_COLORS = { cloud: '#f59e0b', local: '#10b981', gateway: '#6366f1', config: '#64748b' };

// ─── Individual provider card ─────────────────────────────────────────────────
function ProviderCard({ provider, values, onChange, onTest }) {
  const [visible, setVisible] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTest(provider.testKey, values[provider.fields[0]?.key]);
    setTestResult(result);
    setTesting(false);
    setTimeout(() => setTestResult(null), 6000);
  };

  const allFilled = provider.fields.every(f => values[f.key]);

  return (
    <div style={styles.card}>
      <div style={styles.cardHead}>
        <div style={styles.cardTitle}>
          <span style={styles.cardIcon}>{provider.icon}</span>
          <div>
            <div style={styles.cardName}>{provider.name}</div>
            <span style={{ ...styles.typePill, background: `${TYPE_COLORS[provider.type]}22`, color: TYPE_COLORS[provider.type] }}>
              {provider.type}
            </span>
          </div>
        </div>
        <div style={styles.cardStatus}>
          {allFilled
            ? <span style={{ color: '#10b981', fontSize: 12 }}>✓ configured</span>
            : <span style={{ color: '#f59e0b', fontSize: 12 }}>⚠ incomplete</span>}
        </div>
      </div>

      <div style={styles.fields}>
        {provider.fields.map(field => (
          <div key={field.key} style={styles.field}>
            <label style={styles.fieldLabel}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                value={values[field.key] || ''}
                onChange={e => onChange(field.key, e.target.value)}
                style={styles.input}
              >
                <option value="">— select —</option>
                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <div style={styles.inputRow}>
                <input
                  type={field.type === 'secret' && !visible[field.key] ? 'password' : 'text'}
                  value={values[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={styles.input}
                  autoComplete="off"
                />
                {field.type === 'secret' && (
                  <button
                    style={styles.eyeBtn}
                    onClick={() => setVisible(v => ({ ...v, [field.key]: !v[field.key] }))}
                    type="button"
                  >
                    {visible[field.key] ? '🙈' : '👁️'}
                  </button>
                )}
              </div>
            )}
            <div style={styles.fieldKey}>{field.key}</div>
          </div>
        ))}
      </div>

      {provider.testKey && (
        <div style={styles.testRow}>
          <button style={styles.testBtn} onClick={handleTest} disabled={testing}>
            {testing ? '⏳ Testing...' : '⚡ Test Connection'}
          </button>
          {testResult && (
            <span style={{ color: testResult.success ? '#10b981' : '#ef4444', fontSize: 13, marginLeft: 10 }}>
              {testResult.success ? '✓' : '✗'} {testResult.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeGroup, setActiveGroup] = useState('core');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      setValues(res.data.settings || {});
      setError(null);
    } catch {
      setError('Cannot reach backend — make sure backend/server.js is running');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings', values);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Save failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (providerKey, keyValue) => {
    try {
      const res = await api.post(`/settings/test/${providerKey}`, { key: keyValue });
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const currentGroup = PROVIDER_GROUPS.find(g => g.id === activeGroup);
  const configuredCount = PROVIDER_GROUPS.flatMap(g => g.providers).flatMap(p => p.fields)
    .filter(f => values[f.key]).length;
  const totalFields = PROVIDER_GROUPS.flatMap(g => g.providers).flatMap(p => p.fields).length;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Settings & Secrets</h1>
          <p style={styles.sub}>
            Manage all provider credentials, API keys, and connection settings in one place.
            Changes are saved to <code style={styles.code}>backend/.env</code>
          </p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.progressBadge}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${(configuredCount / totalFields) * 100}%` }} />
            </div>
            <span style={styles.progressText}>{configuredCount}/{totalFields} fields set</span>
          </div>
          <button
            style={{ ...styles.saveBtn, ...(saved ? { background: '#10b981' } : {}) }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ Saving...' : saved ? '✓ Saved!' : '💾 Save All'}
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sideNav}>
          {PROVIDER_GROUPS.map(group => {
            const groupFields = group.providers.flatMap(p => p.fields);
            const filled = groupFields.filter(f => values[f.key]).length;
            const total = groupFields.length;
            const allDone = filled === total;
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                style={{ ...styles.navBtn, ...(activeGroup === group.id ? styles.navBtnActive : {}) }}
              >
                <span style={styles.navLabel}>{group.label}</span>
                <span style={{ ...styles.navBadge, color: allDone ? '#10b981' : filled > 0 ? '#f59e0b' : '#475569' }}>
                  {filled}/{total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loading}>Loading settings...</div>
          ) : currentGroup ? (
            <>
              <div style={styles.groupHeader}>
                <h2 style={styles.groupTitle}>{currentGroup.label}</h2>
                <p style={styles.groupDesc}>{currentGroup.desc}</p>
              </div>
              <div style={styles.cardsGrid}>
                {currentGroup.providers.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    values={values}
                    onChange={handleChange}
                    onTest={handleTest}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexShrink: 0 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 13 },
  code: { background: '#0f172a', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, padding: '1px 5px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 },
  progressBadge: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 16px', minWidth: 160 },
  progressBar: { background: '#334155', borderRadius: 4, height: 4, marginBottom: 6, overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg,#6366f1,#10b981)', borderRadius: 4, height: '100%', transition: 'width 0.4s' },
  progressText: { color: '#94a3b8', fontSize: 12 },
  saveBtn: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '12px 24px', transition: 'background 0.2s' },
  errorBanner: { background: '#450a0a', border: '1px solid #991b1b', borderRadius: 10, color: '#fca5a5', fontSize: 13, marginBottom: 16, padding: '12px 16px', flexShrink: 0 },
  layout: { display: 'flex', gap: 20, flex: 1, overflow: 'hidden' },
  sideNav: { width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' },
  navBtn: { background: 'transparent', border: '1px solid transparent', borderRadius: 8, color: '#64748b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '9px 12px', textAlign: 'left', width: '100%', transition: 'all 0.15s' },
  navBtnActive: { background: '#1e293b', borderColor: '#334155', color: '#f1f5f9' },
  navLabel: { fontSize: 13 },
  navBadge: { fontSize: 11, fontWeight: 600 },
  content: { flex: 1, overflowY: 'auto' },
  loading: { color: '#64748b', padding: '40px 0', textAlign: 'center' },
  groupHeader: { marginBottom: 20 },
  groupTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  groupDesc: { color: '#64748b', fontSize: 13 },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  cardIcon: { fontSize: 24, marginTop: 2 },
  cardName: { fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 },
  typePill: { fontSize: 11, fontWeight: 500, padding: '1px 8px', borderRadius: 20 },
  cardStatus: { textAlign: 'right' },
  fields: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 },
  field: {},
  fieldLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 5 },
  inputRow: { display: 'flex', gap: 6 },
  input: { flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9', fontSize: 13, outline: 'none', padding: '9px 12px', width: '100%' },
  eyeBtn: { background: '#334155', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14, padding: '0 10px', flexShrink: 0 },
  fieldKey: { color: '#334155', fontFamily: 'monospace', fontSize: 10, marginTop: 3 },
  testRow: { borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', paddingTop: 12 },
  testBtn: { background: '#6366f122', border: '1px solid #6366f144', borderRadius: 7, color: '#a5b4fc', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '7px 14px' },
};
