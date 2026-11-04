'use strict';

/*
  Habit For Me: a simple habit tracker that runs in the browser.
  Everything is saved on this device (localStorage). No account needed.

  How this file is organised:
    1. Constants        - colours, icons, suggestions
    2. Date helpers     - dates are stored as "YYYY-MM-DD" strings
    3. Saving/loading   - read and write data in localStorage
    4. Habit maths      - streaks, completion rates, daily progress
    5. Screens          - Today, Habit details, Progress, Settings
    6. Add/edit sheet   - the form for creating or changing a habit
    7. Actions          - what happens when you tap things
*/

/* ---------- 1. Constants ---------- */

const STORAGE_KEY = 'habit-for-me:v1';
const COLORS = ['#2f9e6b', '#1a8fd6', '#7a5af5', '#d6409f', '#e5484d', '#ef7a12', '#b98900', '#12a594'];
const ICONS = ['💧', '📚', '🏃', '🧘', '🥗', '😴', '✍️', '🎸', '🧹', '💊', '🚭', '☀️', '🪥', '🚶', '💪', '🙏', '🍎', '💻', '🌱', '🎯'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday ... 6 = Saturday
const SUGGESTIONS = [
  { name: 'Drink water', icon: '💧', color: '#1a8fd6', goal: 8 },
  { name: 'Read 20 minutes', icon: '📚', color: '#7a5af5', goal: 1 },
  { name: 'Go for a walk', icon: '🚶', color: '#2f9e6b', goal: 1 },
  { name: 'Meditate', icon: '🧘', color: '#d6409f', goal: 1 },
  { name: 'Sleep by 11pm', icon: '😴', color: '#12a594', goal: 1 },
];

const ICON_SVG = {
  tick: '<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
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
  tab: 'today',
  date: todayKey(), // the day shown on the Today screen
  detail: null, // id of the habit being viewed, or null
  month: null, // "YYYY-MM" shown in the habit calendar
  peek: null, // { chart, key } - the day tapped on a Progress chart
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
  }

  const habit = ui.detail && findHabit(ui.detail);
  if (ui.detail && !habit) ui.detail = null;

  if (habit) view.innerHTML = renderDetail(habit);
  else if (ui.tab === 'stats') view.innerHTML = renderStats();
  else if (ui.tab === 'settings') view.innerHTML = renderSettings();
  else view.innerHTML = renderToday();

  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === ui.tab;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });

  if (focusSel) {
    const el = view.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }
}

/* Today */

function renderToday() {
  const tk = todayKey();
  const sel = parseKey(ui.date);
  const isToday = ui.date === tk;
  const isYesterday = ui.date === keyOf(addDays(new Date(), -1));
  const title = isToday ? 'Today' : isYesterday ? 'Yesterday' : fmt(sel, { weekday: 'long' });
  const sub = isToday
    ? fmt(sel, { weekday: 'long', month: 'long', day: 'numeric' })
    : fmt(sel, { month: 'long', day: 'numeric', year: 'numeric' });

  const head = `
    <header class="page-head">
      <div><h1>${esc(title)}</h1><p class="muted">${esc(sub)}</p></div>
      ${state.habits.length ? `
        <div class="head-actions">
          ${isToday ? '' : '<button class="pill" data-action="go-today">Today</button>'}
          <button class="add-btn" data-action="add" aria-label="Add a new habit">${ICON_SVG.plus}</button>
        </div>` : ''}
    </header>`;

  if (!state.habits.length) {
    return `${head}
      <section class="card empty">
        <div class="big" aria-hidden="true">🌱</div>
        <h2>Start your first habit</h2>
        <p class="muted">Small things, done every day, add up. Pick one to begin, or make your own.</p>
        <div class="chips">
          ${SUGGESTIONS.map((s, i) => `<button class="chip" data-action="suggest" data-i="${i}">${s.icon} ${esc(s.name)}</button>`).join('')}
        </div>
        <button class="primary" data-action="add">Create my own habit</button>
      </section>`;
  }

  const due = state.habits.filter((h) => isDue(h, sel));
  const resting = state.habits.length - due.length;
  const done = due.filter((h) => isDone(h, ui.date)).length;
  const p = dayProgress(sel) || 0;

  return `${head}
    ${weekStrip(sel)}
    ${due.length ? `
      <section class="card summary" aria-label="Progress for this day">
        <div class="summary-row"><strong>${done} of ${due.length} done</strong><span class="muted">${pct(p)}</span></div>
        <div class="bar"><span style="width:${p * 100}%"></span></div>
      </section>
      <ul class="habit-list">${due.map((h) => habitRow(h, ui.date)).join('')}</ul>`
    : '<p class="empty-note">Nothing scheduled for this day. Enjoy the rest! 🌿</p>'}
    ${resting ? `<p class="muted small center rest-note">${plural(resting, 'habit')} not scheduled ${isToday ? 'today' : 'this day'}.</p>` : ''}`;
}

