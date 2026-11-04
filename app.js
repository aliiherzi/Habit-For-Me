'use strict';

/*
  Habit For Me: a simple habit tracker that runs in the browser.
  Everything is saved on this device (localStorage). No account needed.

  How this file is organised:
    1. Constants        - colours, icons, moods, tips and quotes
    2. Date helpers     - dates are stored as "YYYY-MM-DD" strings
    3. Saving/loading   - read and write data in localStorage
    4. Habit maths      - streaks, completion rates, daily progress
    5. Screens          - Today, Stats, All habits, Me, and each habit's counter and Stat pages
    6. Sheets           - add/edit a habit, memo, mood and note, keypad, tips, profile
    7. Actions          - what happens when you tap things
    8. Reminders        - a notification at the chosen time while the app is open
*/

/* ---------- 1. Constants ---------- */

const STORAGE_KEY = 'habit-for-me:v1';
const MAX_COUNT = 999; // the most times a habit can be counted in one day

// Colour sets in the colour picker.
const PALETTES = [
  ['Bright', ['#ff5a7a', '#ff6b6b', '#ff8a5c', '#ffa94d', '#ffc542', '#f5d547', '#c8e05a',
    '#7ed957', '#3ccf7a', '#20c9a6', '#2ec4d6', '#3ab4ff', '#3d8bff', '#2f6bff',
    '#5b6cff', '#7c5cff', '#a05cff', '#c85cf0', '#f05cc8', '#ff6fa8', '#a1887f']],
  ['Soft', ['#f8bbd0', '#ffcdd2', '#ffccbc', '#ffe0b2', '#fff59d', '#f0f4c3', '#dcedc8',
    '#c8e6c9', '#b2dfdb', '#b2ebf2', '#b3e5fc', '#bbdefb', '#c5cae9', '#d1c4e9',
    '#e1bee7', '#f3d1f4', '#d7ccc8', '#cfd8dc', '#ffe4ec', '#e6f4ea', '#e3e8ff']],
];
const NEW_COLORS = ['#2f6bff', '#ff5a7a', '#20c9a6', '#ffa94d', '#7c5cff', '#3ccf7a', '#f05cc8'];
const ICONS = ['💪', '🏃', '🚶', '🧘', '🚴', '🏊', '💧', '🥗', '🍎', '🍵', '😴', '🛏️', '📚', '📖', '✍️', '📝',
  '🎯', '💻', '🧠', '🎸', '🎨', '🎧', '🧹', '🪥', '🧴', '💊', '🚭', '📵', '☀️', '🌱', '🙏', '🕌', '📿', '💰',
  '💼', '🗣️', '🐶', '⚽', '❤️', '⭐'];
