# Habit For Me

A simple, free habit tracker that works on **iPhone, Android, Mac and PC**.
Check off your habits every day, build streaks, and see your progress.

> Status: **version 3 works**, with the dark iPhone look. No account, no ads. Your data stays on your device.

## Features

- [x] Add habits with an icon, a colour, a short description and the days they repeat on
- [x] Habits you do many times a day (e.g. "8 glasses of water" or "500 times"), with a keypad for big numbers
- [x] Today screen: a row of days with rings that fill as you go, and habit cards tinted with each habit's colour
- [x] Groups and time of day (morning, afternoon, evening), with the pink **All** button to show only those
- [x] A counter page for each habit (big ring, **Add**, check button) and a **Stat** page: calendar,
  yearly status, streaks, totals, averages, monthly rate, memos, and Trending and Comparison charts
- [x] Memos: write how a habit went each day, with an emoji (it can pop up when you finish)
- [x] Stats: month calendar with progress rings, the whole year at a glance, monthly or yearly rate,
  best streak, perfect days, habits done and daily average, for all habits or one
- [x] Mood and a note for each day (the face at the top of Today; the week's moods on Me)
- [x] Reminders: pick a time for a habit and get a notification while the app is open, or use
  **Add reminder to calendar** so your calendar app reminds you even when the app is closed
- [x] Archive a habit instead of deleting it
- [x] Me page: your name and picture, moods, a daily quote, settings and backups
- [x] Unit picker like the Habit Tracker app, with the habits most people track: Popular, Activity,
  Body Measurements, Nutrition Intake, Workout, Mind & Sleep, Study & Work, Faith, Self-care,
  Home & Money, Family & Friends and Other. Each item has its measurements; search, or type your own unit
- [x] The week starts on Saturday (or Sunday or Monday, in Me → Settings)
- [x] A chime when you finish a habit, and confetti with “WELL DONE!! YOU DID IT!!” when everything
  for today is done (turn either off in Me → Settings; “Don't show again” also turns the confetti off)
- [x] Finished days get a pink ring with ✨ (Today and Stats); finished habits get a green badge and a 🔥 streak
- [x] On a habit's page: − inside the ring, and ↺ to reset the day (it asks first)
- [x] New Habit page: ready-made habits in tabs (Popular, Faith, Health, Sports, Lifestyle, Time, Quit),
  or **Custom Habit** for your own
- [x] Build or Quit habits: a Quit habit has a limit (“Don't exceed 5 cigarettes each day”) and counts as
  done while you stay under it
- [x] Timer for habits counted in minutes or hours: start/pause, ↺ to reset the day's time, Countdown to
  pick the length (5m to 2h) and count down or up, another full round with ▶ once the goal is done,
  focus sounds (Tick, Rain, Waves, Fire, Soft noise) and an end sound (Bell, Chime)
- [x] Group tab: share a habit with friends by link (WhatsApp or any app), remind each other, and see how
  each friend is doing (last 7 days and streak). Without a server, a friend's progress updates when they
  send it and you open their link
- [x] Fits every screen: phones, tablets and iPads, and laptops
- [x] Dark look by default, a sun/moon button on Today to switch to light, and Auto in Me → Settings
- [x] Works offline and installs on your phone's home screen like an app
- [x] Seedling logo 🌱 on a black background (home screen and browser tab)
- [x] Goal period: a goal per day, per week, per month, or every few days (e.g. Gym 3 times a week)
- [x] Habit term: a start date and an optional end date
- [x] Several reminder times for one habit, and your own reminder message
- [x] Complete all: tick off many of the day's habits at once
- [x] Backup and restore (download your data as a file, load it on another device)

## Look and feel

The design follows the **Habit Tracker** app on iPhone in dark mode: a black page with dark grey cards,
a pink accent, habit cards tinted with each habit's own colour, and a floating menu at the bottom.
Habit For Me keeps its own name, icon and artwork.

## Ideas for later

- "Quit" habits that count the days you avoided something
- Notifications even when the app is closed (needs a push server)
- Reorder habits by dragging
- Home screen widgets (needs a native app)
- Sync between devices (needs accounts and a server)
- A native App Store / Google Play app (Apple charges $99 a year for a developer account)

## Use it

### Open it

The app is live at **https://aliiherzi.github.io/Habit-For-Me/** (free GitHub Pages).
It is published from the `gh-pages` branch, a copy of `main`. After changing `main`, publish with:

```bash
git push origin main:gh-pages
```

The code is public; your habit data never leaves your device.

### Install it like an app

- **iPhone / iPad:** open the link in **Safari**, tap **Share**, then **Add to Home Screen**.
- **Android:** open it in **Chrome**, tap **⋮**, then **Install app** (or **Add to Home screen**).
- **Mac:** in **Safari**, choose **File → Add to Dock**. In **Chrome**, click the install icon at the right end of the address bar.

### Try it on your own computer

Run this in the project folder, then open http://localhost:8000:

```bash
python3 -m http.server 8000
```

## How it's built

Plain **HTML, CSS and JavaScript**. There are no frameworks and nothing to install or build.

| File | What it does |
|------|--------------|
| `index.html` | The page itself: loads everything and holds the floating menu |
| `styles.css` | All the colours and layout, including dark mode and bigger screens |
| `app.js` | The app: screens, streak maths, saving data |
| `sw.js` | Service worker that makes the app work offline |
| `manifest.webmanifest` | App name and icons, so phones can install it |
| `icons/` | App icons in different sizes |

Data is saved in the browser's `localStorage` on each device. Use **Me → Download a backup**
to keep a copy or move your habits to another device.

## Project notes

- [`CLAUDE.md`](CLAUDE.md): project instructions Claude Code reads automatically each session
- [`docs/claude-credit-guide.md`](docs/claude-credit-guide.md): how to use the $100 Claude credit
- [`docs/where-to-store-info.md`](docs/where-to-store-info.md): where to keep project information
