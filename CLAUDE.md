# CLAUDE.md

Instructions for Claude Code when working in this repository.

## About the project

**Habit For Me** is a personal habit tracker: add habits, check them off daily,
and see streaks and progress. See `README.md` for the feature list.

## Status

Version 2 is built and working: same features as version 1, with a new look that follows
the Habit Tracker app, a new All habits screen, and Weekly / Monthly / Yearly stats.
Also: reminders, and a mood and note for each day.

## Decisions (answered by the owner)

1. **Web and mobile.** Built as a Progressive Web App (PWA): one app that runs in any
   browser and installs on iPhone, Android and Mac home screens/docks.
2. **Tech:** plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
3. **Data:** saved on the device in `localStorage`. Backups are JSON files (Settings →
   Download a backup / Restore). No accounts or server.
4. **Hosting:** GitHub Pages from the `main` branch root.
5. **Look:** the owner wants Habit For Me to look like the **Habit Tracker** app by Davetech
   (App Store), which they use on their Mac. Follow its layout, colours, screens and menu.
   Keep our own name, icon and artwork: no copied images, logos or premium/paywall screens.
   The owner's screen recording of it is in their Google Drive
   ("Screen Recording 2026-11-04 at 20.03.00.mov", 368 MB, too big for the Drive connector).
6. **Screens:** it must fit phones, tablets/iPads and laptops.

## Code map

- `index.html`: page shell (floating tab bar: Today, All habits, Stats, Me; sheet dialog; toast)
- `app.js`: all logic, in numbered sections: constants, date helpers, saving/loading,
  habit maths (streaks, rates), screens (Today, All habits, Details, Stats, Me),
  add/edit sheet, actions (one delegated click handler using `data-action`)
- `styles.css`: colour tokens on `:root`, dark mode via `prefers-color-scheme`
  and `[data-theme]`. Bigger screens at 640px (tablet), 768px and 1024px (iPad landscape, laptop).
- `sw.js`: network-first offline cache. **Bump `CACHE` and update `FILES`** when adding,
  renaming or removing files.
- Data shape: `{ version, habits: [{ id, name, icon, color, goal, days: [0-6], createdAt, reminder: "HH:MM" or "" }],
  log: { habitId: { "YYYY-MM-DD": count } }, journal: { "YYYY-MM-DD": { mood: 1-5, note } },
  settings: { theme, weekStart } }`.
  Keep `normalize()` able to read older data so people's habits are never lost.

## Reminders (how they work)

- A web app can't send notifications while it's closed without a push server, and we have no
  server (decision 3). So reminders work in two ways:
  1. While the app is open (even in the background), `checkReminders()` runs every 30 seconds and
     sends a notification once per habit per day, within an hour after its time, if the habit is
     due and not done. Sent reminders are remembered in localStorage under `habit-for-me:reminded`.
  2. **Add to calendar** on a habit's page downloads an `.ics` file with a repeating event and an
     alert, so the phone's calendar reminds the owner even when the app is closed.
- iPhone: notifications only work after the app is added to the Home Screen (iOS 16.4+).

## Look and feel (from the Habit Tracker app)

- Pink accent `--accent` (#db3360, #ff6b8a in dark mode), light grey page, white rounded cards.
- Today: centred title with a pink round **+** on the right, a scrolling row of dates
  (dashed circles, filled pink when the day is complete), and habit bars that fill with the
  habit's colour (`--p` = progress) with a white round check button on the right.
- Floating pill-shaped menu at the bottom with icon-only tabs.
- Stats: Weekly / Monthly / Yearly tabs, a script title with sun and moon, a yellow date pill,
  coloured squares, "perfect" badges and coloured numbers.
- Me: pink gradient at the top, white cards for This week, Settings, Your data.
- Add/edit: grouped white cards on a lavender-grey sheet, pink pill buttons.

## Working rules

- **Keep costs low.** The owner is using a $100 Claude credit
  (see `docs/claude-credit-guide.md`). Prefer clear, focused tasks; avoid
  unnecessary parallel agents or max-effort settings.
- Start simple: build the smallest working version first, then add features.
- Explain changes in plain, simple language; the owner is learning.
- Never commit secrets (API keys, passwords, tokens). Use a `.env` file,
  which is listed in `.gitignore`.
- Before pushing UI changes, check the app at phone (320-430px), tablet (768-1024px) and
  laptop (1280px+) widths, in light and dark mode, with no sideways scrolling and no console errors.
- Keep `README.md` checklists up to date as features are finished.

## Next steps

- Turn on GitHub Pages (needs the repo to be public on a free GitHub plan).
- Pick the next feature from "Ideas for later" in `README.md`. Features the Habit Tracker app
  has that we don't yet: habit groups, widgets.
