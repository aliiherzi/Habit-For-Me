'use strict';

/*
  Habit For Me: a simple habit tracker that runs in the browser.
  Everything is saved on this device (localStorage). No account needed.

  How this file is organised:
    1. Constants        - colours, icons, suggestions
    2. Date helpers     - dates are stored as "YYYY-MM-DD" strings
    3. Saving/loading   - read and write data in localStorage
    4. Habit maths      - streaks, completion rates, daily progress
    5. Screens          - Today, All habits, Habit details, Stats, Me
    6. Add/edit sheet   - the form for creating or changing a habit
    7. Actions          - what happens when you tap things
*/

/* ---------- 1. Constants ---------- */

const STORAGE_KEY = 'habit-for-me:v1';
const COLORS = ['#ee4d6f', '#5b7fd8', '#12a4b6', '#1faf7a', '#f0883e', '#d04aae', '#8b63d6', '#e0a21f'];
const ICONS = ['💧', '📚', '🏃', '🧘', '🥗', '😴', '✍️', '🎸', '🧹', '💊', '🚭', '☀️', '🪥', '🚶', '💪', '🙏', '🍎', '💻', '🌱', '🎯'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday ... 6 = Saturday
const SUGGESTIONS = [
  { name: 'Drink water', icon: '💧', color: '#12a4b6', goal: 8 },
  { name: 'Read 20 minutes', icon: '📚', color: '#8b63d6', goal: 1 },
  { name: 'Go for a walk', icon: '🚶', color: '#5b7fd8', goal: 1 },
  { name: 'Meditate', icon: '🧘', color: '#d04aae', goal: 1 },
  { name: 'Sleep by 11pm', icon: '😴', color: '#1faf7a', goal: 1 },
];
const RANGES = [['week', 'Weekly'], ['month', 'Monthly'], ['year', 'Yearly']];

const ICON_SVG = {
  tick: '<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

/* ---------- 2. Date helpers ---------- */

const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const todayKey = () => keyOf(new Date());
const isKey = (k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);
const fmt = (d, opts) => d.toLocaleDateString(undefined, opts);

function startOfWeek(d) {
  const diff = (d.getDay() - state.settings.weekStart + 7) % 7;
  return addDays(d, -diff);
}

/** Weekday numbers in display order (Monday first or Sunday first). */
function weekOrder() {
  return ALL_DAYS.map((i) => (i + state.settings.weekStart) % 7);
}

function dayName(dow, style = 'short') {
  // 2023-01-01 was a Sunday, so add `dow` days to get that weekday.
  return fmt(new Date(2023, 0, 1 + dow), { weekday: style });
}

/* ---------- 3. Saving and loading ---------- */

function defaultState() {
  return { version: 1, habits: [], log: {}, settings: { theme: 'system', weekStart: 1 } };
}

function clampInt(v, min, max, fallback) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** Cleans up saved or imported data so the app never breaks on bad input. */
function normalize(raw) {
  const s = defaultState();
  if (!raw || typeof raw !== 'object') return s;

  if (Array.isArray(raw.habits)) {
    s.habits = raw.habits
      .filter((h) => h && h.id && h.name)
      .map((h) => {
        const days = Array.isArray(h.days)
          ? [...new Set(h.days.map(Number))].filter((d) => d >= 0 && d <= 6).sort()
          : [];
        return {
          id: String(h.id),
          name: String(h.name).slice(0, 60),
          icon: typeof h.icon === 'string' && h.icon ? h.icon.slice(0, 8) : '✅',
          color: /^#[0-9a-f]{6}$/i.test(h.color) ? h.color : COLORS[0],
          goal: clampInt(h.goal, 1, 50, 1),
          days: days.length ? days : ALL_DAYS.slice(),
          createdAt: isKey(h.createdAt) ? h.createdAt : todayKey(),
        };
      });
  }

  if (raw.log && typeof raw.log === 'object') {
    for (const h of s.habits) {
      const src = raw.log[h.id];
      if (!src || typeof src !== 'object') continue;
      const clean = {};
      for (const [k, v] of Object.entries(src)) {
        const n = clampInt(v, 0, 50, 0);
        if (isKey(k) && n > 0) clean[k] = n;
      }
      s.log[h.id] = clean;
    }
  }

  const st = raw.settings || {};
  if (['system', 'light', 'dark'].includes(st.theme)) s.settings.theme = st.theme;
  if (st.weekStart === 0 || st.weekStart === 1) s.settings.weekStart = st.weekStart;
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (err) {
    console.warn('Could not load saved data', err);
  }
  return defaultState();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    toast('Could not save. Storage may be full or blocked.');
  }
}

let state = load();

// Things about the screen that don't need saving.
const ui = {
  tab: 'today', // today, habits, stats or me
  date: todayKey(), // the day shown on the Today screen
  detail: null, // id of the habit being viewed, or null
  month: null, // "YYYY-MM" shown in the habit calendar
  range: 'week', // Stats: week, month or year
  anchor: todayKey(), // Stats: a day inside the week, month or year being shown
  confirm: null, // which delete button is waiting for a second tap
  editing: null, // id of the habit open in the edit sheet
};

/* ---------- 4. Habit maths ---------- */

const countOf = (h, k) => (state.log[h.id] && state.log[h.id][k]) || 0;
const isDone = (h, k) => countOf(h, k) >= h.goal;
const findHabit = (id) => state.habits.find((h) => h.id === id) || null;

/** First day a habit counts from: the day it was made, or an earlier logged day. */
function startKey(h) {
  let s = h.createdAt;
  for (const k of Object.keys(state.log[h.id] || {})) if (k < s) s = k;
  return s;
}

/** Is this habit scheduled on this date? */
function isDue(h, d, start = startKey(h)) {
  return h.days.includes(d.getDay()) && keyOf(d) >= start;
}

function setCount(h, k, n) {
  const log = state.log[h.id] || (state.log[h.id] = {});
  if (n > 0) log[k] = n;
  else delete log[k];
  save();
}

/** Scheduled days done in a row, counting back from today. Today doesn't break it until it's over. */
function currentStreak(h) {
  const start = startKey(h);
  let d = new Date();
  if (h.days.includes(d.getDay()) && !isDone(h, keyOf(d))) d = addDays(d, -1);
  let n = 0;
  for (let i = 0; i < 3660; i++, d = addDays(d, -1)) {
    const k = keyOf(d);
    if (k < start) break;
    if (!h.days.includes(d.getDay())) continue;
    if (isDone(h, k)) n++;
    else break;
  }
  return n;
}

function bestStreak(h) {
  const tk = todayKey();
  let best = 0;
  let run = 0;
  for (let d = parseKey(startKey(h)); keyOf(d) <= tk; d = addDays(d, 1)) {
    if (!h.days.includes(d.getDay())) continue;
    const k = keyOf(d);
    if (isDone(h, k)) best = Math.max(best, ++run);
    else if (k !== tk) run = 0;
  }
  return best;
}

/** Share of scheduled days done over the last `days` days (today counts only once done). */
function rate(h, days = 30) {
  const start = startKey(h);
  const tk = todayKey();
  let due = 0;
  let done = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(new Date(), -i);
    const k = keyOf(d);
    if (!isDue(h, d, start)) continue;
    if (isDone(h, k)) {
      due++;
      done++;
    } else if (k !== tk) due++;
  }
  return { due, done, pct: due ? done / due : null };
}

