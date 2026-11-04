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
- [x] Fits every screen: phones, tablets and iPads, and laptops
- [ ] Sign in with Google or a code by text message, and keep the same habits on every device
  (built and switched off: it needs a free Firebase project, see [docs/sign-in-setup.md](docs/sign-in-setup.md))
- [x] Dark look by default, a sun/moon button on Today to switch to light, and Auto in Me → Settings
- [x] Works offline and installs on your phone's home screen like an app
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

### Put it online for free (GitHub Pages)

1. On GitHub, open this repo, then **Settings → Pages**.
2. Under **Build and deployment**, pick **Deploy from a branch**, choose **main** and **/ (root)**, then **Save**.
3. After a minute or two the app is live at **https://aliiherzi.github.io/Habit-For-Me/**

> On a free GitHub account, Pages only works for **public** repos. Making the repo
> public shows the code only. Your habit data never leaves your device.

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
| `cloud.js` | Sign-in (Google or phone code) and syncing between devices, using Firebase |
| `firebase-config.js` | Your Firebase project's settings (empty until sign-in is set up) |
| `sw.js` | Service worker that makes the app work offline |
| `manifest.webmanifest` | App name and icons, so phones can install it |
| `icons/` | App icons in different sizes |

Data is saved in the browser's `localStorage` on each device. Use **Me → Download a backup**
to keep a copy or move your habits to another device.

## Project notes

- [`CLAUDE.md`](CLAUDE.md): project instructions Claude Code reads automatically each session
- [`docs/claude-credit-guide.md`](docs/claude-credit-guide.md): how to use the $100 Claude credit
- [`docs/where-to-store-info.md`](docs/where-to-store-info.md): where to keep project information
