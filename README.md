# Games

Two self-contained browser games, no build step, no dependencies — just open
the file:

| Game | File | Genre | Session length |
|------|------|-------|----------------|
| **Ferrow Light** | `ferrow-light.html` | Zork-style text adventure | 20–30 minutes |
| **Miner 2049er** | `index.html` | Arcade platformer | as long as you last |

---

# Ferrow Light

A Zork-style interactive fiction game, sized to be finished in one sitting
(20–30 minutes). You are the relief keeper of Ferrow Point Light: the keeper
is missing, the lamp is dark, a storm is building, and the evening packet
steamer is due through the shoals at dusk.

## Play

Open `ferrow-light.html` in any modern browser (works on phones too). Type
commands at the `>` prompt:

- **Move**: `NORTH`, `SOUTH`, `EAST`, `WEST`, `UP`, `DOWN` (or `N`/`S`/`E`/`W`/`U`/`D`)
- **Look around**: `LOOK`, `EXAMINE thing` (or `X thing`), `READ thing`
- **Act**: `TAKE`, `DROP`, `OPEN`, `UNLOCK`, `LIGHT`, `POUR`, `WIND`, `PUT X IN Y`
- **Helpers**: `INVENTORY` (`I`), `HINT` for a contextual nudge, `SCORE`, `HELP`, `RESTART`

Nine rooms, four chained puzzles, a 100-point score with ranks, and one
faithful homage to a certain lurker in dark places. Everything is
deterministic and fair — the game warns you (twice) about the one thing that
can kill you. If you're ever stuck, `HINT` always points at the next step.

---

# Miner 2049er — Bounty Bob

A browser remake of the classic 1982 platformer *Miner 2049er*. You play
**Bounty Bob**, exploring an abandoned uranium mine. Your goal: **walk over
every floor tile** in the mine to claim it (the tiles turn gold) — while
dodging the radioactive mutants that roam the shafts.

## Play

Just open `index.html` in any modern browser. No build step, no dependencies —
it's a single self-contained HTML file using the Canvas 2D API.

```
# from the repo root
open index.html        # macOS
xdg-open index.html    # Linux
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