const totalDone = (h) => Object.keys(state.log[h.id] || {}).filter((k) => isDone(h, k)).length;

/** 0..1 progress across every habit due on a day, or null when nothing was due. */
function dayProgress(d) {
  const due = state.habits.filter((h) => isDue(h, d));
  if (!due.length) return null;
  const k = keyOf(d);
  return due.reduce((sum, h) => sum + Math.min(countOf(h, k) / h.goal, 1), 0) / due.length;
}

/** Numbers for the Weekly report: share of scheduled days met, completions, perfect days. */
function weekSummary(days) {
  const tk = todayKey();
  let due = 0;
  let met = 0;
  let total = 0;
  let perfect = 0;
  for (const d of days) {
    const k = keyOf(d);
    if (k > tk) continue;
    if (dayProgress(d) === 1) perfect++;
    for (const h of state.habits) {
      const done = isDone(h, k);
      if (done) total++;
      if (!isDue(h, d)) continue;
      if (done) {
        due++;
        met++;
      } else if (k !== tk) due++;
    }
  }
  return { met: due ? met / due : null, total, perfect };
}

/** Text colour (white or dark) that is easy to read on a habit's colour. */
function inkOn(hex) {
  const lin = (i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5);
  return 1.05 / (lum + 0.05) >= 3 ? '#ffffff' : '#1e1e24';
}

/** CSS variables for a habit: its colour, text colour on it, and tick colour on white. */
function habitVars(h) {
  const ink = inkOn(h.color);
  return `--c:${h.color};--ink:${ink};--tc:${ink === '#ffffff' ? h.color : '#1e1e24'}`;
}

function scheduleText(h) {
  const days = h.days.join(',');
  if (days === '0,1,2,3,4,5,6') return 'Every day';
  if (days === '1,2,3,4,5') return 'Weekdays';
  if (days === '0,6') return 'Weekends';
  return weekOrder().filter((d) => h.days.includes(d)).map((d) => dayName(d)).join(', ');
}

const pct = (p) => `${Math.round(p * 100)}%`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* ---------- 5. Screens ---------- */

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const view = document.getElementById('view');

function render() {
  // Remember which button had keyboard focus so it can be focused again after redrawing.
  const active = document.activeElement;
  let focusSel = null;
  if (active && view.contains(active) && active.dataset.action) {
    focusSel = `[data-action="${active.dataset.action}"]`;
    if (active.dataset.id) focusSel += `[data-id="${CSS.escape(active.dataset.id)}"]`;
    if (active.dataset.key) focusSel += `[data-key="${active.dataset.key}"]`;
    if (active.dataset.range) focusSel += `[data-range="${active.dataset.range}"]`;
  }

  const habit = ui.detail && findHabit(ui.detail);
  if (ui.detail && !habit) ui.detail = null;

  if (habit) view.innerHTML = renderDetail(habit);
  else if (ui.tab === 'habits') view.innerHTML = renderHabits();
  else if (ui.tab === 'stats') view.innerHTML = renderStats();
  else if (ui.tab === 'me') view.innerHTML = renderMe();
  else view.innerHTML = renderToday();

  document.body.classList.toggle('tinted', ui.tab === 'me' && !habit);
  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === ui.tab;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });

  // Keep the chosen day in view in the date strip.
  const strip = view.querySelector('.strip');
  const chosen = strip && strip.querySelector('[aria-current="date"]');
  if (chosen) strip.scrollLeft = chosen.offsetLeft - (strip.clientWidth - chosen.offsetWidth) / 2;

  if (focusSel) {
    const el = view.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }
}

