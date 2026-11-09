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
// The New Habit page: ready-made habits in tabs. Each is [emoji, name, goal, unit, more], where more can
// hold type: 'quit' (stay at or under the goal each day) and days (0 = Sunday ... 6 = Saturday).
const TEMPLATE_TABS = [
  ['Popular', '🔥', [
    ['🚶', 'Walk', 30, 'min'], ['😴', 'Sleep', 8, 'hr'], ['💧', 'Drink water', 8, 'glasses'], ['🧘', 'Meditation', 10, 'min'],
    ['🏃', 'Run', 20, 'min'], ['🚴', 'Cycling', 30, 'min'], ['💪', 'Workout', 45, 'min'], ['🔥', 'Burn calories', 400, 'kcal'],
    ['📖', 'Read a book', 20, 'pages'], ['🕌', 'Pray on time', 5, 'prayers'], ['📗', 'Read Quran', 5, 'pages'],
    ['📱', 'Less social media', 1, 'hr', { type: 'quit' }]]],
  ['Faith', '🕌', [
    ['🕌', 'Pray on time', 5, 'prayers'], ['🌅', 'Fajr on time', 1, ''], ['🕋', 'Pray at the mosque', 5, 'prayers'],
    ['📗', 'Read Quran', 5, 'pages'], ['🧠', 'Memorize Quran', 5, 'ayahs'], ['☀️', 'Morning adhkar', 1, ''],
    ['🌙', 'Evening adhkar', 1, ''], ['📿', 'Istighfar', 100, 'times'], ['📿', 'Salawat', 100, 'times'], ['📿', 'Dhikr', 33, 'times'],
    ['🤲', 'Dua', 1, ''], ['💰', 'Sadaqah', 1, ''], ['🍽️', 'Fast Monday and Thursday', 1, '', { days: [1, 4] }],
    ['🌌', 'Tahajjud', 2, 'rakats'], ['🌤️', 'Duha prayer', 2, 'rakats'], ['🎧', 'Islamic lesson', 20, 'min']]],
  ['Health', '❤️', [
    ['💧', 'Drink water', 8, 'glasses'], ['😴', 'Sleep', 8, 'hr'], ['🍎', 'Eat fruit', 2, 'pieces'], ['🥦', 'Eat vegetables', 3, 'servings'],
    ['💊', 'Take medicine', 1, ''], ['💊', 'Take vitamins', 1, ''], ['🦷', 'Brush teeth', 2, 'times'], ['🧴', 'Skincare', 1, ''],
    ['🌞', 'Time in daylight', 20, 'min'], ['🫁', 'Breathe', 5, 'min'], ['🛏️', 'Sleep early', 1, ''], ['⚖️', 'Check weight', 1, '']]],
  ['Sports', '🏃', [
    ['🚶', 'Walk', 30, 'min'], ['🏃', 'Run', 20, 'min'], ['🤸', 'Stretch', 10, 'min'], ['🧘', 'Yoga', 20, 'min'],
    ['🚴', 'Cycling', 30, 'min'], ['🏊', 'Swim', 30, 'min'], ['🔥', 'Burn calories', 400, 'kcal'], ['🏋️', 'Exercise', 30, 'min'],
    ['💪', 'Workout', 45, 'min'], ['🏋️', 'Gym', 1, ''], ['🤜', 'Push-ups', 30, 'reps'], ['🦵', 'Squats', 30, 'reps'],
    ['⚽', 'Football', 60, 'min'], ['🪢', 'Jump rope', 10, 'min']]],
  ['Lifestyle', '🏠', [
    ['💵', 'Track expenses', 1, ''], ['💰', 'Save money', 5, '$'], ['🫁', 'Breathe', 5, 'min'], ['🧘', 'Meditation', 10, 'min'],
    ['📖', 'Read a book', 20, 'pages'], ['🎓', 'Learning', 30, 'min'], ['📝', 'Review today', 1, ''], ['💡', 'Mind clearing', 10, 'min'],
    ['💧', 'Drink water', 8, 'glasses'], ['🍎', 'Eat fruit', 2, 'pieces'], ['🛏️', 'Make the bed', 1, ''], ['🧹', 'Tidy up', 15, 'min'],
    ['📞', 'Call family', 1, ''], ['🙏', 'Gratitude', 3, 'things'], ['🌱', 'Water the plants', 1, '']]],
  ['Time', '⏱️', [
    ['🤸', 'Stretch', 10, 'min'], ['🧘', 'Yoga', 20, 'min'], ['🏊', 'Swim', 30, 'min'], ['🏋️', 'Exercise', 30, 'min'],
    ['💪', 'Strength training', 20, 'min'], ['🧘', 'Meditation', 10, 'min'], ['🫁', 'Breathe', 5, 'min'], ['📖', 'Read a book', 30, 'min'],
    ['🎓', 'Learning', 1, 'hr'], ['📝', 'Review today', 10, 'min'], ['💡', 'Mind clearing', 10, 'min'], ['🎯', 'Deep work', 2, 'hr'],
    ['📗', 'Quran', 20, 'min']]],
  ['Quit', '🚫', [
    ['🍞', 'Less carbohydrate', 150, 'g'], ['🍬', 'Eat less sugar', 25, 'g'], ['☕', 'Drink less caffeine', 2, 'cups'],
    ['🥤', 'Drink less soda', 1, 'cans'], ['🚭', 'Smoke less', 5, 'cigarettes'], ['🎮', 'Play less games', 1, 'hr'],
    ['😤', 'Complain less', 0, 'times'], ['🪑', 'Sit less', 8, 'hr'], ['📺', 'Watch less TV', 1, 'hr'],
    ['📱', 'Less social media', 1, 'hr'], ['📵', 'Less phone time', 3, 'hr'], ['🍔', 'Less junk food', 1, 'meals'],
    ['💸', 'Spend less', 10, '$']].map((t) => [...t, { type: 'quit' }])],
];
// Sounds for the timer, made in the app (no sound files): [id, label, emoji].
const FOCUS_SOUNDS = [['silent', 'Silent', '🔇'], ['tick', 'Tick', '🕐'], ['rain', 'Rain', '🌧️'], ['waves', 'Waves', '🌊'],
  ['fire', 'Fire', '🔥'], ['noise', 'Soft noise', '🌫️']];