const AVATARS = ['🙂', '😎', '🦁', '🐼', '🦊', '🐯', '🐨', '🐸', '🦉', '🌻', '⭐', '🚀', '🧕', '👩', '👨', '🧔', '👧', '👦'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday ... 6 = Saturday
const TIMES = [['any', 'Anytime', '🕘'], ['morning', 'Morning', '🌅'], ['afternoon', 'Afternoon', '☀️'], ['evening', 'Evening', '🌙']];
const SUGGESTIONS = [
  { name: 'Drink water', icon: '💧', color: '#2ec4d6', goal: 8, unit: 'glasses' },
  { name: 'Read', icon: '📚', color: '#7c5cff', goal: 1, desc: '20 minutes' },
  { name: 'Go for a walk', icon: '🚶', color: '#3d8bff', goal: 1 },
  { name: 'Workout', icon: '💪', color: '#2f6bff', goal: 1, desc: 'Gym' },
  { name: 'Meditate', icon: '🧘', color: '#f05cc8', goal: 1 },
  { name: 'Sleep by 11pm', icon: '😴', color: '#3ccf7a', goal: 1 },
];
const MOODS = [
  { emoji: '😞', label: 'Awful' },
  { emoji: '🙁', label: 'Bad' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😄', label: 'Great' },
];
// The Unit picker: kinds of things to count, each with its own measurements (first one is the default).
const SPORTS = ['American Football', 'Archery', 'Badminton', 'Baseball', 'Basketball', 'Bowling', 'Boxing',
  'Cardio Dance', 'Climbing', 'Cooldown', 'Cricket', 'Cycling', 'Dance', 'Football (soccer)', 'Golf',
  'Gym / Strength', 'HIIT', 'Hiking', 'Martial Arts', 'Pilates', 'Rowing', 'Running', 'Skating', 'Skiing',
  'Swimming', 'Table Tennis', 'Tennis', 'Volleyball', 'Walking', 'Yoga'];
const DISTANCE_SPORTS = ['Cycling', 'Hiking', 'Rowing', 'Running', 'Skiing', 'Walking'];
const UNIT_KINDS = [
  ['Activity', [['Active Energy', ['kcal', 'kJ']], ['Basal Energy', ['kcal', 'kJ']], ['Cycling Distance', ['km', 'mi', 'm']],
    ['Flights Climbed', ['floors']], ['Move Time', ['min']], ['Stand Hours', ['hr']], ['Stand Minutes', ['min']],
    ['Steps', ['steps']], ['Swimming Distance', ['m', 'yd']], ['Walking + Running Distance', ['km', 'mi', 'm']]]],
  ['Body Measurements', [['Body Weight', ['kg', 'lb']], ['Body Fat', ['%']], ['Waist', ['cm', 'in']], ['Height', ['cm', 'in']]]],
  ['Nutrition Intake', [['Water', ['glasses', 'ml', 'l', 'cups']], ['Biotin', ['mcg']], ['Caffeine', ['mg']], ['Calcium', ['mg']],
    ['Carbohydrates', ['g']], ['Dietary Energy', ['kcal', 'kJ']], ['Dietary Sugar', ['g']], ['Fiber', ['g']], ['Folate', ['mcg']],
    ['Fruit and vegetables', ['servings']], ['Iron', ['mg']], ['Magnesium', ['mg']], ['Potassium', ['mg']], ['Protein', ['g']],
    ['Sodium', ['mg']], ['Vitamin C', ['mg']], ['Vitamin D', ['mcg']], ['Zinc', ['mg']]]],
  ['Mind', [['Mindful Minutes', ['min']], ['Sleep', ['hr', 'min']], ['Reading', ['pages', 'min', 'chapters']],
    ['Study', ['min', 'hr', 'lessons']], ['Journaling', ['min', 'pages']], ['Screen-free time', ['min', 'hr']]]],
  ['Workout', SPORTS.map((s) => [s, s === 'Swimming' ? ['min', 'hr', 'kcal', 'm'] : DISTANCE_SPORTS.includes(s) ? ['min', 'hr', 'kcal', 'km'] : ['min', 'hr', 'kcal']])],
  ['Faith', [['Quran', ['pages', 'ayahs', 'juz', 'min']], ['Prayers', ['prayers']], ['Sunnah prayers', ['rakats']],
    ['Dhikr', ['times']], ['Istighfar', ['times']], ['Salawat', ['times']], ['Sadaqah', ['times']], ['Fasting', ['days']]]],
  ['Other', [['Count', ['count']], ['Times', ['times']], ['Blood Glucose', ['mg/dL', 'mmol/L']], ['Handwashing', ['min']],
    ['Time in Daylight', ['min']], ['Toothbrushing', ['min']]]],
];
const MEMO_EMOJIS = ['😀', '🙂', '😐', '🙁', '😢', '😂', '🥰', '😎', '😴', '😤', '🤒', '🥳'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/; // "HH:MM", e.g. "08:30"

// Short lines for the Daily quote card (a different one each day).
const QUOTES = [
  'Small steps every day add up to big changes.',
  'You don’t have to be perfect. Just keep showing up.',
  'Today’s effort is tomorrow’s habit.',
  'A little today beats a lot someday.',
  'Every check mark is a promise you kept to yourself.',
  'Slow days still count. Keep going.',
  'Be proud of how far you have come.',
  'One more day, one more step.',
  'Your future self will thank you for today.',
  'Start small, stay steady, finish strong.',
];

const TIPS = [
  ['✅', 'Tap the round button on a habit to check it off. If you do it several times a day, each tap adds one.'],
  ['🎯', 'Tap a habit to open its counter. <strong>Add</strong> lets you type a bigger number in one go.'],
  ['📅', 'Forgot a day? Pick it in the row of days on Today, or tap it in the habit’s <strong>Stat</strong> calendar.'],
  ['🙂', 'Tap the face at the top of Today to save your mood and a note about the day.'],
  ['📝', 'Use <strong>Memo</strong> on a habit to write how it went. Turn on “Write a memo after finishing” to be asked every time.'],
  ['🏷️', 'Give habits a time of day or a group, then use the pink <strong>All</strong> button to show only those.'],
  ['💾', 'Your habits live only on this device. Download a backup from <strong>Me</strong> now and then.'],
];

const svg = (body, w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICON_SVG = {
  tick: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.8),
  left: svg('<path d="M15 6l-6 6 6 6"/>', 2.2),
  right: svg('<path d="M9 6l6 6-6 6"/>', 2.2),
  down: svg('<path d="M7 10l5 5 5-5"/>', 2.2),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.4),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 2.2),
  more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  smile: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.2c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2"/><path d="M9.2 9.6h.01M14.8 9.6h.01" stroke-width="3"/>'),
  swap: svg('<path d="M7 8h11l-3-3M17 16H6l3 3"/>'),
  pencil: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  cal: svg('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
  grid: svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>'),
  check: svg('<rect x="5" y="4" width="14" height="16" rx="3"/><path d="M9 12l2 2 4-4"/>'),
  flame: svg('<path d="M12 21c-3.6 0-6-2.5-6-5.9 0-3.1 2.2-5 3.6-6.9.4 1.5 1.2 2.6 2.3 3.1.2-2.6 1.6-5.1 3.7-7.1.3 2.9 3.4 5.2 3.4 9.6 0 4.4-2.6 7.2-7 7.2z"/>'),
  medal: svg('<circle cx="12" cy="14.5" r="5.5"/><path d="M9 3.5l2.2 5.6M15 3.5l-2.2 5.6M12 12.5v4"/>'),
  bars: svg('<path d="M6 20v-8M12 20V5M18 20v-5"/>', 2.4),
  sum: svg('<path d="M17 5H7l5.5 7L7 19h10"/>'),
  avg: svg('<path d="M4 17l5-5 4 3 7-8"/>'),
  pie: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12h8.5"/>'),
  memo: svg('<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 8.5h6M9 12.5h6M9 16.5h3.5"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
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
const fmtTime = (hm) => {
  const [h, m] = hm.split(':').map(Number);
  return new Date(2023, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};
// Months are written "YYYY-MM".
const monthOf = (d) => keyOf(d).slice(0, 7);
const monthStart = (mk) => parseKey(`${mk}-01`);
const monthEnd = (mk) => {
  const d = monthStart(mk);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};
const shiftMonth = (mk, n) => {
  const d = monthStart(mk);
  return monthOf(new Date(d.getFullYear(), d.getMonth() + n, 1));
};

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
const dayCode = (dow) => dayName(dow).slice(0, 3).toUpperCase(); // "MON"

/* ---------- 3. Saving and loading ---------- */

function defaultState() {
  return {
    version: 4,
    habits: [],
    log: {},
    memos: {},
    journal: {},
    settings: { theme: 'dark', weekStart: 6, name: '', avatar: '🙂' }, // weekStart 6 = Saturday
  };
}

function clampInt(v, min, max, fallback) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

const cleanText = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Cleans up saved or imported data so the app never breaks on bad input. Older backups still load. */
function normalize(raw) {
  const s = defaultState();
  if (!raw || typeof raw !== 'object') return s;

  if (Array.isArray(raw.habits)) {
    const seen = new Set();
    s.habits = raw.habits
      .filter((h) => h && h.id && h.name && !seen.has(String(h.id)) && seen.add(String(h.id)))
      .map((h) => {
        const days = Array.isArray(h.days)
          ? [...new Set(h.days.map(Number))].filter((d) => d >= 0 && d <= 6).sort()
          : [];
        return {
          id: String(h.id),
          name: String(h.name).slice(0, 60),
          desc: cleanText(h.desc, 40), // short line under the name, e.g. "Gym"
          icon: typeof h.icon === 'string' && h.icon ? h.icon.slice(0, 8) : '✅',
          color: /^#[0-9a-f]{6}$/i.test(h.color) ? h.color.toLowerCase() : NEW_COLORS[0],
          goal: clampInt(h.goal, 1, MAX_COUNT, 1),
          unit: cleanText(h.unit, 12), // e.g. "glasses"; empty means "times"
          days: days.length ? days : ALL_DAYS.slice(),
          time: TIMES.some(([t]) => t === h.time) ? h.time : 'any',
          group: cleanText(h.group, 24),
          reminder: TIME_RE.test(h.reminder) ? h.reminder : '', // "" means no reminder
          memo: h.memo === true, // ask for a memo after finishing
          archived: h.archived === true,
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
        const n = clampInt(v, 0, MAX_COUNT, 0);
        if (isKey(k) && n > 0) clean[k] = n;
      }
      s.log[h.id] = clean;
    }
  }

  // Memos for each habit and day: { habitId: { "YYYY-MM-DD": { text, emoji } } }
  if (raw.memos && typeof raw.memos === 'object') {
    for (const h of s.habits) {
      const src = raw.memos[h.id];
      if (!src || typeof src !== 'object') continue;
      const clean = {};
      for (const [k, v] of Object.entries(src)) {
        if (!isKey(k) || !v || typeof v !== 'object') continue;
        const text = typeof v.text === 'string' ? v.text.trim().slice(0, 1000) : '';
        const emoji = typeof v.emoji === 'string' ? v.emoji.slice(0, 8) : '';
        if (text || emoji) clean[k] = { text, emoji };
      }
      if (Object.keys(clean).length) s.memos[h.id] = clean;
    }
  }

  // Mood (1-5) and note for each day: { "YYYY-MM-DD": { mood, note } }
  if (raw.journal && typeof raw.journal === 'object') {
    for (const [k, v] of Object.entries(raw.journal)) {
      if (!isKey(k) || !v || typeof v !== 'object') continue;
      const entry = {};
      const mood = clampInt(v.mood, 0, 5, 0);
      if (mood) entry.mood = mood;
      if (typeof v.note === 'string' && v.note.trim()) entry.note = v.note.slice(0, 1000);
      if (Object.keys(entry).length) s.journal[k] = entry;
    }
  }

  const st = raw.settings || {};
  if (['system', 'light', 'dark'].includes(st.theme)) s.settings.theme = st.theme;
  if ([0, 1, 6].includes(st.weekStart)) s.settings.weekStart = st.weekStart;
  // Before version 4, Monday was just the default, so those weeks now start on Saturday.
  if (!(raw.version >= 4) && st.weekStart === 1) s.settings.weekStart = 6;
  s.settings.name = cleanText(st.name, 30);
  if (typeof st.avatar === 'string' && st.avatar.trim()) s.settings.avatar = st.avatar.trim().slice(0, 8);
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
  startCache.clear();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    toast('Could not save. Storage may be full or blocked.');
  }
}

const startCache = new Map(); // first counted day of each habit, worked out once
let state = load();

// Things about the screen that don't need saving.
const ui = {
  tab: 'today', // today, stats, habits or me
  date: todayKey(), // the day shown on Today and in a habit's counter
  detail: null, // id of the habit whose counter is open, or null
  stat: false, // true when that habit's Stat page is open
  month: todayKey().slice(0, 7), // month in the habit's Stat calendar ("YYYY-MM")
  year: new Date().getFullYear(), // year in the habit's Yearly status
  trend: 'week', // habit Stat chart: week, month or year
  memosAll: false, // show every memo instead of the latest three
  filter: 'all', // Today: "all", "time:morning" or "group:Name"
  pick: 'all', // Stats: "all" or one habit's id
  smonth: todayKey().slice(0, 7), // Stats: month shown
  yearView: false, // Stats: show the whole year instead of one month
  rateYear: false, // Stats: rate for the year instead of the month
  menu: null, // which small menu is open: filter, pick or habit
  confirm: null, // which delete button is waiting for a second tap
  editing: null, // id of the habit open in the edit sheet
};

/* ---------- 4. Habit maths ---------- */

const countOf = (h, k) => (state.log[h.id] && state.log[h.id][k]) || 0;
const isDone = (h, k) => countOf(h, k) >= h.goal;
const findHabit = (id) => state.habits.find((h) => h.id === id) || null;
const active = () => state.habits.filter((h) => !h.archived);
const entryOf = (k) => state.journal[k] || {};
const memoOf = (h, k) => (state.memos[h.id] && state.memos[h.id][k]) || null;

/** Saves the mood and/or note for a day. Empty values are removed. */
function setJournal(k, patch) {
  const next = { ...entryOf(k), ...patch };
  if (!next.mood) delete next.mood;
  if (!next.note) delete next.note;
  if (Object.keys(next).length) state.journal[k] = next;
  else delete state.journal[k];
  save();
}

/** Saves a habit's memo for a day. An empty memo is removed. */
function setMemo(h, k, memo) {
  const all = state.memos[h.id] || (state.memos[h.id] = {});
  if (memo && (memo.text || memo.emoji)) all[k] = memo;
  else delete all[k];
  if (!Object.keys(all).length) delete state.memos[h.id];
  save();
}

/** First day a habit counts from: the day it was made, or an earlier logged day. */
function startKey(h) {
  if (startCache.has(h.id)) return startCache.get(h.id);
  let s = h.createdAt;
  for (const k of Object.keys(state.log[h.id] || {})) if (k < s) s = k;
  startCache.set(h.id, s);
  return s;
}

/** Is this habit scheduled on this date? */
function isDue(h, d, start = startKey(h)) {
  return h.days.includes(d.getDay()) && keyOf(d) >= start;
}

function setCount(h, k, n) {
  const log = state.log[h.id] || (state.log[h.id] = {});
  if (n > 0) log[k] = Math.min(n, MAX_COUNT);
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

const totalDone = (h) => Object.keys(state.log[h.id] || {}).filter((k) => isDone(h, k)).length;

/** 0..1 progress for one day across some habits, or null when nothing was due. */
function progressOf(list, d) {
  const k = keyOf(d);
  const due = list.filter((h) => isDue(h, d));
  if (due.length) return due.reduce((sum, h) => sum + Math.min(countOf(h, k) / h.goal, 1), 0) / due.length;
  // One habit done on a day it wasn't scheduled still shows.
  if (list.length === 1 && countOf(list[0], k)) return Math.min(countOf(list[0], k) / list[0].goal, 1);
  return null;
}
const dayProgress = (d) => progressOf(active(), d);

/**
 * Numbers for some habits between two dates (only up to today):
 * rate = share of scheduled days done (today counts only once done), done = days done,
 * volume = sum of all counts, perfect = days when every scheduled habit was done.
 */
function periodStats(list, from, to) {
  const tk = todayKey();
  const end = keyOf(to) < tk ? keyOf(to) : tk;
  const starts = new Map(list.map((h) => [h.id, startKey(h)]));
  let due = 0;
  let met = 0;
  let done = 0;
  let volume = 0;
  let perfect = 0;
  let days = 0;
  for (let d = new Date(from); keyOf(d) <= end; d = addDays(d, 1)) {
    const k = keyOf(d);
    days++;
    let dayDue = 0;
    let dayMet = 0;
    for (const h of list) {
      const c = countOf(h, k);
      volume += c;
      const ok = c >= h.goal;
      if (ok) done++;
      if (!isDue(h, d, starts.get(h.id))) continue;
      dayDue++;
      if (ok) {
        dayMet++;
        due++;
        met++;
      } else if (k !== tk) due++;
    }
    if (dayDue && dayMet === dayDue) perfect++;
  }
  return { rate: due ? met / due : null, done, volume, perfect, days };
}

/** Text colour (white or dark) that is easy to read on a colour. */
function inkOn(hex) {
  const lin = (i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5);
  return 1.05 / (lum + 0.05) >= 3 ? '#ffffff' : '#1c1c1e';
}

/** CSS variables for a habit: its colour and the text colour that reads well on it. */
function habitVars(h) {
  return `--c:${h.color};--ink:${inkOn(h.color)}`;
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
const fmtNum = (x) => String(Math.round(x * 100) / 100);

/* ---------- 5. Screens ---------- */

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const view = document.getElementById('view');

function render() {
  // Remember which button had keyboard focus so it can be focused again after redrawing.
  const focused = document.activeElement;
  let focusSel = null;
  if (focused && view.contains(focused) && focused.dataset.action) {
    focusSel = `[data-action="${focused.dataset.action}"]`;
    for (const attr of ['id', 'key', 'value', 'menu', 'delta']) {
      if (focused.dataset[attr] !== undefined) focusSel += `[data-${attr}="${CSS.escape(focused.dataset[attr])}"]`;
    }
  }

  const habit = ui.detail && findHabit(ui.detail);
  if (ui.detail && !habit) {
    ui.detail = null;
    ui.stat = false;
  }

  if (habit) view.innerHTML = ui.stat ? renderHabitStats(habit) : renderCounter(habit);
  else if (ui.tab === 'stats') view.innerHTML = renderStats();
  else if (ui.tab === 'habits') view.innerHTML = renderHabits();
  else if (ui.tab === 'me') view.innerHTML = renderMe();
  else view.innerHTML = renderToday();

  document.body.dataset.screen = habit ? (ui.stat ? 'habit-stat' : 'counter') : ui.tab;
  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === ui.tab;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
    if (b.dataset.tab === 'today') {
      // On Today, the Today button turns into a pink + for adding a habit.
      const addMode = on && !habit;
      b.classList.toggle('add-mode', addMode);
      b.setAttribute('aria-label', addMode ? 'Add a new habit' : 'Today');
      b.title = addMode ? 'Add a new habit' : 'Today';
    }
  });

  // Keep the chosen day in view in the row of days (today sits at the right end).
  const strip = view.querySelector('.strip');
  const chosen = strip && strip.querySelector('.sel');
  if (chosen) strip.scrollLeft = chosen.offsetLeft + chosen.offsetWidth - strip.clientWidth + 6;

  if (focusSel) {
    const el = view.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }
}

/** Top bar: buttons on the left, title in the middle, buttons on the right, then an open menu. */
function topBar(title, left = '', right = '', extra = '', cls = '') {
  return `
    <header class="top${cls ? ` ${cls}` : ''}">
      <div class="top-side">${left}</div>
      <h1 class="top-title">${title}</h1>
      <div class="top-side end">${right}</div>
      ${extra}
    </header>`;
}

const roundBtn = (action, icon, label, attrs = '') =>
  `<button class="round" data-action="${action}" aria-label="${esc(label)}" title="${esc(label)}" ${attrs}>${icon}</button>`;
const tipButton = () => '<button class="fab-tip" data-action="tips" aria-label="Tips" title="Tips"><span aria-hidden="true">💡</span></button>';

/** A small menu. Items: { action, label, attrs, icon, on, danger }. */
function popover(items, place) {
  return `
    <div class="popover ${place}" role="menu">
      ${items.map((i) => `
        <button role="menuitem" class="${i.danger ? 'danger' : ''}${i.on ? ' on' : ''}" data-action="${i.action}" ${i.attrs || ''}>
          ${i.icon ? `<span class="pi" aria-hidden="true">${i.icon}</span>` : ''}<span class="pl">${esc(i.label)}</span>${i.on ? ICON_SVG.tick : ''}
        </button>`).join('')}
    </div>`;
}

/* Today */

function filterLabel() {
  if (ui.filter.startsWith('time:')) {
    const t = TIMES.find(([id]) => id === ui.filter.slice(5));
    return t ? t[1] : 'All';
  }
  if (ui.filter.startsWith('group:')) return ui.filter.slice(6);
  return 'All';
}

function matchesFilter(h) {
  if (ui.filter.startsWith('time:')) return h.time === ui.filter.slice(5);
  if (ui.filter.startsWith('group:')) return h.group === ui.filter.slice(6);
  return true;
}

const groupNames = (list = active()) => [...new Set(list.map((h) => h.group).filter(Boolean))].sort((a, b) => a.localeCompare(b));

function filterMenu() {
  const items = [{ action: 'filter', attrs: 'data-value="all"', label: 'All habits', on: ui.filter === 'all' }];
  for (const [t, label, icon] of TIMES) {
    items.push({ action: 'filter', attrs: `data-value="time:${t}"`, label, icon, on: ui.filter === `time:${t}` });
  }
  for (const g of groupNames()) {
    items.push({ action: 'filter', attrs: `data-value="group:${esc(g)}"`, label: g, icon: '🏷️', on: ui.filter === `group:${g}` });
  }
  return popover(items, 'pop-left');
}

function renderToday() {
  const tk = todayKey();
  const sel = parseKey(ui.date);
  const isToday = ui.date === tk;
  const isYesterday = ui.date === keyOf(addDays(new Date(), -1));
  const title = isToday ? 'Today' : isYesterday ? 'Yesterday' : fmt(sel, { weekday: 'short', month: 'short', day: 'numeric' });
  const mood = entryOf(ui.date).mood;
  const moodBtn = `<button class="round mood-btn" data-action="day" aria-label="${esc(`Mood and note for ${title}`)}" title="Mood and note">${mood ? `<span class="emo" aria-hidden="true">${MOODS[mood - 1].emoji}</span>` : ICON_SVG.smile}</button>`;
  const dark = isDarkNow();
  const themeBtn = roundBtn('toggle-theme', dark ? ICON_SVG.sun : ICON_SVG.moon, dark ? 'Switch to light mode' : 'Switch to dark mode');
  const list = active();

  if (!list.length) {
    const archivedOnly = state.habits.length > 0;
    return `${topBar('Today', '', themeBtn + moodBtn, '', 'today-top')}
      <section class="empty">
        <div class="empty-art" aria-hidden="true">🌱</div>
        <h2>${archivedOnly ? 'No active habits' : 'No habits yet'}</h2>
        <p>${archivedOnly ? 'Your habits are archived. Restore them from the habits list, or add a new one.' : 'Tap the pink <strong>+</strong> below to add your first habit, or start with one of these.'}</p>
        <div class="chips">
          ${SUGGESTIONS.map((s, i) => `<button class="chip" data-action="suggest" data-i="${i}">${s.icon} ${esc(s.name)}</button>`).join('')}
        </div>
      </section>
      ${tipButton()}`;
  }

  const shown = list.filter(matchesFilter);
  const due = shown.filter((h) => isDue(h, sel));
  const resting = shown.length - due.length;
  const filterBtn = `
    <button class="filter-pill" data-action="menu" data-menu="filter" aria-haspopup="true" aria-expanded="${ui.menu === 'filter'}" aria-label="${esc(`Show: ${filterLabel()}`)}">
      <span>${esc(filterLabel())}</span>${ICON_SVG.down}
    </button>`;

  return `${topBar(esc(title), filterBtn, themeBtn + moodBtn, ui.menu === 'filter' ? filterMenu() : '', 'today-top')}
    ${dateStrip()}
    ${due.length
      ? `<ul class="hlist">${due.map((h) => habitCard(h, ui.date)).join('')}</ul>`
      : `<p class="empty-note">${ui.filter === 'all' ? 'Nothing scheduled for this day. Enjoy the rest! 🌿' : 'No habits here for this day.'}</p>`}
    ${resting ? `<p class="rest-note">${plural(resting, 'habit')} not scheduled ${isToday ? 'today' : 'this day'}</p>` : ''}
    ${isToday ? '' : '<button class="link-btn" data-action="go-today">Back to today</button>'}
    ${tipButton()}`;
}

/** A row of days: the last 30 days up to today, with a ring that fills as the day's habits get done. */
function dateStrip() {
  const tk = todayKey();
  const earliest = keyOf(addDays(parseKey(tk), -29));
  let d = parseKey(ui.date < earliest ? ui.date : earliest);
  let cells = '';
  for (; keyOf(d) <= tk; d = addDays(d, 1)) {
    const k = keyOf(d);
    const p = dayProgress(d);
    const cls = ['sd'];
    if (k === ui.date) cls.push('sel');
    if (k === tk) cls.push('today');
    if (p === 1) cls.push('full');
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${p === null ? '' : `, ${pct(p)} done`}`;
    cells += `
      <button class="${cls.join(' ')}" data-action="pick-day" data-key="${k}" aria-label="${esc(label)}"${k === ui.date ? ' aria-current="date"' : ''}>
        <span class="sd-dow" aria-hidden="true">${esc(fmt(d, { weekday: 'short' }).slice(0, 2))}</span>
        <span class="sd-ring" style="--p:${(p || 0).toFixed(3)}" aria-hidden="true"><b>${d.getDate()}</b></span>
      </button>`;
  }
  return `<div class="strip" role="group" aria-label="Pick a day">${cells}</div>`;
}

/** One habit as a card tinted with its colour. It fills as you make progress. */
function habitCard(h, k) {
  const c = countOf(h, k);
  const done = c >= h.goal;
  const p = Math.min(c / h.goal, 1);
  const streak = currentStreak(h);
  const meta = h.desc ? esc(h.desc) : streak ? `🔥 ${plural(streak, 'day')}` : h.reminder ? `⏰ ${esc(fmtTime(h.reminder))}` : '';
  const label = done
    ? (h.goal > 1 ? `${h.name}: done. Open it to change the count.` : `${h.name}: done. Tap to undo.`)
    : h.goal > 1 ? `${h.name}: ${c} of ${h.goal}. Tap to add one.` : `${h.name}: not done. Tap to check it off.`;
  return `
    <li class="hc${done ? ' done' : ''}" style="${habitVars(h)};--p:${p.toFixed(3)}">
      <button class="hc-main" data-action="open" data-id="${esc(h.id)}" aria-label="${esc(`${h.name}, ${c} of ${h.goal}. Open counter.`)}">
        <span class="hc-icon" aria-hidden="true">${esc(h.icon)}</span>
        <span class="hc-body">
          <span class="hc-name">${esc(h.name)}</span>
          <span class="hc-meta"><span class="hc-count">${c}/${h.goal}</span>${meta ? `<span class="hc-desc">${meta}</span>` : ''}</span>
        </span>
      </button>
      <button class="hc-btn" data-action="tick" data-id="${esc(h.id)}" aria-pressed="${done}" aria-label="${esc(label)}">${done || h.goal === 1 ? ICON_SVG.tick : ICON_SVG.plus}</button>
    </li>`;
}

/* A habit's counter page */

function renderCounter(h) {
  const k = ui.date;
  const c = countOf(h, k);
  const done = c >= h.goal;
  const p = Math.min(c / h.goal, 1);
  const R = 116;
  const C = 2 * Math.PI * R;
  const armed = ui.confirm === `delete:${h.id}`;
  const id = `data-id="${esc(h.id)}"`;
  const menu = ui.menu === 'habit' ? popover([
    { action: 'edit', attrs: id, label: 'Edit' },
    ...(h.reminder ? [{ action: 'ics', attrs: id, label: 'Add reminder to calendar' }] : []),
    { action: 'archive', attrs: id, label: h.archived ? 'Restore' : 'Archive' },
    { action: 'delete', attrs: id, label: armed ? 'Tap again to delete for good' : 'Delete', danger: true },
  ], 'pop-right') : '';
  const unit = h.unit ? ` ${esc(h.unit)}` : '';

  return `
    <div class="counter" style="${habitVars(h)}">
      ${topBar(`<span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}`,
        roundBtn('back', ICON_SVG.left, 'Back'),
        roundBtn('menu', ICON_SVG.more, 'More options', `data-menu="habit" aria-haspopup="true" aria-expanded="${ui.menu === 'habit'}"`),
        menu)}
      ${k === todayKey() ? '' : `<p class="cnt-day">${esc(fmt(parseKey(k), { weekday: 'long', month: 'long', day: 'numeric' }))}</p>`}
      ${h.archived ? '<p class="cnt-day">Archived. Use ••• to restore it to Today.</p>' : ''}
      <div class="ring-box">
        <svg class="big-ring" viewBox="0 0 260 260" aria-hidden="true">
          <circle cx="130" cy="130" r="${R}" class="track"/>
          ${p > 0 ? `<circle cx="130" cy="130" r="${R}" class="prog" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 130 130)"/>` : ''}
        </svg>
        <div class="ring-in">
          <span class="ring-emoji" aria-hidden="true">${esc(h.icon)}</span>
          <button class="ring-num" data-action="keypad" ${id} aria-label="${esc(`${c} of ${h.goal}${h.unit ? ` ${h.unit}` : ''}. Tap to type a number.`)}">${c}</button>
          <span class="ring-goal" aria-hidden="true">/${h.goal}${unit}</span>
        </div>
        <button class="ring-plus" data-action="add-one" ${id} aria-label="Add one">${ICON_SVG.plus}</button>
      </div>
      ${h.desc ? `<p class="cnt-desc">${esc(h.desc)}</p>` : ''}
      <div class="cnt-actions">
        <button class="add-pill" data-action="keypad" ${id}>Add</button>
        <button class="done-btn${done ? ' on' : ''}" data-action="complete" ${id} aria-pressed="${done}" aria-label="${done ? 'Done. Tap to undo.' : 'Mark as done'}">${ICON_SVG.tick}</button>
      </div>
      <div class="cnt-foot">
        <button class="foot-btn" data-action="memo" ${id}><span class="fi memo">${ICON_SVG.memo}</span>Memo</button>
        <button class="foot-btn" data-action="stat" ${id}><span class="fi stat">${ICON_SVG.bars}</span>Stat</button>
      </div>
    </div>`;
}

/* A habit's Stat page */

/** Class for one day of a habit: done, part(ly), miss(ed), off (not scheduled) or future. */
function dayClass(h, d, start, tk) {
  const k = keyOf(d);
  const c = countOf(h, k);
  if (k > tk) return 'future';
  if (c >= h.goal) return 'done';
  if (c > 0) return 'part';
  return isDue(h, d, start) ? 'miss' : 'off';
}

/** The first and last day shown for a month grid (whole weeks). */
function monthGrid(mk) {
  const first = monthStart(mk);
  const last = monthEnd(mk);
  const lead = (first.getDay() - state.settings.weekStart + 7) % 7;
  const trail = 6 - ((last.getDay() - state.settings.weekStart + 7) % 7);
  return { first, gridStart: addDays(first, -lead), total: lead + last.getDate() + trail };
}

const dowRow = () => weekOrder().map((d) => `<span class="dow" aria-hidden="true">${esc(dayName(d, 'narrow'))}</span>`).join('');
const monthTitle = (d) => `${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

function habitCalendar(h) {
  const tk = todayKey();
  const start = startKey(h);
  const { first, gridStart, total } = monthGrid(ui.month);
  let cells = dowRow();
  for (let i = 0; i < total; i++) {
    const d = addDays(gridStart, i);
    const k = keyOf(d);
    const c = countOf(h, k);
    const cls = ['cd'];
    let said = 'not done';
    if (d.getMonth() !== first.getMonth()) cls.push('out');
    if (k > tk) { cls.push('future'); said = 'upcoming'; }
    else if (c >= h.goal) { cls.push('done'); said = 'done'; }
    else if (c > 0) said = `${c} of ${h.goal}`;
    else if (isDue(h, d, start) && k < tk) said = 'missed';
    else if (!h.days.includes(d.getDay())) { cls.push('off'); said = 'not scheduled'; }
    if (k === tk) cls.push('today');
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}: ${said}`;
    cells += `<button class="${cls.join(' ')}" style="--p:${Math.min(c / h.goal, 1).toFixed(3)}" data-action="cal" data-id="${esc(h.id)}" data-key="${k}" ${k > tk ? 'disabled' : ''} aria-label="${esc(label)}"><b>${d.getDate()}</b></button>`;
  }
  const atLatest = ui.month >= tk.slice(0, 7);
  return `
    <section class="card">
      <div class="cal-nav">
        <button class="nav-btn" data-action="month" data-delta="-1" aria-label="Previous month">${ICON_SVG.left}</button>
        <strong aria-label="${esc(fmt(first, { month: 'long', year: 'numeric' }))}">${monthTitle(first)}</strong>
        <button class="nav-btn" data-action="month" data-delta="1" aria-label="Next month" ${atLatest ? 'disabled' : ''}>${ICON_SVG.right}</button>
      </div>
      <div class="cal7">${cells}</div>
      <p class="hint">Tap a day to check it in or undo it.</p>
    </section>`;
}

/** Yearly status: one small square per day, a column for each week. */
function yearGrid(h) {
  const tk = todayKey();
  const start = startKey(h);
  const y = ui.year;
  const jan1 = new Date(y, 0, 1);
  const lead = (jan1.getDay() - state.settings.weekStart + 7) % 7;
  let cells = '<i class="x"></i>'.repeat(lead);
  let n = lead;
  let done = 0;
  for (let d = new Date(jan1); d.getFullYear() === y; d = addDays(d, 1)) {
    const cls = dayClass(h, d, start, tk);
    if (cls === 'done') done++;
    cells += `<i class="${cls}"></i>`;
    n++;
  }
  const cols = Math.ceil(n / 7);
  cells += '<i class="x"></i>'.repeat(cols * 7 - n);
  const atLatest = y >= new Date().getFullYear();
  return `
    <section class="card">
      <div class="card-head">
        <h2>Yearly status</h2>
        <div class="yr-nav">
          <button class="nav-btn sm" data-action="year" data-delta="-1" aria-label="Previous year">${ICON_SVG.left}</button>
          <span class="yr-pill">${y}</span>
          <button class="nav-btn sm" data-action="year" data-delta="1" aria-label="Next year" ${atLatest ? 'disabled' : ''}>${ICON_SVG.right}</button>
        </div>
      </div>
      <div class="ygrid" style="--cols:${cols}" role="img" aria-label="${esc(`${h.name} in ${y}: done on ${plural(done, 'day')}`)}">${cells}</div>
    </section>`;
}

function memosCard(h) {
  const all = Object.entries(state.memos[h.id] || {}).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const shown = ui.memosAll ? all : all.slice(0, 3);
  const rows = shown.map(([k, m]) => `
    <button class="memo-row" data-action="memo" data-id="${esc(h.id)}" data-key="${k}">
      <span class="mr-emo" aria-hidden="true">${esc(m.emoji || '📝')}</span>
      <span class="mr-text">${m.text ? esc(m.text) : '<span class="muted">No words, just a feeling</span>'}</span>
      <span class="mr-date">${k}</span>
    </button>`).join('');
  return `
    <section class="card">
      <div class="card-head">
        <h2>Memos</h2>
        ${all.length > 3 ? `<button class="more" data-action="memos-all">${ui.memosAll ? 'Less' : 'More'}${ICON_SVG.right}</button>` : ''}
      </div>
      ${rows || '<p class="hint">No memos yet. Tap <strong>Memo</strong> on the habit’s page to write how it went.</p>'}
    </section>`;
}

function segButtons(action, options, current, label) {
  return `<div class="seg" role="group" aria-label="${esc(label)}">${options.map(([v, text]) =>
    `<button data-action="${action}" data-value="${v}" aria-pressed="${v === current}">${esc(text)}</button>`).join('')}</div>`;
}

function trendCard(h) {
  const tk = todayKey();
  const today = parseKey(tk);
  const bars = [];
  if (ui.trend === 'year') {
    for (let i = 11; i >= 0; i--) {
      const first = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const st = periodStats([h], first, new Date(first.getFullYear(), first.getMonth() + 1, 0));
      const v = st.rate || 0;
      bars.push({ v, label: fmt(first, { month: 'narrow' }), title: `${fmt(first, { month: 'long', year: 'numeric' })}: ${st.rate === null ? 'nothing scheduled' : pct(v)}` });
    }
  } else {
    const n = ui.trend === 'month' ? 30 : 7;
    for (let i = n - 1; i >= 0; i--) {
      const d = addDays(today, -i);
      const c = countOf(h, keyOf(d));
      const label = n === 7 ? `${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : i % 6 === 0 ? String(d.getDate()) : '';
      bars.push({ v: Math.min(c / h.goal, 1), label, title: `${fmt(d, { month: 'short', day: 'numeric' })}: ${c} of ${h.goal}` });
    }
  }
  const met = bars.filter((b) => b.v >= 1).length;
  const what = ui.trend === 'year' ? 'months fully done' : 'days done';
  return `
    <section class="card">
      <div class="card-head">
        <h2>Trending</h2>
        ${segButtons('trend', [['week', '1 Week'], ['month', '1 Month'], ['year', '1 Year']], ui.trend, 'Chart period')}
      </div>
      <div class="chart${bars.length > 12 ? ' dense' : ''}" role="img" aria-label="${esc(`${met} of ${bars.length} ${what}`)}">
        ${bars.map((b) => `<div class="bar-col" title="${esc(b.title)}"><div class="bar"><i style="--v:${b.v.toFixed(3)}"></i></div><span>${esc(b.label)}</span></div>`).join('')}
      </div>
      <div class="legend"><span><i class="lg-met"></i>Met</span><span><i class="lg-unmet"></i>Unmet</span></div>
    </section>`;
}

function compareCard(h) {
  const tk = todayKey();
  const thisWeek = startOfWeek(parseKey(tk));
  const lastWeek = addDays(thisWeek, -7);
  const v = (d) => (keyOf(d) > tk ? 0 : Math.min(countOf(h, keyOf(d)) / h.goal, 1));
  let a = 0;
  let b = 0;
  const cols = weekOrder().map((dow, i) => {
    const lw = v(addDays(lastWeek, i));
    const tw = v(addDays(thisWeek, i));
    a += lw;
    b += tw;
    return `<div class="bar-col"><div class="bar-pair"><div class="bar last"><i style="--v:${lw.toFixed(3)}"></i></div><div class="bar"><i style="--v:${tw.toFixed(3)}"></i></div></div><span>${esc(dayCode(dow))}</span></div>`;
  }).join('');
  return `
    <section class="card">
      <div class="card-head"><h2>Comparison</h2><span class="muted small">Week</span></div>
      <div class="chart cmp" role="img" aria-label="${esc(`Last week ${fmtNum(a)} days done, this week ${fmtNum(b)} so far`)}">${cols}</div>
      <div class="legend"><span><i class="lg-last"></i>Last week</span><span><i class="lg-met"></i>This week</span></div>
    </section>`;
}

function renderHabitStats(h) {
  const first = monthStart(ui.month);
  const mon = fmt(first, { month: 'short' });
  const ms = periodStats([h], first, monthEnd(ui.month));
  const volAll = Object.values(state.log[h.id] || {}).reduce((a, b) => a + b, 0);
  const cur = currentStreak(h);
  const best = bestStreak(h);
  const total = totalDone(h);
  const dd = (n) => (n === 1 ? 'day' : 'days');
  const tiles = [
    ['cal', '#3d8bff', ms.done, dd(ms.done), `Done in ${mon}`],
    ['check', '#3ccf7a', total, dd(total), 'Total done'],
    ['flame', '#8e6bff', cur, dd(cur), 'Current streak'],
    ['medal', '#ffa94d', best, dd(best), 'Best streak'],
    ['bars', '#4cd07d', ms.volume, h.unit, `Count in ${mon}`],
    ['sum', '#ff5c9a', volAll, h.unit, 'Total count'],
    ['avg', '#b36bff', fmtNum(ms.volume / Math.max(ms.days, 1)), '', 'Daily average'],
    ['pie', '#2ec4d6', ms.rate === null ? '–' : Math.round(ms.rate * 100), ms.rate === null ? '' : '%', 'Monthly rate'],
  ];
  const tileHtml = tiles.map(([ic, col, val, unit, label]) => `
    <div class="tile">
      <span class="ti" style="--t:${col}">${ICON_SVG[ic]}</span>
      <div class="val">${esc(String(val))}${unit ? `<small>${esc(unit)}</small>` : ''}</div>
      <div class="lbl">${esc(label)}</div>
    </div>`).join('');

  return `
    <div class="hstat" style="${habitVars(h)};--k:${h.color};--kink:${inkOn(h.color)}">
      ${topBar(`<span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}`,
        roundBtn('close-stat', ICON_SVG.close, 'Close'),
        '<button class="round" data-action="tips" aria-label="Tips" title="Tips"><span class="emo" aria-hidden="true">💡</span></button>')}
      <div class="wide-grid">
        <div>${habitCalendar(h)}${yearGrid(h)}</div>
        <div><div class="tiles">${tileHtml}</div>${memosCard(h)}</div>
      </div>
      <div class="wide-grid">
        <div>${trendCard(h)}</div>
        <div>${compareCard(h)}</div>
      </div>
    </div>`;
}

/* Stats */

function statsCalendar(list) {
  const tk = todayKey();
  const { first, gridStart, total } = monthGrid(ui.smonth);
  let cells = dowRow();
  for (let i = 0; i < total; i++) {
    const d = addDays(gridStart, i);
    const k = keyOf(d);
    const future = k > tk;
    const p = future ? null : progressOf(list, d);
    const cls = ['cd'];
    if (d.getMonth() !== first.getMonth()) cls.push('out');
    if (future) cls.push('future');
    if (p === 1) cls.push('done');
    if (k === tk) cls.push('today');
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${p === null ? '' : `: ${pct(p)} done`}. Open this day.`;
    cells += `<button class="${cls.join(' ')}" style="--p:${(p || 0).toFixed(3)}" data-action="goto-day" data-key="${k}" ${future ? 'disabled' : ''} aria-label="${esc(label)}"><b>${d.getDate()}</b></button>`;
  }
  const atLatest = ui.smonth >= tk.slice(0, 7);
  return `
    <section class="card">
      <div class="cal-nav">
        <button class="nav-btn" data-action="smonth" data-delta="-1" aria-label="Previous month">${ICON_SVG.left}</button>
        <strong aria-label="${esc(fmt(first, { month: 'long', year: 'numeric' }))}">${monthTitle(first)}</strong>
        <button class="nav-btn" data-action="smonth" data-delta="1" aria-label="Next month" ${atLatest ? 'disabled' : ''}>${ICON_SVG.right}</button>
      </div>
      <div class="cal7">${cells}</div>
    </section>`;
}

function statsYear(list) {
  const tk = todayKey();
  const y = Number(ui.smonth.slice(0, 4));
  let months = '';
  for (let m = 0; m < 12; m++) {
    const first = new Date(y, m, 1);
    const lead = (first.getDay() - state.settings.weekStart + 7) % 7;
    const dim = new Date(y, m + 1, 0).getDate();
    let dots = '<i class="x"></i>'.repeat(lead);
    for (let i = 1; i <= dim; i++) {
      const d = new Date(y, m, i);
      const p = keyOf(d) > tk ? null : progressOf(list, d);
      dots += `<i class="${p === null || p === 0 ? '' : p >= 1 ? 'l3' : p >= 0.5 ? 'l2' : 'l1'}"></i>`;
    }
    const mk = monthOf(first);
    months += `
      <button class="ym" data-action="open-month" data-value="${mk}" ${mk > tk.slice(0, 7) ? 'disabled' : ''} aria-label="${esc(`Show ${fmt(first, { month: 'long', year: 'numeric' })}`)}">
        <strong>${esc(fmt(first, { month: 'short' }))}</strong><span class="ym-grid" aria-hidden="true">${dots}</span>
      </button>`;
  }
  const atLatest = y >= new Date().getFullYear();
  return `
    <section class="card">
      <div class="cal-nav">
        <button class="nav-btn" data-action="syear" data-delta="-1" aria-label="Previous year">${ICON_SVG.left}</button>
        <strong>${y}</strong>
        <button class="nav-btn" data-action="syear" data-delta="1" aria-label="Next year" ${atLatest ? 'disabled' : ''}>${ICON_SVG.right}</button>
      </div>
      <div class="ymonths">${months}</div>
    </section>`;
}

function rateCard(list, single) {
  const y = Number(ui.smonth.slice(0, 4));
  const from = ui.rateYear ? new Date(y, 0, 1) : monthStart(ui.smonth);
  const to = ui.rateYear ? new Date(y, 11, 31) : monthEnd(ui.smonth);
  const st = periodStats(list, from, to);
  const best = Math.max(0, ...list.map((h) => bestStreak(h)));
  const R = 82;
  const C = 2 * Math.PI * R;
  const p = st.rate || 0;
  const dd = (n) => (n === 1 ? 'Day' : 'Days');
  const items = [
    ['medal', '#ffa94d', best, dd(best), 'Best streak'],
    single ? ['cal', '#3d8bff', st.done, dd(st.done), 'Days done'] : ['cal', '#3d8bff', st.perfect, dd(st.perfect), 'Perfect days'],
    single ? ['check', '#3ccf7a', st.volume, '', 'Times done'] : ['check', '#3ccf7a', st.done, '', 'Habits done'],
    ['avg', '#b36bff', fmtNum((single ? st.volume : st.done) / Math.max(st.days, 1)), '', 'Daily average'],
  ];
  const period = ui.rateYear ? String(y) : fmt(monthStart(ui.smonth), { month: 'long', year: 'numeric' });
  return `
    <section class="card rate-card">
      <div class="rate-ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="${R}" class="track"/>
          ${p > 0 ? `<circle cx="100" cy="100" r="${R}" class="prog" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 100 100)"/>` : ''}
        </svg>
        <div class="rate-in">
          <b>${st.rate === null ? '–' : `${(st.rate * 100).toFixed(2)}%`}</b>
          <span>${ui.rateYear ? 'Yearly rate' : 'Monthly rate'}</span>
          <button class="swap" data-action="rate-mode" aria-label="${ui.rateYear ? 'Show the monthly rate' : 'Show the yearly rate'}" title="Month or year">${ICON_SVG.swap}</button>
        </div>
      </div>
      <p class="period">${esc(period)}</p>
      <div class="kgrid">
        ${items.map(([ic, col, val, unit, label]) => `
          <div class="kitem">
            <span class="ti round-ti" style="--t:${col}">${ICON_SVG[ic]}</span>
            <b>${esc(String(val))}${unit ? `<small>${unit}</small>` : ''}</b>
            <span>${label}</span>
          </div>`).join('')}
      </div>
    </section>`;
}

function doneTodayCard(list) {
  const tk = todayKey();
  const rows = list.filter((h) => countOf(h, tk) > 0).map((h) => `
    <button class="drow" data-action="open" data-id="${esc(h.id)}" style="${habitVars(h)}">
      <span class="dr-ic" aria-hidden="true">${esc(h.icon)}</span>
      <span class="dr-name">${esc(h.name)}</span>
      <span class="dr-c${isDone(h, tk) ? ' ok' : ''}">${countOf(h, tk)}/${h.goal}</span>
    </button>`).join('');
  return `
    <section class="card">
      <div class="card-head"><h2>Done today</h2><button class="more" data-action="tab" data-tab="today">More${ICON_SVG.right}</button></div>
      ${rows || '<p class="hint center">Nothing checked off yet today.</p>'}
    </section>`;
}

function renderStats() {
  const list = active();
  let pick = ui.pick === 'all' ? null : findHabit(ui.pick);
  if (pick && pick.archived) pick = null;
  if (!pick) ui.pick = 'all';
  const subjects = pick ? [pick] : list;
  const color = pick ? pick.color : 'var(--accent)';
  const colorInk = pick ? inkOn(pick.color) : 'var(--accent-ink)';

  const pickBtn = `
    <button class="stat-pick" data-action="menu" data-menu="pick" aria-haspopup="true" aria-expanded="${ui.menu === 'pick'}">
      ${pick ? `<span class="pick-ic" aria-hidden="true">${esc(pick.icon)}</span>` : '<span class="all-badge" aria-hidden="true">All</span>'}
      <span class="pick-name">${esc(pick ? pick.name : 'Overall')}</span>${ICON_SVG.down}
    </button>`;
  const menu = ui.menu === 'pick' ? popover([
    { action: 'pick', attrs: 'data-value="all"', label: 'Overall', icon: '<span class="all-badge">All</span>', on: !pick },
    ...list.map((h) => ({ action: 'pick', attrs: `data-value="${esc(h.id)}"`, label: h.name, icon: esc(h.icon), on: pick === h })),
  ], 'pop-center') : '';
  const left = roundBtn('stat-view', ui.yearView ? ICON_SVG.cal : ICON_SVG.grid, ui.yearView ? 'Show one month' : 'Show the whole year');
  const head = topBar(pickBtn, left, roundBtn('add', ICON_SVG.plus, 'Add a new habit'), menu);

  if (!list.length) return `${head}<p class="empty-note">Add a habit to see your progress here.</p>`;

  const chips = `
    <div class="chip-row" role="group" aria-label="Choose a habit">
      <button class="echip${pick ? '' : ' on'}" data-action="pick" data-value="all" aria-pressed="${!pick}" aria-label="All habits" title="All habits"><span class="all-badge" aria-hidden="true">All</span></button>
      ${list.map((h) => `<button class="echip${pick === h ? ' on' : ''}" data-action="pick" data-value="${esc(h.id)}" aria-pressed="${pick === h}" aria-label="${esc(h.name)}" title="${esc(h.name)}"><span aria-hidden="true">${esc(h.icon)}</span></button>`).join('')}
    </div>`;

  return `${head}${chips}
    <div class="wide-grid" style="--k:${color};--kink:${colorInk}">
      <div>${ui.yearView ? statsYear(subjects) : statsCalendar(subjects)}</div>
      <div>${rateCard(subjects, Boolean(pick))}${doneTodayCard(list)}</div>
    </div>`;
}

/* All habits */

function renderHabits() {
  const list = active();
  const archived = state.habits.filter((h) => h.archived);
  const head = topBar('Habits', '', roundBtn('add', ICON_SVG.plus, 'Add a new habit'));
  if (!state.habits.length) return `${head}<p class="empty-note">No habits yet. Tap <strong>+</strong> to add one.</p>`;

  const meta = (h) => {
    const parts = [scheduleText(h)];
    if (h.goal > 1) parts.push(`${h.goal}${h.unit ? ` ${h.unit}` : ' times'} a day`);
    if (h.time !== 'any') parts.push(TIMES.find(([t]) => t === h.time)[1]);
    if (h.group) parts.push(h.group);
    if (h.reminder) parts.push(`⏰ ${fmtTime(h.reminder)}`);
    return parts.join(' · ');
  };
  const row = (h) => {
    const s = currentStreak(h);
    return `
      <li>
        <button class="lrow" data-action="open" data-id="${esc(h.id)}" style="${habitVars(h)}">
          <span class="lr-icon" aria-hidden="true">${esc(h.icon)}</span>
          <span class="lr-body"><span class="lr-name">${esc(h.name)}</span><span class="lr-meta">${esc(meta(h))}</span></span>
          ${s ? `<span class="lr-streak" aria-label="${esc(`${plural(s, 'day')} in a row`)}">🔥 ${s}</span>` : ''}
          <span class="lr-chev" aria-hidden="true">${ICON_SVG.right}</span>
        </button>
      </li>`;
  };
  const archivedRows = archived.map((h) => `
    <li class="arow">
      <button class="lrow" data-action="open" data-id="${esc(h.id)}" style="${habitVars(h)}">
        <span class="lr-icon" aria-hidden="true">${esc(h.icon)}</span>
        <span class="lr-body"><span class="lr-name">${esc(h.name)}</span><span class="lr-meta">${esc(meta(h))}</span></span>
      </button>
      <button class="ghost" data-action="archive" data-id="${esc(h.id)}">Restore</button>
    </li>`).join('');

  return `${head}
    <p class="sub-note">${plural(list.length, 'habit')}${archived.length ? ` · ${archived.length} archived` : ''}</p>
    ${list.length ? `<ul class="list">${list.map(row).join('')}</ul>` : '<p class="empty-note">Every habit is archived.</p>'}
    ${archived.length ? `<h2 class="sec-title">Archived</h2><ul class="list">${archivedRows}</ul>` : ''}`;
}

/* Me: moods, quote, settings and backups */

function renderMe() {
  const s = state.settings;
  const t = s.theme;
  const ws = s.weekStart;
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const tk = todayKey();
  const start = startOfWeek(parseKey(tk));
  const week = ALL_DAYS.map((i) => {
    const d = addDays(start, i);
    const k = keyOf(d);
    const mood = entryOf(k).mood;
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}: ${mood ? MOODS[mood - 1].label : 'no mood saved'}`;
    return `
      <button class="mw${k === tk ? ' now' : ''}${mood ? ' has' : ''}" data-action="day" data-key="${k}" ${k > tk ? 'disabled' : ''} aria-label="${esc(label)}">
        <span class="mw-dow" aria-hidden="true">${esc(fmt(d, { weekday: 'narrow' }))}</span>
        <span class="mw-ring" aria-hidden="true">${mood ? `<span class="emo">${MOODS[mood - 1].emoji}</span>` : d.getDate()}</span>
      </button>`;
  }).join('');
  const dayOfYear = Math.round((parseKey(tk) - new Date(parseKey(tk).getFullYear(), 0, 1)) / 864e5);
  const chev = `<span class="row-chev" aria-hidden="true">${ICON_SVG.right}</span>`;

  return `
    <header class="me-top">
      <button class="avatar" data-action="profile" aria-label="Change your name and picture"><span aria-hidden="true">${esc(s.avatar)}</span></button>
      <h1 class="me-title"><button class="me-name" data-action="profile" aria-label="${esc(`${s.name || 'You'}. Change your name`)}">${esc(s.name || 'You')}${ICON_SVG.pencil}</button></h1>
    </header>

    <div class="wide-grid">
      <div>
        <section class="card">
          <div class="card-head"><h2>Moods</h2><button class="more" data-action="moods">View${ICON_SVG.right}</button></div>
          <div class="mood-week">${week}</div>
        </section>
        <section class="quote-card">
          <h2>Daily quote</h2>
          <blockquote>${esc(QUOTES[dayOfYear % QUOTES.length])}</blockquote>
        </section>
        <section class="card">
          <div class="card-head"><h2>Settings</h2></div>
          <div class="row"><span>Appearance</span>${segButtons('theme', [['dark', 'Dark'], ['light', 'Light'], ['system', 'Auto']], t, 'Appearance')}</div>
          <div class="row"><span>Week starts on</span>${segButtons('week-start', [['6', 'Sat'], ['0', 'Sun'], ['1', 'Mon']], String(ws), 'Week starts on')}</div>
          <div class="row"><span>Reminder notifications</span>${notifControl()}</div>
          <button class="row" data-action="tab" data-tab="habits"><span>Habit manager</span>${chev}</button>
          <button class="row" data-action="tips"><span>Usage tips</span>${chev}</button>
        </section>
      </div>
      <div>
        <section class="card">
          <div class="card-head"><h2>Your data</h2></div>
          <p class="help">Your habits are saved only on this device. Make a backup to keep them safe or move them to another phone.</p>
          <button class="row" data-action="export"><span>Download a backup</span><span class="muted">.json</span></button>
          <button class="row" data-action="import"><span>Restore from a backup</span><span class="muted">Replaces data</span></button>
          <button class="row danger${ui.confirm === 'reset' ? ' armed' : ''}" data-action="reset">
            <span>${ui.confirm === 'reset' ? 'Tap again to delete everything' : 'Delete all data'}</span>
          </button>
        </section>
        <section class="card">
          <div class="card-head"><h2>Put it on your phone</h2></div>
          <div class="help">
            ${installed ? '<p><strong>✓ Installed.</strong> You are using Habit For Me as an app.</p>' : `
              <p><strong>iPhone / iPad:</strong> open this page in Safari, tap the Share button, then <em>Add to Home Screen</em>.</p>
              <p><strong>Android:</strong> open it in Chrome, tap the ⋮ menu, then <em>Install app</em> or <em>Add to Home screen</em>.</p>
              <p><strong>Mac:</strong> in Safari choose <em>File → Add to Dock</em>. In Chrome, click the install icon in the address bar.</p>`}
          </div>
        </section>
      </div>
    </div>

    <p class="about">Habit For Me · version 3.0</p>`;
}

function notifControl() {
  if (typeof Notification === 'undefined') return '<span class="muted">Not available here</span>';
  if (Notification.permission === 'granted') return '<span class="muted">On</span>';
  if (Notification.permission === 'denied') return '<span class="muted">Blocked</span>';
  return '<button class="ghost" data-action="notif">Turn on</button>';
}

function recentNotes(limit) {
  const keys = Object.keys(state.journal).sort().reverse().slice(0, limit);
  if (!keys.length) return '<p class="hint center">Nothing yet. Tap the face at the top of Today to save how you feel.</p>';
  return keys.map((k) => {
    const e = state.journal[k];
    return `
      <button class="note-row" data-action="goto-day" data-key="${k}">
        <span class="nr-mood" aria-hidden="true">${e.mood ? MOODS[e.mood - 1].emoji : '📝'}</span>
        <span class="nr-body">
          <span class="nr-date">${esc(fmt(parseKey(k), { weekday: 'short', month: 'short', day: 'numeric' }))}${e.mood ? ` · ${MOODS[e.mood - 1].label}` : ''}</span>
          ${e.note ? `<span class="nr-text">${esc(e.note)}</span>` : ''}
        </span>
      </button>`;
  }).join('');
}

/* ---------- 6. Sheets ---------- */

const sheet = document.getElementById('sheet');
const closeBtn = `<button type="button" class="round" data-action="close-sheet" aria-label="Close">${ICON_SVG.close}</button>`;

function showSheet(html) {
  sheet.innerHTML = `<div class="sheet-inner"><div class="grabber" aria-hidden="true"></div>${html}</div>`;
  if (!sheet.open) sheet.showModal();
  sheet.querySelector('.sheet-inner').scrollTop = 0;
}

function daysNote(goal, days, unit) {
  if (!days.length) return '*Pick at least one day';
  // "1 glass", "1 page": drop the plural ending when the goal is 1.
  const one = (u) => u.replace(/sses$/, 'ss').replace(/([^s])s$/, '$1');
  const what = `${goal} ${goal === 1 ? one(unit || 'times') : unit || 'times'}`;
  if (days.length === 7) return `*Complete ${what} every day`;
  return `*Complete ${what} on each ${weekOrder().filter((d) => days.includes(d)).map(dayCode).join(' ')}`;
}

function updateDaysNote(form) {
  const goal = clampInt(form.elements.goal.value, 1, MAX_COUNT, 1);
  const days = [...form.querySelectorAll('input[name="days"]:checked')].map((i) => Number(i.value));
  form.querySelector('.f-note').textContent = daysNote(goal, days, form.elements.unit.value.trim());
}

function setFormColor(form, c) {
  form.style.setProperty('--accent', c);
  form.style.setProperty('--accent-ink', inkOn(c));
}

/** The form for adding a habit (h = null) or changing one. */
function openSheet(h, preset) {
  ui.editing = h ? h.id : null;
  const p = preset || {};
  const v = h || {
    name: p.name || '',
    desc: p.desc || '',
    icon: p.icon || ICONS[0],
    color: p.color || NEW_COLORS[state.habits.length % NEW_COLORS.length],
    goal: p.goal || 1,
    unit: p.unit || '',
    days: ALL_DAYS,
    time: 'any',
    group: '',
    reminder: '',
    memo: false,
  };
  const icons = ICONS.includes(v.icon) ? ICONS : [v.icon, ...ICONS];
  const known = PALETTES.flatMap(([, colors]) => colors);
  const palIndex = Math.max(0, PALETTES.findIndex(([, colors]) => colors.includes(v.color)));
  const palettes = PALETTES.map(([name, colors], i) => {
    const list = i === 0 && !known.includes(v.color) ? [v.color, ...colors] : colors;
    return `
      <div class="pal" data-pal="${i}" ${i === palIndex ? '' : 'hidden'} role="radiogroup" aria-label="${esc(name)} colours">
        ${list.map((c) => `<label class="opt color-opt" style="--sw:${c}"><input type="radio" name="color" value="${c}" ${c === v.color ? 'checked' : ''} aria-label="Colour ${c}"><span></span></label>`).join('')}
      </div>`;
  }).join('');

  showSheet(`
    <form id="habit-form" class="hf" style="--accent:${v.color};--accent-ink:${inkOn(v.color)}" novalidate>
      <div class="sheet-head">
        ${closeBtn}
        <h2 id="sheet-title">${h ? `<span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}` : 'New habit'}</h2>
        <span class="round-gap" aria-hidden="true"></span>
      </div>

      <section class="fcard">
        <div class="f-ident">
          <button type="button" class="icon-tile" data-action="toggle-pick" data-value="icon-pick" aria-expanded="false" aria-label="Choose an icon"><span class="preview">${esc(v.icon)}</span></button>
          <div class="f-names">
            <input type="text" name="name" maxlength="60" placeholder="Habit name" value="${esc(v.name)}" autocomplete="off" aria-label="Habit name" required>
            <input type="text" name="desc" maxlength="40" placeholder="Description (optional)" value="${esc(v.desc)}" autocomplete="off" aria-label="Description">
          </div>
        </div>
        <div class="icon-pick" id="icon-pick" hidden>
          <div class="icon-grid" role="radiogroup" aria-label="Icon">
            ${icons.map((ic) => `<label class="opt icon-opt"><input type="radio" name="icon" value="${esc(ic)}" ${ic === v.icon ? 'checked' : ''} aria-label="${esc(ic)}"><span>${esc(ic)}</span></label>`).join('')}
          </div>
          <label class="f-row"><span>Or type any emoji</span><input type="text" name="icon_custom" maxlength="8" class="emoji-in" placeholder="🙂" autocomplete="off" aria-label="Your own emoji"></label>
        </div>
      </section>

      <section class="fcard">
        <button type="button" class="f-row f-link" data-action="toggle-pick" data-value="color-pick" aria-expanded="false"><span>Colour</span><span class="swatch" aria-hidden="true"></span>${ICON_SVG.right}</button>
        <div class="color-pick" id="color-pick" hidden>
          <div class="pal-tabs" role="group" aria-label="Colour sets">
            ${PALETTES.map(([name], i) => `<button type="button" class="pchip${i === palIndex ? ' on' : ''}" data-action="pal" data-value="${i}" aria-pressed="${i === palIndex}">${esc(name)}</button>`).join('')}
          </div>
          ${palettes}
        </div>
        <label class="f-row"><span>Group</span><input type="text" name="group" maxlength="24" placeholder="(Optional)" value="${esc(v.group)}" list="group-list" autocomplete="off"></label>
        <datalist id="group-list">${groupNames(state.habits).map((g) => `<option value="${esc(g)}"></option>`).join('')}</datalist>
      </section>

      <section class="fcard">
        <div class="f-row"><span id="goal-label">Goal per day</span>
          <div class="stepper" role="group" aria-labelledby="goal-label">
            <button type="button" data-action="step" data-delta="-1" aria-label="One fewer">−</button>
            <input type="number" name="goal" min="1" max="${MAX_COUNT}" value="${v.goal}" inputmode="numeric" aria-label="Goal per day">
            <button type="button" data-action="step" data-delta="1" aria-label="One more">+</button>
          </div>
        </div>
        <button type="button" class="f-row f-link" data-action="unit-open"><span>Unit</span><span class="unit-val">${esc(v.unit || 'count')}</span>${ICON_SVG.right}</button>
        <input type="hidden" name="unit" value="${esc(v.unit)}">
      </section>

      <section class="fcard">
        <div class="f-row"><span>Task days</span>
          <div class="presets">
            <button type="button" class="pchip sm" data-action="preset" data-value="0,1,2,3,4,5,6">Every day</button>
            <button type="button" class="pchip sm" data-action="preset" data-value="1,2,3,4,5">Weekdays</button>
          </div>
        </div>
        <div class="day-circles" role="group" aria-label="Task days">
          ${weekOrder().map((d) => `<label class="opt day-opt"><input type="checkbox" name="days" value="${d}" ${v.days.includes(d) ? 'checked' : ''} aria-label="${esc(dayName(d, 'long'))}"><span>${esc(dayCode(d))}</span></label>`).join('')}
        </div>
        <p class="f-note" aria-live="polite">${esc(daysNote(v.goal, v.days, v.unit))}</p>
      </section>

      <section class="fcard">
        <div class="f-row col"><span>Time of day</span>
          <div class="time-chips" role="radiogroup" aria-label="Time of day">
            ${TIMES.map(([t, label]) => `<label class="opt tchip"><input type="radio" name="time" value="${t}" ${v.time === t ? 'checked' : ''}><span>${label}</span></label>`).join('')}
          </div>
        </div>
      </section>

      <section class="fcard">
        <div class="f-row"><span id="rem-label">Reminder</span><label class="switch"><input type="checkbox" name="remind" ${v.reminder ? 'checked' : ''} aria-labelledby="rem-label"><span aria-hidden="true"></span></label></div>
        <div class="rem-time"${v.reminder ? '' : ' hidden'}>
          <label class="f-row"><span>Time</span><input type="time" name="reminder" value="${v.reminder || '08:00'}" class="time-chip"></label>
          <p class="f-hint">You get a notification while Habit For Me is open. For reminders when it's closed, use <strong>Add reminder to calendar</strong> in the habit's ••• menu.</p>
        </div>
        <div class="f-row"><span id="memo-label">Write a memo after finishing</span><label class="switch"><input type="checkbox" name="memo" ${v.memo ? 'checked' : ''} aria-labelledby="memo-label"><span aria-hidden="true"></span></label></div>
      </section>

      <p class="form-error" role="alert" hidden></p>
      <button type="submit" class="save-btn">${h ? 'Save' : 'Add habit'}</button>
    </form>`);
  if (!h && !preset) sheet.querySelector('input[name="name"]').focus();
}

/* The Unit picker: opens over the add/edit form, so nothing typed in the form is lost. */

/** The list of items for one kind, or search results across every kind. */
function unitListHtml(kind, query, current) {
  const q = query.trim().toLowerCase();
  const all = UNIT_KINDS.flatMap(([k, list]) => list.map(([name, units]) => ({ kind: k, name, units })));
  const items = q
    ? all.filter((it) => it.name.toLowerCase().includes(q) || it.kind.toLowerCase().includes(q) || it.units.some((u) => u.toLowerCase() === q))
    : all.filter((it) => it.kind === UNIT_KINDS[kind][0]);
  const now = current || 'count';
  const row = (it) => {
    const label = `<span class="u-name">${esc(it.name)}${q ? `<small>${esc(it.kind)}</small>` : ''}</span>`;
    if (it.units.length === 1) {
      const u = it.units[0];
      return `
        <div class="u-item"><button type="button" class="u-row${u === now ? ' on' : ''}" data-action="unit-pick" data-value="${esc(u)}" data-name="${esc(it.name)}">
          ${label}<span class="u-unit">${esc(u)}</span>
        </button></div>`;
    }
    const has = it.units.includes(now);
    return `
      <div class="u-item">
        <button type="button" class="u-row" data-action="unit-expand" aria-expanded="${has}">${label}${ICON_SVG.right}</button>
        <div class="u-choices"${has ? '' : ' hidden'}>
          ${it.units.map((u) => `<button type="button" class="pchip${u === now ? ' on' : ''}" data-action="unit-pick" data-value="${esc(u)}" data-name="${esc(it.name)}">${esc(u)}</button>`).join('')}
        </div>
      </div>`;
  };
  // Offer the typed text as a new unit, unless it is already a unit or the name of an item.
  const typed = query.trim().slice(0, 12);
  const known = all.some((it) => it.units.includes(typed) || it.name.toLowerCase() === q);
  const own = typed && !known
    ? `<div class="u-item"><button type="button" class="u-row own" data-action="unit-pick" data-value="${esc(typed)}" data-name="">
        <span class="u-name">Use your own unit</span><span class="u-unit">${esc(typed)}</span></button></div>`
    : '';
  return own || items.length ? `<div class="u-card">${items.map(row).join('')}${own}</div>` : '<p class="u-empty">Nothing found.</p>';
}

function openUnitPicker(form) {
  const current = form.elements.unit.value;
  const kind = Math.max(0, UNIT_KINDS.findIndex(([, list]) => list.some(([, units]) => units.includes(current || 'count'))));
  sheet.insertAdjacentHTML('beforeend', `
    <div class="unit-panel" data-kind="${kind}" role="group" aria-label="Unit">
      <div class="sheet-head">
        <button type="button" class="round" data-action="unit-close" aria-label="Back to the habit">${ICON_SVG.close}</button>
        <h2>Unit</h2>
        <span class="round-gap" aria-hidden="true"></span>
      </div>
      <div class="unit-tabs" role="group" aria-label="Kinds">
        ${UNIT_KINDS.map(([name], i) => `<button type="button" class="pchip${i === kind ? ' on' : ''}" data-action="unit-kind" data-value="${i}" aria-pressed="${i === kind}">${esc(name)}</button>`).join('')}
      </div>
      <div class="unit-list">${unitListHtml(kind, '', current)}</div>
      <label class="unit-search">${ICON_SVG.search}<input type="search" placeholder="Search or type a unit" aria-label="Search units, or type your own" autocomplete="off" maxlength="30"></label>
    </div>`);
  const tab = sheet.querySelector('.unit-tabs .pchip.on');
  if (tab && tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'center' });
}

/** Mood and note for one day. */
function openDay(k) {
  const e = entryOf(k);
  showSheet(`
    <form id="day-form" data-key="${k}" novalidate>
      <div class="sheet-head">
        ${closeBtn}
        <h2 id="sheet-title">${esc(fmt(parseKey(k), { weekday: 'long', month: 'short', day: 'numeric' }))}</h2>
        <span class="round-gap" aria-hidden="true"></span>
      </div>
      <p class="f-label" id="mood-label">How did you feel?</p>
      <div class="moods" role="radiogroup" aria-labelledby="mood-label">
        ${MOODS.map((m, i) => `<label class="opt mood-opt"><input type="radio" name="mood" value="${i + 1}" ${e.mood === i + 1 ? 'checked' : ''} aria-label="${m.label}"><span aria-hidden="true">${m.emoji}</span><small aria-hidden="true">${m.label}</small></label>`).join('')}
      </div>
      <label class="f-label" for="day-note">Note</label>
      <textarea id="day-note" name="note" maxlength="1000" rows="6" placeholder="How did it go? What helped, and what got in the way?">${esc(e.note || '')}</textarea>
      <button type="submit" class="save-btn">Save</button>
      ${e.mood || e.note ? '<button type="button" class="text-danger" data-action="clear-day">Clear mood and note</button>' : ''}
    </form>`);
}

/** A habit's memo for one day, with an emoji for how it felt. */
function openMemo(h, k) {
  const m = memoOf(h, k) || { text: '', emoji: '' };
  showSheet(`
    <form id="memo-form" data-id="${esc(h.id)}" data-key="${k}" style="--accent:${h.color};--accent-ink:${inkOn(h.color)}" novalidate>
      <div class="sheet-head">
        ${closeBtn}
        <label class="date-pick"><span class="sr">Memo date</span><input type="date" name="date" value="${k}" max="${todayKey()}"></label>
        <button type="submit" class="round ok" aria-label="Save memo">${ICON_SVG.tick}</button>
      </div>
      <h2 id="sheet-title" class="memo-title"><span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}</h2>
      <textarea name="text" maxlength="1000" rows="8" placeholder="Write your memo here…" aria-label="Memo">${esc(m.text)}</textarea>
      <div class="emoji-row" role="radiogroup" aria-label="How did it feel?">
        ${MEMO_EMOJIS.map((em) => `<label class="opt emo-opt"><input type="radio" name="emoji" value="${em}" ${m.emoji === em ? 'checked' : ''} aria-label="${em}"><span aria-hidden="true">${em}</span></label>`).join('')}
      </div>
      ${m.text || m.emoji ? '<button type="button" class="text-danger" data-action="del-memo">Delete memo</button>' : ''}
    </form>`);
  if (!m.text) sheet.querySelector('textarea').focus();
}

/** Type a number to add, or set the day's total. */
function openKeypad(h) {
  const c = countOf(h, ui.date);
  showSheet(`
    <form id="keypad-form" data-id="${esc(h.id)}" style="--accent:${h.color};--accent-ink:${inkOn(h.color)}" novalidate>
      <div class="sheet-head">
        ${closeBtn}
        <h2 id="sheet-title"><span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}</h2>
        <span class="round-gap" aria-hidden="true"></span>
      </div>
      <p class="kp-now">Now ${c} of ${h.goal}${h.unit ? ` ${esc(h.unit)}` : ''}</p>
      <input class="kp-input" type="number" name="amount" min="0" max="${MAX_COUNT}" inputmode="numeric" placeholder="1" aria-label="How many">
      <div class="kp-quick">${[1, 5, 10, 33, 100].map((n) => `<button type="button" class="pchip" data-action="kp-quick" data-value="${n}">${n}</button>`).join('')}</div>
      <button type="submit" class="save-btn" value="add">Add</button>
      <button type="submit" class="ghost-btn" value="set">Set as the total</button>
    </form>`);
  sheet.querySelector('.kp-input').focus();
}

function openProfile() {
  const s = state.settings;
  const pics = AVATARS.includes(s.avatar) ? AVATARS : [s.avatar, ...AVATARS];
  showSheet(`
    <form id="profile-form" novalidate>
      <div class="sheet-head">
        ${closeBtn}
        <h2 id="sheet-title">Profile</h2>
        <span class="round-gap" aria-hidden="true"></span>
      </div>
      <section class="fcard"><label class="f-row"><span>Name</span><input type="text" name="name" maxlength="30" value="${esc(s.name)}" placeholder="Your name" autocomplete="nickname"></label></section>
      <section class="fcard">
        <p class="f-label pad">Picture</p>
        <div class="icon-grid pb" role="radiogroup" aria-label="Picture">
          ${pics.map((a) => `<label class="opt icon-opt"><input type="radio" name="avatar" value="${esc(a)}" ${a === s.avatar ? 'checked' : ''} aria-label="${esc(a)}"><span>${esc(a)}</span></label>`).join('')}
        </div>
      </section>
      <button type="submit" class="save-btn">Save</button>
    </form>`);
}

function openTips() {
  showSheet(`
    <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Tips</h2><span class="round-gap" aria-hidden="true"></span></div>
    <ul class="tips">${TIPS.map(([ic, text]) => `<li><span class="tip-ic" aria-hidden="true">${ic}</span><span>${text}</span></li>`).join('')}</ul>`);
}

function openMoods() {
  showSheet(`
    <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Moods and notes</h2><span class="round-gap" aria-hidden="true"></span></div>
    <div class="card flush">${recentNotes(60)}</div>`);
}

// Live updates inside the open form.
sheet.addEventListener('change', (e) => {
  const form = e.target.form;
  if (!form) return;
  const name = e.target.name;
  if (form.id === 'habit-form') {
    if (name === 'icon') {
      form.querySelector('.preview').textContent = e.target.value;
      form.elements.icon_custom.value = '';
    }
    if (name === 'color') setFormColor(form, e.target.value);
    if (name === 'remind') form.querySelector('.rem-time').hidden = !e.target.checked;
    if (name === 'days') updateDaysNote(form);
  }
  if (form.id === 'memo-form' && name === 'date') {
    const h = findHabit(form.dataset.id);
    const k = e.target.value;
    if (h && isKey(k) && k <= todayKey()) openMemo(h, k);
    else e.target.value = form.dataset.key;
  }
});

sheet.addEventListener('input', (e) => {
  if (e.target.matches('.unit-search input')) {
    const panel = e.target.closest('.unit-panel');
    const searching = Boolean(e.target.value.trim());
    panel.querySelector('.unit-list').innerHTML = unitListHtml(Number(panel.dataset.kind), e.target.value, sheet.querySelector('#habit-form').elements.unit.value);
    panel.querySelector('.unit-tabs').classList.toggle('dim', searching);
    return;
  }
  const form = e.target.form;
  if (!form || form.id !== 'habit-form') return;
  if (e.target.name === 'icon_custom' && e.target.value.trim()) form.querySelector('.preview').textContent = e.target.value.trim();
  if (e.target.name === 'goal' || e.target.name === 'unit') updateDaysNote(form);
});

sheet.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);

  if (form.id === 'day-form') {
    setJournal(form.dataset.key, {
      mood: clampInt(fd.get('mood'), 0, 5, 0),
      note: String(fd.get('note') || '').trim().slice(0, 1000),
    });
    sheet.close();
    render();
    toast('Saved');
    return;
  }

  if (form.id === 'memo-form') {
    const h = findHabit(form.dataset.id);
    if (h) {
      const text = String(fd.get('text') || '').trim().slice(0, 1000);
      const emoji = String(fd.get('emoji') || '');
      setMemo(h, form.dataset.key, { text, emoji });
      toast(text || emoji ? 'Memo saved' : 'Memo removed');
    }
    sheet.close();
    render();
    return;
  }

  if (form.id === 'keypad-form') {
    const h = findHabit(form.dataset.id);
    if (h && ui.date <= todayKey()) {
      const mode = e.submitter && e.submitter.value === 'set' ? 'set' : 'add';
      const raw = String(fd.get('amount') || '').trim();
      const amount = clampInt(raw === '' ? (mode === 'add' ? 1 : 0) : raw, 0, MAX_COUNT, 0);
      const before = countOf(h, ui.date);
      const after = mode === 'set' ? amount : Math.min(before + amount, MAX_COUNT);
      setCount(h, ui.date, after);
      sheet.close();
      render();
      afterChange(h, before, after, ui.date);
    } else sheet.close();
    return;
  }

  if (form.id === 'profile-form') {
    state.settings.name = String(fd.get('name') || '').trim().slice(0, 30);
    const pic = String(fd.get('avatar') || '');
    if (pic) state.settings.avatar = pic;
    save();
    sheet.close();
    render();
    return;
  }

  // The add/edit habit form.
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

  const custom = String(fd.get('icon_custom') || '').trim();
  const data = {
    name: name.slice(0, 60),
    desc: String(fd.get('desc') || '').trim().slice(0, 40),
    icon: (custom || String(fd.get('icon') || ICONS[0])).slice(0, 8),
    color: String(fd.get('color') || NEW_COLORS[0]),
    goal: clampInt(fd.get('goal'), 1, MAX_COUNT, 1),
    unit: String(fd.get('unit') || '').trim().slice(0, 12),
    days,
    time: String(fd.get('time') || 'any'),
    group: String(fd.get('group') || '').trim().slice(0, 24),
    reminder: fd.get('remind') && TIME_RE.test(String(fd.get('reminder'))) ? String(fd.get('reminder')) : '',
    memo: Boolean(fd.get('memo')),
  };
  const existing = ui.editing && findHabit(ui.editing);
  if (existing) Object.assign(existing, data);
  else state.habits.push({ id: newId(), createdAt: todayKey(), archived: false, ...data });

  save();
  sheet.close();
  render();
  toast(existing ? 'Habit updated' : `${data.icon} ${data.name} added`);
  if (data.reminder) askNotifications();
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

/** After a count changes: a little buzz, a cheer when everything is done, and the memo if asked for. */
function afterChange(h, before, after, k) {
  const finished = before < h.goal && after >= h.goal;
  if (navigator.vibrate) navigator.vibrate(finished ? 18 : 8);
  if (!finished) return;
  if (k === todayKey()) {
    const due = active().filter((x) => isDue(x, parseKey(k)));
    if (due.length > 1 && due.every((x) => isDone(x, k))) toast('All done for today! 🎉');
  }
  if (h.memo) openMemo(h, k);
}

/** The round button on Today: +1, or done/undo for once-a-day habits. */
function tick(h) {
  const k = ui.date;
  if (k > todayKey()) return;
  const c = countOf(h, k);
  if (c >= h.goal && h.goal > 1) {
    // Bigger counts are changed on the habit's own page, so one tap never wipes them.
    openCounter(h);
    toast('Done! Change the count here if you need to.');
    return;
  }
  const next = c >= h.goal ? 0 : c + 1;
  setCount(h, k, next);
  render();
  afterChange(h, c, next, k);
}

function openCounter(h) {
  ui.detail = h.id;
  ui.stat = false;
  ui.menu = null;
  render();
  window.scrollTo(0, 0);
}

function downloadFile(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportData() {
  downloadFile(JSON.stringify(state, null, 2), 'application/json', `habit-for-me-backup-${todayKey()}.json`);
  toast('Backup downloaded');
}

/** A calendar file (.ics) with a repeating event and alert, so the calendar app can remind you. */
function downloadCalendar(h) {
  const codes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  let first = new Date();
  while (!h.days.includes(first.getDay())) first = addDays(first, 1);
  const [hh, mm] = h.reminder.split(':');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const text = (v) => String(v).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');
  const fold = (line) => {
    // Calendar files wrap lines longer than 75 bytes.
    const parts = [];
    let cur = '';
    let bytes = 0;
    for (const ch of line) {
      const n = new TextEncoder().encode(ch).length;
      if (bytes + n > 74) {
        parts.push(cur);
        cur = ' ';
        bytes = 1;
      }
      cur += ch;
      bytes += n;
    }
    parts.push(cur);
    return parts.join('\r\n');
  };
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Habit For Me//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${h.id}@habit-for-me`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${keyOf(first).replace(/-/g, '')}T${hh}${mm}00`,
    'DURATION:PT15M',
    `RRULE:${h.days.length === 7 ? 'FREQ=DAILY' : `FREQ=WEEKLY;BYDAY=${h.days.map((d) => codes[d]).join(',')}`}`,
    `SUMMARY:${text(`${h.icon} ${h.name}`)}`,
    'DESCRIPTION:A reminder from Habit For Me',
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${text(h.name)}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  const slug = h.name.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'habit';
  downloadFile(`${lines.map(fold).join('\r\n')}\r\n`, 'text/calendar', `${slug}-reminder.ics`);
  toast('Calendar file downloaded. Open it to add the reminder.');
}

/** Asks the browser for permission to show notifications (only after a tap). */
function askNotifications() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
  const result = Notification.requestPermission();
  if (result && result.then) result.then(() => render());
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
    Object.assign(ui, { detail: null, stat: false, pick: 'all', filter: 'all', menu: null });
    render();
    toast(`Backup restored: ${plural(state.habits.length, 'habit')}`);
  } catch (err) {
    toast("That file isn't a Habit For Me backup");
  }
});

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  // A tap anywhere outside an open menu closes it.
  if (ui.menu && !e.target.closest('.popover') && !(el && el.dataset.action === 'menu')) {
    ui.menu = null;
    render();
  }
  if (!el || el.disabled) return;
  const action = el.dataset.action;
  const value = el.dataset.value;
  const h = el.dataset.id ? findHabit(el.dataset.id) : null;
  if (action !== 'delete' && action !== 'reset') ui.confirm = null;

  switch (action) {
    case 'tab':
      if (value === undefined && el.dataset.tab === 'today' && ui.tab === 'today' && !ui.detail && el.classList.contains('tab')) {
        openSheet(null); // the pink + on Today
        break;
      }
      ui.tab = el.dataset.tab;
      Object.assign(ui, { detail: null, stat: false, menu: null });
      if (sheet.open) sheet.close();
      render();
      window.scrollTo(0, 0);
      break;
    case 'add':
      ui.menu = null;
      openSheet(null);
      break;
    case 'suggest':
      openSheet(null, SUGGESTIONS[Number(el.dataset.i)]);
      break;
    case 'tick':
      if (h) tick(h);
      break;
    case 'open':
      if (h) openCounter(h);
      break;
    case 'back':
      Object.assign(ui, { detail: null, stat: false, menu: null });
      render();
      break;
    case 'menu':
      ui.menu = ui.menu === el.dataset.menu ? null : el.dataset.menu;
      render();
      break;
    case 'filter':
      ui.filter = value;
      ui.menu = null;
      render();
      break;
    case 'pick':
      ui.pick = value;
      ui.menu = null;
      render();
      break;
    case 'keypad':
      if (h && ui.date <= todayKey()) openKeypad(h);
      break;
    case 'add-one': {
      if (!h || ui.date > todayKey()) break;
      const before = countOf(h, ui.date);
      if (before >= MAX_COUNT) break;
      setCount(h, ui.date, before + 1);
      render();
      afterChange(h, before, before + 1, ui.date);
      break;
    }
    case 'complete': {
      if (!h || ui.date > todayKey()) break;
      const before = countOf(h, ui.date);
      if (before >= h.goal && h.goal > 1) {
        openKeypad(h);
        break;
      }
      const after = before >= h.goal ? 0 : h.goal;
      setCount(h, ui.date, after);
      render();
      afterChange(h, before, after, ui.date);
      break;
    }
    case 'memo':
      if (h) openMemo(h, el.dataset.key || ui.date);
      break;
    case 'del-memo': {
      const form = el.closest('form');
      const mh = findHabit(form.dataset.id);
      if (mh) setMemo(mh, form.dataset.key, null);
      sheet.close();
      render();
      toast('Memo deleted');
      break;
    }
    case 'stat':
      if (!h) break;
      Object.assign(ui, { stat: true, month: ui.date.slice(0, 7), year: Number(ui.date.slice(0, 4)), memosAll: false, menu: null });
      render();
      window.scrollTo(0, 0);
      break;
    case 'close-stat':
      ui.stat = false;
      render();
      window.scrollTo(0, 0);
      break;
    case 'edit':
      ui.menu = null;
      render();
      if (h) openSheet(h);
      break;
    case 'archive':
      if (!h) break;
      h.archived = !h.archived;
      save();
      if (h.archived && ui.detail === h.id) Object.assign(ui, { detail: null, stat: false });
      ui.menu = null;
      render();
      toast(h.archived ? 'Archived. Restore it any time from the habits list.' : `${h.icon} ${h.name} is back on Today`);
      break;
    case 'delete':
      if (!h) break;
      if (ui.confirm === `delete:${h.id}`) {
        state.habits = state.habits.filter((x) => x !== h);
        delete state.log[h.id];
        delete state.memos[h.id];
        save();
        Object.assign(ui, { confirm: null, detail: null, stat: false, menu: null });
        if (ui.pick === h.id) ui.pick = 'all';
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
    case 'go-today':
      ui.date = todayKey();
      render();
      break;
    case 'month': {
      const next = shiftMonth(ui.month, Number(el.dataset.delta));
      if (next <= todayKey().slice(0, 7)) ui.month = next;
      render();
      break;
    }
    case 'year':
      ui.year = Math.min(new Date().getFullYear(), ui.year + Number(el.dataset.delta));
      render();
      break;
    case 'cal': {
      const k = el.dataset.key;
      if (!h || k > todayKey()) break;
      const before = countOf(h, k);
      const after = before >= h.goal ? 0 : h.goal;
      setCount(h, k, after);
      render();
      afterChange(h, before, after, k);
      break;
    }
    case 'trend':
      ui.trend = value;
      render();
      break;
    case 'memos-all':
      ui.memosAll = !ui.memosAll;
      render();
      break;
    case 'stat-view':
      ui.yearView = !ui.yearView;
      render();
      break;
    case 'smonth': {
      const next = shiftMonth(ui.smonth, Number(el.dataset.delta));
      if (next <= todayKey().slice(0, 7)) ui.smonth = next;
      render();
      break;
    }
    case 'syear': {
      const y = Number(ui.smonth.slice(0, 4)) + Number(el.dataset.delta);
      const now = todayKey().slice(0, 7);
      ui.smonth = `${y}-${ui.smonth.slice(5)}` > now ? now : `${y}-${ui.smonth.slice(5)}`;
      render();
      break;
    }
    case 'open-month':
      ui.smonth = value;
      ui.yearView = false;
      render();
      break;
    case 'rate-mode':
      ui.rateYear = !ui.rateYear;
      render();
      break;
    case 'day':
      openDay(el.dataset.key || ui.date);
      break;
    case 'clear-day':
      setJournal(el.closest('form').dataset.key, { mood: 0, note: '' });
      sheet.close();
      render();
      toast('Cleared');
      break;
    case 'moods':
      openMoods();
      break;
    case 'goto-day':
      ui.date = el.dataset.key;
      Object.assign(ui, { tab: 'today', detail: null, stat: false, menu: null });
      if (sheet.open) sheet.close();
      render();
      window.scrollTo(0, 0);
      break;
    case 'profile':
      openProfile();
      break;
    case 'tips':
      openTips();
      break;
    case 'ics':
      ui.menu = null;
      render();
      if (h && h.reminder) downloadCalendar(h);
      break;
    case 'notif':
      askNotifications();
      break;
    case 'toggle-theme':
      state.settings.theme = isDarkNow() ? 'light' : 'dark';
      save();
      applyTheme();
      render();
      break;
    case 'theme':
      state.settings.theme = value;
      save();
      applyTheme();
      render();
      break;
    case 'week-start':
      state.settings.weekStart = Number(value);
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
        Object.assign(ui, { confirm: null, tab: 'today', date: todayKey(), detail: null, stat: false, pick: 'all', filter: 'all' });
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
      input.value = clampInt(Number(input.value) + Number(el.dataset.delta), 1, MAX_COUNT, 1);
      updateDaysNote(form);
      break;
    }
    case 'preset': {
      const form = el.closest('form');
      const set = value.split(',').map(Number);
      form.querySelectorAll('input[name="days"]').forEach((i) => {
        i.checked = set.includes(Number(i.value));
      });
      updateDaysNote(form);
      break;
    }
    case 'toggle-pick': {
      const box = sheet.querySelector(`#${value}`);
      box.hidden = !box.hidden;
      el.setAttribute('aria-expanded', String(!box.hidden));
      break;
    }
    case 'pal': {
      const form = el.closest('form');
      form.querySelectorAll('.pal').forEach((p) => {
        p.hidden = p.dataset.pal !== value;
      });
      form.querySelectorAll('.pal-tabs .pchip').forEach((b) => {
        const on = b === el;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      break;
    }
    case 'unit-open':
      openUnitPicker(el.closest('form'));
      break;
    case 'unit-close':
      el.closest('.unit-panel').remove();
      break;
    case 'unit-kind': {
      const panel = el.closest('.unit-panel');
      panel.dataset.kind = value;
      panel.querySelector('.unit-search input').value = '';
      panel.querySelector('.unit-tabs').classList.remove('dim');
      panel.querySelectorAll('.unit-tabs .pchip').forEach((b) => {
        const on = b === el;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const list = panel.querySelector('.unit-list');
      list.innerHTML = unitListHtml(Number(value), '', sheet.querySelector('#habit-form').elements.unit.value);
      list.scrollTop = 0;
      break;
    }
    case 'unit-expand': {
      const box = el.nextElementSibling;
      box.hidden = !box.hidden;
      el.setAttribute('aria-expanded', String(!box.hidden));
      break;
    }
    case 'unit-pick': {
      const form = sheet.querySelector('#habit-form');
      const unit = value === 'count' ? '' : value.trim().slice(0, 12);
      form.elements.unit.value = unit;
      form.querySelector('.unit-val').textContent = unit || 'count';
      // Picking "Steps" or "Water" for a habit with no name yet also gives it that name.
      const itemName = el.dataset.name;
      if (itemName && !['Count', 'Times'].includes(itemName) && !form.elements.name.value.trim()) form.elements.name.value = itemName;
      updateDaysNote(form);
      el.closest('.unit-panel').remove();
      break;
    }
    case 'kp-quick': {
      const input = el.closest('form').elements.amount;
      input.value = value;
      input.focus();
      break;
    }
    default:
      break;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.menu && !sheet.open) {
    ui.menu = null;
    render();
  }
});

let toastTimer;
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const isDarkNow = () => state.settings.theme === 'dark' || (state.settings.theme === 'system' && darkQuery.matches);
function applyTheme() {
  const t = state.settings.theme;
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  const dark = isDarkNow();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#000000' : '#f2f2f7';
}
if (darkQuery.addEventListener) {
  darkQuery.addEventListener('change', () => {
    applyTheme();
    render();
  });
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

/* ---------- 8. Reminders: a notification at the chosen time while the app is open ---------- */

const REMINDED_KEY = 'habit-for-me:reminded'; // which reminders were already sent today

function checkReminders() {
  const now = new Date();
  const tk = keyOf(now);
  const mins = now.getHours() * 60 + now.getMinutes();
  let sent = null;
  try {
    sent = JSON.parse(localStorage.getItem(REMINDED_KEY) || 'null');
  } catch (err) {
    sent = null;
  }
  if (!sent || sent.day !== tk || !Array.isArray(sent.ids)) sent = { day: tk, ids: [] };
  let changed = false;
  for (const h of active()) {
    if (!h.reminder || sent.ids.includes(h.id)) continue;
    const [hh, mm] = h.reminder.split(':').map(Number);
    const late = mins - (hh * 60 + mm);
    if (late < 0 || late > 60) continue; // only in the hour after the reminder time
    sent.ids.push(h.id);
    changed = true;
    if (isDue(h, now) && !isDone(h, tk)) remind(h);
  }
  if (changed) {
    try {
      localStorage.setItem(REMINDED_KEY, JSON.stringify(sent));
    } catch (err) {
      // Storage blocked: the reminder may repeat, which is harmless.
    }
  }
}

function remind(h) {
  const title = `${h.icon} ${h.name}`;
  const options = { body: 'Time for this habit. Tap to open Habit For Me.', icon: 'icons/icon-192.png', tag: `habit-${h.id}` };
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const fallback = () => {
      try {
        new Notification(title, options); // eslint-disable-line no-new
      } catch (err) {
        // This browser only allows notifications from the service worker.
      }
    };
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration()
        .then((reg) => (reg ? reg.showNotification(title, options) : fallback()))
        .catch(fallback);
    } else fallback();
  }
  if (!document.hidden) toast(`⏰ Time for ${h.name}`);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  checkDayChange();
  checkReminders();
});
setInterval(() => {
  checkDayChange();
  checkReminders();
}, 30 * 1000);

// Lets the app work offline once it has been opened.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Offline mode unavailable', err));
  });
}

applyTheme();
render();
checkReminders();
