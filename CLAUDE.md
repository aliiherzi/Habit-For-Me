# CLAUDE.md

Instructions for Claude Code when working in this repository.

## About the project

**Habit For Me** is a personal habit tracker: add habits, check them off daily,
and see streaks and progress. See `README.md` for the feature list.

## Status

Version 1 is built and working.

## Decisions (answered by the owner)

1. **Web and mobile.** Built as a Progressive Web App (PWA): one app that runs in any
   browser and installs on iPhone, Android and Mac home screens/docks.
2. **Tech:** plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
3. **Data:** saved on the device in `localStorage`. Backups are JSON files (Settings →
   Download a backup / Restore). No accounts or server.
4. **Hosting:** GitHub Pages from the `main` branch root.
5. The owner liked a Habit Tracker app on the App Store. Use it for **feature ideas
   only**; keep this app's own original design, name and icon.

## Code map

- `index.html`: page shell (tab bar, sheet dialog, toast)
- `app.js`: all logic, in numbered sections: constants, date helpers, saving/loading,
  habit maths (streaks, rates), screens (Today, Details, Progress, Settings),
  add/edit sheet, actions (one delegated click handler using `data-action`)
- `styles.css`: colour tokens on `:root`, dark mode via `prefers-color-scheme`
  and `[data-theme]`
- `sw.js`: network-first offline cache. **Bump `CACHE` and update `FILES`** when adding,
  renaming or removing files.
- Data shape: `{ version, habits: [{ id, name, icon, color, goal, days: [0-6], createdAt }],
  log: { habitId: { "YYYY-MM-DD": count } }, settings: { theme, weekStart } }`.
  Keep `normalize()` able to read older data so people's habits are never lost.

## Working rules

- **Keep costs low.** The owner is using a $100 Claude credit
  (see `docs/claude-credit-guide.md`). Prefer clear, focused tasks; avoid
  unnecessary parallel agents or max-effort settings.
- Start simple: build the smallest working version first, then add features.
- Explain changes in plain, simple language; the owner is learning.
- Never commit secrets (API keys, passwords, tokens). Use a `.env` file,
  which is listed in `.gitignore`.
- Before pushing UI changes, check the app at phone width (320-430px), in light
  and dark mode, with no sideways scrolling and no console errors.
- Keep `README.md` checklists up to date as features are finished.

## Next steps

- Turn on GitHub Pages (needs the repo to be public on a free GitHub plan).
- Pick the next feature from "Ideas for later" in `README.md`.
