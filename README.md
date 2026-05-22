# Faculty Roulette

Faculty Roulette is a small academic survival simulator. You start as a fresh faculty member and try to survive semesters of grant deadlines, teaching load, paper reviews, service work, and suspiciously urgent administrative emails.

## Status

Playable zero-dependency prototype.

## Features

- Five faculty archetypes, plus a random default profile for fresh no-change runs
- Three universe intensity modes
- Daily seed and random seed runs
- Profile-specific opening scenes instead of one shared fixed script
- A larger branching scene pool where previous choices change which scenes can appear next
- 44 weird-tale scenes and 132 choice entries across profile, flag, and route-dependent branches
- The same choice can produce different creepy aftermath variants under different seeds
- Post-choice weird-image reveals generated from each aftermath's route tone and story keywords
- Every choice now gets a shorter tone-bound aftermath beat for cleaner story flow without cross-scene stitching
- Random-length runs with 8-12 scene questions and scene-by-scene progression on every choice
- Richer aftermath prose adapted from the earlier haunted-academia version
- Choices now pause on a prominent aftermath passage before the next scene appears
- Developer-style log/terminal UI removed so the page stays focused on the story
- Roulette-style event draw
- Escalating academic horror storyline with branching endings
- 108 structurally distinct academic horror dossiers with varied titles, images, voices, and route-aware ending echoes
- One continuous story dossier that carries the full sequence of scenes, decisions, and aftermaths
- Story-focused reading layout with a single continuous narrative record
- Mid-run story arcs, hidden routes, and profile-dependent branches
- Six-stat survival model
- Continuous story timeline and dossier-style endings

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