// Reminder ringtones, made in the app: [id, label].
const RINGTONES = [['default', 'Default'], ['drum', 'Drum'], ['universe', 'Universe'], ['chord', 'Chord'], ['ding', 'Ding'], ['rhythm', 'Rhythm']];
const END_SOUNDS = [['bell', 'Bell', '🔔'], ['chime', 'Chime', '🎵'], ['silent', 'Silent', '🔇']];
const MOODS = [
  { emoji: '😞', label: 'Awful' },
  { emoji: '🙁', label: 'Bad' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😄', label: 'Great' },
];
// The Unit picker: kinds of things to count, each with items and their measurements.
// An item is [name, 'units', 'more search words']; the first unit is the usual one.
// A plain string starts a new section. Item names must all be different.
const SPORTS = ['American Football', 'Archery', 'Badminton', 'Baseball', 'Basketball', 'Bowling', 'Boxing',
  'Cardio Dance', 'Climbing', 'Cooldown', 'Cricket', 'Cycling', 'Dance', 'Football (soccer)', 'Golf',
  'Gym / Strength', 'HIIT', 'Hiking', 'Martial Arts', 'Pilates', 'Rowing', 'Running', 'Skating', 'Skiing',
  'Swimming', 'Table Tennis', 'Tennis', 'Volleyball', 'Walking', 'Yoga'];
const DISTANCE_SPORTS = ['Cycling', 'Hiking', 'Rowing', 'Running', 'Skiing', 'Walking'];
const UNIT_KINDS = [
  ['Activity', [
    ['Active Energy', 'kcal kJ', 'calories burned'], ['Basal Energy', 'kcal kJ', 'resting calories'],
    ['Cycling Distance', 'km mi m', 'bike'], ['Exercise Minutes', 'min', 'workout'], ['Flights Climbed', 'floors', 'stairs'],
    ['Move Time', 'min'], ['Stand Hours', 'hr'], ['Stand Minutes', 'min'], ['Steps', 'steps', 'walk'],
    ['Swimming Distance', 'm yd km', 'swim'], ['Walking + Running Distance', 'km mi m', 'walk run jog']]],
  ['Body Measurements', [
    ['Body Fat Percentage', '%'], ['Body Mass Index', 'BMI'], ['Height', 'cm in'], ['Lean Body Mass', 'kg lb'],
    ['Waist Circumference', 'cm in', 'waist'], ['Weight', 'kg lb', 'body weight'],
    'Health checks',
    ['Blood Glucose', 'mg/dL mmol/L', 'sugar diabetes'], ['Blood Oxygen', '%', 'spo2'], ['Blood Pressure', 'mmHg'],
    ['Body Temperature', '°C °F', 'fever'], ['Heart Rate', 'bpm', 'pulse'], ['Resting Heart Rate', 'bpm', 'pulse']]],
  ['Nutrition Intake', [
    'Food and drink',
    ['Water', 'glasses ml l cups oz', 'drink'], ['Coffee', 'cups'], ['Tea', 'cups'], ['Milk', 'glasses cups ml'],
    ['Fruit', 'pieces servings'], ['Vegetables', 'servings', 'veggies'], ['Fruit and vegetables', 'servings'],
    ['Healthy meals', 'meals', 'eat food'], ['Home-cooked meals', 'meals', 'cook eat food'],
    'Nutrients',
    ['Biotin', 'mcg'], ['Caffeine', 'mg'], ['Calcium', 'mg'], ['Carbohydrates', 'g', 'carbs'], ['Dietary Cholesterol', 'mg'],
    ['Dietary Energy', 'kcal kJ', 'calories food'], ['Dietary Sugar', 'g', 'sugar'], ['Fiber', 'g', 'fibre'], ['Folate', 'mcg'],
    ['Iron', 'mg'], ['Magnesium', 'mg'], ['Potassium', 'mg'], ['Protein', 'g'], ['Saturated Fat', 'g'],
    ['Sodium', 'mg', 'salt'], ['Total Fat', 'g', 'fat'], ['Vitamin A', 'mcg'], ['Vitamin B12', 'mcg'], ['Vitamin C', 'mg'],
    ['Vitamin D', 'mcg IU'], ['Zinc', 'mg']]],
  ['Workout', [
    'Exercises',
    ['Push-ups', 'reps sets', 'pushups press'], ['Pull-ups', 'reps sets', 'pullups'], ['Sit-ups', 'reps sets', 'situps abs'],
    ['Squats', 'reps sets', 'legs'], ['Lunges', 'reps sets', 'legs'], ['Burpees', 'reps sets'], ['Jumping Jacks', 'reps'],
    ['Plank', 'sec min', 'core abs'], ['Jump Rope', 'min skips', 'skipping'], ['Stretching', 'min', 'flexibility'],
    'Sports',
    ...SPORTS.map((s) => [s, `min hr sessions kcal${s === 'Swimming' ? ' m' : DISTANCE_SPORTS.includes(s) ? ' km' : ''}`,
      s === 'Gym / Strength' ? 'workout weights' : ''])]],
  ['Mind & Sleep', [
    ['Mindful Minutes', 'min', 'mindfulness'], ['Meditation', 'min sessions'], ['Breathing', 'min breaths', 'breath'],
    ['Journaling', 'min pages entries', 'diary write'], ['Gratitude', 'things', 'thankful'],
    ['Screen-free time', 'min hr', 'phone digital detox'], ['Time in Daylight', 'min', 'outside sun outdoors'],
    'Sleep',
    ['Sleep', 'hr min'], ['Time in Bed', 'hr min'], ['Nap', 'min']]],
  ['Study & Work', [
    'Study',
    ['Reading', 'pages min chapters books', 'book read'], ['Study', 'min hr lessons sessions', 'learn school'],
    ['Homework', 'tasks min', 'school'], ['Language practice', 'min lessons words', 'english arabic learn'],
    ['Online course', 'lessons min videos', 'class learn'], ['Podcast', 'episodes min', 'listen'],
    'Work',
    ['Deep work', 'hr min sessions', 'focus'], ['Focus sessions', 'sessions min', 'pomodoro'],
    ['Tasks done', 'tasks', 'to-do todo'], ['Writing', 'words pages min', 'write'], ['Coding', 'min hr problems', 'programming'],
    'Hobbies',
    ['Drawing', 'min drawings', 'art'], ['Music practice', 'min songs', 'instrument']]],
  ['Faith', [
    'Prayer',
    ['Prayers', 'prayers', 'salah salat namaz'], ['Prayers on time', 'prayers', 'salah salat'],
    ['Prayers at the mosque', 'prayers', 'masjid jamaah'], ['Sunnah prayers', 'rakats', 'rawatib'],
    ['Tahajjud', 'rakats', 'night prayer qiyam'], ['Duha', 'rakats'], ['Witr', 'rakats'],
    'Quran',
    ['Quran', 'pages ayahs juz surahs min', 'koran read'], ['Quran memorization', 'ayahs pages surahs', 'hifz'],
    ['Quran listening', 'min', 'recitation'], ['Tafsir', 'pages min', 'meaning'],
    'Remembrance',
    ['Morning adhkar', 'times', 'azkar dhikr'], ['Evening adhkar', 'times', 'azkar dhikr'], ['Dhikr', 'times', 'tasbih zikr'],
    ['Istighfar', 'times', 'astaghfirullah'], ['Salawat', 'times', 'durood'], ['Dua', 'times', 'supplication'],
    'Good deeds',
    ['Sadaqah', 'times $', 'charity'], ['Fasting', 'days', 'sawm'], ['Islamic lesson', 'min lessons', 'learn']]],
  ['Self-care', [
    ['Toothbrushing', 'times min', 'teeth brush'], ['Flossing', 'times', 'teeth'], ['Handwashing', 'times min'],
    ['Shower', 'times min'], ['Skincare', 'times', 'face skin'], ['Sunscreen', 'times'],
    ['Medicine', 'doses pills', 'medication tablets'], ['Vitamins', 'pills', 'supplements']]],
  ['Home & Money', [
    'Home',
    ['Cleaning', 'min', 'clean house'], ['Tidy up', 'min items', 'declutter'], ['Laundry', 'loads'],
    ['Dishes', 'times'], ['Cooking', 'meals min', 'cook'], ['Make the bed', 'times'],
    ['Water the plants', 'times', 'garden'], ['Gardening', 'min'],
    'Money',
    ['Save money', '$ € £', 'saving'], ['No-spend day', 'days', 'budget'], ['Track spending', 'times', 'expenses budget']]],
  ['Family & Friends', [
    ['Call family', 'calls min', 'phone parents mother father'], ['Visit relatives', 'visits', 'family'],
    ['Time with family', 'min hr'], ['Time with kids', 'min hr', 'children play'], ['Message a friend', 'messages', 'text'],
    ['Meet friends', 'times hr'], ['Help someone', 'times', 'kindness'], ['Kind deeds', 'deeds', 'good kindness']]],
  // Plain units for any habit: picking one of these doesn't change the habit's name.
  ['Other', [
    ['Count', 'count'], ['Times', 'times'], ['Minutes', 'min'], ['Hours', 'hr'], ['Seconds', 'sec'], ['Sessions', 'sessions'],
    ['Pages', 'pages'], ['Kilometres', 'km'], ['Miles', 'mi'], ['Metres', 'm'], ['Reps', 'reps'], ['Percent', '%'],
    ['Money', '$ € £']]],
];
// Every item once, with its kind.
const UNIT_ITEMS = UNIT_KINDS.flatMap(([kind, list]) => list.filter(Array.isArray).map(([name, units, words = '']) =>
  ({ kind, name, units: units.split(' '), words, plain: kind === 'Other' })));
const UNIT_BY_NAME = new Map(UNIT_ITEMS.map((it) => [it.name, it]));
// The Popular tab comes first: the habits most people track.
UNIT_KINDS.unshift(['Popular', ['Water', 'Steps', 'Walking', 'Running', 'Gym / Strength', 'Push-ups', 'Sleep', 'Reading',
  'Study', 'Meditation', 'Journaling', 'Prayers', 'Quran', 'Dhikr', 'Weight', 'Fruit and vegetables', 'Screen-free time',
  'Call family'].map((name) => [name])]);
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
// A green seal with a tick: the badge on a finished habit's card.
const SEAL_SVG = (() => {
  let d = '';
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const r = 10.7 + 0.85 * Math.cos(a * 12);
    d += `${i ? 'L' : 'M'}${(12 + r * Math.sin(a)).toFixed(2)} ${(12 - r * Math.cos(a)).toFixed(2)}`;
  }
  return `<svg class="seal" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}Z" fill="#30c15a"/><path d="M7.7 12.3l2.9 2.9 5.7-5.9" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
})();
const ICON_SVG = {
  tick: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.8),
  left: svg('<path d="M15 6l-6 6 6 6"/>', 2.2),
  right: svg('<path d="M9 6l6 6-6 6"/>', 2.2),
  down: svg('<path d="M7 10l5 5 5-5"/>', 2.2),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.4),
  minus: svg('<path d="M5 12h14"/>', 2.4),
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.3-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>',
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  note: svg('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  watch: svg('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V10M9.5 3h5M12 3v3"/>'),
  people: svg('<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.7.8 2.7 2.5 3 5.2"/>'),
  share: svg('<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>'),
  bell: svg('<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  link: svg('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
  undo: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>', 2.2),
  warn: svg('<path d="M12 4.2 2.9 19.5h18.2z"/><path d="M12 10v4M12 16.9h.01"/>', 2),
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
    settings: { theme: 'dark', weekStart: 6, name: '', avatar: '🙂', sound: true, celebrate: true, focusSound: 'tick', endSound: 'bell' }, // weekStart 6 = Saturday
  };
}

function clampInt(v, min, max, fallback) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

const cleanText = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** A saved place for a location reminder, or null. */
function cleanPlace(v) {
  if (!v || typeof v !== 'object') return null;
  const lat = Number(v.lat);
  const lng = Number(v.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { name: cleanText(v.name, 30) || 'My place', lat, lng, r: clampInt(v.r, 50, 5000, 200), on: v.on === 'leave' ? 'leave' : 'arrive' };
}

/** A friend's last progress for a shared habit: { name: { day, week: "1101-01", streak, at } }. */
function cleanFriendStats(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [name, v] of Object.entries(raw).slice(0, 20)) {
    if (v && isKey(v.day) && /^[01?-]{7}$/.test(v.week)) {
      out[cleanText(name, 30)] = { day: v.day, week: v.week, streak: clampInt(v.streak, 0, 99999, 0), at: Number(v.at) || 0 };
    }
  }
  return out;
}

/** Cleans up saved or imported data so the app never breaks on bad input. Older backups still load. */
function normalize(raw) {
  const s = defaultState();
  if (!raw || typeof raw !== 'object') return s;

  if (Array.isArray(raw.habits)) {
    const seen = new Set();
    s.habits = raw.habits
      .filter((h) => h && h.id && h.name && !seen.has(String(h.id)) && seen.add(String(h.id)))
      .map((h) => {
        const days = h.period && h.period !== 'day' ? ALL_DAYS.slice() : Array.isArray(h.days)
          ? [...new Set(h.days.map(Number))].filter((d) => d >= 0 && d <= 6).sort()
          : [];
        return {
          id: String(h.id),
          name: String(h.name).slice(0, 60),
          desc: cleanText(h.desc, 40), // short line under the name, e.g. "Gym"
          icon: typeof h.icon === 'string' && h.icon ? h.icon.slice(0, 8) : '✅',
          color: /^#[0-9a-f]{6}$/i.test(h.color) ? h.color.toLowerCase() : NEW_COLORS[0],
          type: h.type === 'quit' ? 'quit' : 'build', // quit: stay at or under the goal each day
          goal: clampInt(h.goal, h.type === 'quit' ? 0 : 1, MAX_COUNT, 1),
          unit: cleanText(h.unit, 12), // e.g. "glasses"; empty means "times"
          days: days.length ? days : ALL_DAYS.slice(),
          time: TIMES.some(([t]) => t === h.time) ? h.time : 'any',
          group: cleanText(h.group, 24),
          // Reminder times (up to 5); reminder is the first, "" means none. remindText: your own message.
          reminders: [...new Set((Array.isArray(h.reminders) ? h.reminders : [h.reminder]).filter((t) => TIME_RE.test(t)))].sort().slice(0, 5),
          remindText: cleanText(h.remindText, 80),
          superAlert: h.superAlert === true, // ring like an alarm until stopped
          ringtone: RINGTONES.some(([id]) => id === h.ringtone) ? h.ringtone : 'default',
          place: cleanPlace(h.place), // location reminder: { name, lat, lng, r (metres), on: arrive|leave } or null
          // Goal period: day, week, month, or every N days ("days", every 2-30).
          period: ['week', 'month', 'days'].includes(h.period) ? h.period : 'day',
          every: clampInt(h.every, 2, 30, 2),
          endDate: isKey(h.endDate) ? h.endDate : '', // last day of the habit, "" means no end
          memo: h.memo === true, // ask for a memo after finishing
          archived: h.archived === true,
          createdAt: isKey(h.createdAt) ? h.createdAt : todayKey(), // also the habit's start date
          // Shared with friends (Group tab): the link id, friends' names and the progress they last sent.
          shareId: cleanText(h.shareId, 40),
          friends: Array.isArray(h.friends) ? [...new Set(h.friends.map((f) => cleanText(f, 30)).filter(Boolean))].slice(0, 20) : [],
          friendStats: cleanFriendStats(h.friendStats),
        };
      })
      .map((h) => {
        h.reminder = h.reminders[0] || '';
        if (h.endDate && h.endDate < h.createdAt) h.endDate = '';
        return h;
      });
  }

  if (raw.log && typeof raw.log === 'object') {
    for (const h of s.habits) {
      const src = raw.log[h.id];
      if (!src || typeof src !== 'object') continue;
      const clean = {};
      for (const [k, v] of Object.entries(src)) {
        // Timed habits can hold parts of a minute or an hour, so keep 4 decimals.
        const n = Math.min(MAX_COUNT, Math.max(0, Math.round(Number(v) * 10000) / 10000));
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
  if (st.sound === false) s.settings.sound = false;
  if (st.celebrate === false) s.settings.celebrate = false;
  if (FOCUS_SOUNDS.some(([id]) => id === st.focusSound)) s.settings.focusSound = st.focusSound;
  if (END_SOUNDS.some(([id]) => id === st.endSound)) s.settings.endSound = st.endSound;
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
  tplTab: 0, // New Habit page: which tab of ready-made habits
  countView: false, // a timed habit's page shows the counter instead of the timer
  countUp: false, // the timer counts up (time done) instead of down (time left)
};

/* ---------- 4. Habit maths ---------- */

const countOf = (h, k) => (state.log[h.id] && state.log[h.id][k]) || 0;
const isDone = (h, k) => (h.type === 'quit' ? periodCount(h, k) <= h.goal : periodCount(h, k) >= h.goal);
/** How much of one day's goal is done, 0..1. A quit habit counts as 1 while it stays at or under its limit. */
const dayShare = (h, k) => (h.type === 'quit' ? Number(periodCount(h, k) <= h.goal) : Math.min(periodCount(h, k) / h.goal, 1));
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
  const k = keyOf(d);
  return h.days.includes(d.getDay()) && k >= start && (!h.endDate || k <= h.endDate);
}

const periodOf = (h) => h.period || 'day';
const PERIOD_WORDS = { day: ['day', 'Day'], week: ['week', 'Week'], month: ['month', 'Month'], days: ['round', 'Round'] };

/** First and last day of the goal period that holds day k (a week, a month, or a round of N days). */
function periodRange(h, k) {
  const p = periodOf(h);
  if (p === 'day') return [k, k];
  const d = parseKey(k);
  if (p === 'week') {
    const s = startOfWeek(d);
    return [keyOf(s), keyOf(addDays(s, 6))];
  }
  if (p === 'month') return [keyOf(new Date(d.getFullYear(), d.getMonth(), 1)), keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 0))];
  const start = parseKey(h.createdAt);
  const n = Math.max(0, Math.floor(Math.round((d - start) / 864e5) / h.every));
  const s = addDays(start, n * h.every);
  return [keyOf(s), keyOf(addDays(s, h.every - 1))];
}

/** The count that the goal is about: the day's, or the whole period's. */
function periodCount(h, k) {
  if (periodOf(h) === 'day') return countOf(h, k);
  const [a, b] = periodRange(h, k);
  let sum = 0;
  for (const [day, n] of Object.entries(state.log[h.id] || {})) if (day >= a && day <= b) sum += n;
  return Math.round(sum * 10000) / 10000;
}

const periodLabel = (h) => ({ week: 'This week', month: 'This month', days: `These ${h.every} days` })[periodOf(h)] || '';

function setCount(h, k, n) {
  const log = state.log[h.id] || (state.log[h.id] = {});
  if (n > 0) log[k] = Math.min(n, MAX_COUNT);
  else delete log[k];
  save();
}

/** Scheduled days done in a row, counting back from today. Today doesn't break it until it's over. */
/** Goal periods met in a row, going back from the one holding day k (the current one counts once met). */
function periodStreak(h) {
  const start = startKey(h);
  let k = todayKey();
  if (!isDone(h, k)) k = keyOf(addDays(parseKey(periodRange(h, k)[0]), -1));
  let n = 0;
  while (k >= start && isDone(h, k)) {
    n++;
    k = keyOf(addDays(parseKey(periodRange(h, k)[0]), -1));
  }
  return n;
}

function currentStreak(h) {
  if (periodOf(h) !== 'day') return periodStreak(h);
  const start = startKey(h);
  let d = new Date();
  // A quit habit that went over its limit today has already lost today, so it breaks the streak now.
  if (h.days.includes(d.getDay()) && !isDone(h, keyOf(d)) && h.type !== 'quit') d = addDays(d, -1);
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
  if (periodOf(h) !== 'day') {
    let best = 0;
    let run = 0;
    for (let k = startKey(h); k <= tk; k = keyOf(addDays(parseKey(periodRange(h, k)[1]), 1))) {
      if (isDone(h, k)) best = Math.max(best, ++run);
      else if (periodRange(h, k)[1] < tk) run = 0;
    }
    return best;
  }
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

function totalDone(h) {
  if (h.type !== 'quit') return Object.keys(state.log[h.id] || {}).filter((k) => isDone(h, k)).length;
  // A quit habit succeeds on every scheduled day it stayed under the limit, logged or not.
  const tk = todayKey();
  const start = startKey(h);
  let n = 0;
  for (let d = parseKey(start); keyOf(d) <= tk; d = addDays(d, 1)) if (isDue(h, d, start) && isDone(h, keyOf(d))) n++;
  return n;
}

/** 0..1 progress for one day across some habits, or null when nothing was due. */
function progressOf(list, d) {
  const k = keyOf(d);
  const due = list.filter((h) => isDue(h, d));
  if (due.length) return due.reduce((sum, h) => sum + dayShare(h, k), 0) / due.length;
  // One habit done on a day it wasn't scheduled still shows.
  if (list.length === 1 && countOf(list[0], k)) return dayShare(list[0], k);
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
      volume += countOf(h, k);
      const ok = isDone(h, k);
      const due_ = isDue(h, d, starts.get(h.id));
      if (ok && (due_ || h.type !== 'quit')) done++;
      if (!due_) continue;
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
const isTimeHabit = (h) => h.unit === 'min' || h.unit === 'hr';
const unitSecs = (h) => (h.unit === 'hr' ? 3600 : 60);
const usesTimer = (h) => isTimeHabit(h) && periodOf(h) === 'day';
/** An amount on a card: "1h 30m" or "25m" for habits counted in minutes or hours, else the number. */
function fmtAmount(h, x) {
  if (!isTimeHabit(h)) return fmtNum(x);
  const m = Math.floor(x * (unitSecs(h) / 60) + 1e-6);
  const hrs = Math.floor(m / 60);
  if (!m) return '0';
  return hrs ? `${hrs}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`;
}
/** A clock for the timer: 01:05:09, or 05:09 under an hour. */
function fmtClock(secs) {
  const t = Math.max(0, Math.floor(secs));
  const hrs = Math.floor(t / 3600);
  const rest = `${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
  return hrs ? `${pad(hrs)}:${rest}` : rest;
}

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
  else if (ui.tab === 'group') view.innerHTML = renderGroup();
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
    ${ui.date <= tk && due.some((h) => h.type !== 'quit' && !isDone(h, ui.date)) ? `<button class="complete-all" data-action="complete-all">${ICON_SVG.tick}Complete all</button>` : ''}
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
        <span class="sd-ring" style="--p:${(p || 0).toFixed(3)}" aria-hidden="true"><b>${d.getDate()}</b>${p === 1 ? '<i class="spark">✨</i>' : ''}</span>
      </button>`;
  }
  return `<div class="strip" role="group" aria-label="Pick a day">${cells}</div>`;
}

/** One habit as a card tinted with its colour. It fills as you make progress. */
function habitCard(h, k) {
  const c = countOf(h, k);
  const quit = h.type === 'quit';
  const done = isDone(h, k);
  const p = dayShare(h, k);
  const streak = currentStreak(h);
  const running = Boolean(timers[h.id]) && timers[h.id].key === k;
  const meta = running ? '⏱️ Timer on' : h.desc ? esc(h.desc) : periodLabel(h) || (h.reminder ? `⏰ ${esc(fmtTime(h.reminder))}` : '');
  const amount = `${fmtAmount(h, periodCount(h, k))}/${fmtAmount(h, h.goal)}`;
  let label;
  let btn;
  if (usesTimer(h)) {
    label = running ? `${h.name}: timer on. Tap to pause.` : `${h.name}: ${amount}. Tap to start the timer.`;
    btn = running ? ICON_SVG.pause : done && !quit ? SEAL_SVG : ICON_SVG.play;
  } else if (quit) {
    label = `${h.name}: ${c} of at most ${h.goal}${h.unit ? ` ${h.unit}` : ''}. Tap to add one.`;
    btn = ICON_SVG.close;
  } else {
    label = done
      ? (h.goal > 1 ? `${h.name}: done. Open it to change the count.` : `${h.name}: done. Tap to undo.`)
      : h.goal > 1 ? `${h.name}: ${c} of ${h.goal}. Tap to add one.` : `${h.name}: not done. Tap to check it off.`;
    btn = done ? SEAL_SVG : h.goal === 1 ? ICON_SVG.tick : ICON_SVG.plus;
  }
  const cls = ['hc', done ? 'done' : '', quit ? 'quit' : '', quit && !done ? 'over' : '', running ? 'running' : ''].filter(Boolean).join(' ');
  return `
    <li class="${cls}" style="${habitVars(h)};--p:${p.toFixed(3)}">
      ${streak ? `<span class="hc-streak" aria-hidden="true">🔥 ${streak} ${PERIOD_WORDS[periodOf(h)][1]}${streak === 1 ? '' : 's'}</span>` : ''}
      <button class="hc-main" data-action="open" data-id="${esc(h.id)}" aria-label="${esc(`${h.name}, ${amount}${streak ? `, ${plural(streak, PERIOD_WORDS[periodOf(h)][0])} in a row` : ''}. Open.`)}">
        <span class="hc-icon" aria-hidden="true">${esc(h.icon)}</span>
        <span class="hc-body">
          <span class="hc-name">${esc(h.name)}</span>
          <span class="hc-meta"><span class="hc-count">${amount}</span>${meta ? `<span class="hc-desc">${meta}</span>` : ''}</span>
        </span>
      </button>
      <button class="hc-btn" data-action="tick" data-id="${esc(h.id)}"${quit || usesTimer(h) ? '' : ` aria-pressed="${done}"`} aria-label="${esc(label)}">${btn}</button>
    </li>`;
}

/* A habit's counter page */

function renderCounter(h) {
  const k = ui.date;
  const c = countOf(h, k);
  const total = periodCount(h, k); // the day's count, or the whole week's / month's
  const quit = h.type === 'quit';
  const over = quit && total > h.goal;
  const done = !quit && total >= h.goal;
  const p = quit ? (h.goal ? Math.min(total / h.goal, 1) : Number(total > 0)) : Math.min(total / h.goal, 1);
  const R = 116;
  const C = 2 * Math.PI * R;
  const armed = ui.confirm === `delete:${h.id}`;
  const id = `data-id="${esc(h.id)}"`;
  const menu = ui.menu === 'habit' ? popover([
    { action: 'share-habit', attrs: id, label: 'Build with a friend' },
    { action: 'edit', attrs: id, label: 'Edit' },
    ...(h.reminder ? [{ action: 'ics', attrs: id, label: 'Add reminder to calendar' }] : []),
    { action: 'archive', attrs: id, label: h.archived ? 'Restore' : 'Archive' },
    { action: 'delete', attrs: id, label: armed ? 'Tap again to delete for good' : 'Delete', danger: true },
  ], 'pop-right') : '';
  const unit = h.unit ? ` ${esc(h.unit)}` : '';
  const timed = usesTimer(h) && k === todayKey();
  const timerView = timed && !ui.countView;
  const fb = (action, cls, icon, label) => `<button class="foot-btn" data-action="${action}" ${id}><span class="fi ${cls}">${icon}</span>${label}</button>`;
  const foot = [
    timed ? fb('style', 'style', ICON_SVG.clock, timerView ? 'Counter' : 'Timer') : '',
    timerView ? fb('sound', 'sound', ICON_SVG.note, 'Sound') : '',
    timerView ? fb('countdown', 'watch', ICON_SVG.watch, 'Countdown') : '',
    fb('memo', 'memo', ICON_SVG.memo, 'Memo'),
    fb('stat', 'stat', ICON_SVG.bars, 'Stat'),
  ].filter(Boolean).join('');
  const limit = isTimeHabit(h) ? fmtAmount(h, h.goal) : `${h.goal}${unit}`;
  const each = { day: 'each day', week: 'each week', month: 'each month', days: `every ${h.every} days` }[periodOf(h)];
  const rule = quit ? `<p class="cnt-desc rule${over ? ' over' : ''}">${over ? `Over the limit ${periodOf(h) === 'day' ? 'today' : periodLabel(h).toLowerCase()}` : h.goal ? `*Don't exceed ${limit} ${each}` : `*Not even once ${periodOf(h) === 'day' ? 'today' : periodLabel(h).toLowerCase()}`}</p>` : '';
  const head = `
      ${topBar(`<span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}`,
        roundBtn('back', ICON_SVG.left, 'Back'),
        roundBtn('menu', ICON_SVG.more, 'More options', `data-menu="habit" aria-haspopup="true" aria-expanded="${ui.menu === 'habit'}"`),
        menu)}
      ${k === todayKey() ? '' : `<p class="cnt-day">${esc(fmt(parseKey(k), { weekday: 'long', month: 'long', day: 'numeric' }))}</p>`}
      ${h.archived ? '<p class="cnt-day">Archived. Use ••• to restore it to Today.</p>' : ''}`;

  if (timerView) {
    const t = timerState(h);
    return `
    <div class="counter timer" style="${habitVars(h)}">
      ${head}
      <div class="ring-box">
        <svg class="big-ring" viewBox="0 0 260 260" aria-hidden="true">
          <circle cx="130" cy="130" r="${R}" class="prog full${over ? ' over' : ''}"/>
          <circle cx="130" cy="14" r="7" class="knob" transform="rotate(${t.knob} 130 130)"/>
        </svg>
        <div class="ring-in">
          <span class="clock" role="timer">${t.clock}</span>
          <span class="ring-goal clock-sub">${esc(t.sub)}</span>
        </div>
      </div>
      ${h.desc ? `<p class="cnt-desc">${esc(h.desc)}</p>` : ''}
      ${rule}
      <div class="cnt-actions">
        ${c > 0 || t.running ? `<button class="reset-btn" data-action="reset-day" ${id} aria-label="Reset today's time to 0">${ICON_SVG.undo}</button>` : '<span class="reset-btn" aria-hidden="true"></span>'}
        <button class="add-pill play" data-action="timer" ${id} aria-label="${t.running ? 'Pause the timer' : 'Start the timer'}">${t.running ? ICON_SVG.pause : ICON_SVG.play}</button>
        <button class="done-btn" data-action="keypad" ${id} aria-label="Add time by hand">${ICON_SVG.plus}</button>
      </div>
      <div class="cnt-foot">${foot}</div>
    </div>`;
  }

  return `
    <div class="counter" style="${habitVars(h)}">
      ${head}
      <div class="ring-box">
        <svg class="big-ring" viewBox="0 0 260 260" aria-hidden="true">
          <circle cx="130" cy="130" r="${R}" class="track"/>
          ${p > 0 ? `<circle cx="130" cy="130" r="${R}" class="prog${over ? ' over' : ''}" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 130 130)"/>` : ''}
        </svg>
        <div class="ring-in">
          <span class="ring-emoji" aria-hidden="true">${esc(h.icon)}</span>
          <button class="ring-num" data-action="keypad" ${id} aria-label="${esc(`${fmtNum(total)} of ${h.goal}${h.unit ? ` ${h.unit}` : ''}. Tap to type a number.`)}">${fmtNum(total)}</button>
          <span class="ring-goal" aria-hidden="true">/${h.goal}${unit}${periodLabel(h) ? `<br>${periodLabel(h).toLowerCase()}` : ''}</span>
        </div>
        <button class="ring-plus" data-action="add-one" ${id} aria-label="Add one">${ICON_SVG.plus}</button>
        ${c > 0 ? `<button class="ring-minus" data-action="sub-one" ${id} aria-label="Take one away">${ICON_SVG.minus}</button>` : ''}
      </div>
      ${h.desc ? `<p class="cnt-desc">${esc(h.desc)}</p>` : ''}
      ${rule}
      <div class="cnt-actions">
        ${c > 0 ? `<button class="reset-btn" data-action="reset-day" ${id} aria-label="Reset to 0">${ICON_SVG.undo}</button>` : '<span class="reset-btn" aria-hidden="true"></span>'}
        <button class="add-pill" data-action="keypad" ${id}>Add</button>
        ${quit ? '<span class="done-btn ghost" aria-hidden="true"></span>' : `<button class="done-btn${done ? ' on' : ''}" data-action="complete" ${id} aria-pressed="${done}" aria-label="${done ? 'Done. Tap to undo.' : 'Mark as done'}">${ICON_SVG.tick}</button>`}
      </div>
      <div class="cnt-foot">${foot}</div>
    </div>`;
}

/* A habit's Stat page */

/** Class for one day of a habit: done, part(ly), miss(ed), off (not scheduled) or future. */
function dayClass(h, d, start, tk) {
  const k = keyOf(d);
  const c = countOf(h, k);
  if (k > tk) return 'future';
  if (h.type === 'quit') return !c && !isDue(h, d, start) ? 'off' : isDone(h, k) ? 'done' : 'miss';
  if (periodOf(h) !== 'day') return isDone(h, k) ? 'done' : c > 0 ? 'part' : periodRange(h, k)[1] >= tk || !isDue(h, d, start) ? 'off' : 'miss';
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
    if (p === 1) cls.push('perfect');
    if (k === tk) cls.push('today');
    const label = `${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${p === null ? '' : `: ${pct(p)} done`}. Open this day.`;
    cells += `<button class="${cls.join(' ')}" style="--p:${(p || 0).toFixed(3)}" data-action="goto-day" data-key="${k}" ${future ? 'disabled' : ''} aria-label="${esc(label)}"><b>${d.getDate()}</b>${p === 1 ? '<i class="spark" aria-hidden="true">✨</i>' : ''}</button>`;
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
    ['medal', '#ffa94d', best, dd(best), 'Best Streaks'],
    single ? ['cal', '#3d8bff', st.done, dd(st.done), 'Days Done'] : ['cal', '#3d8bff', st.perfect, dd(st.perfect), 'Perfect Days'],
    single ? ['check', '#3ccf7a', st.volume, '', 'Times Done'] : ['check', '#3ccf7a', st.done, '', 'Habits Done'],
    ['avg', '#b36bff', fmtNum((single ? st.volume : st.done) / Math.max(st.days, 1)), '', 'Daily Average'],
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
          <b>${st.rate === null ? '–' : `${fmtNum(st.rate * 100)}%`}</b>
          <span>${ui.rateYear ? 'Yearly Rate' : 'Monthly Rate'}</span>
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
          <div class="row"><span id="sound-label">Sounds</span><label class="switch"><input type="checkbox" data-action="set-sound" ${s.sound ? 'checked' : ''} aria-labelledby="sound-label"><span aria-hidden="true"></span></label></div>
          <div class="row"><span id="party-label">Celebrate when all done</span><label class="switch"><input type="checkbox" data-action="set-celebrate" ${s.celebrate ? 'checked' : ''} aria-labelledby="party-label"><span aria-hidden="true"></span></label></div>
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

/** "Goal per day", "Allowed per week", "Goal every 3 days"… */
function goalLabel(quit, period, every) {
  const per = { day: 'per day', week: 'per week', month: 'per month', days: `every ${every} days` }[period];
  return `${quit ? 'Allowed' : 'Goal'} ${per}`;
}

/** The location reminder in the form: a chip with the place, tap to change, × to remove. */
const placeChip = (pl) => `<span class="rem-chip place-chip"><button type="button" class="place-open" data-action="place-open">📍 ${esc(pl.name)} · ${pl.on === 'leave' ? 'Leaving' : 'Arriving'}</button><button type="button" class="rem-x" data-action="place-remove" aria-label="Remove the location reminder">${ICON_SVG.close}</button></span>`;

/** One reminder time in the form, with a button to take it away. */
const remTimeHtml = (t) => `<span class="rem-chip"><input type="time" name="reminder" value="${t}" class="time-chip" aria-label="Reminder time"><button type="button" class="rem-x" data-action="remove-time" aria-label="Remove this time">${ICON_SVG.close}</button></span>`;

function daysNote(goal, days, unit, quit, period = 'day', every = 2) {
  if (period !== 'day') {
    const u = goal === 1 ? (unit || 'times').replace(/sses$/, 'ss').replace(/([^s])s$/, '$1') : unit || 'times';
    const each = { week: 'each week', month: 'each month', days: `every ${every} days` }[period];
    return quit ? `*Don't exceed ${goal} ${u} ${each}` : `*Complete ${goal} ${u} ${each}, on any days`;
  }
  if (!days.length) return '*Pick at least one day';
  if (quit) {
    const when = days.length === 7 ? 'each day' : `on each ${weekOrder().filter((d) => days.includes(d)).map(dayCode).join(' ')}`;
    const u = goal === 1 ? (unit || 'times').replace(/sses$/, 'ss').replace(/([^s])s$/, '$1') : unit || 'times';
    return goal ? `*Don't exceed ${goal} ${u} ${when}` : `*Not even once, ${when}`;
  }
  // "1 glass", "1 page": drop the plural ending when the goal is 1.
  const one = (u) => u.replace(/sses$/, 'ss').replace(/([^s])s$/, '$1');
  const what = `${goal} ${goal === 1 ? one(unit || 'times') : unit || 'times'}`;
  if (days.length === 7) return `*Complete ${what} every day`;
  return `*Complete ${what} on each ${weekOrder().filter((d) => days.includes(d)).map(dayCode).join(' ')}`;
}

const isQuitForm = (form) => Boolean(form.querySelector('input[name="type"][value="quit"]:checked'));

function updateDaysNote(form) {
  const quit = isQuitForm(form);
  const goal = clampInt(form.elements.goal.value, quit ? 0 : 1, MAX_COUNT, 1);
  const days = [...form.querySelectorAll('input[name="days"]:checked')].map((i) => Number(i.value));
  const period = form.elements.period.value;
  const every = clampInt(form.elements.every.value, 2, 30, 2);
  form.querySelector('.f-note').textContent = daysNote(goal, days, form.elements.unit.value.trim(), quit, period, every);
  form.querySelector('#goal-label').textContent = goalLabel(quit, period, every);
  form.querySelector('.every').hidden = period !== 'days';
  form.querySelector('.day-circles').hidden = period !== 'day';
  form.querySelector('.presets').hidden = period !== 'day';
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
    goal: p.goal !== undefined ? p.goal : 1,
    unit: p.unit || '',
    type: p.type || 'build',
    period: 'day',
    every: 2,
    createdAt: todayKey(),
    endDate: '',
    reminders: [],
    remindText: '',
    superAlert: false,
    ringtone: 'default',
    place: null,
    days: p.days || ALL_DAYS,
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
        <div class="f-row"><span id="type-label">Habit type</span>
          <div class="time-chips type-chips" role="radiogroup" aria-labelledby="type-label">
            <label class="opt tchip"><input type="radio" name="type" value="build" ${v.type === 'quit' ? '' : 'checked'}><span>Build</span></label>
            <label class="opt tchip"><input type="radio" name="type" value="quit" ${v.type === 'quit' ? 'checked' : ''}><span>Quit</span></label>
          </div>
        </div>
        <div class="f-row"><span id="period-label">Goal period</span>
          <div class="period-pick">
            <select name="period" aria-labelledby="period-label">
              ${[['day', 'Day-Long'], ['week', 'Week-Long'], ['month', 'Month-Long'], ['days', 'Every few days']].map(([val, label]) => `<option value="${val}" ${v.period === val ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>
        </div>
        <label class="f-row every"${v.period === 'days' ? '' : ' hidden'}><span>Repeat every</span><span class="every-in"><input type="number" name="every" min="2" max="30" value="${v.every}" inputmode="numeric" aria-label="Every how many days"> days</span></label>
        <div class="f-row"><span id="goal-label">${goalLabel(v.type === 'quit', v.period, v.every)}</span>
          <div class="stepper" role="group" aria-labelledby="goal-label">
            <button type="button" data-action="step" data-delta="-1" aria-label="One fewer">−</button>
            <input type="number" name="goal" min="${v.type === 'quit' ? 0 : 1}" max="${MAX_COUNT}" value="${v.goal}" inputmode="numeric" aria-labelledby="goal-label">
            <button type="button" data-action="step" data-delta="1" aria-label="One more">+</button>
          </div>
        </div>
        <button type="button" class="f-row f-link" data-action="unit-open"><span>Unit</span><span class="unit-val">${esc(v.unit || 'count')}</span>${ICON_SVG.right}</button>
        <input type="hidden" name="unit" value="${esc(v.unit)}">
      </section>

      <section class="fcard">
        <div class="f-row"><span>Task days</span>
          <div class="presets"${v.period === 'day' ? '' : ' hidden'}>
            <button type="button" class="pchip sm" data-action="preset" data-value="0,1,2,3,4,5,6">Every day</button>
            <button type="button" class="pchip sm" data-action="preset" data-value="1,2,3,4,5">Weekdays</button>
          </div>
        </div>
        <div class="day-circles" role="group" aria-label="Task days"${v.period === 'day' ? '' : ' hidden'}>
          ${weekOrder().map((d) => `<label class="opt day-opt"><input type="checkbox" name="days" value="${d}" ${v.days.includes(d) ? 'checked' : ''} aria-label="${esc(dayName(d, 'long'))}"><span>${esc(dayCode(d))}</span></label>`).join('')}
        </div>
        <p class="f-note" aria-live="polite">${esc(daysNote(v.goal, v.days, v.unit, v.type === 'quit', v.period, v.every))}</p>
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
          <div class="f-row"><span id="sa-label">Super Alert <button type="button" class="qmark" data-action="super-info" aria-label="What is Super Alert?">?</button></span><label class="switch"><input type="checkbox" name="superAlert" ${v.superAlert ? 'checked' : ''} aria-labelledby="sa-label"><span aria-hidden="true"></span></label></div>
          <div class="f-row"><span>Time</span><button type="button" class="add-time" data-action="reminder-type" aria-label="Add a reminder: time or location">${ICON_SVG.plus}</button></div>
          <div class="rem-times">${(v.reminders.length || v.place ? v.reminders : ['08:00']).map(remTimeHtml).join('')}${v.place ? placeChip(v.place) : ''}</div>
          <input type="hidden" name="place" value="${esc(v.place ? JSON.stringify(v.place) : '')}">
          <label class="f-row"><span>Ringtone</span><select name="ringtone" class="ring-pick" aria-label="Ringtone">${RINGTONES.map(([id, label]) => `<option value="${id}" ${(v.ringtone || 'default') === id ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
          <input type="text" name="remindText" maxlength="80" value="${esc(v.remindText)}" placeholder="Reminder message (optional)" class="rem-text" autocomplete="off" aria-label="Reminder message">
          <p class="f-hint">You get a notification while Habit For Me is open. For reminders when it's closed, use <strong>Add reminder to calendar</strong> in the habit's ••• menu.</p>
        </div>
        <div class="f-row"><span id="memo-label">Write a memo after finishing</span><label class="switch"><input type="checkbox" name="memo" ${v.memo ? 'checked' : ''} aria-labelledby="memo-label"><span aria-hidden="true"></span></label></div>
      </section>

      <section class="fcard">
        <p class="f-label pad">Habit term</p>
        <div class="term">
          <label><span>Start date</span><input type="date" name="startDate" value="${v.createdAt}" max="${todayKey()}" class="date-chip"></label>
          <span class="term-line" aria-hidden="true"></span>
          <label><span>End date</span><input type="date" name="endDate" value="${v.endDate}" class="date-chip" aria-describedby="end-hint"></label>
        </div>
        <p class="f-hint" id="end-hint">Leave the end date empty for no end. After the end date the habit stops showing on Today.</p>
      </section>

      <p class="form-error" role="alert" hidden></p>
      <button type="submit" class="save-btn">${h ? 'Save' : 'Add habit'}</button>
    </form>`);
  if (!h && !preset) sheet.querySelector('input[name="name"]').focus();
}

/* The Unit picker: opens over the add/edit form, so nothing typed in the form is lost. */

/** The item and unit chosen in the form: the item named like the habit (or just picked), or else a plain unit. */
function unitChoice(form) {
  const unit = form.elements.unit.value || 'count';
  const name = (form.elements.unit.dataset.item || form.elements.name.value).trim().toLowerCase();
  const item = UNIT_ITEMS.find((it) => !it.plain && it.name.toLowerCase() === name && it.units.includes(unit))
    || UNIT_ITEMS.find((it) => it.plain && it.units.includes(unit));
  return { unit, item };
}

/** One kind's items (cards with section titles), or search results across every kind. */
function unitListHtml(kind, query, choice) {
  const q = query.trim().toLowerCase();
  const isOn = (it, u) => it === choice.item && u === choice.unit;
  const row = (it) => {
    const label = `<span class="u-name">${esc(it.name)}${q ? `<small>${esc(it.kind)}</small>` : ''}</span>`;
    const name = it.plain ? '' : esc(it.name);
    if (it.units.length === 1) {
      const u = it.units[0];
      return `
        <div class="u-item"><button type="button" class="u-row${isOn(it, u) ? ' on' : ''}" data-action="unit-pick" data-value="${esc(u)}" data-name="${name}">
          ${label}<span class="u-unit">${esc(u)}</span>
        </button></div>`;
    }
    const open = it.units.some((u) => isOn(it, u));
    return `
      <div class="u-item">
        <button type="button" class="u-row" data-action="unit-expand" aria-expanded="${open}">${label}${ICON_SVG.right}</button>
        <div class="u-choices"${open ? '' : ' hidden'}>
          ${it.units.map((u) => `<button type="button" class="pchip${isOn(it, u) ? ' on' : ''}" data-action="unit-pick" data-value="${esc(u)}" data-name="${name}">${esc(u)}</button>`).join('')}
        </div>
      </div>`;
  };
  const card = (rows) => `<div class="u-card">${rows}</div>`;
  if (!q) {
    let html = '';
    let rows = '';
    for (const x of UNIT_KINDS[kind][1]) {
      if (Array.isArray(x)) { rows += row(UNIT_BY_NAME.get(x[0])); continue; }
      if (rows) html += card(rows);
      rows = '';
      html += `<h3 class="u-head">${esc(x)}</h3>`;
    }
    return html + (rows ? card(rows) : '');
  }
  const found = UNIT_ITEMS.filter((it) => it.name.toLowerCase().includes(q) || it.words.includes(q)
    || it.kind.toLowerCase().includes(q) || it.units.some((u) => u.toLowerCase() === q));
  // Offer the typed text as a new unit, unless it is already a unit, or names an item ("Quran", "calories").
  const typed = query.trim().slice(0, 12);
  const known = UNIT_ITEMS.some((it) => it.units.includes(typed) || it.name.toLowerCase() === q || it.words.split(' ').includes(q));
  const own = known ? '' : `<div class="u-item"><button type="button" class="u-row own" data-action="unit-pick" data-value="${esc(typed)}" data-name="">
      <span class="u-name">Use your own unit</span><span class="u-unit">${esc(typed)}</span></button></div>`;
  return found.length || own ? card(found.map(row).join('') + own) : '<p class="u-empty">Nothing found.</p>';
}

function openUnitPicker(form) {
  const choice = unitChoice(form);
  // Open on the kind that holds the chosen item (Popular if it is there). A habit with no unit opens on Popular.
  const name = choice.item && choice.unit !== 'count' ? choice.item.name : '';
  const kind = Math.max(0, UNIT_KINDS.findIndex(([, list]) => list.some((x) => Array.isArray(x) && x[0] === name)));
  sheet.insertAdjacentHTML('beforeend', `
    <div class="unit-panel" data-kind="${kind}" role="group" aria-label="Unit">
      <div class="sheet-head">
        <button type="button" class="round" data-action="unit-close" aria-label="Back to the habit">${ICON_SVG.close}</button>
        <h2>Unit</h2>
        <span class="round-gap" aria-hidden="true"></span>
      </div>
      <div class="unit-tabs" role="group" aria-label="Kinds">
        ${UNIT_KINDS.map(([k], i) => `<button type="button" class="pchip${i === kind ? ' on' : ''}" data-action="unit-kind" data-value="${i}" aria-pressed="${i === kind}">${esc(k)}</button>`).join('')}
      </div>
      <div class="unit-list">${unitListHtml(kind, '', choice)}</div>
      <label class="unit-search">${ICON_SVG.search}<input type="search" placeholder="Search or type a unit" aria-label="Search units, or type your own" autocomplete="off" maxlength="30"></label>
    </div>`);
  // Scroll the chosen kind and item into the middle, without moving anything else.
  const tabs = sheet.querySelector('.unit-tabs');
  const tab = tabs.querySelector('.on');
  tabs.scrollLeft += tab.getBoundingClientRect().left - tabs.getBoundingClientRect().left - (tabs.clientWidth - tab.offsetWidth) / 2;
  const list = sheet.querySelector('.unit-list');
  const lit = list.querySelector('.on');
  if (lit) list.scrollTop += lit.getBoundingClientRect().top - list.getBoundingClientRect().top - (list.clientHeight - lit.offsetHeight) / 2;
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
      <p class="kp-now">Now ${isTimeHabit(h) ? `${fmtAmount(h, c)} of ${fmtAmount(h, h.goal)} (type ${h.unit === 'hr' ? 'hours' : 'minutes'})` : `${fmtNum(c)} of ${h.goal}${h.unit ? ` ${esc(h.unit)}` : ''}`}</p>
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
    if (name === 'ringtone') ring(e.target.value);
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
    panel.querySelector('.unit-list').innerHTML = unitListHtml(Number(panel.dataset.kind), e.target.value, unitChoice(sheet.querySelector('#habit-form')));
    panel.querySelector('.unit-tabs').classList.toggle('dim', searching);
    return;
  }
  const form = e.target.form;
  if (!form || form.id !== 'habit-form') return;
  if (e.target.name === 'icon_custom' && e.target.value.trim()) form.querySelector('.preview').textContent = e.target.value.trim();
  if (e.target.name === 'type') {
    const quit = isQuitForm(form);
    form.elements.goal.min = quit ? 0 : 1;
    if (!quit && Number(form.elements.goal.value) < 1) form.elements.goal.value = 1;
  }
  if (['goal', 'unit', 'type', 'period', 'every'].includes(e.target.name)) updateDaysNote(form);
});

sheet.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);

  if (form.id === 'share-form') {
    const h = findHabit(form.dataset.id);
    if (!h) {
      sheet.close();
      return;
    }
    const me = cleanText(fd.get('me'), 30);
    const friend = cleanText(fd.get('friend'), 30);
    if (me) state.settings.name = me;
    if (friend && !h.friends.includes(friend)) h.friends.push(friend);
    const link = habitLink(h);
    save();
    sheet.close();
    shareText(`${friend ? `Salaam ${friend}! ` : ''}Let's build “${h.icon} ${h.name}” together on Habit For Me 💪 Open this link to join. (If you use the app from your home screen: Group → + → Join with a link, and paste it.)`, link);
    Object.assign(ui, { tab: 'group', detail: null, stat: false, menu: null });
    render();
    return;
  }

  if (form.id === 'all-form') {
    const k = ui.date;
    const ids = fd.getAll('ids').map(String);
    for (const id of ids) {
      const h = findHabit(id);
      if (!h || isDone(h, k)) continue;
      cancelTimer(h);
      setCount(h, k, countOf(h, k) + h.goal - periodCount(h, k));
    }
    sheet.close();
    render();
    if (!ids.length) return;
    const due = active().filter((x) => isDue(x, parseKey(k)));
    if (k === todayKey() && due.every((x) => isDone(x, k)) && state.settings.celebrate) celebrate();
    else chime();
    toast(`${plural(ids.length, 'habit')} completed`);
    return;
  }

  if (form.id === 'join-form') {
    const d = readLink(fd.get('link'));
    if (!d) {
      const error = form.querySelector('.form-error');
      error.textContent = "That doesn't look like a Habit For Me link.";
      error.hidden = false;
      return;
    }
    openLink(d);
    return;
  }

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
  const period = ['week', 'month', 'days'].includes(fd.get('period')) ? fd.get('period') : 'day';
  const days = period === 'day' ? fd.getAll('days').map(Number).sort() : ALL_DAYS.slice();
  const startDate = isKey(fd.get('startDate')) && fd.get('startDate') <= todayKey() ? fd.get('startDate') : null;
  const endDate = isKey(fd.get('endDate')) ? fd.get('endDate') : '';
  const times = [...new Set(fd.getAll('reminder').map(String).filter((t) => TIME_RE.test(t)))].sort().slice(0, 5);
  const error = form.querySelector('.form-error');
  const problem = !name ? 'Please give your habit a name.' : !days.length ? 'Pick at least one day.'
    : endDate && startDate && endDate < startDate ? 'The end date is before the start date.' : '';
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
    type: fd.get('type') === 'quit' ? 'quit' : 'build',
    goal: clampInt(fd.get('goal'), fd.get('type') === 'quit' ? 0 : 1, MAX_COUNT, 1),
    unit: String(fd.get('unit') || '').trim().slice(0, 12),
    days,
    time: String(fd.get('time') || 'any'),
    group: String(fd.get('group') || '').trim().slice(0, 24),
    reminders: fd.get('remind') ? times : [],
    reminder: fd.get('remind') ? times[0] || '' : '',
    remindText: String(fd.get('remindText') || '').trim().slice(0, 80),
    superAlert: Boolean(fd.get('superAlert')),
    ringtone: RINGTONES.some(([id]) => id === fd.get('ringtone')) ? String(fd.get('ringtone')) : 'default',
    place: fd.get('remind') ? cleanPlace((() => { try { return JSON.parse(String(fd.get('place') || 'null')); } catch (err) { return null; } })()) : null,
    period,
    every: clampInt(fd.get('every'), 2, 30, 2),
    endDate,
    memo: Boolean(fd.get('memo')),
  };
  const existing = ui.editing && findHabit(ui.editing);
  if (existing) Object.assign(existing, data, startDate ? { createdAt: startDate } : {});
  else state.habits.push({ id: newId(), createdAt: startDate || todayKey(), archived: false, shareId: '', friends: [], friendStats: {}, ...data });
  startCache.clear();

  save();
  sheet.close();
  render();
  toast(existing ? 'Habit updated' : `${data.icon} ${data.name} added`);
  if (data.reminder || data.place) askNotifications();
  // You set the place where you are standing: count as already there, so it rings next time you arrive.
  const saved = existing || state.habits[state.habits.length - 1];
  if (data.place) inside[saved.id] = true;
  watchPlaces();
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

/* Sounds: made here with Web Audio (no sound files). They play after a tap. */

let audioCtx = null;

/** The sound engine, started on the first tap (phones only allow sound after a tap). */
function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch (err) {
    return null;
  }
}

/** Play bell-like notes: [frequency in Hz, start in seconds, length in seconds]. */
function playNotes(notes, volume, force) {
  if ((!state.settings.sound && !force) || !audio()) return;
  try {
    const t0 = audioCtx.currentTime + 0.02;
    const out = audioCtx.createGain();
    out.gain.value = volume;
    out.connect(audioCtx.destination);
    notes.forEach(([freq, at, len]) => {
      // Each note, plus a quieter one an octave higher: that makes it ring like a bell.
      [[1, 1], [2, 0.22]].forEach(([times, level]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = freq * times;
        gain.gain.setValueAtTime(0.0001, t0 + at);
        gain.gain.exponentialRampToValueAtTime(level, t0 + at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t0 + at);
        osc.stop(t0 + at + len + 0.05);
      });
    });
  } catch (err) {
    // No sound is fine.
  }
}

/** A habit is done: three quick rising notes (C, E, G). */
const chime = () => playNotes([[1046.5, 0, 0.6], [1318.5, 0.08, 0.6], [1568, 0.16, 0.9]], 0.18);

/** Everything for today is done: the same notes, then a high C over a ringing chord. */
const fanfare = () => playNotes([[1046.5, 0, 0.5], [1318.5, 0.09, 0.5], [1568, 0.18, 0.5],
  [2093, 0.27, 1.6], [1318.5, 0.42, 1.4], [1568, 0.42, 1.4]], 0.14);

/* The celebration when everything for today is done. */

const party = document.getElementById('party');
let partyTimer = 0;
let partyThen = null; // runs when the celebration closes, for example a memo to write

function celebrate(then) {
  partyThen = then || null;
  fanfare();
  party.innerHTML = `
    <canvas class="confetti" aria-hidden="true"></canvas>
    <div class="party-words"><p class="pw1">WELL DONE!!</p><p class="pw2">YOU DID IT!!</p></div>
    <button type="button" class="party-off">Don't show again</button>`;
  if (!party.open) party.showModal();
  party.focus({ preventScroll: true }); // focus the whole screen, not the small button
  confetti(party.querySelector('.confetti'));
  clearTimeout(partyTimer);
  partyTimer = setTimeout(endParty, 5000);
}

function endParty() {
  clearTimeout(partyTimer);
  if (party.open) party.close();
}

// A tap anywhere closes it. "Don't show again" also turns it off (it can be turned on in Me → Settings).
party.addEventListener('click', (e) => {
  if (e.target.closest('.party-off')) {
    state.settings.celebrate = false;
    save();
    toast('Turn it back on in Me → Settings');
  }
  endParty();
});

party.addEventListener('close', () => {
  party.innerHTML = '';
  const then = partyThen;
  partyThen = null;
  if (then) then();
});

/** Paper squares and little stars that flutter down for a few seconds. */
function confetti(canvas) {
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  const colors = ['#ff3d8b', '#ffc81e', '#2ba8e0'];
  const count = still ? 50 : Math.min(240, Math.round((W * H) / 2600));
  const bits = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * W,
    y: still ? Math.random() * H : (Math.random() * 1.6 - 0.6) * H,
    fall: 1.2 + Math.random() * 2.4,
    drift: (Math.random() - 0.5) * 0.8,
    size: 5 + Math.random() * 7,
    turn: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.16,
    flip: Math.random() * Math.PI * 2,
    star: i % 6 === 0,
    color: colors[i % 3],
  }));
  const drawStar = (r) => {
    ctx.beginPath();
    for (let j = 0; j < 10; j++) {
      const a = (j * Math.PI) / 5 - Math.PI / 2;
      const rr = j % 2 ? r * 0.45 : r;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  };
  const started = performance.now();
  const frame = (now) => {
    if (!canvas.isConnected) return;
    ctx.clearRect(0, 0, W, H);
    bits.forEach((b) => {
      if (!still) {
        b.y += b.fall;
        b.flip += 0.08;
        b.x += b.drift + Math.sin(b.flip) * 0.5;
        b.turn += b.spin;
      }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.turn);
      if (b.star) {
        ctx.fillStyle = colors[2];
        drawStar(b.size * 0.55);
      } else {
        // The paper turns as it falls, so it looks thinner, then wider again.
        const tall = b.size * (0.35 + 0.65 * Math.abs(Math.cos(b.flip)));
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.size / 2, -tall / 2, b.size, tall);
      }
      ctx.restore();
    });
    if (!still && now - started < 5000) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* A small question with Cancel and Confirm, like an iPhone alert. */

