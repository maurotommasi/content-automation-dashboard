const express = require('express');
const axios = require('axios');
const router = express.Router();

function n8nClient() {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.N8N_API_KEY) {
    headers['X-N8N-API-KEY'] = process.env.N8N_API_KEY;
  }
  return axios.create({
    baseURL: `${process.env.N8N_BASE_URL}/api/v1`,
    headers,
    timeout: 10000,
  });
}

// GET /api/n8n/status — check if n8n is reachable
router.get('/status', async (req, res) => {
  try {
    await axios.get(`${process.env.N8N_BASE_URL}/healthz`, { timeout: 4000 });
    res.json({ status: 'online', url: process.env.N8N_BASE_URL });
  } catch {
    res.status(503).json({ status: 'offline', url: process.env.N8N_BASE_URL });
  }
});

// GET /api/n8n/workflows — list all workflows
router.get('/workflows', async (req, res) => {
  try {
    const client = n8nClient();
    const response = await client.get('/workflows');
    const workflows = (response.data.data || []).map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
      tags: (wf.tags || []).map(t => t.name),
      nodeCount: (wf.nodes || []).length,
    }));
    res.json({ workflows, total: workflows.length });
  } catch (err) {
    res.status(503).json({ error: 'n8n unreachable or API key missing', workflows: [], total: 0 });
  }
});

// GET /api/n8n/workflows/:id — get single workflow
router.get('/workflows/:id', async (req, res) => {
  try {
    const client = n8nClient();
    const response = await client.get(`/workflows/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 503).json({ error: err.message });
  }
});

// PATCH /api/n8n/workflows/:id/activate
router.patch('/workflows/:id/activate', async (req, res) => {
  try {
    const client = n8nClient();
    await client.patch(`/workflows/${req.params.id}`, { active: true });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 503).json({ error: err.message });
  }
});

// PATCH /api/n8n/workflows/:id/deactivate
router.patch('/workflows/:id/deactivate', async (req, res) => {
  try {
    const client = n8nClient();
    await client.patch(`/workflows/${req.params.id}`, { active: false });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 503).json({ error: err.message });
  }
});

// GET /api/n8n/executions — recent workflow executions (used as activity logs)
router.get('/executions', async (req, res) => {
  try {
    const client = n8nClient();
    const limit = req.query.limit || 50;
    const response = await client.get(`/executions?limit=${limit}&includeData=false`);
    const executions = (response.data.data || []).map(ex => ({
      id: ex.id,
      workflowId: ex.workflowId,
      workflowName: ex.workflowData?.name || 'Unknown',
      status: ex.status, // success | error | running | waiting
      startedAt: ex.startedAt,
      stoppedAt: ex.stoppedAt,
      mode: ex.mode,
      durationMs: ex.stoppedAt && ex.startedAt
        ? new Date(ex.stoppedAt) - new Date(ex.startedAt)
        : null,
    }));
    res.json({ executions, total: executions.length });
  } catch (err) {
    res.status(503).json({ error: 'n8n unreachable', executions: [], total: 0 });
  }
});

// GET /api/n8n/executions/:id — single execution detail
router.get('/executions/:id', async (req, res) => {
  try {
    const client = n8nClient();
    const response = await client.get(`/executions/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 503).json({ error: err.message });
  }
});

// POST /api/n8n/workflows/:id/run — manually trigger a workflow
router.post('/workflows/:id/run', async (req, res) => {
  try {
    const client = n8nClient();
    const response = await client.post(`/workflows/${req.params.id}/run`, req.body || {});
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 503).json({ error: err.message });
  }
});

module.exports = router;
