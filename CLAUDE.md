# CLAUDE.md

Instructions for Claude Code when working in this repository.

## About the project

**Habit For Me** is a personal habit tracker: add habits, check them off daily,
and see streaks and progress. See `README.md` for the feature list.

## Status

Version 3 is built and working: the dark iPhone look of the Habit Tracker app, made from the owner's
28 screenshots. New in v3: a description, unit, group and time of day for each habit, counts up to 999,
a counter page and a Stat page for each habit, memos per habit, archive, and a new Stats screen.
Still there from v2: reminders, and a mood and note for each day.

## Decisions (answered by the owner)

1. **Web and mobile.** Built as a Progressive Web App (PWA): one app that runs in any
   browser and installs on iPhone, Android and Mac home screens/docks.
2. **Tech:** plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
3. **Data:** saved on the device in `localStorage`. Backups are JSON files (Settings →
   Download a backup / Restore). No accounts or server.
4. **Hosting:** GitHub Pages, live at https://aliiherzi.github.io/Habit-For-Me/ . It publishes the
   `gh-pages` branch, a copy of `main`: after pushing `main`, also run `git push origin main:gh-pages`.
   The repo is public (code only; habits stay on each device). This cloud session can't change repo
   settings (visibility, Pages), but pushing `gh-pages` is enough to publish.
5. **Look:** the owner wants Habit For Me to look like the **Habit Tracker** app by Davetech
   (App Store), which they use on their Mac. Follow its layout, colours, screens and menu.
   Keep our own name, icon and artwork: no copied images, logos or premium/paywall screens.
   The owner's screen recording of it is in their Google Drive
   ("Screen Recording 2026-11-04 at 20.03.00.mov", 368 MB, too big for the Drive connector).
   They also shared 28 iPhone screenshots (Drive folder "whatsapp unknown"), which v3 follows.
   Dark mode is the default; Light and Auto stay in Me → Settings.
6. **Screens:** it must fit phones, tablets/iPads and laptops.

## Code map

- `index.html`: page shell (floating tab bar: Today, Stats, Group, All habits, Me; sheet, party and ask dialogs; toast).
  On Today, the Today tab turns into a pink **+** that adds a habit.
- `app.js`: all logic, in numbered sections: constants, date helpers, saving/loading,
  habit maths (streaks, rates, `periodStats`), screens (Today, Stats, All habits, Me, a habit's
  counter page and Stat page), sheets (add/edit, memo, mood and note, keypad, tips, profile),
  actions (one delegated click handler using `data-action`), reminders.
  Don't name a global function `top`, `name` or `status`: the browser already uses those names.
- `styles.css`: colour tokens on `:root` (light), dark tokens under `prefers-color-scheme` and
  `[data-theme="dark"]`. Bigger screens at 640px (tablet) and 900px (iPad landscape, laptop).
- `icons/`: our own seedling logo (two green leaves on a curved stem, black background), drawn in
  `icon.svg` (rounded, for browser tabs). The PNGs are made from the same drawing on a square black
  background: 180 (iPhone), 192 and 512, and maskable 512 with the drawing at 80% size. Phones keep an
  old icon until the app is added to the home screen again.
- `sw.js`: network-first offline cache. **Bump `CACHE` and update `FILES`** when adding,
  renaming or removing files.
- Data shape (version 4; v4 only changed the default week start to Saturday): `{ version, habits: [{ id, name, desc, icon, color, goal (1-999), unit,
  days: [0-6], time: any|morning|afternoon|evening, group, reminder: "HH:MM" or "", memo, archived,
  createdAt, type: build|quit (quit: goal is a limit, 0-999, done while count <= goal),
  shareId, friends: [names], friendStats: { name: { day, week: "1101-01", streak, at } } }], log: { habitId: { "YYYY-MM-DD": count } }, memos: { habitId: { "YYYY-MM-DD": { text, emoji } } },
  journal: { "YYYY-MM-DD": { mood: 1-5, note } }, settings: { theme: dark|light|system, weekStart: 6 Sat | 0 Sun | 1 Mon, name, avatar, sound, celebrate, focusSound, endSound } }`
  (sound and celebrate are true unless turned off). Counts of habits in `min`/`hr` can have up to
  4 decimals (the timer adds parts of a minute). Running timers live apart, in localStorage
  `habit-for-me:timers` ({ habitId: { key, start, from } }), so they keep going if the app closes.
  The owner's family is Muslim and their week starts on Saturday, so that is the default.
  Keep `normalize()` able to read older data so people's habits are never lost.

## Reminders (how they work)

