const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/ollama/models
router.get('/models', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const models = (response.data.models || []).map(m => ({
      name: m.name,
      size: m.size,
      modified: m.modified_at,
      digest: m.digest,
    }));
    res.json({ models, total: models.length, status: 'online' });
  } catch {
    res.status(503).json({ models: [], total: 0, status: 'offline' });
  }
});

// POST /api/ollama/generate — run a generation
router.post('/generate', async (req, res) => {
  try {
    const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      model: req.body.model || 'llama3.2',
      prompt: req.body.prompt,
      stream: false,
    }, { timeout: 120000 });
    res.json({ response: response.data.response, model: response.data.model });
  } catch (err) {
    res.status(503).json({ error: 'Ollama generation failed', detail: err.message });
  }
});

// POST /api/ollama/chat — chat completions
router.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/chat`, {
      model: req.body.model || 'llama3.2',
      messages: req.body.messages,
      stream: false,
    }, { timeout: 120000 });
    res.json({ message: response.data.message, model: response.data.model });
  } catch (err) {
    res.status(503).json({ error: 'Ollama chat failed', detail: err.message });
  }
});

module.exports = router;