const askBox = document.getElementById('ask');
let askYes = null;

function ask(text, onYes) {
  askYes = onYes;
  askBox.innerHTML = `
    <form method="dialog" class="ask-card">
      <span class="ask-icon" aria-hidden="true">${ICON_SVG.warn}</span>
      <p id="ask-text">${esc(text)}</p>
      <div class="ask-btns">
        <button value="no" class="ask-no">Cancel</button>
        <button value="yes" class="ask-yes">Confirm</button>
      </div>
    </form>`;
  askBox.returnValue = '';
  askBox.showModal();
}

askBox.addEventListener('close', () => {
  const yes = askBox.returnValue === 'yes' && askYes;
  askYes = null;
  if (yes) yes();
});

/** After a count changes: a buzz, a chime when a habit is finished, and confetti when the whole day is done. */
function afterChange(h, before, after, k, quiet) {
  if (periodOf(h) !== 'day') {
    // Goal periods: compare the whole period's total before and after.
    const total = periodCount(h, k);
    before = total - (after - before);
    after = total;
  }
  if (h.type === 'quit') {
    // Quit habits: a warning buzz when going over the limit, no cheering.
    const broke = before <= h.goal && after > h.goal;
    if (navigator.vibrate) navigator.vibrate(broke ? [40, 60, 40] : 8);
    if (broke) toast(`${h.icon} Over your limit for ${h.name} today`);
    return;
  }
  const finished = before < h.goal && after >= h.goal;
  if (navigator.vibrate) navigator.vibrate(finished ? 18 : 8);
  if (!finished) return;
  const memo = h.memo ? () => openMemo(h, k) : null;
  const due = k === todayKey() ? active().filter((x) => isDue(x, parseKey(k))) : [];
  if (due.length && due.every((x) => isDone(x, k))) {
    if (state.settings.celebrate) {
      celebrate(memo); // the memo opens when the celebration closes
      return;
    }
    fanfare();
    toast('All done for today! 🎉');
  } else if (!quiet) chime();
  if (memo) memo();
}