- A web app can't send notifications while it's closed without a push server, and we have no
  server (decision 3). So reminders work in two ways:
  1. While the app is open (even in the background), `checkReminders()` runs every 30 seconds and
     sends a notification once per habit per day, within an hour after its time, if the habit is
     due and not done. Sent reminders are remembered in localStorage under `habit-for-me:reminded`.
  2. **Add reminder to calendar** in a habit's ••• menu downloads an `.ics` file with a repeating
     event and an alert, so the phone's calendar reminds the owner even when the app is closed.
- iPhone: notifications only work after the app is added to the Home Screen (iOS 16.4+).

## Look and feel (from the Habit Tracker app on iPhone, dark mode)

- Black page `#000`, cards `#171717`, sheets `#0b0b0b`, pink accent `--accent` `#fd5c7d`
  (`#f0436a` in light mode). Habit colours are mixed with `--mix` (black, or white in light mode).
- Today: pink **All ▾** filter pill on the left, title in the middle, a sun/moon light-dark button and
  the mood face on the right;
  a row of days (two-letter day name over a ring that fills pink, selected day boxed, a ✨ on a finished
  day); habit cards tinted 20% with the habit's colour that fill as you go (`--p`), the emoji in a rounded
  box, a "0/1" chip, the description, "🔥 N Days" in the top corner, and a round check (or +) button that
  becomes a green seal (`SEAL_SVG`) when done. A 💡 tips button floats bottom-left.
- Finishing a habit plays a chime; finishing the last habit of the day opens the celebration (`celebrate()`,
  `<dialog id="party">`: confetti on a canvas, "WELL DONE!! YOU DID IT!!", "Don't show again") with a bigger
  sound. Sounds are made with Web Audio in `playNotes()` (no sound files; iPhone's silent switch mutes them).
- Habit counter page: big ring with the emoji, count and "/goal", + and − inside the ring, an **Add**
  pill (opens the keypad) between ↺ reset (asks first with `ask()`, `<dialog id="ask">`) and a check button
  in the habit's colour, Memo and Stat buttons below.
- Habit Stat page: month calendar, Yearly status grid, 8 coloured tiles, Memos, Trending
  (1 Week / 1 Month / 1 Year) and Comparison (last week vs this week) bar charts.
- Stats: "Overall ▾" picker and a row of habit emoji chips, month calendar with progress rings and ✨ on
  finished days (or the whole year), a pink rate ring ("20%", "Monthly Rate") with ⇄ for month or year, and four numbers.
- Me: avatar and name, Moods week (dashed circles), a gradient Daily quote card, Settings cards.
- Unit picker (from the form's Unit row): pink kind chips (Popular first, then Activity, Body Measurements,
  Nutrition Intake, Workout, Mind & Sleep, Study & Work, Faith, Self-care, Home & Money, Family & Friends, Other),
  cards of items showing their measurement (or › to choose one) under small section titles, and a search box
  at the bottom that can also take your own unit. Only the chosen item is lit (matched by the habit's name).
  It is a panel over the form (`UNIT_KINDS`; item names must all be different; Other holds plain units).
- Add/edit: grouped dark cards, colour picker with Bright and Soft sets, Habit type (Build/Quit), day circles,
  time-of-day chips, switches; the form takes the habit's colour as its accent.
- New Habit page (the pink +): `TEMPLATE_TABS` (Popular, Faith, Health, Sports, Lifestyle, Time, Quit), rows with
  emoji, name, goal and +, and a floating **Custom Habit** button for the blank form.
- Timer page (habits in `min`/`hr`, today only): full ring in the habit's colour with a white knob that goes round
  once a minute, the clock, ↺ reset (asks first), play/pause pill and + (add by hand), and Counter (Style),
  Sound, Countdown, Memo, Stat. Countdown (`openCountdown`) picks count down/up and the length (5m-2h), which
  sets the goal (an `hr` habit switches to `min`). Once the goal is done, ▶ runs another full round
  (`timerTarget`). Focus and end sounds are made in `focusBuffer()`/`endSound()`.
- Group tab: shared habits with your row and each friend's (7 dots and streak), Remind, My progress, Invite.
  There is no server: links (`#h=` + base64 JSON with the habit and the sender's last 7 days) go by WhatsApp or
  the share sheet; opening one adds the habit or updates that friend. iPhone home-screen apps have their own
  storage, so they join with Group → + → Join with a link (paste).

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

- Done: the owner's email was removed from the history, the repo is public, and the app is live.
- Pick the next feature from "Ideas for later" in `README.md`. Features the Habit Tracker app
  has that we don't yet: Goal Period (week-long and month-long goals), widgets, live friend progress (needs the
  Firebase account on the `sign-in` branch), Apple Health sync and Apple Music (not possible in a web app).
