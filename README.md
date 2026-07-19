# Games

> This repo is a small **retro arcade** of self-contained browser games —
> no build step, no dependencies. Open [`index.html`](index.html) for the
> **menu**, then pick a game:
>
> | Game | File | Description |
> |------|------|-------------|
> | **Ferrow Light** | [`ferrow-light.html`](ferrow-light.html) | four-chapter Zork-style text adventure (documented below) |
> | **Cubert** | [`cubert.html`](cubert.html) | cube-hopping isometric arcade — see [`CUBERT.md`](CUBERT.md) |
> | **Miner 2049er** | [`miner.html`](miner.html) | platformer (documented below) |
>
> Every page cross-links, so you can hop between the menu and any game.

---

# Ferrow Light

A Zork-style interactive fiction game in **four chapters** — one long night
on a storm-bound headland. You are the relief keeper of Ferrow Point Light:
the keeper is missing, the lamp is dark, and the evening packet steamer is
due through the shoals.

1. **The Cold Light** — relight the abandoned lighthouse.
2. **The Man Below** — the falling tide uncovers a wrecked skiff, and a sea
   cave that floods on a timer.
3. **The False Light** — someone has hung a decoy light where a light should
   never be. Put it out.
4. **Keeping the Light** — the storm fights back. Keep your lamp burning
   until dawn.

## Play

Open `ferrow-light.html` in any modern browser (works on phones too).
Progress **autosaves after every move** — close the page and your watch
resumes where you left it. Type commands at the `>` prompt:

- **Move**: `NORTH`, `SOUTH`, `EAST`, `WEST`, `UP`, `DOWN` (or `N`/`S`/`E`/`W`/`U`/`D`)
- **Look around**: `LOOK`, `EXAMINE thing` (or `X thing`), `READ thing`
- **Act**: `TAKE`, `DROP`, `OPEN`, `UNLOCK`, `LIGHT`, `POUR`, `WIND`, `PRY`,
  `TIE`, `THROW`, `CLIMB`, `FILL`, `GIVE`, `PUT X IN Y`
- **Helpers**: `INVENTORY` (`I`), `HINT` for a contextual nudge, `SCORE`, `HELP`, `RESTART`

Fifteen rooms, a dozen chained puzzles, a 250-point score with keeper ranks,
a tide that keeps its own clock, and one faithful homage to a certain lurker
in dark places. Everything is deterministic and fair — both of the things
that can kill you warn you first, twice. If you're ever stuck, `HINT` always
points at the next step, and dying only costs you one move: reload the page
to return to just before it went wrong.

---

# Miner 2049er — Bounty Bob

A browser remake of the classic 1982 platformer *Miner 2049er*. You play
**Bounty Bob**, exploring an abandoned uranium mine. Your goal: **walk over
every floor tile** in the mine to claim it (the tiles turn gold) — while
dodging the radioactive mutants that roam the shafts.

## Play

Open `index.html` for the arcade menu and pick Miner 2049er, or open
`miner.html` directly. No build step, no dependencies — it's a single
self-contained HTML file using the Canvas 2D API.

```
# from the repo root
open miner.html        # macOS   (or open index.html for the menu)
xdg-open miner.html    # Linux
# or just double-click the file
```

### On iPhone / iPad (iOS)

The game is fully playable on iOS Safari:

- **On-screen controls** — a D-pad (left/right to move, up/down to climb) and
  **JUMP** / pause buttons appear automatically on touch devices. They're
  multi-touch, so you can move and jump at the same time.
- **Tap to start** — tap anywhere on the playfield to begin or restart.
- Pinch-zoom, double-tap zoom, and rubber-band scrolling are disabled so
  gestures don't fight the game, and the layout respects the notch / home
  indicator (safe-area insets).
- Runs at the correct speed on 120 Hz **ProMotion** devices (the game logic
  uses a fixed 60 Hz timestep independent of the display refresh rate).
- **Add to Home Screen** (Share → *Add to Home Screen*) to launch it
  fullscreen like a native app.

Landscape orientation gives the most room, but portrait works too.

## How to play

| Action            | Keys                          |
|-------------------|-------------------------------|
| Move left / right | `←` `→`  (or `A` / `D`)       |
| Climb ladders     | `↑` `↓`  (or `W` / `S`)       |
| Jump              | `Space`                       |
| Pause             | `P`                           |
| Start / continue  | `Space` or `Enter`            |

Touch controls appear automatically on phones and tablets.

## Rules

- **Claim the mine** — every brown floor tile must be stepped on. When the last
  one turns gold, you advance to the next level.
- **Avoid the mutants** — touching one normally costs a life.
- **Pulverizer power-up** (the glowing blue orb) — grab it to make every mutant
  *edible* for a few seconds. Touch them while it's active to pulverize them for
  bonus points. A timer bar at the top shows how long you have.
- You start with **3 lives**. Falling off the bottom of the mine also costs a
  life. Claimed progress is kept when you respawn.
- High score is saved in your browser's local storage.

## Scoring

| Event                | Points |
|----------------------|--------|
| Claim a floor tile   | 10     |
| Grab a pulverizer    | 100    |
| Pulverize a mutant   | 250    |
| Clear a level        | 500    |

Two hand-built levels are included — "First Shaft" and "Crossing Caverns".
The level maps live in the `LEVELS` array near the top of the script and are
easy to edit or extend (see the tile legend in the comments).
