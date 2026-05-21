# Faculty Roulette

Faculty Roulette is a small academic survival simulator. You start as a fresh faculty member and try to survive semesters of grant deadlines, teaching load, paper reviews, service work, and suspiciously urgent administrative emails.

## Status

Playable zero-dependency prototype.

## Features

- Five faculty archetypes
- Three universe intensity modes
- Daily seed and random seed runs
- Roulette-style event draw
- Action points and long-term project slots
- Budget and energy economy with project risk
- Absurd semester rules that mutate choice outcomes
- Project-specific story arcs and hidden routes
- Six-stat survival model
- Campus bestiary discoveries
- Achievements, timeline, crisis radar, diagnosis card, endings, and share text

## Run

Open `index.html` directly in a browser, or serve this folder with a static server.

```powershell
python -m http.server 8780
```

## Smoke Test

If Node.js is available:

```powershell
node smoke-test.mjs
```

## Files

- `index.html`: app shell
- `styles.css`: visual design
- `app.js`: game state, events, endings
- `smoke-test.mjs`: zero-dependency DOM smoke test

## Deployment

Use a standalone GitHub repository and static hosting target when publishing.
