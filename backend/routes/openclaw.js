const express = require('express');
const axios = require('axios');
const router = express.Router();

function openclawClient() {
  return axios.create({
    baseURL: process.env.OPENCLAW_BASE_URL,
    headers: {
      'Authorization': `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
}

// GET /api/openclaw/status — check if gateway is reachable
router.get('/status', async (req, res) => {
  try {
    // Try to reach the gateway on port 18789
    await axios.get(`${process.env.OPENCLAW_BASE_URL}/health`, { timeout: 3000 });
    res.json({ status: 'online', port: 18789 });
  } catch (err) {
    // If /health returns 4xx, gateway is still running (just no /health endpoint)
    if (err.response) {
      res.json({ status: 'online', port: 18789, note: 'Gateway reachable' });
    } else {
      res.status(503).json({ status: 'offline', error: err.message });
    }
  }
});

// GET /api/openclaw/sessions — list active agent sessions
router.get('/sessions', async (req, res) => {
  try {
    const client = openclawClient();
    const response = await client.get('/sessions');
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(503).json({ error: 'OpenClaw gateway unreachable', sessions: [] });
    }
  }
});

// POST /api/openclaw/chat — send a message to Claude via OpenClaw
router.post('/chat', async (req, res) => {
  try {
    const client = openclawClient();
    const response = await client.post('/chat', {
      message: req.body.message,
      model: req.body.model || 'claude-opus-4-6',
      system: req.body.system || '',
    });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(503).json({ error: 'OpenClaw gateway unreachable' });
    }
  }
});

module.exports = router;
