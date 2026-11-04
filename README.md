# Habit For Me

A simple, free habit tracker that works on **iPhone, Android, Mac and PC**.
Check off your habits every day, build streaks, and see your progress.

> Status: **version 1 works.** No account, no ads. Your data stays on your device.

## Features

- [x] Add habits with an icon, a colour and the days they repeat on
- [x] Habits you do several times a day (e.g. "8 glasses of water")
- [x] Check off habits each day, and go back to fill in earlier days
- [x] Streaks: current streak and best streak for every habit
- [x] A calendar for each habit; tap a day to mark it done or not done
- [x] Progress screen: last 7 days, a 12-week heatmap, and a 30-day score per habit
- [x] Light and dark mode
- [x] Works offline and installs on your phone's home screen like an app
- [x] Backup and restore (download your data as a file, load it on another device)

## Ideas for later

- Reminders / notifications
- Reorder habits by dragging
- Archive a habit instead of deleting it
- Notes for each day
- Sync between devices (needs accounts and a server)
- A native App Store / Google Play app (Apple charges $99 a year for a developer account)

## Use it

### Put it online for free (GitHub Pages)

1. On GitHub, open this repo, then **Settings → Pages**.
2. Under **Build and deployment**, pick **Deploy from a branch**, choose **main** and **/ (root)**, then **Save**.
3. After a minute or two the app is live at **https://aliiherzi.github.io/habit-for-me/**

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
| `index.html` | The page itself: loads everything and holds the tab bar |
| `styles.css` | All the colours and layout, including dark mode |
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