function weekStrip(sel) {
  const tk = todayKey();
  const start = startOfWeek(sel);
  const atLatestWeek = keyOf(addDays(start, 6)) >= tk;
  let cells = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const k = keyOf(d);
    const future = k > tk;
    const p = future ? 0 : dayProgress(d) || 0;
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${future ? '' : `, ${pct(p)} done`}`;
    cells += `
      <button class="day${k === ui.date ? ' sel' : ''}${k === tk ? ' is-today' : ''}" data-action="pick-day" data-key="${k}"
        ${future ? 'disabled' : ''} aria-label="${esc(label)}" ${k === ui.date ? 'aria-current="date"' : ''}>
        <span class="dow" aria-hidden="true">${esc(fmt(d, { weekday: 'narrow' }))}</span>
        <span class="ring" style="--p:${p.toFixed(3)}" aria-hidden="true"><span>${d.getDate()}</span></span>
      </button>`;
  }
  return `
    <div class="week">
      <button class="icon-btn" data-action="week" data-delta="-7" aria-label="Previous week">${ICON_SVG.left}</button>
      <div class="days">${cells}</div>
      <button class="icon-btn" data-action="week" data-delta="7" aria-label="Next week" ${atLatestWeek ? 'disabled' : ''}>${ICON_SVG.right}</button>
    </div>`;
}

function habitRow(h, k) {
  const c = countOf(h, k);
  const done = c >= h.goal;
  const p = Math.min(c / h.goal, 1);
  const streak = currentStreak(h);
  const parts = [];
  if (h.goal > 1) parts.push(`${Math.min(c, h.goal)} of ${h.goal}`);
  parts.push(streak ? `🔥 ${streak} in a row` : scheduleText(h));
  const label = done
    ? `${h.name}: done. Tap to undo.`
    : h.goal > 1 ? `${h.name}: ${c} of ${h.goal}. Tap to add one.` : `${h.name}: not done. Tap to mark done.`;

  return `
    <li class="habit${done ? ' done' : ''}" style="--c:${h.color}">
      <button class="habit-main" data-action="open" data-id="${esc(h.id)}" aria-label="${esc(h.name)} details">
        <span class="h-icon" aria-hidden="true">${esc(h.icon)}</span>
        <span class="h-body"><span class="h-name">${esc(h.name)}</span><span class="h-meta">${esc(parts.join(' · '))}</span></span>
      </button>
      <button class="check" data-action="tick" data-id="${esc(h.id)}" aria-pressed="${done}" aria-label="${esc(label)}">
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle class="track" cx="22" cy="22" r="19"/>
          <circle class="prog" cx="22" cy="22" r="19" pathLength="100" style="stroke-dasharray:${(p * 100).toFixed(1)} 100;${p ? '' : 'opacity:0'}"/>
        </svg>
        <span class="check-in">${done ? ICON_SVG.tick : h.goal > 1 ? `<small>${c}/${h.goal}</small>` : ''}</span>
      </button>
    </li>`;
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

  return `
    <div class="detail-head">
      <button class="back" data-action="back">${ICON_SVG.left}<span>Back</span></button>
      <button class="pill" data-action="edit" data-id="${esc(h.id)}">Edit</button>
    </div>
    <section class="hero" style="--c:${h.color}">
      <span class="h-icon" aria-hidden="true">${esc(h.icon)}</span>
      <div>
        <h1>${esc(h.name)}</h1>
        <p class="muted">${esc(scheduleText(h))}${h.goal > 1 ? ` · ${h.goal} times a day` : ''}</p>
      </div>
    </section>

    <div class="tiles">
      <div class="tile"><div class="label">Current streak</div><div class="value">${cur}</div><div class="sub">${cur === 1 ? 'day' : 'days'} in a row</div></div>
      <div class="tile"><div class="label">Best streak</div><div class="value">${best}</div><div class="sub">${best === 1 ? 'day' : 'days'}</div></div>
      <div class="tile"><div class="label">Last 30 days</div><div class="value">${r.pct === null ? '–' : pct(r.pct)}</div><div class="sub">${r.done} of ${r.due} scheduled days</div></div>
      <div class="tile"><div class="label">Total</div><div class="value">${total}</div><div class="sub">${total === 1 ? 'day' : 'days'} completed</div></div>
    </div>

    <h2 class="section-title">History</h2>
    <section class="card" style="--c:${h.color}">
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
    </button>`;
}

/* Progress */

function renderStats() {
  const head = '<header class="page-head"><div><h1>Progress</h1><p class="muted">How your habits are going</p></div></header>';
  if (!state.habits.length) return `${head}<p class="empty-note">Add a habit to see your progress here.</p>`;

  const tk = todayKey();
  const now = parseKey(tk);
  const dueToday = state.habits.filter((h) => isDue(h, now));
  const doneToday = dueToday.filter((h) => isDone(h, tk)).length;

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(now, -i);
    last7.push({ d, k: keyOf(d), p: dayProgress(d) });
  }
  const scored = last7.filter((x) => x.p !== null);
  const avg7 = scored.length ? scored.reduce((s, x) => s + x.p, 0) / scored.length : null;

  let perfect = 0;
  for (let i = 0; i < 30; i++) if (dayProgress(addDays(now, -i)) === 1) perfect++;

  let top = null;
  for (const h of state.habits) {
    const s = currentStreak(h);
    if (!top || s > top.s) top = { h, s };
  }

  const describe = (d, p) => `${fmt(d, { weekday: 'long', month: 'short', day: 'numeric' })}: ${p === null ? 'nothing scheduled' : `${pct(p)} done`}`;

  // Last 7 days bar chart
  const barKey = ui.peek && ui.peek.chart === 'bar' ? ui.peek.key : tk;
  const barSel = last7.find((x) => x.k === barKey) || last7[6];
  const bars = last7.map((x) => `
    <button class="${x.k === barSel.k ? 'sel' : ''}" data-action="peek" data-chart="bar" data-key="${x.k}" aria-label="${esc(describe(x.d, x.p))}">
      <span class="col${x.p ? '' : ' zero'}" style="height:${x.p ? Math.max(x.p * 100, 3) : 0}%"></span>
    </button>`).join('');
  const barLabels = last7.map((x) => `<span class="${x.k === tk ? 'now' : ''}">${esc(fmt(x.d, { weekday: 'narrow' }))}</span>`).join('');

  // Last 12 weeks heatmap
  const weeks = 12;
  const hStart = startOfWeek(addDays(now, -7 * (weeks - 1)));
  const heatKey = ui.peek && ui.peek.chart === 'heat' ? ui.peek.key : tk;
  let heat = '';
  let heatSel = { d: now, p: dayProgress(now) };
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(hStart, i);
    const k = keyOf(d);
    if (k > tk) { heat += '<span class="blank"></span>'; continue; }
    const p = dayProgress(d);
    const lvl = p === null ? 'none' : p === 0 ? 'l0' : p < 1 / 3 ? 'l1' : p < 2 / 3 ? 'l2' : p < 1 ? 'l3' : 'l4';
    if (k === heatKey) heatSel = { d, p };
    heat += `<button class="${lvl}${k === heatKey ? ' sel' : ''}" data-action="peek" data-chart="heat" data-key="${k}" aria-label="${esc(describe(d, p))}"></button>`;
  }

  const rows = state.habits.map((h) => {
    const r = rate(h, 30);
    return `
      <li class="rate-row" style="--c:${h.color}">
        <span class="r-icon" aria-hidden="true">${esc(h.icon)}</span>
        <div class="r-body">
          <div class="r-name">${esc(h.name)}</div>
          <div class="bar"><span style="width:${(r.pct || 0) * 100}%"></span></div>
        </div>
        <span class="r-pct">${r.pct === null ? '–' : pct(r.pct)}</span>
      </li>`;
  }).join('');

  return `${head}
    <div class="tiles">
      <div class="tile"><div class="label">Today</div><div class="value">${doneToday}/${dueToday.length}</div><div class="sub">habits done</div></div>
      <div class="tile"><div class="label">Last 7 days</div><div class="value">${avg7 === null ? '–' : pct(avg7)}</div><div class="sub">average done</div></div>
      <div class="tile"><div class="label">Perfect days</div><div class="value">${perfect}</div><div class="sub">in the last 30 days</div></div>
      <div class="tile"><div class="label">Top streak</div><div class="value">${top.s}</div><div class="sub">${esc(`${top.h.icon} ${top.h.name}`)}</div></div>
    </div>

    <h2 class="section-title">Last 7 days</h2>
    <section class="card">
      <p class="readout">${esc(describe(barSel.d, barSel.p))}</p>
      <div class="chart">${bars}</div>
      <div class="chart-labels" aria-hidden="true">${barLabels}</div>
    </section>

    <h2 class="section-title">Last 12 weeks</h2>
    <section class="card">
      <p class="readout">${esc(describe(heatSel.d, heatSel.p))}</p>
      <div class="heat">${heat}</div>
      <div class="legend" aria-hidden="true">Less <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> More</div>
    </section>

    <h2 class="section-title">Each habit · last 30 days</h2>
    <section class="card"><ul class="rate-list">${rows}</ul></section>`;
}

/* Settings */

function renderSettings() {
  const t = state.settings.theme;
  const ws = state.settings.weekStart;
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const seg = (action, value, label, on) => `<button data-action="${action}" data-value="${value}" aria-pressed="${on}">${label}</button>`;

  return `
    <header class="page-head"><div><h1>Settings</h1><p class="muted">Make it yours</p></div></header>

    <h2 class="section-title">Look</h2>
    <section class="group">
      <div class="row"><span>Appearance</span>
        <div class="seg" role="group" aria-label="Appearance">
          ${seg('theme', 'system', 'Auto', t === 'system')}${seg('theme', 'light', 'Light', t === 'light')}${seg('theme', 'dark', 'Dark', t === 'dark')}
        </div>
      </div>
      <div class="row"><span>Week starts on</span>
        <div class="seg" role="group" aria-label="Week starts on">
          ${seg('week-start', 1, 'Monday', ws === 1)}${seg('week-start', 0, 'Sunday', ws === 0)}
        </div>
      </div>
    </section>

    <h2 class="section-title">Put it on your phone</h2>
    <section class="group help">
      ${installed ? '<p><strong>✓ Installed.</strong> You are using Habit For Me as an app.</p>' : `
        <p><strong>iPhone / iPad:</strong> open this page in Safari, tap the Share button, then <em>Add to Home Screen</em>.</p>
        <p><strong>Android:</strong> open it in Chrome, tap the ⋮ menu, then <em>Install app</em> or <em>Add to Home screen</em>.</p>
        <p>It then opens like a normal app and works without internet.</p>`}
    </section>

    <h2 class="section-title">Your data</h2>
    <section class="group">
      <p class="help">Your habits are saved only on this device. Make a backup to keep them safe or move them to another phone.</p>
      <button class="row" data-action="export"><span>Download a backup</span><span class="muted">.json</span></button>
      <button class="row" data-action="import"><span>Restore from a backup</span><span class="muted">Replaces data</span></button>
      <button class="row danger${ui.confirm === 'reset' ? ' armed' : ''}" data-action="reset">
        <span>${ui.confirm === 'reset' ? 'Tap again to delete everything' : 'Delete all data'}</span>
      </button>
    </section>

    <p class="muted small center about">Habit For Me · version 1.0</p>`;
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
          <button type="button" class="text-btn" data-action="close-sheet">Cancel</button>
          <h2 id="sheet-title">${h ? 'Edit habit' : 'New habit'}</h2>
          <button type="submit" class="text-btn strong">Save</button>
        </div>

        <label class="field"><span>Name</span>
          <input type="text" name="name" maxlength="60" placeholder="e.g. Drink water" value="${esc(v.name)}" autocomplete="off" required>
        </label>

        <fieldset><legend>Icon</legend>
          <div class="icon-grid">
            ${icons.map((ic) => `<label class="opt icon-opt"><input type="radio" name="icon" value="${esc(ic)}" ${ic === v.icon ? 'checked' : ''} aria-label="${esc(ic)}"><span>${esc(ic)}</span></label>`).join('')}
          </div>
        </fieldset>

        <fieldset><legend>Colour</legend>
          <div class="color-row">
            ${colors.map((c, i) => `<label class="opt color-opt" style="--c:${c}"><input type="radio" name="color" value="${c}" ${c === v.color ? 'checked' : ''} aria-label="Colour ${i + 1}"><span></span></label>`).join('')}
          </div>
        </fieldset>

        <div class="field"><span id="goal-label">Times per day</span>
          <div class="stepper" role="group" aria-labelledby="goal-label">
            <button type="button" data-action="step" data-delta="-1" aria-label="One fewer">−</button>
            <output aria-live="polite">${v.goal}</output>
            <button type="button" data-action="step" data-delta="1" aria-label="One more">+</button>
          </div>
          <input type="hidden" name="goal" value="${v.goal}">
        </div>
        <p class="hint">Use more than 1 for things like “8 glasses of water”.</p>

        <fieldset><legend>Repeat on</legend>
          <div class="presets">
            <button type="button" class="chip" data-action="preset" data-days="0,1,2,3,4,5,6">Every day</button>
            <button type="button" class="chip" data-action="preset" data-days="1,2,3,4,5">Weekdays</button>
            <button type="button" class="chip" data-action="preset" data-days="0,6">Weekends</button>
          </div>
          <div class="day-chips">
            ${weekOrder().map((d) => `<label class="opt day-opt"><input type="checkbox" name="days" value="${d}" ${v.days.includes(d) ? 'checked' : ''} aria-label="${esc(dayName(d, 'long'))}"><span>${esc(dayName(d))}</span></label>`).join('')}
          </div>
        </fieldset>

        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="primary">${h ? 'Save changes' : 'Add habit'}</button>
      </form>
    </div>`;

  sheet.showModal();
  if (!h && !preset) sheet.querySelector('input[name="name"]').focus();
}

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
      ui.peek = null;
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
    case 'week': {
      const next = keyOf(addDays(parseKey(ui.date), Number(el.dataset.delta)));
      ui.date = next > todayKey() ? todayKey() : next;
      render();
      break;
    }
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
    case 'peek':
      ui.peek = { chart: el.dataset.chart, key: el.dataset.key };
      render();
      break;
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
        Object.assign(ui, { confirm: null, tab: 'today', date: todayKey(), detail: null, peek: null });
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