/* ---------- Timers for habits counted in minutes or hours ---------- */

// Running timers: { habitId: { key: day, start: time in ms, from: seconds done before starting } }.
// Kept apart from the habits, so a timer keeps going when the app is closed and opened again.
const TIMERS_KEY = 'habit-for-me:timers';
let timers = loadTimers();
let lastTick = 0;
let focusSrc = null; // the focus sound playing now
let previewTimer = 0;
const focusBuffers = {};

function loadTimers() {
  try {
    const t = JSON.parse(localStorage.getItem(TIMERS_KEY) || '{}');
    return t && typeof t === 'object' ? t : {};
  } catch (err) {
    return {};
  }
}

function saveTimers() {
  try {
    localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
  } catch (err) {
    // Storage blocked: the timer still works while the app stays open.
  }
}

/** Seconds done on a day, counting a timer that is running now. */
function secsDone(h, k) {
  const t = timers[h.id];
  return countOf(h, k) * unitSecs(h) + (t && t.key === k ? (Date.now() - t.start) / 1000 : 0);
}

/** What the timer page shows: the clock, a line under it, and where the knob on the ring is. */
/**
 * Where a timer stops (in seconds done today): at the goal, and once the goal is done, after one
 * more full round of the same length, so ▶ always starts a fresh countdown. A quit habit stops at
 * its limit and after that keeps counting how far over it is (Infinity: no stop).
 */