/** Top bar: optional button on the left, title in the middle, button on the right. */
function topbar(title, { left = '', right = '', sub = '' } = {}) {
  return `
    <header class="topbar">
      <div class="tb-side">${left}</div>
      <div class="tb-title"><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div>
      <div class="tb-side end">${right}</div>
    </header>`;
}

const addButton = `<button class="add-btn" data-action="add" aria-label="Add a new habit">${ICON_SVG.plus}</button>`;

/* Today */

function renderToday() {
  const tk = todayKey();
  const sel = parseKey(ui.date);
  const isToday = ui.date === tk;
  const isYesterday = ui.date === keyOf(addDays(new Date(), -1));
  const title = isToday ? 'Today' : isYesterday ? 'Yesterday' : fmt(sel, { month: 'long', day: 'numeric' });

  if (!state.habits.length) {
    return `${topbar('Today', { right: addButton })}
      <section class="empty">
        <div class="empty-art" aria-hidden="true"><span>🚀</span></div>
        <h2>No habits yet</h2>
        <p class="muted">Tap <strong>+</strong> to add your first habit, or start with one of these.</p>
        <div class="chips">
          ${SUGGESTIONS.map((s, i) => `<button class="chip" data-action="suggest" data-i="${i}">${s.icon} ${esc(s.name)}</button>`).join('')}
        </div>
      </section>`;
  }

  const due = state.habits.filter((h) => isDue(h, sel));
  const resting = state.habits.length - due.length;
  const done = due.filter((h) => isDone(h, ui.date)).length;
  const sub = due.length ? `${done} of ${due.length} done` : fmt(sel, { weekday: 'long' });
  const left = isToday ? '' : '<button class="pill" data-action="go-today">Today</button>';

  return `${topbar(title, { left, right: addButton, sub })}
    ${dateStrip()}
    ${due.length
      ? `<ul class="bars">${due.map((h) => habitBar(h, ui.date)).join('')}</ul>`
      : '<p class="empty-note">Nothing scheduled for this day. Enjoy the rest! 🌿</p>'}
    ${resting ? `<p class="muted small center rest-note">${plural(resting, 'habit')} not scheduled ${isToday ? 'today' : 'this day'}.</p>` : ''}`;
}

