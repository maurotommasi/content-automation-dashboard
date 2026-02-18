import React, { useState } from 'react';

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'LinkedIn'];
const CONTENT_TYPES = ['Reel/Short', 'Static Post', 'Carousel', 'Story', 'Long Video'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_SCHEDULE = {
  Instagram: { enabled: true, dailyLimit: 3, timeSlots: ['07:00', '13:00', '19:00'], contentMix: { 'Reel/Short': 60, 'Static Post': 20, 'Carousel': 20 }, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  TikTok: { enabled: true, dailyLimit: 4, timeSlots: ['08:00', '12:00', '17:00', '21:00'], contentMix: { 'Reel/Short': 100 }, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  YouTube: { enabled: true, dailyLimit: 1, timeSlots: ['15:00'], contentMix: { 'Reel/Short': 70, 'Long Video': 30 }, activeDays: ['Thu', 'Fri', 'Sat'] },
  'Twitter/X': { enabled: false, dailyLimit: 5, timeSlots: ['09:00', '12:00', '16:00', '20:00', '22:00'], contentMix: { 'Static Post': 100 }, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  LinkedIn: { enabled: false, dailyLimit: 1, timeSlots: ['09:00'], contentMix: { 'Static Post': 60, 'Carousel': 40 }, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
};

const PLATFORM_ICONS = { Instagram: '📸', TikTok: '🎵', YouTube: '▶️', 'Twitter/X': '🐦', LinkedIn: '💼' };
const PLATFORM_COLORS = { Instagram: '#e1306c', TikTok: '#010101', YouTube: '#ff0000', 'Twitter/X': '#1da1f2', LinkedIn: '#0077b5' };

const UPCOMING = [
  { id: 1, platform: 'Instagram', type: 'Reel/Short', topic: 'Morning fitness routine', scheduledAt: '2026-02-18T07:00:00', status: 'scheduled', ai_generated: true },
  { id: 2, platform: 'TikTok', type: 'Reel/Short', topic: 'Viral fitness challenge recreation', scheduledAt: '2026-02-18T08:00:00', status: 'generating', ai_generated: true },
  { id: 3, platform: 'Instagram', type: 'Carousel', topic: 'Top 5 nutrition tips', scheduledAt: '2026-02-18T13:00:00', status: 'scheduled', ai_generated: true },
  { id: 4, platform: 'TikTok', type: 'Reel/Short', topic: 'Day in my life vlog', scheduledAt: '2026-02-18T12:00:00', status: 'pending_content', ai_generated: false },
  { id: 5, platform: 'YouTube', type: 'Reel/Short', topic: 'Quick workout tips Short', scheduledAt: '2026-02-20T15:00:00', status: 'scheduled', ai_generated: true },
  { id: 6, platform: 'Instagram', type: 'Reel/Short', topic: 'Sunset beach photoshoot BTS', scheduledAt: '2026-02-18T19:00:00', status: 'scheduled', ai_generated: true },
];

const STATUS_COLORS = { scheduled: '#10b981', generating: '#6366f1', pending_content: '#f59e0b', failed: '#ef4444', posted: '#64748b' };
const STATUS_LABELS = { scheduled: 'Scheduled', generating: 'Generating...', pending_content: 'Needs Content', failed: 'Failed', posted: 'Posted' };

function PlatformCard({ platform, config, onChange }) {
  const color = PLATFORM_COLORS[platform];

  const updateTimeSlot = (idx, val) => {
    const updated = [...config.timeSlots];
    updated[idx] = val;
    onChange(platform, { ...config, timeSlots: updated });
  };

  const addTimeSlot = () => {
    if (config.timeSlots.length >= config.dailyLimit) return;
    onChange(platform, { ...config, timeSlots: [...config.timeSlots, '12:00'] });
  };

  const removeTimeSlot = (idx) => {
    const updated = config.timeSlots.filter((_, i) => i !== idx);
    onChange(platform, { ...config, timeSlots: updated, dailyLimit: Math.max(1, config.dailyLimit - 1) });
  };

  const toggleDay = (day) => {
    const days = config.activeDays.includes(day)
      ? config.activeDays.filter(d => d !== day)
      : [...config.activeDays, day];
    onChange(platform, { ...config, activeDays: days });
  };

  return (
    <div style={{ ...styles.platformCard, borderTop: `3px solid ${color}`, opacity: config.enabled ? 1 : 0.5 }}>
      <div style={styles.platformHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={styles.platformIcon}>{PLATFORM_ICONS[platform]}</span>
          <div>
            <div style={styles.platformName}>{platform}</div>
            <div style={styles.platformLimit}>{config.dailyLimit} posts/day · {config.activeDays.length} days/week</div>
          </div>
        </div>
        <label style={styles.toggle}>
          <input type="checkbox" checked={config.enabled} onChange={e => onChange(platform, { ...config, enabled: e.target.checked })} style={{ display: 'none' }} />
          <div style={{ ...styles.toggleTrack, background: config.enabled ? '#10b981' : '#334155' }}>
            <div style={{ ...styles.toggleThumb, left: config.enabled ? 20 : 2 }} />
          </div>
        </label>
      </div>

      {config.enabled && (
        <>
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Daily Post Limit</div>
            <div style={styles.limitControl}>
              <button style={styles.limitBtn} onClick={() => onChange(platform, { ...config, dailyLimit: Math.max(1, config.dailyLimit - 1) })}>−</button>
              <span style={styles.limitNum}>{config.dailyLimit}</span>
              <button style={styles.limitBtn} onClick={() => onChange(platform, { ...config, dailyLimit: Math.min(10, config.dailyLimit + 1) })}>+</button>
              <span style={styles.limitNote}>max 10/day</span>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Active Days</div>
            <div style={styles.daysPicker}>
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  style={{ ...styles.dayBtn, ...(config.activeDays.includes(day) ? { background: `${color}33`, color, borderColor: color } : {}) }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Posting Times</div>
            <div style={styles.timeSlots}>
              {config.timeSlots.map((t, idx) => (
                <div key={idx} style={styles.timeSlot}>
                  <input
                    type="time"
                    value={t}
                    onChange={e => updateTimeSlot(idx, e.target.value)}
                    style={styles.timeInput}
                  />
                  <button style={styles.removeBtn} onClick={() => removeTimeSlot(idx)}>×</button>
                </div>
              ))}
              {config.timeSlots.length < 10 && (
                <button style={styles.addTimeBtn} onClick={addTimeSlot}>+ Add Time</button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SchedulerPage() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [tab, setTab] = useState('schedule');
  const [saved, setSaved] = useState(false);

  const updatePlatform = (platform, config) => {
    setSchedule(prev => ({ ...prev, [platform]: config }));
    setSaved(false);
  };

  const saveSchedule = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalWeeklyPosts = Object.entries(schedule).reduce((sum, [, cfg]) => {
    if (!cfg.enabled) return sum;
    return sum + cfg.dailyLimit * cfg.activeDays.length;
  }, 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Post Scheduler</h1>
          <p style={styles.sub}>Configure how many posts to publish daily on each platform, when to post, and on which days.</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.totalBadge}>
            <div style={styles.totalNum}>{totalWeeklyPosts}</div>
            <div style={styles.totalLbl}>posts/week planned</div>
          </div>
          <button style={{ ...styles.saveBtn, ...(saved ? styles.saveBtnSaved : {}) }} onClick={saveSchedule}>
            {saved ? '✓ Saved!' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'schedule' ? styles.tabActive : {}) }} onClick={() => setTab('schedule')}>
          ⚙️ Configure Schedule
        </button>
        <button style={{ ...styles.tab, ...(tab === 'upcoming' ? styles.tabActive : {}) }} onClick={() => setTab('upcoming')}>
          📅 Upcoming Posts ({UPCOMING.filter(p => p.status !== 'posted').length})
        </button>
        <button style={{ ...styles.tab, ...(tab === 'summary' ? styles.tabActive : {}) }} onClick={() => setTab('summary')}>
          📊 Weekly Summary
        </button>
      </div>

      {tab === 'schedule' && (
        <div style={styles.platformGrid}>
          {PLATFORMS.map(p => (
            <PlatformCard key={p} platform={p} config={schedule[p]} onChange={updatePlatform} />
          ))}
        </div>
      )}

      {tab === 'upcoming' && (
        <div style={styles.upcomingList}>
          <div style={styles.upcomingHeader}>
            <span style={{ flex: 2 }}>Content</span>
            <span style={{ width: 120 }}>Platform</span>
            <span style={{ width: 120 }}>Type</span>
            <span style={{ width: 160 }}>Scheduled At</span>
            <span style={{ width: 140 }}>Status</span>
            <span style={{ width: 80 }}>AI Gen</span>
          </div>
          {UPCOMING.map(post => (
            <div key={post.id} style={styles.upcomingRow}>
              <span style={{ flex: 2, color: '#f1f5f9', fontSize: 14 }}>{post.topic}</span>
              <span style={{ width: 120, color: PLATFORM_COLORS[post.platform], fontSize: 13 }}>
                {PLATFORM_ICONS[post.platform]} {post.platform}
              </span>
              <span style={{ width: 120, color: '#94a3b8', fontSize: 13 }}>{post.type}</span>
              <span style={{ width: 160, color: '#64748b', fontSize: 12 }}>
                {new Date(post.scheduledAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ width: 140 }}>
                <span style={{ background: `${STATUS_COLORS[post.status]}22`, color: STATUS_COLORS[post.status], fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
                  {STATUS_LABELS[post.status]}
                </span>
              </span>
              <span style={{ width: 80, color: post.ai_generated ? '#10b981' : '#64748b', fontSize: 13 }}>
                {post.ai_generated ? '🤖 Yes' : '👤 No'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'summary' && (
        <div style={styles.summaryGrid}>
          {PLATFORMS.filter(p => schedule[p].enabled).map(platform => {
            const cfg = schedule[platform];
            const weeklyTotal = cfg.dailyLimit * cfg.activeDays.length;
            return (
              <div key={platform} style={styles.summaryCard}>
                <div style={styles.summaryHeader}>
                  <span style={styles.platformIcon}>{PLATFORM_ICONS[platform]}</span>
                  <span style={styles.platformName}>{platform}</span>
                </div>
                <div style={styles.summaryStats}>
                  <div style={styles.summaryStat}>
                    <div style={{ ...styles.summaryNum, color: PLATFORM_COLORS[platform] }}>{cfg.dailyLimit}</div>
                    <div style={styles.summaryLbl}>posts/day</div>
                  </div>
                  <div style={styles.summaryStat}>
                    <div style={{ ...styles.summaryNum, color: PLATFORM_COLORS[platform] }}>{cfg.activeDays.length}</div>
                    <div style={styles.summaryLbl}>days/week</div>
                  </div>
                  <div style={styles.summaryStat}>
                    <div style={{ ...styles.summaryNum, color: PLATFORM_COLORS[platform] }}>{weeklyTotal}</div>
                    <div style={styles.summaryLbl}>posts/week</div>
                  </div>
                </div>
                <div style={styles.summaryDays}>{cfg.activeDays.join(' · ')}</div>
                <div style={styles.summaryTimes}>
                  {cfg.timeSlots.map((t, i) => <span key={i} style={styles.timeChip}>{t}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 32, color: '#f1f5f9', height: '100vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 14 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  totalBadge: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '12px 20px', textAlign: 'center' },
  totalNum: { fontSize: 28, fontWeight: 700, color: '#6366f1' },
  totalLbl: { color: '#64748b', fontSize: 12 },
  saveBtn: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '12px 24px' },
  saveBtnSaved: { background: '#10b981' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: { background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', cursor: 'pointer', fontSize: 14, padding: '10px 20px' },
  tabActive: { background: '#6366f122', borderColor: '#6366f1', color: '#a5b4fc' },
  platformGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  platformCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 },
  platformHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  platformIcon: { fontSize: 26 },
  platformName: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
  platformLimit: { fontSize: 12, color: '#64748b', marginTop: 2 },
  toggle: { cursor: 'pointer', position: 'relative' },
  toggleTrack: { width: 42, height: 24, borderRadius: 12, position: 'relative', transition: 'background 0.2s' },
  toggleThumb: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' },
  section: { marginBottom: 14 },
  sectionLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  limitControl: { display: 'flex', alignItems: 'center', gap: 10 },
  limitBtn: { background: '#334155', border: 'none', borderRadius: 6, color: '#f1f5f9', cursor: 'pointer', fontSize: 18, width: 32, height: 32 },
  limitNum: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', minWidth: 28, textAlign: 'center' },
  limitNote: { color: '#475569', fontSize: 12 },
  daysPicker: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  dayBtn: { background: 'transparent', border: '1px solid #334155', borderRadius: 6, color: '#64748b', cursor: 'pointer', fontSize: 12, padding: '4px 8px' },
  timeSlots: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  timeSlot: { display: 'flex', alignItems: 'center', gap: 4 },
  timeInput: { background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#f1f5f9', fontSize: 13, padding: '4px 8px' },
  removeBtn: { background: '#334155', border: 'none', borderRadius: 4, color: '#94a3b8', cursor: 'pointer', fontSize: 16, width: 22, height: 22, lineHeight: '1' },
  addTimeBtn: { background: 'transparent', border: '1px dashed #334155', borderRadius: 6, color: '#64748b', cursor: 'pointer', fontSize: 12, padding: '4px 10px' },
  upcomingList: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12 },
  upcomingHeader: { display: 'flex', padding: '12px 20px', background: '#0f172a', borderRadius: '12px 12px 0 0', color: '#64748b', fontSize: 12, fontWeight: 600 },
  upcomingRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1e293b' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  summaryCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 },
  summaryHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  summaryStats: { display: 'flex', gap: 8, marginBottom: 12 },
  summaryStat: { flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 8, padding: '10px 4px' },
  summaryNum: { fontSize: 22, fontWeight: 700 },
  summaryLbl: { color: '#64748b', fontSize: 11, marginTop: 2 },
  summaryDays: { color: '#64748b', fontSize: 12, marginBottom: 10 },
  summaryTimes: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  timeChip: { background: '#334155', color: '#94a3b8', fontSize: 11, padding: '2px 8px', borderRadius: 20 },
};
