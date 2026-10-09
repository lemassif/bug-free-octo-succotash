# Cubert — a cube-hopping arcade game

A browser game inspired by the classic 1982 arcade cabinet where a little
orange creature hops around an isometric pyramid of cubes. Hop onto every cube
to flip it to the **target color** — without leaping off the edge — while
dodging the bouncing red balls and **Slinky**, the purple snake that chases you.

It's a single self-contained HTML file (`cubert.html`) using the Canvas 2D API.
No build step, no dependencies.

## Play

Just open `cubert.html` in any modern browser:

```
# from the repo root
open cubert.html        # macOS
xdg-open cubert.html    # Linux
# or double-click the file
```

There's a link on the title screen to hop over to the other game
(Miner 2049er) and back.

### On iPhone / iPad (iOS)

Cubert is fully playable on iOS Safari:

- **Four corner buttons** — a diamond of touch buttons appears automatically on
  phones and tablets. Each corner hops one diagonal:
  ◤ up-left · ◥ up-right · ◣ down-left · ◢ down-right.
- Pinch-zoom, double-tap zoom, and rubber-band scrolling are disabled so
  gestures don't fight the game, and the layout respects the notch / home
  indicator (safe-area insets).
- Runs at the correct speed on 120 Hz **ProMotion** devices — the game logic
  uses a fixed 60 Hz timestep independent of the display refresh rate.
- **Add to Home Screen** (Share → *Add to Home Screen*) to launch it fullscreen
  like a native app.

## How to play

The pyramid points up, so the four moves are all **diagonal**. On a keyboard the
arrow keys (or W A S D) are rotated 45°:

| Key            | Hops        |
|----------------|-------------|
| `↑` / `W`      | up-right    |
| `→` / `D`      | down-right  |
| `↓` / `S`      | down-left   |
| `←` / `A`      | up-left     |
| `P`            | pause       |
| `Space` / `Enter` | start / play again |

## Rules

- **Flip every cube** — land on each cube to change its top color. When they all
  reach the target color, the level is cleared.
- **20 levels, pick any one.** The title screen has a PLAY button for level 1
  and a grid to start on any level from 1 to 20. Past level 20 the game keeps
  going and keeps speeding up.

  | Levels | Tier   | What changes |
  |--------|--------|--------------|
  | 1–5    | Rookie | One hop per cube, then two. Sam shows up on level 5. |
  | 6–10   | Hopper | Hopping a finished cube knocks it back a step; more red balls. |
  | 11–15  | Expert | Two, then three hops per cube; up to 4 red balls at once. |
  | 16–20  | Master | Three hops, finished cubes knock back, 5 red balls, only one disc. |

  Every level is a little faster than the one before: red balls drop more
  often and hop faster, Slinky hatches sooner and chases faster, and Sam comes
  more often.
- **Don't jump off** — leaping past the edge of the pyramid costs a life…
- **…unless you catch a rescue disc.** A spinning disc floats beside each side of
  the pyramid. Hop off the edge next to one and it flies you back to the top. If
  Slinky is chasing you, it follows you off the edge and plummets — worth big
  bonus points.
- **Avoid the enemies:**
  - **Red balls** bounce down the pyramid at random. Touching one costs a life.
  - **Slinky** (the purple snake) hatches from a bouncing egg, then relentlessly
    chases you. Touching it costs a life — lure it off a disc edge to beat it.
  - **Sam** (the little green guy, level 5 and up) hops down the pyramid and
    turns cubes back to the starting color. Catch him for 300 points.
  - **Green ball** — catch it to freeze every enemy for 3.5 seconds (100 points).
- You start with **5 lives** and earn a bonus life for every level you clear. Losing one clears the board of enemies for a brief
  breather; your cube progress is kept.
- High score is saved in your browser's local storage.

## Scoring

| Event                         | Points        |
|-------------------------------|---------------|
| Flip a cube toward target     | 5             |
| Flip a cube to the target     | 25            |
| Ride a rescue disc            | 50            |
| Lure Slinky off a disc edge   | 500           |
| Catch Sam                     | 300           |
| Catch the green ball          | 100           |
| Clear a level                 | 200 + 100/level |

Five levels are included, each with its own color scheme and rising difficulty.
The level definitions live in the `LEVELS` array near the top of the script and
are easy to edit or extend.