/** A scrolling row of days: the last five weeks up to the end of this week. */
function dateStrip() {
  const tk = todayKey();
  const today = parseKey(tk);
  const lastKey = keyOf(addDays(startOfWeek(today), 6));
  const earliest = keyOf(addDays(today, -34));
  let d = parseKey(ui.date < earliest ? ui.date : earliest);
  let cells = '';
  for (; keyOf(d) <= lastKey; d = addDays(d, 1)) {
    const k = keyOf(d);
    const future = k > tk;
    const p = future ? null : dayProgress(d);
    const cls = ['sd'];
    if (k === ui.date) cls.push('sel');
    if (k === tk) cls.push('today');
    if (future) cls.push('future');
    const fill = p === 1 ? ' full' : p > 0 ? ' some' : '';
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${p === null ? '' : `, ${pct(p)} done`}`;
    cells += `
      <button class="${cls.join(' ')}" data-action="${future ? 'future-day' : 'pick-day'}" data-key="${k}" aria-label="${esc(label)}"${k === ui.date ? ' aria-current="date"' : ''}>
        <span class="sd-dow" aria-hidden="true">${esc(fmt(d, { weekday: 'short' }).slice(0, 2))}</span>
        <span class="sd-num${fill}" aria-hidden="true">${d.getDate()}</span>
      </button>`;
  }
  return `<div class="strip" role="group" aria-label="Pick a day">${cells}</div>`;
}

/** One habit as a bar that fills with its colour as you make progress. */
function habitBar(h, k) {
  const c = countOf(h, k);
  const done = c >= h.goal;
  const p = Math.min(c / h.goal, 1);
  const streak = currentStreak(h);
  const parts = [];
  if (h.goal > 1) parts.push(`${Math.min(c, h.goal)}/${h.goal} times`);
  parts.push(streak ? `🔥 ${plural(streak, 'day')}` : scheduleText(h));
  const label = done
    ? `${h.name}: done. Tap to undo.`
    : h.goal > 1 ? `${h.name}: ${c} of ${h.goal}. Tap to add one.` : `${h.name}: not done. Tap to mark done.`;
  const mark = done ? ICON_SVG.tick : h.goal > 1 ? '<b>+1</b>' : '';

  return `
    <li class="hb${done ? ' done' : ''}" style="${habitVars(h)};--p:${p.toFixed(3)}">
      <button class="hb-main" data-action="open" data-id="${esc(h.id)}" aria-label="${esc(h.name)} details">
        <span class="hb-icon" aria-hidden="true">${esc(h.icon)}</span>
        <span class="hb-body"><span class="hb-name">${esc(h.name)}</span><span class="hb-meta">${esc(parts.join(' · '))}</span></span>
      </button>
      <button class="hb-check" data-action="tick" data-id="${esc(h.id)}" aria-pressed="${done}" aria-label="${esc(label)}"><span>${mark}</span></button>
    </li>`;
}

/* All habits */

function renderHabits() {
  const head = topbar('All habits', { right: addButton, sub: state.habits.length ? plural(state.habits.length, 'habit') : '' });
  if (!state.habits.length) {
    return `<div class="narrow">${head}<p class="empty-note">No habits yet. Tap <strong>+</strong> to add one.</p></div>`;
  }
  const rows = state.habits.map((h) => {
    const s = currentStreak(h);
    return `
      <li>
        <button class="lrow" data-action="open" data-id="${esc(h.id)}" style="${habitVars(h)}">
          <span class="h-icon" aria-hidden="true">${esc(h.icon)}</span>
          <span class="lr-body">
            <span class="lr-name">${esc(h.name)}</span>
            <span class="lr-meta">${esc(scheduleText(h))}${h.goal > 1 ? ` · ${h.goal} times a day` : ''}</span>
          </span>
          ${s ? `<span class="lr-streak" aria-label="${esc(`${plural(s, 'day')} in a row`)}">🔥 ${s}</span>` : ''}
          <span class="lr-chev" aria-hidden="true">${ICON_SVG.right}</span>
        </button>
      </li>`;
  }).join('');
  return `<div class="narrow">${head}<ul class="lgroup">${rows}</ul></div>`;
}

/* Habit details */

function renderDetail(h) {
  const tk = todayKey();
  const cur = currentStreak(h);
  const best = bestStreak(h);
  const r = rate(h, 30);
  const total = totalDone(h);
  const start = startKey(h);

  const [y, m] = ui.month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const lead = (first.getDay() - state.settings.weekStart + 7) % 7;
  const atLatestMonth = ui.month >= tk.slice(0, 7);

  let cells = weekOrder().map((d) => `<span class="dow">${esc(dayName(d, 'narrow'))}</span>`).join('');
  cells += '<span></span>'.repeat(lead);
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(y, m - 1, i);
    const k = keyOf(d);
    const c = countOf(h, k);
    const scheduled = h.days.includes(d.getDay());
    let cls = '';
    let state_ = 'not scheduled';
    if (k > tk) { cls = 'future'; state_ = 'upcoming'; }
    else if (c >= h.goal) { cls = 'done'; state_ = 'done'; }
    else if (c > 0) { cls = 'part'; state_ = `${c} of ${h.goal}`; }
    else if (scheduled && k >= start && k < tk) { cls = 'miss'; state_ = 'missed'; }
    else if (scheduled) { state_ = 'not done'; }
    else cls = 'off';
    if (k === tk) cls += ' today';
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}: ${state_}`;
    cells += `<button class="${cls.trim()}" data-action="cal" data-id="${esc(h.id)}" data-key="${k}" ${k > tk ? 'disabled' : ''} aria-label="${esc(label)}">${i}</button>`;
  }

  const armed = ui.confirm === `delete:${h.id}`;
  const days = (n) => `<small>${n === 1 ? 'day' : 'days'}</small>`;

  return `
    <div class="narrow">
      <div class="detail-head">
        <button class="back" data-action="back">${ICON_SVG.left}<span>Back</span></button>
        <button class="pill" data-action="edit" data-id="${esc(h.id)}">Edit</button>
      </div>
      <section class="hero" style="${habitVars(h)}">
        <span class="h-icon" aria-hidden="true">${esc(h.icon)}</span>
        <div>
          <h1>${esc(h.name)}</h1>
          <p class="muted">${esc(scheduleText(h))}${h.goal > 1 ? ` · ${h.goal} times a day` : ''}</p>
        </div>
      </section>

      <div class="tiles">
        <div class="tile k1"><div class="value">${cur}${days(cur)}</div><div class="label">Current streak</div></div>
        <div class="tile k2"><div class="value">${best}${days(best)}</div><div class="label">Best streak</div></div>
        <div class="tile k3"><div class="value">${r.pct === null ? '–' : pct(r.pct)}</div><div class="label">Last 30 days</div><div class="sub">${r.done} of ${r.due} scheduled days</div></div>
        <div class="tile k4"><div class="value">${total}</div><div class="label">Total done</div></div>
      </div>

      <section class="card" style="${habitVars(h)}">
        <div class="cal-head">
          <button class="icon-btn" data-action="month" data-delta="-1" aria-label="Previous month">${ICON_SVG.left}</button>
          <strong>${esc(fmt(first, { month: 'long', year: 'numeric' }))}</strong>
          <button class="icon-btn" data-action="month" data-delta="1" aria-label="Next month" ${atLatestMonth ? 'disabled' : ''}>${ICON_SVG.right}</button>
        </div>
        <div class="cal">${cells}</div>
        <div class="cal-legend">
          <span><i class="k-done"></i>Done</span><span><i class="k-part"></i>Partly</span><span><i class="k-miss"></i>Missed</span>
        </div>
        <p class="muted small">Tap a day to mark it done or not done. You can fill in days you forgot.</p>
      </section>

      <button class="danger-btn${armed ? ' armed' : ''}" data-action="delete" data-id="${esc(h.id)}">
        ${armed ? 'Tap again to delete for good' : 'Delete habit'}
      </button>
    </div>`;
}

