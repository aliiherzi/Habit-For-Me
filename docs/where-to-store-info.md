# Where to store project information

Claude Code cloud sessions run in a **temporary container**. Anything that is
only saved there is deleted when the session ends, so push important work to GitHub.

## Project details → this GitHub repository

- `README.md`: what the project is, how to run it, the plan and goals
- `CLAUDE.md`: notes for Claude (goals, tech, rules, next steps).
  **Claude Code reads it automatically** at the start of every session in this repo.

## Personal notes and planning → Google Drive or a Claude Doc

Ideas, budget tracking and to-do lists can live in a Google Doc or a Claude Doc.

## Never store these in the repo

- API keys, passwords or tokens. Put them in a `.env` file (already in
  `.gitignore`) or in the cloud environment's secrets settings.
