// Mock data hook — replace API calls with real n8n / backend endpoints
import { useState, useEffect } from 'react';

const MOCK_AGENTS = [
  { id: 'openclaw', name: 'OpenClaw (Claude)', status: 'active', provider: 'cloud/claude', model: 'claude-opus-4-6', tasksCompleted: 47, tasksFailed: 2, lastActive: new Date().toISOString() },
  { id: 'image-local', name: 'Image Gen (ComfyUI)', status: 'active', provider: 'local/comfyui', model: 'juggernautXL', tasksCompleted: 23, tasksFailed: 1, lastActive: new Date().toISOString() },
  { id: 'video-local', name: 'Video Gen (Wan2.1)', status: 'idle', provider: 'local/wan2', model: 'wan2.1-14b', tasksCompleted: 8, tasksFailed: 0, lastActive: new Date(Date.now() - 600000).toISOString() },
  { id: 'chat-ollama', name: 'Chat LLM (Ollama)', status: 'active', provider: 'local/ollama', model: 'llama3.2', tasksCompleted: 134, tasksFailed: 3, lastActive: new Date().toISOString() },
  { id: 'video-cloud', name: 'Video Gen (Seedance)', status: 'idle', provider: 'cloud/seedance', model: 'seedance-v1', tasksCompleted: 12, tasksFailed: 0, lastActive: new Date(Date.now() - 1800000).toISOString() },
  { id: 'social-poster', name: 'Social Poster', status: 'active', provider: 'n8n', model: 'workflow', tasksCompleted: 89, tasksFailed: 5, lastActive: new Date().toISOString() },
];

const MOCK_LOGS = [
  { id: 1, timestamp: new Date().toISOString(), level: 'info', agent: 'OpenClaw', message: 'Received Telegram message: "top 5 viral fitness videos"', workflow: 'viral-research' },
  { id: 2, timestamp: new Date(Date.now() - 30000).toISOString(), level: 'info', agent: 'OpenClaw', message: 'Intent parsed: VIRAL_RESEARCH → niche=fitness, count=5', workflow: 'viral-research' },
  { id: 3, timestamp: new Date(Date.now() - 60000).toISOString(), level: 'success', agent: 'Social Poster', message: 'Posted Reel to Instagram @handle — 1.2k views in 1hr', workflow: 'social-poster' },
  { id: 4, timestamp: new Date(Date.now() - 90000).toISOString(), level: 'info', agent: 'Image Gen (ComfyUI)', message: 'Generated image: Paris luxury shoot — 4 variants', workflow: 'image-pipeline' },
  { id: 5, timestamp: new Date(Date.now() - 120000).toISOString(), level: 'warning', agent: 'Video Gen (Wan2.1)', message: 'Generation slow — VRAM at 94%, queued', workflow: 'video-pipeline' },
  { id: 6, timestamp: new Date(Date.now() - 180000).toISOString(), level: 'info', agent: 'Chat LLM (Ollama)', message: 'Generated 10 caption variants for fitness reel', workflow: 'caption-generator' },
  { id: 7, timestamp: new Date(Date.now() - 240000).toISOString(), level: 'error', agent: 'Social Poster', message: 'Instagram API rate limit hit — retrying in 60s', workflow: 'social-poster' },
  { id: 8, timestamp: new Date(Date.now() - 300000).toISOString(), level: 'success', agent: 'Video Gen (Wan2.1)', message: 'Video generated: beach_sunset_recreation.mp4 (28s)', workflow: 'video-pipeline' },
  { id: 9, timestamp: new Date(Date.now() - 360000).toISOString(), level: 'info', agent: 'OpenClaw', message: 'Content calendar generated for week 2026-02-18', workflow: 'content-calendar' },
  { id: 10, timestamp: new Date(Date.now() - 420000).toISOString(), level: 'success', agent: 'Social Poster', message: 'YouTube Short uploaded: "5 min morning workout" — 847 views', workflow: 'social-poster' },
];

const MOCK_FILES = [
  { id: 1, name: 'paris_luxury_shoot_v1.png', type: 'image', size: '4.2 MB', provider: 'ComfyUI + SDXL', workflow: 'image-pipeline', createdAt: new Date().toISOString(), url: null, status: 'posted' },
  { id: 2, name: 'beach_recreation_v2.mp4', type: 'video', size: '28.7 MB', provider: 'Wan2.1', workflow: 'video-pipeline', createdAt: new Date(Date.now() - 300000).toISOString(), url: null, status: 'pending_approval' },
  { id: 3, name: 'fitness_carousel_slide_1.png', type: 'image', size: '2.1 MB', provider: 'ComfyUI + InstantID', workflow: 'image-pipeline', createdAt: new Date(Date.now() - 600000).toISOString(), url: null, status: 'posted' },
  { id: 4, name: 'morning_routine_reel.mp4', type: 'video', size: '45.3 MB', provider: 'Seedance', workflow: 'video-pipeline', createdAt: new Date(Date.now() - 900000).toISOString(), url: null, status: 'posted' },
  { id: 5, name: 'quote_card_success.png', type: 'image', size: '1.8 MB', provider: 'ComfyUI + SDXL', workflow: 'quote-generator', createdAt: new Date(Date.now() - 1200000).toISOString(), url: null, status: 'pending_approval' },
  { id: 6, name: 'product_review_audio.mp3', type: 'audio', size: '8.4 MB', provider: 'ElevenLabs', workflow: 'voiceover-creator', createdAt: new Date(Date.now() - 1500000).toISOString(), url: null, status: 'processing' },
];

const MOCK_STATS = {
  totalPosts: 89,
  postsToday: 7,
  imagesGenerated: 234,
  videosGenerated: 45,
  avgEngagement: '6.2%',
  topPlatform: 'Instagram',
  localVsCloud: { local: 68, cloud: 32 },
  weeklyActivity: [
    { day: 'Mon', posts: 12, images: 18, videos: 4 },
    { day: 'Tue', posts: 15, images: 22, videos: 6 },
    { day: 'Wed', posts: 9, images: 14, videos: 3 },
    { day: 'Thu', posts: 18, images: 28, videos: 8 },
    { day: 'Fri', posts: 14, images: 20, videos: 5 },
    { day: 'Sat', posts: 11, images: 16, videos: 4 },
    { day: 'Sun', posts: 10, images: 15, videos: 3 },
  ],
};

export function useMockData() {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [files, setFiles] = useState(MOCK_FILES);
  const [stats] = useState(MOCK_STATS);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        lastActive: a.status === 'active' ? new Date().toISOString() : a.lastActive,
        tasksCompleted: a.status === 'active' ? a.tasksCompleted + Math.floor(Math.random() * 2) : a.tasksCompleted,
      })));

      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: ['info', 'info', 'info', 'success', 'warning'][Math.floor(Math.random() * 5)],
        agent: MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)].name,
        message: [
          'Processing Telegram request...',
          'Image generation complete — 4 variants ready',
          'Caption generated for Instagram post',
          'Viral research: found 5 trending videos in fitness niche',
          'Provider health check passed — all local services online',
          'Posting to Instagram Reels...',
        ][Math.floor(Math.random() * 6)],
        workflow: ['viral-research', 'image-pipeline', 'video-pipeline', 'caption-generator'][Math.floor(Math.random() * 4)],
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return { agents, logs, files, stats };
}