/* Stats: Weekly, Monthly and Yearly reports */

function renderStats() {
  const tabs = RANGES.map(([r, label]) =>
    `<button class="${ui.range === r ? 'on' : ''}" data-action="range" data-range="${r}" aria-pressed="${ui.range === r}">${label}</button>`).join('');
  const head = `<header class="stats-head"><div class="range-tabs" role="group" aria-label="Report period">${tabs}</div></header>`;
  if (!state.habits.length) return `${head}<p class="empty-note">Add a habit to see your progress here.</p>`;

  const tk = todayKey();
  const a = parseKey(ui.anchor);
  let label;
  let body;
  let atLatest;
  if (ui.range === 'month') {
    const first = new Date(a.getFullYear(), a.getMonth(), 1);
    label = fmt(first, { month: 'long', year: 'numeric' });
    atLatest = keyOf(first).slice(0, 7) >= tk.slice(0, 7);
    body = monthlyView(first);
  } else if (ui.range === 'year') {
    const y = a.getFullYear();
    label = String(y);
    atLatest = y >= parseKey(tk).getFullYear();
    body = yearlyView(y);
  } else {
    const start = startOfWeek(a);
    const end = addDays(start, 6);
    label = `${fmt(start, { month: 'short', day: 'numeric' })} – ${fmt(end, { month: 'short', day: 'numeric' })}`;
    atLatest = keyOf(end) >= tk;
    body = weeklyView(start);
  }

  return `${head}
    <section class="report">
      <div class="banner" aria-hidden="true"><span class="sun">☀️</span><span class="script">Habit For Me</span><span class="moon">🌙</span></div>
      <div class="period">
        <button class="dot-btn" data-action="period" data-delta="-1" aria-label="Earlier">${ICON_SVG.left}</button>
        <span class="period-label">${esc(label)}</span>
        <button class="dot-btn" data-action="period" data-delta="1" aria-label="Later" ${atLatest ? 'disabled' : ''}>${ICON_SVG.right}</button>
      </div>
      ${body}
    </section>`;
}

/** Class for one day of a report grid: done, part(ly), miss(ed), off (not scheduled) or future. */
function dayClass(h, d, start, tk) {
  const k = keyOf(d);
  const c = countOf(h, k);
  if (k > tk) return 'future';
  if (c >= h.goal) return 'done';
  if (c > 0) return 'part';
  return isDue(h, d, start) ? 'miss' : 'off';
}

function weeklyView(start) {
  const tk = todayKey();
  const days = ALL_DAYS.map((i) => addDays(start, i));
  const head = days.map((d) => `<span class="${keyOf(d) === tk ? 'now' : ''}">${esc(fmt(d, { weekday: 'narrow' }))}</span>`).join('');

  const rows = state.habits.map((h) => {
    const s = startKey(h);
    let due = 0;
    let met = 0;
    const cells = days.map((d) => {
      const k = keyOf(d);
      const cls = dayClass(h, d, s, tk);
      if (k <= tk && isDue(h, d, s)) {
        if (cls === 'done') { due++; met++; } else if (k !== tk) due++;
      }
      return `<span class="sq ${cls}"></span>`;
    }).join('');
    const perfect = due > 0 && met === due;
    return `
      <div class="wk-row" style="${habitVars(h)}">
        <div class="wk-name"><span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}</div>
        <div class="wk-grid" role="img" aria-label="${esc(`${h.name}: ${met} of ${due} scheduled days done${perfect ? ', perfect' : ''}`)}">
          ${cells}<span class="badge">${perfect ? '<span title="Perfect">🏅</span>' : ''}</span>
        </div>
      </div>`;
  }).join('');

  const sum = weekSummary(days);
  const top = Math.max(0, ...state.habits.map((h) => currentStreak(h)));
  return `
    <div class="wk">
      <div class="wk-row wk-headrow" aria-hidden="true"><div class="wk-name"></div><div class="wk-grid wk-head">${head}<span></span></div></div>
      ${rows}
    </div>
    <div class="kpis">
      <div class="kpi k1"><b>${sum.met === null ? '–' : pct(sum.met)}</b><span>Met</span></div>
      <div class="kpi k2"><b>${sum.perfect}</b><span>Perfect days</span></div>
      <div class="kpi k3"><b>${sum.total}</b><span>Total done</span></div>
      <div class="kpi k4"><b>${top}<small>d</small></b><span>Top streak</span></div>
    </div>`;
}

function monthlyView(first) {
  const tk = todayKey();
  const y = first.getFullYear();
  const m = first.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const lead = (first.getDay() - state.settings.weekStart + 7) % 7;
  const dows = weekOrder().map((d) => `<span class="mc-dow">${esc(dayName(d, 'narrow'))}</span>`).join('');

  const cards = state.habits.map((h) => {
    const s = startKey(h);
    let met = 0;
    let cells = '<span></span>'.repeat(lead);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(y, m, i);
      let cls = dayClass(h, d, s, tk);
      if (cls === 'done') met++;
      if (keyOf(d) === tk) cls += ' today';
      cells += `<span class="${cls}">${i}</span>`;
    }
    return `
      <button class="mcard" data-action="open" data-id="${esc(h.id)}" style="${habitVars(h)}" aria-label="${esc(`${h.name}: done on ${plural(met, 'day')} this month. Open details.`)}">
        <span class="mc-title"><span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}</span>
        <span class="mc-grid" aria-hidden="true">${dows}${cells}</span>
        <span class="mc-foot" aria-hidden="true">${plural(met, 'day')}</span>
      </button>`;
  }).join('');
  return `<div class="months">${cards}</div>`;
}

