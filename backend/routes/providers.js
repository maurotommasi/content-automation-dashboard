const express = require('express');
const axios = require('axios');
const router = express.Router();

const TIMEOUT = 3000;

async function check(url, label, extra = {}) {
  try {
    const res = await axios.get(url, { timeout: TIMEOUT });
    return { id: label, status: 'online', data: extra.parseData ? extra.parseData(res.data) : null };
  } catch {
    return { id: label, status: 'offline', data: null };
  }
}

// GET /api/providers/health — check all local providers
router.get('/health', async (req, res) => {
  const [ollama, comfyui, a1111, wan2, cogvideox, lmstudio, airllm, fooocus] = await Promise.all([
    check(`${process.env.OLLAMA_BASE_URL}/api/tags`, 'ollama', {
      parseData: d => ({ models: (d.models || []).map(m => m.name) })
    }),
    check(`${process.env.COMFYUI_BASE_URL}/system_stats`, 'comfyui', {
      parseData: d => ({ vram_used: d?.devices?.[0]?.vram_used, vram_total: d?.devices?.[0]?.vram_total })
    }),
    check(`${process.env.A1111_BASE_URL}/sdapi/v1/sd-models`, 'automatic1111', {
      parseData: d => ({ models: Array.isArray(d) ? d.length : 0 })
    }),
    check(`${process.env.WAN2_BASE_URL}/health`, 'wan2'),
    check(`${process.env.COGVIDEOX_BASE_URL}/health`, 'cogvideox'),
    check(`${process.env.LMSTUDIO_BASE_URL}/v1/models`, 'lmstudio', {
      parseData: d => ({ models: (d.data || []).map(m => m.id) })
    }),
    check(`${process.env.AIRLLM_BASE_URL}/health`, 'airllm'),
    check(`${process.env.FOOOCUS_BASE_URL}/`, 'fooocus'),
  ]);

  // OpenClaw check via gateway port
  const openclaw = await check(`${process.env.OPENCLAW_BASE_URL}/health`, 'openclaw').catch(() => ({
    id: 'openclaw', status: 'online', data: { note: 'Gateway running' }
  }));

  res.json({ providers: { ollama, comfyui, a1111, wan2, cogvideox, lmstudio, airllm, fooocus, openclaw } });
});

// GET /api/providers/ollama/models
router.get('/ollama/models', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.OLLAMA_BASE_URL}/api/tags`, { timeout: TIMEOUT });
    res.json(response.data);
  } catch (err) {
    res.status(503).json({ error: 'Ollama offline', models: [] });
  }
});

module.exports = router;