function timerTarget(h, from) {
  const goal = h.goal * unitSecs(h);
  if (h.type === 'quit') return from < goal ? goal : Infinity;
  return (Math.floor(from / goal + 1e-9) + 1) * goal;
}

function timerState(h) {
  const t = timers[h.id];
  const done = secsDone(h, todayKey());
  const goal = h.goal * unitSecs(h);
  const target = timerTarget(h, t ? t.from : done);
  const over = target === Infinity;
  const left = target - done;
  const clock = ui.countUp ? fmtClock(done) : over ? `+${fmtClock(done - goal)}` : fmtClock(left);
  // The knob goes round once a minute: backwards while counting down, forwards when counting up.
  const sec = Math.floor(ui.countUp ? done : over ? done - goal : left) % 60;
  const knob = !ui.countUp && !over ? -((60 - sec) % 60) * 6 : sec * 6;
  const sub = `${fmtAmount(h, done / unitSecs(h))} of ${fmtAmount(h, h.goal)}${h.type === 'quit' ? ' allowed' : done >= goal ? ' ✓' : ''}`;
  return { clock, sub, knob, running: Boolean(t) };
}

function startTimer(h) {
  const k = todayKey();
  timers[h.id] = { key: k, start: Date.now(), from: secsDone(h, k) };
  saveTimers();
  startFocusSound(); // this runs from a tap, which also lets sound play on phones
}

/** Pause: add the time since starting to that day's count. */
function stopTimer(h) {
  const t = timers[h.id];
  if (!t) return;
  delete timers[h.id];
  saveTimers();
  if (!Object.keys(timers).length) stopFocusSound();
  const before = countOf(h, t.key);
  const after = Math.min(MAX_COUNT, Math.round((before + (Date.now() - t.start) / 1000 / unitSecs(h)) * 10000) / 10000);
  setCount(h, t.key, after);
  afterChange(h, before, after, t.key);
}

/** The goal (or a quit habit's limit) is reached: stop right on it and play the end sound. */
/** Stops a timer without saving its time (for reset). */
function cancelTimer(h) {
  if (!timers[h.id]) return;
  delete timers[h.id];
  saveTimers();
  if (!Object.keys(timers).length) stopFocusSound();
}