/** One row per month, one square per day: a whole year at a glance. */
function yearlyView(y) {
  const tk = todayKey();
  const cards = state.habits.map((h) => {
    const s = startKey(h);
    let done = 0;
    let due = 0;
    let dueDone = 0;
    let cells = '';
    for (let m = 0; m < 12; m++) {
      const dim = new Date(y, m + 1, 0).getDate();
      for (let i = 1; i <= 31; i++) {
        if (i > dim) { cells += '<i class="x"></i>'; continue; }
        const d = new Date(y, m, i);
        const k = keyOf(d);
        const cls = dayClass(h, d, s, tk);
        if (cls === 'done') done++;
        if (k <= tk && isDue(h, d, s) && (cls === 'done' || k !== tk)) {
          due++;
          if (cls === 'done') dueDone++;
        }
        cells += `<i class="${cls}"></i>`;
      }
    }
    const share = due ? pct(dueDone / due) : '–';
    return `
      <button class="ycard" data-action="open" data-id="${esc(h.id)}" style="${habitVars(h)}" aria-label="${esc(`${h.name}: done on ${plural(done, 'day')} in ${y}. Open details.`)}">
        <span class="yc-head"><span class="yc-name"><span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}</span><span class="yc-stat">${plural(done, 'day')} · ${share}</span></span>
        <span class="ygrid" aria-hidden="true">${cells}</span>
      </button>`;
  }).join('');
  return `<div class="years">${cards}</div>`;
}

/* Me: this week, settings and backups */

function renderMe() {
  const t = state.settings.theme;
  const ws = state.settings.weekStart;
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const seg = (action, value, label, on) => `<button data-action="${action}" data-value="${value}" aria-pressed="${on}">${label}</button>`;

  const tk = todayKey();
  const start = startOfWeek(parseKey(tk));
  const spoken = [];
  const week = ALL_DAYS.map((i) => {
    const d = addDays(start, i);
    const k = keyOf(d);
    const p = k > tk ? null : dayProgress(d);
    spoken.push(`${fmt(d, { weekday: 'long' })} ${p === null ? 'nothing yet' : pct(p)}`);
    return `
      <div class="wd${k === tk ? ' now' : ''}">
        <span>${esc(fmt(d, { weekday: 'narrow' }))}</span>
        <span class="wd-ring" style="--p:${(p || 0).toFixed(3)}"><b>${d.getDate()}</b></span>
      </div>`;
  }).join('');

  return `
    <header class="me-head">
      <span class="avatar" aria-hidden="true"><img src="icons/icon.svg" alt=""></span>
      <div><h1>Habit For Me</h1><p class="muted">Your habits stay on this device</p></div>
    </header>

    <div class="me-grid">
      <section class="panel wide">
        <div class="panel-title">This week</div>
        <div class="week-rings" role="img" aria-label="${esc(`This week: ${spoken.join(', ')}`)}">${week}</div>
      </section>

      <section class="panel">
        <div class="panel-title">Settings</div>
        <div class="row"><span>Appearance</span>
          <div class="seg" role="group" aria-label="Appearance">
            ${seg('theme', 'system', 'Auto', t === 'system')}${seg('theme', 'light', 'Light', t === 'light')}${seg('theme', 'dark', 'Dark', t === 'dark')}
          </div>
        </div>
        <div class="row"><span>Week starts on</span>
          <div class="seg" role="group" aria-label="Week starts on">
            ${seg('week-start', 1, 'Mon', ws === 1)}${seg('week-start', 0, 'Sun', ws === 0)}
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">Your data</div>
        <p class="help">Your habits are saved only on this device. Make a backup to keep them safe or move them to another phone.</p>
        <button class="row" data-action="export"><span>Download a backup</span><span class="muted">.json</span></button>
        <button class="row" data-action="import"><span>Restore from a backup</span><span class="muted">Replaces data</span></button>
        <button class="row danger${ui.confirm === 'reset' ? ' armed' : ''}" data-action="reset">
          <span>${ui.confirm === 'reset' ? 'Tap again to delete everything' : 'Delete all data'}</span>
        </button>
      </section>

      <section class="panel help-panel">
        <div class="panel-title">Put it on your phone</div>
        <div class="help">
          ${installed ? '<p><strong>✓ Installed.</strong> You are using Habit For Me as an app.</p>' : `
            <p><strong>iPhone / iPad:</strong> open this page in Safari, tap the Share button, then <em>Add to Home Screen</em>.</p>
            <p><strong>Android:</strong> open it in Chrome, tap the ⋮ menu, then <em>Install app</em> or <em>Add to Home screen</em>.</p>
            <p><strong>Mac:</strong> in Safari choose <em>File → Add to Dock</em>. In Chrome, click the install icon in the address bar.</p>`}
        </div>
      </section>
    </div>

    <p class="muted small center about">Habit For Me · version 2.0</p>`;
}

