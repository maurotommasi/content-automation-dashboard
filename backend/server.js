require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/n8n', require('./routes/n8n'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/openclaw', require('./routes/openclaw'));
app.use('/api/ollama', require('./routes/ollama'));
app.use('/api/settings', require('./routes/settings'));

// GET /api/status — overall system health summary
app.get('/api/status', async (req, res) => {
  const checks = await Promise.allSettled([
    axios.get(`${process.env.N8N_BASE_URL}/healthz`, { timeout: 3000 }),
    axios.get(`${process.env.OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 }),
    axios.get(`${process.env.COMFYUI_BASE_URL}/system_stats`, { timeout: 3000 }),
    axios.get(`${process.env.OPENCLAW_BASE_URL}/health`, { timeout: 3000 }).catch(e => {
      // OpenClaw may not have /health but still be running
      if (e.response) return { status: 200 };
      throw e;
    }),
    axios.get(`${process.env.A1111_BASE_URL}/sdapi/v1/sd-models`, { timeout: 3000 }),
    axios.get(`${process.env.WAN2_BASE_URL}/health`, { timeout: 3000 }),
  ]);

  const [n8n, ollama, comfyui, openclaw, a1111, wan2] = checks;

  res.json({
    timestamp: new Date().toISOString(),
    services: {
      n8n:       { status: n8n.status === 'fulfilled' ? 'online' : 'offline',    url: process.env.N8N_BASE_URL },
      ollama:    { status: ollama.status === 'fulfilled' ? 'online' : 'offline',  url: process.env.OLLAMA_BASE_URL },
      comfyui:   { status: comfyui.status === 'fulfilled' ? 'online' : 'offline', url: process.env.COMFYUI_BASE_URL },
      openclaw:  { status: openclaw.status === 'fulfilled' ? 'online' : 'offline',url: process.env.OPENCLAW_BASE_URL },
      a1111:     { status: a1111.status === 'fulfilled' ? 'online' : 'offline',   url: process.env.A1111_BASE_URL },
      wan2:      { status: wan2.status === 'fulfilled' ? 'online' : 'offline',    url: process.env.WAN2_BASE_URL },
    }
  });
});

// GET /api/agents — build agent list from real service statuses
app.get('/api/agents', async (req, res) => {
  const checks = await Promise.allSettled([
    axios.get(`${process.env.OPENCLAW_BASE_URL}/health`, { timeout: 3000 }).catch(e => { if (e.response) return e.response; throw e; }),
    axios.get(`${process.env.OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 }),
    axios.get(`${process.env.COMFYUI_BASE_URL}/system_stats`, { timeout: 3000 }),
    axios.get(`${process.env.A1111_BASE_URL}/sdapi/v1/sd-models`, { timeout: 3000 }),
    axios.get(`${process.env.WAN2_BASE_URL}/health`, { timeout: 3000 }),
    axios.get(`${process.env.LMSTUDIO_BASE_URL}/v1/models`, { timeout: 3000 }),
    axios.get(`${process.env.N8N_BASE_URL}/healthz`, { timeout: 3000 }),
  ]);

  const [openclaw, ollama, comfyui, a1111, wan2, lmstudio, n8n] = checks;

  const ollamaModels = ollama.status === 'fulfilled'
    ? (ollama.value?.data?.models || []).map(m => m.name).join(', ')
    : 'offline';

  const agents = [
    {
      id: 'openclaw',
      name: 'OpenClaw (Claude Gateway)',
      status: openclaw.status === 'fulfilled' ? 'active' : 'offline',
      provider: 'local/openclaw',
      model: 'claude-opus-4-6',
      port: 18789,
      description: 'Main AI brain — intent parsing, routing, content generation',
    },
    {
      id: 'ollama',
      name: 'Ollama (Local LLM)',
      status: ollama.status === 'fulfilled' ? 'active' : 'offline',
      provider: 'local/ollama',
      model: ollamaModels || 'no models',
      port: 11434,
      description: 'Local LLM server — captions, scripts, research summaries',
    },
    {
      id: 'comfyui',
      name: 'ComfyUI (Image Gen)',
      status: comfyui.status === 'fulfilled' ? 'active' : 'offline',
      provider: 'local/comfyui',
      model: 'SDXL / InstantID',
      port: 8188,
      description: 'Node-based image generation with face consistency',
    },
    {
      id: 'automatic1111',
      name: 'Automatic1111 (Image Gen)',
      status: a1111.status === 'fulfilled' ? 'active' : 'offline',
      provider: 'local/automatic1111',
      model: 'SDXL',
      port: 7860,
      description: 'Stable Diffusion WebUI with API',
    },
    {
      id: 'wan2',
      name: 'Wan2.1 (Video Gen)',
      status: wan2.status === 'fulfilled' ? 'active' : 'offline',
      provider: 'local/wan2',
      model: 'wan2.1-14b',
      port: 8085,
      description: 'Best local video generation (2025)',
    },
    {
      id: 'lmstudio',
      name: 'LM Studio',
      status: lmstudio.status === 'fulfilled' ? 'active' : 'offline',
      provider: 'local/lmstudio',
      model: lmstudio.status === 'fulfilled' ? (lmstudio.value?.data?.data?.[0]?.id || 'loaded') : 'offline',
      port: 1234,
      description: 'GUI-managed local LLM server',
    },
    {
      id: 'n8n',
      name: 'n8n Automation',
      status: n8n.status === 'fulfilled' ? 'active' : 'offline',
      provider: 'n8n',
      model: 'workflow engine',
      port: 5678,
      description: 'Workflow orchestration — connects all services',
    },
  ];

  res.json({ agents });
});

app.listen(PORT, () => {
  console.log(`\n✅ Content AI Backend running at http://localhost:${PORT}`);
  console.log(`   n8n:      ${process.env.N8N_BASE_URL}`);
  console.log(`   OpenClaw: ${process.env.OPENCLAW_BASE_URL}`);
  console.log(`   Ollama:   ${process.env.OLLAMA_BASE_URL}`);
  console.log(`   ComfyUI:  ${process.env.COMFYUI_BASE_URL}\n`);
});