function finishTimer(h, target) {
  const t = timers[h.id];
  cancelTimer(h);
  const before = countOf(h, t.key);
  const after = Math.min(MAX_COUNT, Math.max(before, Math.round((target / unitSecs(h)) * 10000) / 10000));
  setCount(h, t.key, after);
  endSound();
  if (document.hidden) remind(h, h.type === 'quit' ? 'You reached your limit for today.' : "Time's up. Well done!");
  render();
  afterChange(h, before, after, t.key, true);
}

/** Runs 4 times a second: finishes timers, moves the clock on the open page, and ticks. */
function timerTick() {
  const ids = Object.keys(timers);
  if (!ids.length) return;
  for (const id of ids) {
    const h = findHabit(id);
    const t = timers[id];
    if (!h || !usesTimer(h)) {
      delete timers[id];
      saveTimers();
    } else {
      const target = timerTarget(h, t.from);
      if (secsDone(h, t.key) >= target) finishTimer(h, target);
    }
  }
  const h = ui.detail && !ui.stat && findHabit(ui.detail);
  if (h && view.querySelector('.counter.timer')) {
    const st = timerState(h);
    view.querySelector('.clock').textContent = st.clock;
    view.querySelector('.clock-sub').textContent = st.sub;
    view.querySelector('.knob').setAttribute('transform', `rotate(${st.knob} 130 130)`);
  }
  const sec = Math.floor(Date.now() / 1000);
  if (sec !== lastTick && Object.keys(timers).length) {
    lastTick = sec;
    if (state.settings.focusSound === 'tick') tickSound();
  }
}
setInterval(timerTick, 250);

/** A few seconds of rain, waves, fire or soft noise, made from random numbers, that loop smoothly. */
function focusBuffer(ctx, name) {
  if (focusBuffers[name]) return focusBuffers[name];
  const len = ctx.sampleRate * (name === 'waves' ? 8 : 4);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const out = buf.getChannelData(0);
  let brown = 0;
  let crackle = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.02 * white) / 1.02;
    if (name === 'waves') out[i] = brown * 3.5 * (0.25 + 0.75 * Math.sin((Math.PI * i) / len) ** 2);
    else if (name === 'fire') {
      if (Math.random() < 0.0003) crackle = 0.6 + Math.random() * 0.6;
      crackle *= 0.995;
      out[i] = brown * 2.5 + white * crackle;
    } else out[i] = white * (name === 'rain' ? 0.5 : 0.35);
  }
  focusBuffers[name] = buf;
  return buf;
}

/** The sound that plays while a timer runs (the tick is played each second by timerTick). */
function startFocusSound(name = state.settings.focusSound) {
  stopFocusSound();
  if (!state.settings.sound || !audio() || name === 'silent' || name === 'tick') return;
  try {
    const ctx = audioCtx;
    const src = ctx.createBufferSource();
    src.buffer = focusBuffer(ctx, name);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = { rain: 6000, waves: 650, fire: 2600, noise: 1200 }[name];
    const gain = ctx.createGain();
    gain.gain.value = { rain: 0.16, waves: 0.55, fire: 0.4, noise: 0.3 }[name];
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    focusSrc = src;
  } catch (err) {
    focusSrc = null;
  }
}

function stopFocusSound() {
  if (focusSrc) {
    try {
      focusSrc.stop();
    } catch (err) {
      // It had already stopped.
    }
  }
  focusSrc = null;
}

const tickSound = () => playNotes([[1900, 0, 0.03]], 0.05);

/** One ring of a reminder ringtone (an alarm repeats it). */
function ring(name) {
  const tones = {
    default: [[1046.5, 0, 0.5], [1318.5, 0.12, 0.5], [1568, 0.24, 0.8]],
    drum: [[110, 0, 0.25], [110, 0.3, 0.25], [165, 0.6, 0.35], [110, 0.9, 0.25]],
    universe: [[1568, 0, 0.9], [2093, 0.15, 0.9], [2637, 0.3, 0.9], [3136, 0.45, 1.2]],
    chord: [[523.25, 0, 1.4], [659.25, 0, 1.4], [783.99, 0, 1.4], [1046.5, 0, 1.4]],
    ding: [[1760, 0, 1.2], [1760, 0.6, 1.2]],
    rhythm: [[880, 0, 0.15], [880, 0.2, 0.15], [1175, 0.4, 0.15], [880, 0.8, 0.15], [1175, 1, 0.3]],
  };
  playNotes(tones[name] || tones.default, 0.2, true);
}

/** The sound when a timer's time is up. */
function endSound(name = state.settings.endSound) {
  if (name === 'bell') playNotes([[880, 0, 2.2], [1320, 0, 1.4], [880, 0.8, 2.2], [1320, 0.8, 1.4]], 0.14);
  else if (name === 'chime') playNotes([[1046.5, 0, 0.6], [1318.5, 0.15, 0.6], [1568, 0.3, 0.6], [2093, 0.45, 1.3]], 0.15);
}

function openSoundSheet(tab) {
  const s = state.settings;
  const list = tab === 'focus' ? FOCUS_SOUNDS : END_SOUNDS;
  const now = tab === 'focus' ? s.focusSound : s.endSound;
  showSheet(`
    <div class="sound-sheet">
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Select Sound</h2><span class="round-gap" aria-hidden="true"></span></div>
      ${segButtons('sound-tab', [['focus', 'Focus Sound'], ['end', 'End Sound']], tab, 'Which sound')}
      <div class="u-card">${list.map(([sid, label, emoji]) => `
        <div class="u-item"><button type="button" class="u-row${sid === now ? ' on' : ''}" data-action="pick-sound" data-value="${tab}:${sid}" aria-pressed="${sid === now}">
          <span class="u-name"><span><span aria-hidden="true">${emoji}</span> ${label}</span></span>${sid === now ? ICON_SVG.tick : ''}</button></div>`).join('')}
      </div>
      <p class="f-hint">${tab === 'focus' ? 'Plays while the timer runs.' : 'Plays when the time is up.'}${s.sound ? '' : ' Sounds are turned off in Me → Settings.'}</p>
    </div>`);
}

const TIMER_LENGTHS = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120]; // minutes

function openCountdown(h) {
  const now = h.goal * (unitSecs(h) / 60);
  showSheet(`
    <div class="countdown-sheet">
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Countdown</h2><span class="round-gap" aria-hidden="true"></span></div>
      ${segButtons('count-dir', [['down', 'Count down'], ['up', 'Count up']], ui.countUp ? 'up' : 'down', 'Count down or up')}
      <p class="f-label pad">How long</p>
      <div class="len-chips" role="group" aria-label="How long">
        ${TIMER_LENGTHS.map((m) => `<button type="button" class="pchip${m === now ? ' on' : ''}" data-action="timer-length" data-id="${esc(h.id)}" data-value="${m}" aria-pressed="${m === now}">${fmtAmount({ unit: 'min' }, m)}</button>`).join('')}
      </div>
      <p class="f-hint">${h.type === 'quit' ? 'The time you allow yourself each day.' : 'Your goal for the day. When it is done, ▶ starts another round of the same length.'} To type another length, use ••• → Edit.</p>
    </div>`);
}

/** Sets a timed habit's goal in minutes. An hours habit switches to minutes for lengths like 30m. */
function setTimerLength(h, minutes) {
  if (h.unit === 'hr' && minutes % 60) {
    h.unit = 'min';
    const log = state.log[h.id] || {};
    for (const k of Object.keys(log)) log[k] = Math.min(MAX_COUNT, Math.round(log[k] * 60 * 10000) / 10000);
  }
  h.goal = h.unit === 'hr' ? minutes / 60 : minutes;
  save();
}

/* ---------- The New Habit page: ready-made habits ---------- */

function openTemplates(tab = ui.tplTab) {
  ui.tplTab = tab;
  const goalText = ([, , goal, unit, more]) => {
    const amount = isTimeHabit({ unit }) ? fmtAmount({ unit }, goal) : `${goal}${unit ? ` ${unit}` : ''}`;
    if (more && more.type === 'quit') return goal ? `≤ ${amount}` : 'never';
    return goal === 1 && !unit ? '' : amount;
  };
  showSheet(`
    <div class="tpl">
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">New Habit</h2><span class="round-gap" aria-hidden="true"></span></div>
      <div class="unit-tabs tpl-tabs" role="group" aria-label="Kinds of habits">
        ${TEMPLATE_TABS.map(([name, emoji], i) => `<button type="button" class="pchip${i === tab ? ' on' : ''}" data-action="tpl-tab" data-value="${i}" aria-pressed="${i === tab}"><span aria-hidden="true">${emoji}</span> ${esc(name)}</button>`).join('')}
      </div>
      <ul class="tpl-list">
        ${TEMPLATE_TABS[tab][2].map((t, i) => `<li><button type="button" class="tpl-row" data-action="tpl-pick" data-value="${i}"><span class="tpl-emoji" aria-hidden="true">${t[0]}</span><span class="tpl-name">${esc(t[1])}</span><span class="tpl-goal">${esc(goalText(t))}</span><span class="tpl-add" aria-hidden="true">${ICON_SVG.plus}</span></button></li>`).join('')}
      </ul>
      <button type="button" class="custom-btn" data-action="tpl-custom">Custom Habit</button>
    </div>`);
  const row = sheet.querySelector('.tpl-tabs');
  const on = row.querySelector('.on');
  row.scrollLeft += on.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - on.offsetWidth) / 2;
}

/* ---------- Group: share habits with friends ---------- */
// There is no server, so invites, reminders and progress travel as links in messages (WhatsApp,
// Messages…). Each link carries the habit and the sender's last 7 days: opening a friend's link adds
// the habit (the first time) and shows how they are doing in the Group tab.

let pendingJoin = null; // a friend's link waiting for "Add habit"

const b64 = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (code) => new TextDecoder().decode(Uint8Array.from(atob(code.replace(/-/g, '+').replace(/_/g, '/')), (ch) => ch.charCodeAt(0)));

/** The last 7 days of a habit, oldest first: 1 done, 0 not done, - not scheduled. */
function lastWeek(h) {
  const start = startKey(h);
  let out = '';
  for (let i = 6; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const due = isDue(h, d, start);
    out += isDone(h, keyOf(d)) && (due || h.type !== 'quit') ? '1' : due ? '0' : '-';
  }
  return out;
}

const goalLine = (h) => `${h.type === 'quit' ? 'At most' : 'Goal'} ${isTimeHabit(h) ? fmtAmount(h, h.goal) : `${h.goal}${h.unit ? ` ${h.unit}` : ''}`} a day`;

/** A link that opens Habit For Me with this habit and my progress in it. */
function habitLink(h) {
  if (!h.shareId) {
    h.shareId = newId().replace(/-/g, '').slice(0, 16);
    save();
  }
  const data = {
    v: 1, s: h.shareId, n: h.name, i: h.icon, c: h.color, g: h.goal, u: h.unit, t: h.type === 'quit' ? 'q' : 'b',
    d: h.days.join(''), f: state.settings.name || '', day: todayKey(), w: lastWeek(h), k: currentStreak(h),
  };
  return `${location.origin}${location.pathname}#h=${b64(JSON.stringify(data))}`;
}

/** Opens the phone's share sheet (WhatsApp, Messages…). Computers without one get WhatsApp. */
function shareText(text, url) {
  const full = `${text}\n${url}`;
  if (navigator.share) navigator.share({ text: full }).catch(() => {});
  else window.open(`https://wa.me/?text=${encodeURIComponent(full)}`, '_blank', 'noopener');
}

function statusLine(h) {
  const k = todayKey();
  const amount = `${fmtAmount(h, countOf(h, k))}/${fmtAmount(h, h.goal)}`;
  if (h.type === 'quit') return isDone(h, k) ? `I'm under my limit today (${amount})` : 'I went over my limit today';
  return isDone(h, k) ? 'I did it today ✅' : `I'm at ${amount} today`;
}

function sendRemind(h) {
  const who = h.friends.length ? `${h.friends.join(', ')}, ` : '';
  shareText(`🔔 ${who}did you do “${h.icon} ${h.name}” today? ${statusLine(h)}. Let's keep going together 💪`, habitLink(h));
}

function sendProgress(h) {
  const streak = currentStreak(h);
  shareText(`${h.icon} ${h.name}: ${statusLine(h)}${streak ? `, 🔥 ${plural(streak, 'day')} in a row` : ''}. Your turn! Open to see how we're doing:`, habitLink(h));
}

