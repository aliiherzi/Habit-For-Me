# Habit For Me

A simple, free habit tracker that works on **iPhone, Android, Mac and PC**.
Check off your habits every day, build streaks, and see your progress.

> Status: **version 2 works**, with a new look. No account, no ads. Your data stays on your device.

## Features

- [x] Add habits with an icon, a colour and the days they repeat on
- [x] Habits you do several times a day (e.g. "8 glasses of water")
- [x] Today screen: a row of dates to jump to any recent day, and habit bars that fill up with colour as you go
- [x] Streaks: current streak and best streak for every habit
- [x] All habits list, and a details page with a calendar for each habit (tap a day to mark it done or not done)
- [x] Stats: Weekly, Monthly and Yearly reports, with "perfect" badges and totals
- [x] Mood and a note for each day (shown in Weekly stats, and recent notes on the Me page)
- [x] Reminders: pick a time for a habit and get a notification while the app is open, or use
  **Add to calendar** so your calendar app reminds you even when the app is closed
- [x] Me page: this week at a glance, settings, and backups
- [x] Fits every screen: phones, tablets and iPads, and laptops
- [x] Light and dark mode
- [x] Works offline and installs on your phone's home screen like an app
- [x] Backup and restore (download your data as a file, load it on another device)

## Look and feel

The design follows the **Habit Tracker** app the owner likes: a pink accent colour, a row of dates
at the top, coloured habit bars, a floating menu at the bottom, and Weekly / Monthly / Yearly reports.
Habit For Me keeps its own name, icon and artwork.

## Ideas for later

- Habit groups (e.g. Morning, Evening)
- Notifications even when the app is closed (needs a push server)
- Reorder habits by dragging
- Archive a habit instead of deleting it
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
| `sw.js` | Service worker that makes the app work offline |
| `manifest.webmanifest` | App name and icons, so phones can install it |
| `icons/` | App icons in different sizes |

Data is saved in the browser's `localStorage` on each device. Use **Settings → Download a backup**
to keep a copy or move your habits to another device.

## Project notes

- [`CLAUDE.md`](CLAUDE.md): project instructions Claude Code reads automatically each session
- [`docs/claude-credit-guide.md`](docs/claude-credit-guide.md): how to use the $100 Claude credit
- [`docs/where-to-store-info.md`](docs/where-to-store-info.md): where to keep project information
