# Content AI — Monitoring Dashboard

A React monitoring dashboard for the Universal AI Content Automation System. Monitor all agents, view generated files, track activity logs, and manage AI providers in real-time.

---

## Features

- **Login / Auth** — credential-gated access (configurable users)
- **Overview** — live stats: active agents, posts today, images/videos generated, local vs cloud usage
- **Agents Monitor** — real-time status of all AI agents (local + cloud)
- **Activity Logs** — filterable, searchable live log stream
- **Generated Files** — all images/videos/audio with approval actions (Post / Discard)
- **Providers** — health status of all local services (Ollama, ComfyUI, Wan2.1, etc.) + cloud config
- **Workflows** — all n8n workflows, status, success rates, schedules

---

## Quick Start

```bash
cd content-automation-dashboard
npm install
npm start
```

Open `http://localhost:3000`

**Default credentials:**
| Username | Password | Role |
|----------|----------|------|
| admin | openclaw2026 | admin |
| viewer | view123 | viewer |

> Change credentials in `src/context/AuthContext.js`

---

## Production Build

```bash
npm run build
# Serve the build/ folder with nginx or any static host
```

---

## Connecting to Real Data

The dashboard uses mock data by default (`src/hooks/useMockData.js`).

To connect to real data:

1. **Set up the backend API** (see `backend/` in the main automation repo)
2. Replace mock data calls in `useMockData.js` with real `axios` calls:

```js
// Replace mock data with:
const response = await axios.get('/api/agents');
setAgents(response.data);
```

3. **n8n Webhook API** — connect to n8n's REST API to get real workflow status:
```
GET http://localhost:5678/api/v1/workflows
Authorization: Bearer YOUR_N8N_API_KEY
```

4. **Local provider health checks** — proxy through the backend to avoid CORS:
```
GET /api/health/ollama  → proxies to http://localhost:11434/api/tags
GET /api/health/comfyui → proxies to http://localhost:8188/system_stats
```

---

## Tech Stack

- React 18
- React Router 6
- Recharts (charts)
- Axios (HTTP)
- Lucide React (icons)
- CSS-in-JS (inline styles — no extra dependencies)

---

## Folder Structure

```
src/
├── App.js                    # Router + layout
├── index.js                  # Entry point
├── context/
│   └── AuthContext.js        # Auth state + login/logout
├── hooks/
│   ├── useMockData.js        # Mock data + live simulation
│   └── usePolling.js         # Polling helper
├── components/
│   └── Sidebar.js            # Navigation sidebar
└── pages/
    ├── LoginPage.js          # Login screen
    ├── DashboardPage.js      # Overview + charts
    ├── AgentsPage.js         # Agent monitor
    ├── LogsPage.js           # Activity logs
    ├── FilesPage.js          # Generated files
    ├── ProvidersPage.js      # Provider health
    └── WorkflowsPage.js      # Workflow list
```

---

## Customization

### Add/change users
Edit `src/context/AuthContext.js`:
```js
const VALID_CREDENTIALS = [
  { username: 'yourname', password: 'yourpassword', role: 'admin' },
];
```

### Change polling interval
Edit `src/hooks/useMockData.js` — change `8000` (ms) to your preferred interval.

### Add a new page
1. Create `src/pages/NewPage.js`
2. Add to `src/components/Sidebar.js` NAV array
3. Add `<Route>` in `src/App.js`