/** Reads a friend's link (or just the code in it). Returns its data, or null. */
function readLink(text) {
  const str = String(text || '');
  const m = str.match(/#h=([\w-]+)/) || str.trim().match(/^([\w-]{40,})$/);
  if (!m) return null;
  try {
    const d = JSON.parse(unb64(m[1]));
    return d && d.v === 1 && typeof d.s === 'string' && d.s && typeof d.n === 'string' && d.n ? d : null;
  } catch (err) {
    return null;
  }
}

function keepFriendProgress(h, from, d) {
  if (!h.friends.includes(from)) h.friends.push(from);
  if (isKey(d.day) && /^[01?-]{7}$/.test(String(d.w))) {
    h.friendStats[from] = { day: d.day, week: d.w, streak: clampInt(d.k, 0, 99999, 0), at: Date.now() };
  }
}

/** A friend's link: update how they are doing, or offer to add the habit the first time. */
function openLink(d) {
  const from = cleanText(d.f, 30) || 'Your friend';
  const mine = state.habits.find((h) => h.shareId === d.s);
  if (mine) {
    keepFriendProgress(mine, from, d);
    save();
    if (sheet.open) sheet.close();
    Object.assign(ui, { tab: 'group', detail: null, stat: false, menu: null });
    render();
    toast(`${from}'s progress is updated`);
    return;
  }
  pendingJoin = d;
  const color = /^#[0-9a-f]{6}$/i.test(d.c) ? d.c : NEW_COLORS[0];
  showSheet(`
    <div class="join">
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Build together</h2><span class="round-gap" aria-hidden="true"></span></div>
      <div class="share-card" style="--c:${color}"><span class="hc-icon" aria-hidden="true">${esc(cleanText(d.i, 8) || '✅')}</span><b>${esc(cleanText(d.n, 60))}</b></div>
      <p class="join-text"><strong>${esc(from)}</strong> invited you to build this habit together. You'll see how each other is doing in the Group tab.</p>
      ${state.settings.name ? '' : '<section class="fcard"><label class="f-row"><span>Your name</span><input type="text" id="join-me" maxlength="30" placeholder="So your friend knows it’s you" autocomplete="nickname"></label></section>'}
      <button type="button" class="save-btn" data-action="join-yes">Add habit</button>
      <button type="button" class="ghost-btn" data-action="close-sheet">Not now</button>
    </div>`);
}

/** Opening the app from a friend's link (…#h=…). */
function checkLink() {
  if (!location.hash.startsWith('#h=')) return;
  const d = readLink(location.hash);
  history.replaceState(null, '', location.pathname + location.search);
  if (d) openLink(d);
  else toast("That link didn't work. Ask your friend to send it again.");
}
window.addEventListener('hashchange', checkLink);

function renderGroup() {
  const add = roundBtn('group-add', ICON_SVG.plus, 'Share or join a habit');
  const shared = active().filter((h) => h.shareId);
  if (!shared.length) {
    return `${topBar('Group', '', add)}
      <section class="empty group-empty">
        <div class="group-art" aria-hidden="true">🤝</div>
        <p>It's always nicer to have someone by your side.<br>Tap <strong>+</strong> to invite a friend.</p>
      </section>`;
  }
  return `${topBar('Group', '', add)}
    <ul class="glist">${shared.map(groupCard).join('')}</ul>
    <p class="group-note">A friend's progress updates when they send it and you open their link. Tap <strong>My progress</strong> so they can see yours.</p>`;
}

function groupCard(h) {
  const id = `data-id="${esc(h.id)}"`;
  const people = [
    { name: state.settings.name || 'You', me: true, day: todayKey(), week: lastWeek(h), streak: currentStreak(h) },
    ...h.friends.map((f) => ({ name: f, ...(h.friendStats[f] || {}) })),
  ];
  return `
    <li class="gcard" style="${habitVars(h)}">
      <button class="g-head" data-action="open" ${id} aria-label="${esc(`Open ${h.name}`)}">
        <span class="hc-icon" aria-hidden="true">${esc(h.icon)}</span>
        <span class="g-title"><b>${esc(h.name)}</b><small>${esc(goalLine(h))}</small></span>
        ${ICON_SVG.right}
      </button>
      <ul class="g-people">${people.map(personRow).join('')}</ul>
      <div class="g-actions">
        <button class="pchip" data-action="remind" ${id}>${ICON_SVG.bell}Remind</button>
        <button class="pchip" data-action="share-progress" ${id}>${ICON_SVG.share}My progress</button>
        <button class="pchip" data-action="share-habit" ${id}>${ICON_SVG.plus}Invite</button>
      </div>
    </li>`;
}

/** A friend's 7 days end on the day they sent them; move them along so the last dot is today. */
function weekToToday(week, day) {
  const gap = Math.round((parseKey(todayKey()) - parseKey(day)) / 864e5);
  return gap <= 0 ? week : (week + '?'.repeat(Math.min(gap, 7))).slice(-7);
}

function personRow(p) {
  const known = Boolean(p.week);
  const week = known ? weekToToday(p.week, p.day) : '???????';
  const gap = known ? Math.round((parseKey(todayKey()) - parseKey(p.day)) / 864e5) : 0;
  const status = !known ? 'Waiting for their first update'
    : week.slice(-1) === '1' ? 'Done today ✅'
      : gap <= 0 ? 'Not done yet today' : `Last update ${gap === 1 ? 'yesterday' : `${gap} days ago`}`;
  const streak = known && p.streak ? ` · 🔥 ${p.streak}` : '';
  const dots = [...week].map((c) => `<i class="${c === '1' ? 'y' : c === '0' ? 'n' : 'x'}"></i>`).join('');
  return `
    <li class="g-person">
      <span class="g-avatar${p.me ? ' me' : ''}" aria-hidden="true">${esc(p.me ? state.settings.avatar : p.name.slice(0, 1).toUpperCase())}</span>
      <span class="g-who"><b>${esc(p.name)}${p.me && state.settings.name ? ' <small>(you)</small>' : ''}</b><small>${esc(status + streak)}</small></span>
      <span class="g-week" role="img" aria-label="${esc(`Last 7 days: ${[...week].filter((c) => c === '1').length} done`)}">${dots}</span>
    </li>`;
}

function openGroupAdd() {
  showSheet(`
    <div class="group-add">
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Group</h2><span class="round-gap" aria-hidden="true"></span></div>
      <div class="group-art small" aria-hidden="true">🤝</div>
      <p class="ga-title">Create or join shared habits</p>
      <button type="button" class="ga-btn pink" data-action="share-pick">${ICON_SVG.people}Share habits with others</button>
      <button type="button" class="ga-btn orange" data-action="join-open">${ICON_SVG.link}Join with a link</button>
    </div>`);
}

function openSharePick() {
  const list = active();
  showSheet(`
    <div class="share-pick">
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Which habit?</h2><span class="round-gap" aria-hidden="true"></span></div>
      ${list.length ? `<ul class="tpl-list">${list.map((h) => `<li><button type="button" class="tpl-row" data-action="share-habit" data-id="${esc(h.id)}"><span class="tpl-emoji" aria-hidden="true">${esc(h.icon)}</span><span class="tpl-name">${esc(h.name)}</span><span class="tpl-goal">${esc(h.friends.join(', '))}</span><span class="tpl-add" aria-hidden="true">${ICON_SVG.right}</span></button></li>`).join('')}</ul>`
        : '<p class="empty-note">Add a habit first, then share it here.</p>'}
    </div>`);
}

function openShareHabit(h) {
  showSheet(`
    <form id="share-form" data-id="${esc(h.id)}" novalidate>
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Build with a friend</h2><span class="round-gap" aria-hidden="true"></span></div>
      <div class="share-card" style="${habitVars(h)}"><span class="hc-icon" aria-hidden="true">${esc(h.icon)}</span><b>${esc(h.name)}</b><small>${esc(goalLine(h))}</small></div>
      <section class="fcard">
        <label class="f-row"><span>Friend's name</span><input type="text" name="friend" maxlength="30" placeholder="(Optional)" autocomplete="off"></label>
        ${state.settings.name ? '' : '<label class="f-row"><span>Your name</span><input type="text" name="me" maxlength="30" placeholder="So they know it’s you" autocomplete="nickname"></label>'}
      </section>
      <p class="f-hint">They get a link in WhatsApp (or any app you pick). Opening it adds this habit for them. Then you can remind each other and see how you're both doing in the Group tab.</p>
      <button type="submit" class="save-btn">Send invite</button>
    </form>`);
}

function openJoin() {
  showSheet(`
    <form id="join-form" novalidate>
      <div class="sheet-head">${closeBtn}<h2 id="sheet-title">Join a shared habit</h2><span class="round-gap" aria-hidden="true"></span></div>
      <section class="fcard"><label class="f-row col"><span>Paste the link your friend sent</span>
        <input type="url" name="link" placeholder="https://…#h=…" autocomplete="off" class="link-in"></label></section>
      ${navigator.clipboard && navigator.clipboard.readText ? '<button type="button" class="ghost-btn" data-action="paste-link">Paste</button>' : ''}
      <p class="form-error" role="alert" hidden></p>
      <button type="submit" class="save-btn">Join</button>
    </form>`);
}

/** The round button on Today: +1, done/undo for once-a-day habits, or start/pause a timer. */
function tick(h) {
  const k = ui.date;
  if (k > todayKey()) return;
  const c = countOf(h, k);
  if (usesTimer(h) && k === todayKey()) {
    if (timers[h.id]) {
      stopTimer(h);
      render();
    } else if (isDone(h, k) && h.type !== 'quit') openCounter(h);
    else {
      startTimer(h);
      openCounter(h);
    }
    return;
  }
  if (periodOf(h) !== 'day' && h.type !== 'quit') {
    if (!isDone(h, k)) {
      setCount(h, k, c + 1);
      render();
      afterChange(h, c, c + 1, k);
    } else if (h.goal === 1 && c > 0) {
      setCount(h, k, c - 1);
      render();
    } else openCounter(h);
    return;
  }
  if (h.type === 'quit') {
    // Quit habits count each slip; open the habit to take one back.
    const next = Math.min(c + 1, MAX_COUNT);
    setCount(h, k, next);
    render();
    afterChange(h, c, next, k);
    return;
  }
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

/* ---------- Location reminders ---------- */

function openPlacePanel() {
  const form = sheet.querySelector('#habit-form');
  let pl = null;
  try {
    pl = cleanPlace(JSON.parse(form.elements.place.value || 'null'));
  } catch (err) {
    pl = null;
  }
  const r = pl ? pl.r : 200;
  const on = pl ? pl.on : 'arrive';
  sheet.insertAdjacentHTML('beforeend', `
    <div class="unit-panel place-panel" ${pl ? `data-lat="${pl.lat}" data-lng="${pl.lng}"` : ''} role="group" aria-label="Choose a location">
      <div class="sheet-head">
        <button type="button" class="round" data-action="unit-close" aria-label="Back to the habit">${ICON_SVG.close}</button>
        <h2>Choose a location</h2><span class="round-gap" aria-hidden="true"></span>
      </div>
      <section class="fcard">
        <label class="f-row"><span>Name</span><input type="text" class="place-name" maxlength="30" value="${esc(pl ? pl.name : '')}" placeholder="Masjid, Home, Gym…" autocomplete="off"></label>
      </section>
      <button type="button" class="ga-btn green place-here" data-action="place-here">📍 Use where I am now</button>
      <p class="place-where f-hint">${pl ? `Saved: ${pl.lat.toFixed(5)}, ${pl.lng.toFixed(5)}` : 'Go to the place (or be there), then tap the button.'}</p>
      <p class="f-label pad">Remind me within</p>
      <div class="len-chips">${[100, 200, 500, 1000].map((m) => `<button type="button" class="pchip" data-action="place-r" data-value="${m}" aria-pressed="${m === r}">${m < 1000 ? `${m} m` : '1 km'}</button>`).join('')}</div>
      <div class="len-chips">${[['arrive', 'Arriving'], ['leave', 'Leaving']].map(([v2, l]) => `<button type="button" class="pchip" data-action="place-on" data-value="${v2}" aria-pressed="${v2 === on}">${l}</button>`).join('')}</div>
      <p class="f-hint">Works while Habit For Me is open: phones don't let web apps check your location when they are closed.</p>
      <button type="button" class="save-btn" data-action="place-save">Confirm</button>
    </div>`);
}

function findMe(btn) {
  const panel = btn.closest('.unit-panel');
  const where = panel.querySelector('.place-where');
  if (!navigator.geolocation) {
    where.textContent = "This browser can't find your location.";
    return;
  }
  where.textContent = 'Finding you…';
  navigator.geolocation.getCurrentPosition((pos) => {
    panel.dataset.lat = pos.coords.latitude;
    panel.dataset.lng = pos.coords.longitude;
    where.textContent = `Found: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (±${Math.round(pos.coords.accuracy)} m)`;
  }, () => {
    where.textContent = 'Location is blocked. Allow it for this site in your phone settings, then try again.';
  }, { enableHighAccuracy: true, timeout: 15000 });
}

/** Metres between two points on Earth. */
function metres(a, b) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

let placeWatch = null;
const inside = {}; // habitId -> true/false at the last reading

/** While the app is open, follow where you are if any habit has a location reminder. */
function watchPlaces() {
  const any = active().some((h) => h.place);
  if (!any || !navigator.geolocation) {
    if (placeWatch !== null) navigator.geolocation.clearWatch(placeWatch);
    placeWatch = null;
    return;
  }
  if (placeWatch !== null) return;
  placeWatch = navigator.geolocation.watchPosition((pos) => checkPlaces({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => {}, { enableHighAccuracy: true, maximumAge: 30000 });
}

function checkPlaces(here) {
  const tk = todayKey();
  for (const h of active()) {
    if (!h.place) continue;
    const now = metres(here, h.place) <= h.place.r;
    const before = inside[h.id];
    inside[h.id] = now;
    const fire = h.place.on === 'arrive' ? now && before !== true : !now && before === true;
    if (fire && isDue(h, new Date()) && !isDone(h, tk) && markSent(`${h.id}@place`)) {
      remind(h, `${h.place.on === 'arrive' ? 'You arrived at' : 'You left'} ${h.place.name}. ${h.remindText || 'Time for this habit.'}`);
    }
  }
}

/** Remembers that a reminder went out today; false if it already did. */
function markSent(id) {
  const tk = todayKey();
  let sent = null;
  try {
    sent = JSON.parse(localStorage.getItem(REMINDED_KEY) || 'null');
  } catch (err) {
    sent = null;
  }
  if (!sent || sent.day !== tk || !Array.isArray(sent.ids)) sent = { day: tk, ids: [] };
  if (sent.ids.includes(id)) return false;
  sent.ids.push(id);
  try {
    localStorage.setItem(REMINDED_KEY, JSON.stringify(sent));
  } catch (err) {
    // Storage blocked: the reminder may repeat, which is harmless.
  }
  return true;
}

/* ---------- Super Alert: an alarm that rings until stopped ---------- */

const alarmBox = document.getElementById('alarm');
let alarmLoop = 0;
let alarmHabit = null;
const SNOOZE_KEY = 'habit-for-me:snooze';

function openAlarm(h, body) {
  alarmHabit = h;
  const now = new Date();
  alarmBox.innerHTML = `
    <div class="alarm-in" style="${habitVars(h)}">
      <p class="alarm-time">${pad(now.getHours())}:${pad(now.getMinutes())}</p>
      <div class="alarm-habit"><span class="hc-icon" aria-hidden="true">${esc(h.icon)}</span><b>${esc(h.name)}</b></div>
      <p class="alarm-msg">${esc(body || h.remindText || 'Time for this habit')}</p>
      <button type="button" class="alarm-later" data-action="alarm-later">Remind later</button>
      <button type="button" class="alarm-stop" data-action="alarm-stop">Stop</button>
    </div>`;
  if (!alarmBox.open) alarmBox.showModal();
  clearInterval(alarmLoop);
  ring(h.ringtone);
  if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
  alarmLoop = setInterval(() => {
    ring(h.ringtone);
    if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
  }, 2500);
}

function stopAlarm() {
  clearInterval(alarmLoop);
  if (navigator.vibrate) navigator.vibrate(0);
  if (alarmBox.open) alarmBox.close();
}
alarmBox.addEventListener('close', () => clearInterval(alarmLoop));

/** Remind later: ring again in 10 minutes. */
function snooze(h) {
  if (!h) return;
  let list = {};
  try {
    list = JSON.parse(localStorage.getItem(SNOOZE_KEY) || '{}') || {};
  } catch (err) {
    list = {};
  }
  list[h.id] = Date.now() + 10 * 60 * 1000;
  try {
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(list));
  } catch (err) {
    // Storage blocked: no second ring.
  }
}

function checkSnoozes() {
  let list = {};
  try {
    list = JSON.parse(localStorage.getItem(SNOOZE_KEY) || '{}') || {};
  } catch (err) {
    return;
  }
  let changed = false;
  for (const [id, at] of Object.entries(list)) {
    if (Date.now() < at) continue;
    delete list[id];
    changed = true;
    const h = findHabit(id);
    if (h && !isDone(h, todayKey())) remind(h);
  }
  if (changed) {
    try {
      localStorage.setItem(SNOOZE_KEY, JSON.stringify(list));
    } catch (err) {
      // ignore
    }
  }
}

/** Complete all: tick off many habits for the day in one go. */
function openCompleteAll() {
  const k = ui.date;
  const list = active().filter(matchesFilter).filter((h) => isDue(h, parseKey(k)) && h.type !== 'quit' && !isDone(h, k));
  showSheet(`
    <form id="all-form" novalidate>
      <div class="all-head">
        <button type="button" class="link-btn sm" data-action="all-toggle">Deselect all</button>
        <h2 id="sheet-title">Complete all</h2>
        <button type="button" class="link-btn sm" data-action="close-sheet">Cancel</button>
      </div>
      <ul class="all-list">${list.map((h) => `
        <li><label class="all-row" style="${habitVars(h)}"><input type="checkbox" name="ids" value="${esc(h.id)}" checked>
          <span class="all-box" aria-hidden="true">${ICON_SVG.tick}</span><span class="all-name"><span aria-hidden="true">${esc(h.icon)}</span> ${esc(h.name)}</span>
          <span class="all-amount">${fmtAmount(h, periodCount(h, k))}/${fmtAmount(h, h.goal)}</span></label></li>`).join('')}
      </ul>
      <button type="submit" class="save-btn">Complete all</button>
    </form>`);
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
  const until = h.endDate ? `;UNTIL=${h.endDate.replace(/-/g, '')}T235959` : '';
  const events = h.reminders.flatMap((t) => {
    const [hh, mm] = t.split(':');
    return [
      'BEGIN:VEVENT',
      `UID:${h.id}-${hh}${mm}@habit-for-me`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${keyOf(first).replace(/-/g, '')}T${hh}${mm}00`,
      'DURATION:PT15M',
      `RRULE:${h.days.length === 7 ? 'FREQ=DAILY' : `FREQ=WEEKLY;BYDAY=${h.days.map((d) => codes[d]).join(',')}`}${until}`,
      `SUMMARY:${text(`${h.icon} ${h.name}`)}`,
      `DESCRIPTION:${text(h.remindText || 'A reminder from Habit For Me')}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${text(h.remindText || h.name)}`, 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT',
    ];
  });
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Habit For Me//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR'];
  const slug = h.name.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'habit';
  downloadFile(`${lines.map(fold).join('\r\n')}\r\n`, 'text/calendar', `${slug}-reminder.ics`);
  toast(`Calendar file downloaded. Open it to add ${h.reminders.length > 1 ? 'the reminders' : 'the reminder'}.`);
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
        openTemplates(); // the pink + on Today: ready-made habits first
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
      openTemplates();
      break;
    case 'tpl-tab':
      openTemplates(Number(value));
      break;
    case 'tpl-pick': {
      const [icon, name, goal, unit, more = {}] = TEMPLATE_TABS[ui.tplTab][2][Number(value)];
      const colors = PALETTES[0][1];
      openSheet(null, { icon, name, goal, unit, type: more.type, days: more.days, color: colors[(ui.tplTab * 5 + Number(value)) % colors.length] });
      break;
    }
    case 'reminder-type':
      sheet.insertAdjacentHTML('beforeend', `
        <div class="mini-panel" role="group" aria-label="Reminder type">
          <div class="mini-card">
            <div class="mini-head"><button type="button" class="round" data-action="mini-close" aria-label="Close">${ICON_SVG.close}</button><b>Reminder type</b><span class="round-gap"></span></div>
            <div class="mini-btns"><button type="button" class="ga-btn green" data-action="add-time">Time</button><button type="button" class="ga-btn green" data-action="place-open">Location</button></div>
          </div>
        </div>`);
      break;
    case 'mini-close':
      el.closest('.mini-panel').remove();
      break;
    case 'super-info':
      sheet.insertAdjacentHTML('beforeend', `
        <div class="mini-panel" role="group" aria-label="Super Alert">
          <div class="mini-card">
            <div class="alarm-art" aria-hidden="true">⏰</div>
            <h3>Super Alert</h3>
            <p>An alarm-style reminder: the whole screen shows the habit and the ringtone keeps ringing until you tap <strong>Stop</strong> or <strong>Remind later</strong>.</p>
            <p class="f-hint">A web app can't ring through Silent mode or when it is fully closed. Keep Habit For Me open (it can be in the background), or use <strong>Add reminder to calendar</strong> for an alarm from your calendar.</p>
            <button type="button" class="save-btn" data-action="mini-close">Confirm</button>
          </div>
        </div>`);
      break;
    case 'place-open':
      sheet.querySelectorAll('.mini-panel').forEach((x) => x.remove());
      openPlacePanel();
      break;
    case 'place-here':
      findMe(el);
      break;
    case 'place-r':
    case 'place-on':
      el.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
      break;
    case 'place-save': {
      const panel = el.closest('.unit-panel');
      const pl = cleanPlace({
        name: panel.querySelector('.place-name').value,
        lat: panel.dataset.lat, lng: panel.dataset.lng,
        r: panel.querySelector('[data-action="place-r"][aria-pressed="true"]').dataset.value,
        on: panel.querySelector('[data-action="place-on"][aria-pressed="true"]').dataset.value,
      });
      if (!pl) {
        toast('Tap “Use where I am now” first');
        break;
      }
      const form = sheet.querySelector('#habit-form');
      form.elements.place.value = JSON.stringify(pl);
      const box = form.querySelector('.rem-times');
      const old = box.querySelector('.place-chip');
      if (old) old.remove();
      box.insertAdjacentHTML('beforeend', placeChip(pl));
      panel.remove();
      break;
    }
    case 'place-remove': {
      const form = sheet.querySelector('#habit-form');
      form.elements.place.value = '';
      el.closest('.place-chip').remove();
      break;
    }
    case 'alarm-stop':
      stopAlarm();
      break;
    case 'alarm-later':
      snooze(alarmHabit);
      stopAlarm();
      toast('I will remind you again in 10 minutes');
      break;
    case 'add-time': {
      sheet.querySelectorAll('.mini-panel').forEach((x) => x.remove());
      const box = sheet.querySelector('.rem-times');
      if (box.children.length < 5) box.insertAdjacentHTML('beforeend', remTimeHtml('12:00'));
      else toast('Up to 5 times');
      break;
    }
    case 'remove-time': {
      const box = el.closest('.rem-times');
      el.closest('.rem-chip').remove();
      break;
    }
    case 'complete-all':
      openCompleteAll();
      break;
    case 'all-toggle': {
      const boxes = [...sheet.querySelectorAll('#all-form input[name="ids"]')];
      const on = !boxes.every((b) => b.checked);
      boxes.forEach((b) => { b.checked = on; });
      el.textContent = on ? 'Deselect all' : 'Select all';
      break;
    }
    case 'tpl-custom':
      openSheet(null);
      break;
    case 'timer':
      if (!h) break;
      if (timers[h.id]) stopTimer(h);
      else startTimer(h);
      render();
      break;
    case 'style':
      ui.countView = !ui.countView;
      render();
      break;
    case 'countdown':
      if (h) openCountdown(h);
      break;
    case 'count-dir':
      ui.countUp = value === 'up';
      render();
      if (findHabit(ui.detail)) openCountdown(findHabit(ui.detail));
      break;
    case 'timer-length':
      if (!h) break;
      setTimerLength(h, Number(value));
      render();
      openCountdown(h);
      break;
    case 'sound':
      openSoundSheet('focus');
      break;
    case 'sound-tab':
      openSoundSheet(value);
      break;
    case 'pick-sound': {
      const [tab, sid] = value.split(':');
      if (tab === 'focus') {
        state.settings.focusSound = sid;
        save();
        // Let it be heard: switch the sound if a timer is on, or play it for a few seconds.
        startFocusSound(sid);
        if (sid === 'tick') tickSound();
        clearTimeout(previewTimer);
        if (!Object.keys(timers).length) previewTimer = setTimeout(stopFocusSound, 3000);
      } else {
        state.settings.endSound = sid;
        save();
        endSound(sid);
      }
      openSoundSheet(tab);
      break;
    }
    case 'group-add':
      openGroupAdd();
      break;
    case 'share-pick':
      openSharePick();
      break;
    case 'share-habit':
      if (!h) break;
      ui.menu = null;
      render();
      openShareHabit(h);
      break;
    case 'join-open':
      openJoin();
      break;
    case 'paste-link':
      navigator.clipboard.readText().then((text) => {
        const input = sheet.querySelector('#join-form input[name="link"]');
        if (input) input.value = text.trim();
      }).catch(() => toast('Press and hold the box, then choose Paste'));
      break;
    case 'join-yes': {
      const d = pendingJoin;
      if (!d) break;
      const me = sheet.querySelector('#join-me');
      if (me && me.value.trim()) state.settings.name = cleanText(me.value, 30);
      const from = cleanText(d.f, 30) || 'Your friend';
      const days = [...new Set(String(d.d || '').split('').map(Number))].filter((x) => x >= 0 && x <= 6).sort();
      const quit = d.t === 'q';
      const joined = {
        id: newId(), createdAt: todayKey(), archived: false, name: cleanText(d.n, 60), desc: '',
        icon: cleanText(d.i, 8) || '✅', color: /^#[0-9a-f]{6}$/i.test(d.c) ? d.c.toLowerCase() : NEW_COLORS[0],
        type: quit ? 'quit' : 'build', goal: clampInt(d.g, quit ? 0 : 1, MAX_COUNT, 1), unit: cleanText(d.u, 12),
        days: days.length ? days : ALL_DAYS.slice(), time: 'any', group: '', reminder: '', memo: false,
        shareId: cleanText(d.s, 40), friends: [], friendStats: {},
      };
      keepFriendProgress(joined, from, d);
      state.habits.push(joined);
      pendingJoin = null;
      save();
      sheet.close();
      Object.assign(ui, { tab: 'group', detail: null, stat: false, menu: null });
      render();
      toast(`${joined.icon} ${joined.name} added. Tap My progress so ${from} can see yours.`);
      break;
    }
    case 'remind':
      if (h) sendRemind(h);
      break;
    case 'share-progress':
      if (h) sendProgress(h);
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
    case 'sub-one': {
      if (!h) break;
      const before = countOf(h, ui.date);
      if (before < 1) break;
      setCount(h, ui.date, before - 1);
      render();
      afterChange(h, before, before - 1, ui.date);
      break;
    }
    case 'reset-day':
      if (!h) break;
      ask(`Do you want to reset this habit for ${ui.date === todayKey() ? 'today' : 'this day'}?`, () => {
        cancelTimer(h);
        setCount(h, ui.date, 0);
        render();
      });
      break;
    case 'set-sound':
      state.settings.sound = el.checked;
      save();
      chime(); // a sample, when turned on
      break;
    case 'set-celebrate':
      state.settings.celebrate = el.checked;
      save();
      break;
    case 'complete': {
      if (!h || ui.date > todayKey()) break;
      const before = countOf(h, ui.date);
      if (before >= h.goal && h.goal > 1) {
        openKeypad(h);
        break;
      }
      const total = periodCount(h, ui.date);
      // Done: undo today's part. Not done: add what the day (or the period) still needs.
      const after = total >= h.goal ? 0 : before + h.goal - total;
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
      input.value = clampInt(Number(input.value) + Number(el.dataset.delta), isQuitForm(form) ? 0 : 1, MAX_COUNT, 1);
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
      list.innerHTML = unitListHtml(Number(value), '', unitChoice(sheet.querySelector('#habit-form')));
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
      form.elements.unit.dataset.item = el.dataset.name;
      form.querySelector('.unit-val').textContent = unit || 'count';
      // Picking "Steps" or "Water" for a habit with no name yet also gives it that name.
      const itemName = el.dataset.name;
      if (itemName && !form.elements.name.value.trim()) form.elements.name.value = itemName;
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
    for (const t of h.reminders) {
      const id = `${h.id}@${t}`;
      if (sent.ids.includes(id)) continue;
      const [hh, mm] = t.split(':').map(Number);
      const late = mins - (hh * 60 + mm);
      if (late < 0 || late > 60) continue; // only in the hour after the reminder time
      sent.ids.push(id);
      changed = true;
      if (isDue(h, now) && !isDone(h, tk)) remind(h);
    }
  }
  if (changed) {
    try {
      localStorage.setItem(REMINDED_KEY, JSON.stringify(sent));
    } catch (err) {
      // Storage blocked: the reminder may repeat, which is harmless.
    }
  }
}

function remind(h, body) {
  const title = `${h.icon} ${h.name}`;
  const options = { body: body || h.remindText || 'Time for this habit. Tap to open Habit For Me.', icon: 'icons/icon-192.png', tag: `habit-${h.id}`, requireInteraction: h.superAlert, vibrate: h.superAlert ? [400, 200, 400, 200, 400] : undefined };
  if (h.superAlert && !document.hidden) {
    openAlarm(h, body);
    return;
  }
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
  if (h.superAlert) pendingAlarm = { h, body }; // rings as soon as the app is opened again
  else if (!document.hidden) toast(`⏰ Time for ${h.name}`);
}
let pendingAlarm = null;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (pendingAlarm) {
    openAlarm(pendingAlarm.h, pendingAlarm.body);
    pendingAlarm = null;
  }
  checkSnoozes();
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
checkLink();
watchPlaces();
setInterval(checkSnoozes, 30 * 1000);
