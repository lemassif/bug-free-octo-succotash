> This repo is a small **retro arcade** with four self-contained browser games.
> Open [`index.html`](index.html) for the **menu**, then pick a game:
>
> | Game | File | Description |
> |------|------|-------------|
> | **Cubert** | [`cubert.html`](cubert.html) | cube-hopping isometric arcade — see [`CUBERT.md`](CUBERT.md) |
> | **Miner 2049er** | [`miner.html`](miner.html) | platformer (documented below) |
> | **Ferrow Light** | [`ferrow-light.html`](ferrow-light.html) | a four-chapter Zork-style text adventure |
> | **Mulligan Cup** | [`golf.html`](golf.html) | nine-hole golf from behind the ball — see below |
>
> Every page cross-links, so you can hop between the menu and any game.
>
> **Play anywhere, online or offline.** The arcade is an installable PWA: it
> ships a web app manifest and a service worker (`sw.js`) that caches every
> game on first visit. Add it to your phone's Home Screen (Share → *Add to
> Home Screen*) and it launches fullscreen and works with no connection.
>
> Hosted with GitHub Pages, so it's shareable with a single link — just send
> friends and family the Pages URL for this repo.
>
> The rest of this file documents Miner 2049er.

---

# Mulligan Cup

A nine-hole golf game in the spirit of the console classics, drawn from behind
the ball in real perspective (a small 3D projection engine on Canvas 2D — no
libraries). Original characters and courses.

- **Swing** with three taps: start the meter, lock in power, then hit the green
  impact mark on the way back. Early slices right, late hooks left.
- **Read the hole**: wind arrow, distance to the pin, a live minimap (tap it for
  the full course map with the green's slope arrows), and a BREAK dial on the
  green.
- **A full 14-club bag**: Driver, 3 and 5 Wood, 4 through 9 Iron, Pitching, Gap,
  Sand and Lob Wedge, and Putter. Tap the club name (or press `B`) to open the
  bag and see each club's distance from your current lie. Rough and bunkers cost
  distance and accuracy; water and out-of-bounds cost a stroke.
- **Three swingers**: Pip (balanced), Boulder (long but hard to time), Zippy
  (short but forgiving).
- Best score is saved in your browser. Playable with touch, mouse or keyboard
  (`←` `→` aim, `↑` `↓` club, `Space` swing, `M` map, `Esc` cancel).

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