/* ---------- 6. Add / edit sheet ---------- */

const sheet = document.getElementById('sheet');

function openSheet(h, preset) {
  ui.editing = h ? h.id : null;
  const v = h || {
    name: preset ? preset.name : '',
    icon: preset ? preset.icon : ICONS[0],
    color: preset ? preset.color : COLORS[0],
    goal: preset ? preset.goal : 1,
    days: ALL_DAYS,
  };
  const icons = ICONS.includes(v.icon) ? ICONS : [v.icon, ...ICONS];
  const colors = COLORS.includes(v.color) ? COLORS : [v.color, ...COLORS];

  sheet.innerHTML = `
    <div class="sheet-inner">
      <div class="grabber" aria-hidden="true"></div>
      <form id="habit-form" novalidate>
        <div class="sheet-head">
          <button type="button" class="x-btn" data-action="close-sheet" aria-label="Close">${ICON_SVG.close}</button>
          <h2 id="sheet-title">${h ? 'Edit habit' : 'New habit'}</h2>
          <span aria-hidden="true"></span>
        </div>

        <div class="fgroup name-row" style="--c:${v.color}">
          <span class="preview" aria-hidden="true">${esc(v.icon)}</span>
          <label class="name-field"><span class="flabel">Name</span>
            <input type="text" name="name" maxlength="60" placeholder="e.g. Drink water" value="${esc(v.name)}" autocomplete="off" required>
          </label>
        </div>

        <fieldset class="fgroup"><legend class="flabel">Icon</legend>
          <div class="icon-grid">
            ${icons.map((ic) => `<label class="opt icon-opt"><input type="radio" name="icon" value="${esc(ic)}" ${ic === v.icon ? 'checked' : ''} aria-label="${esc(ic)}"><span>${esc(ic)}</span></label>`).join('')}
          </div>
        </fieldset>

        <fieldset class="fgroup"><legend class="flabel">Colour</legend>
          <div class="color-row">
            ${colors.map((c, i) => `<label class="opt color-opt" style="--c:${c}"><input type="radio" name="color" value="${c}" ${c === v.color ? 'checked' : ''} aria-label="Colour ${i + 1}"><span></span></label>`).join('')}
          </div>
        </fieldset>

        <div class="fgroup frow">
          <span class="flabel" id="goal-label">Times per day</span>
          <div class="stepper" role="group" aria-labelledby="goal-label">
            <button type="button" data-action="step" data-delta="-1" aria-label="One fewer">−</button>
            <output aria-live="polite">${v.goal}</output>
            <button type="button" data-action="step" data-delta="1" aria-label="One more">+</button>
          </div>
          <input type="hidden" name="goal" value="${v.goal}">
        </div>
        <p class="hint">Use more than 1 for things like “8 glasses of water”.</p>

        <fieldset class="fgroup"><legend class="flabel">Repeat on</legend>
          <div class="presets">
            <button type="button" class="chip" data-action="preset" data-days="0,1,2,3,4,5,6">Every day</button>
            <button type="button" class="chip" data-action="preset" data-days="1,2,3,4,5">Weekdays</button>
            <button type="button" class="chip" data-action="preset" data-days="0,6">Weekends</button>
          </div>
          <div class="day-chips">
            ${weekOrder().map((d) => `<label class="opt day-opt"><input type="checkbox" name="days" value="${d}" ${v.days.includes(d) ? 'checked' : ''} aria-label="${esc(dayName(d, 'long'))}"><span>${esc(dayName(d).slice(0, 2))}</span></label>`).join('')}
          </div>
        </fieldset>

        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="primary">${h ? 'Save changes' : 'Add habit'}</button>
      </form>
    </div>`;

  sheet.showModal();
  if (!h && !preset) sheet.querySelector('input[name="name"]').focus();
}

// Show the chosen icon and colour in the preview next to the name.
sheet.addEventListener('change', (e) => {
  const form = e.target.form;
  if (!form) return;
  if (e.target.name === 'icon') form.querySelector('.preview').textContent = e.target.value;
  if (e.target.name === 'color') form.querySelector('.name-row').style.setProperty('--c', e.target.value);
});

sheet.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const days = fd.getAll('days').map(Number).sort();
  const error = form.querySelector('.form-error');

  const problem = !name ? 'Please give your habit a name.' : !days.length ? 'Pick at least one day.' : '';
  if (problem) {
    error.textContent = problem;
    error.hidden = false;
    if (!name) form.elements.name.focus();
    return;
  }

  const data = {
    name: name.slice(0, 60),
    icon: String(fd.get('icon') || ICONS[0]),
    color: String(fd.get('color') || COLORS[0]),
    goal: clampInt(fd.get('goal'), 1, 50, 1),
    days,
  };
  const existing = ui.editing && findHabit(ui.editing);
  if (existing) Object.assign(existing, data);
  else state.habits.push({ id: newId(), createdAt: todayKey(), ...data });

  save();
  sheet.close();
  render();
  toast(existing ? 'Habit updated' : `${data.icon} ${data.name} added`);
});

// Tapping the dark area outside the sheet closes it.
sheet.addEventListener('click', (e) => {
  if (e.target === sheet) sheet.close();
});

