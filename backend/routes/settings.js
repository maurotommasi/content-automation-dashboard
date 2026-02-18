const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const ENV_PATH = path.join(__dirname, '../.env');

// Read current .env into key-value map
function readEnv() {
  try {
    const text = fs.readFileSync(ENV_PATH, 'utf8');
    const result = {};
    text.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      result[key] = val;
    });
    return result;
  } catch {
    return {};
  }
}

// Write updated values back to .env
function writeEnv(updates) {
  const current = readEnv();
  const merged = { ...current, ...updates };
  const lines = Object.entries(merged).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(ENV_PATH, lines.join('\n') + '\n', 'utf8');
  // Re-apply to process.env so routes pick up immediately
  Object.entries(updates).forEach(([k, v]) => { process.env[k] = v; });
}

// Mask a secret for display (show first 6 + ***)
function mask(val) {
  if (!val || val.length < 8) return val ? '***' : '';
  return val.slice(0, 6) + '***' + val.slice(-4);
}

// GET /api/settings — return all config (secrets masked)
router.get('/', (req, res) => {
  const env = readEnv();
  const masked = {};
  const SECRET_KEYS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'HIGGSFIELD_API_KEY', 'NANOBANANA_API_KEY',
    'SEEDANCE_API_KEY', 'RUNWAY_API_KEY', 'ELEVENLABS_API_KEY', 'SERPAPI_KEY', 'YOUTUBE_DATA_API_KEY',
    'META_ACCESS_TOKEN', 'TIKTOK_CLIENT_SECRET', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_SECRET',
    'AWS_SECRET_ACCESS_KEY', 'OPENCLAW_GATEWAY_TOKEN', 'N8N_API_KEY', 'TELEGRAM_BOT_TOKEN'];

  Object.entries(env).forEach(([k, v]) => {
    masked[k] = SECRET_KEYS.includes(k) ? mask(v) : v;
  });

  res.json({ settings: masked, hasValues: Object.keys(env).length > 0 });
});

// POST /api/settings — save new values (only updates non-empty submitted values)
router.post('/', (req, res) => {
  try {
    const updates = {};
    Object.entries(req.body).forEach(([k, v]) => {
      // Don't overwrite with masked values or empty strings
      if (v && !v.includes('***')) {
        updates[k] = v;
      }
    });
    writeEnv(updates);
    res.json({ success: true, updated: Object.keys(updates).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/test/:provider — test a provider connection
router.post('/test/:provider', async (req, res) => {
  const { provider } = req.params;
  const env = readEnv();

  try {
    switch (provider) {
      case 'n8n': {
        const url = env.N8N_BASE_URL || 'http://localhost:5678';
        await axios.get(`${url}/healthz`, { timeout: 4000 });
        return res.json({ success: true, message: 'n8n is reachable' });
      }
      case 'openclaw': {
        const url = env.OPENCLAW_BASE_URL || 'http://localhost:18789';
        const r = await axios.get(`${url}/health`, { timeout: 3000 }).catch(e => {
          if (e.response) return e.response;
          throw e;
        });
        return res.json({ success: true, message: `OpenClaw gateway reachable (${r.status})` });
      }
      case 'ollama': {
        const url = env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const r = await axios.get(`${url}/api/tags`, { timeout: 4000 });
        const count = r.data?.models?.length || 0;
        return res.json({ success: true, message: `Ollama online — ${count} model(s) loaded` });
      }
      case 'comfyui': {
        const url = env.COMFYUI_BASE_URL || 'http://localhost:8188';
        await axios.get(`${url}/system_stats`, { timeout: 4000 });
        return res.json({ success: true, message: 'ComfyUI is reachable' });
      }
      case 'automatic1111': {
        const url = env.A1111_BASE_URL || 'http://localhost:7860';
        await axios.get(`${url}/sdapi/v1/sd-models`, { timeout: 4000 });
        return res.json({ success: true, message: 'Automatic1111 is reachable' });
      }
      case 'wan2': {
        const url = env.WAN2_BASE_URL || 'http://localhost:8085';
        await axios.get(`${url}/health`, { timeout: 4000 });
        return res.json({ success: true, message: 'Wan2.1 is reachable' });
      }
      case 'lmstudio': {
        const url = env.LMSTUDIO_BASE_URL || 'http://localhost:1234';
        const r = await axios.get(`${url}/v1/models`, { timeout: 4000 });
        const count = r.data?.data?.length || 0;
        return res.json({ success: true, message: `LM Studio online — ${count} model(s)` });
      }
      case 'anthropic': {
        const key = req.body.key || env.ANTHROPIC_API_KEY;
        if (!key) return res.json({ success: false, message: 'No API key provided' });
        const r = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-opus-4-6',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }]
        }, {
          headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          timeout: 10000,
        });
        return res.json({ success: true, message: `Claude API key valid (model: ${r.data?.model})` });
      }
      case 'telegram': {
        const token = req.body.key || env.TELEGRAM_BOT_TOKEN;
        if (!token) return res.json({ success: false, message: 'No bot token provided' });
        const r = await axios.get(`https://api.telegram.org/bot${token}/getMe`, { timeout: 8000 });
        return res.json({ success: true, message: `Bot: @${r.data.result?.username}` });
      }
      default:
        return res.json({ success: false, message: `No test available for ${provider}` });
    }
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
    return res.json({ success: false, message: msg });
  }
});

module.exports = router;