function newId() {
  return window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ---------- 7. Actions ---------- */

function tick(h) {
  const k = ui.date;
  if (k > todayKey()) return;
  const c = countOf(h, k);
  const next = c >= h.goal ? 0 : c + 1; // tapping a finished habit resets it
  setCount(h, k, next);
  if (navigator.vibrate) navigator.vibrate(next >= h.goal ? 18 : 8);
  render();

  if (next >= h.goal && k === todayKey()) {
    const due = state.habits.filter((x) => isDue(x, parseKey(k)));
    if (due.length > 1 && due.every((x) => isDone(x, k))) toast('All done for today! 🎉');
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habit-for-me-backup-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Backup downloaded');
}

document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.habits)) throw new Error('Not a backup');
    state = normalize(data);
    save();
    applyTheme();
    ui.detail = null;
    render();
    toast(`Backup restored: ${plural(state.habits.length, 'habit')}`);
  } catch (err) {
    toast("That file isn't a Habit For Me backup");
  }
});

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const action = el.dataset.action;
  const h = el.dataset.id ? findHabit(el.dataset.id) : null;
  if (action !== 'delete' && action !== 'reset') ui.confirm = null;

  switch (action) {
    case 'tab':
      ui.tab = el.dataset.tab;
      ui.detail = null;
      render();
      window.scrollTo(0, 0);
      break;
    case 'add':
      openSheet(null);
      break;
    case 'suggest':
      openSheet(null, SUGGESTIONS[Number(el.dataset.i)]);
      break;
    case 'tick':
      if (h) tick(h);
      break;
    case 'open':
      if (!h) break;
      ui.detail = h.id;
      ui.month = ui.date.slice(0, 7);
      render();
      window.scrollTo(0, 0);
      break;
    case 'back':
      ui.detail = null;
      render();
      break;
    case 'edit':
      if (h) openSheet(h);
      break;
    case 'delete':
      if (!h) break;
      if (ui.confirm === `delete:${h.id}`) {
        state.habits = state.habits.filter((x) => x !== h);
        delete state.log[h.id];
        save();
        ui.confirm = null;
        ui.detail = null;
        render();
        toast('Habit deleted');
      } else {
        ui.confirm = `delete:${h.id}`;
        render();
      }
      break;
    case 'pick-day':
      ui.date = el.dataset.key;
      render();
      break;
    case 'future-day':
      toast("You can't check off a future day");
      break;
    case 'go-today':
      ui.date = todayKey();
      render();
      break;
    case 'month': {
      const [y, m] = ui.month.split('-').map(Number);
      const d = new Date(y, m - 1 + Number(el.dataset.delta), 1);
      ui.month = keyOf(d).slice(0, 7);
      render();
      break;
    }
    case 'cal': {
      const k = el.dataset.key;
      if (!h || k > todayKey()) break;
      setCount(h, k, isDone(h, k) ? 0 : h.goal);
      render();
      break;
    }
    case 'range':
      ui.range = el.dataset.range;
      ui.anchor = todayKey();
      render();
      break;
    case 'period': {
      const a = parseKey(ui.anchor);
      const n = Number(el.dataset.delta);
      let d;
      if (ui.range === 'month') d = new Date(a.getFullYear(), a.getMonth() + n, 1);
      else if (ui.range === 'year') d = new Date(a.getFullYear() + n, 0, 1);
      else d = addDays(a, 7 * n);
      const k = keyOf(d);
      ui.anchor = k > todayKey() ? todayKey() : k;
      render();
      break;
    }
    case 'theme':
      state.settings.theme = el.dataset.value;
      save();
      applyTheme();
      render();
      break;
    case 'week-start':
      state.settings.weekStart = Number(el.dataset.value);
      save();
      render();
      break;
    case 'export':
      exportData();
      break;
    case 'import':
      document.getElementById('import-file').click();
      break;
    case 'reset':
      if (ui.confirm === 'reset') {
        state = defaultState();
        save();
        applyTheme();
        Object.assign(ui, { confirm: null, tab: 'today', date: todayKey(), anchor: todayKey(), detail: null });
        render();
        toast('All data deleted');
      } else {
        ui.confirm = 'reset';
        render();
      }
      break;
    case 'close-sheet':
      sheet.close();
      break;
    case 'step': {
      const form = el.closest('form');
      const input = form.elements.goal;
      const v = clampInt(Number(input.value) + Number(el.dataset.delta), 1, 50, 1);
      input.value = v;
      form.querySelector('output').textContent = v;
      break;
    }
    case 'preset': {
      const set = el.dataset.days.split(',').map(Number);
      el.closest('form').querySelectorAll('input[name="days"]').forEach((i) => {
        i.checked = set.includes(Number(i.value));
      });
      break;
    }
    default:
      break;
  }
});

let toastTimer;
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function applyTheme() {
  const t = state.settings.theme;
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

// If the app stays open past midnight, move "Today" to the new day.
let lastToday = todayKey();
function checkDayChange() {
  const t = todayKey();
  if (t === lastToday) return;
  if (ui.date === lastToday) ui.date = t;
  if (ui.anchor === lastToday) ui.anchor = t;
  lastToday = t;
  render();
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkDayChange();
});
setInterval(checkDayChange, 60 * 1000);

// Lets the app work offline once it has been opened.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Offline mode unavailable', err));
  });
}

applyTheme();
render();
