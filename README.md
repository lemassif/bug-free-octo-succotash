> This repo is a small **retro arcade** with seven self-contained browser games.
> Open [`index.html`](index.html) for the **menu**, then pick a game:
>
> | Game | File | Description |
> |------|------|-------------|
> | **Cubert** | [`cubert.html`](cubert.html) | cube-hopping isometric arcade — see [`CUBERT.md`](CUBERT.md) |
> | **Miner 2049er** | [`miner.html`](miner.html) | platformer (documented below) |
> | **Ferrow Light** | [`ferrow-light.html`](ferrow-light.html) | a four-chapter Zork-style text adventure |
> | **Mulligan Cup** | [`golf.html`](golf.html) | eighteen-hole golf from behind the ball — see below |
> | **Giraffatron** | [`giraffe.html`](giraffe.html) | skateboarding, skiing, flying laser giraffe — see below |
> | **Lucky Seven Casino** | [`casino.html`](casino.html) | craps, blackjack and roulette with several players — see below |
> | **Decathlon** | [`decathlon.html`](decathlon.html) | all ten track and field events for one to five athletes — see below |
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

An eighteen-hole golf game in the spirit of the console classics, drawn from
behind the ball in real perspective (a small 3D projection engine on Canvas
2D, no libraries). Original characters and courses.

- **Swing** with three taps: start the meter, lock in power, then hit the green
  impact mark on the way back. Early slices, late hooks. A slice curves right
  for right-handers and left for left-handers.
- **Right- or left-handed** golfers: pick your swinger (Pip, Boulder or Zippy)
  and your handedness on the select screen. The golfer mirrors to the other
  side of the ball.
- **Save and resume.** The round autosaves after every shot. Close the page,
  come back, and tap **Continue** on the title screen to pick up at the same
  ball, stroke count and scorecard. The menu (&#9776;) also has Save & quit.
- **Choose any hole, any time.** Tap the hole name (top left, or press `H`) to
  jump anywhere. Posted scores are kept, the round finishes when all 18 holes
  have a score, and you can also pick the starting hole before you tee off.
- **Three difficulties.** *Casual* is the original, forgiving game. *Pro*
  (the default) tightens the impact window, speeds up the meter, randomizes
  the wind per hole with gusts between shots, quickens and tilts the greens,
  shrinks the cup's capture, and drops the yardage readouts from the meter.
  *Tour* goes further on all of those. Best scores are kept per difficulty.
- **Read the hole**: wind arrow, distance to the pin, and a live minimap. Tap
  it for the full course map, then **tap any spot to measure it**: yards from
  the ball to that spot, from the spot to the pin, what it lands in, and the
  club that reaches it. **Aim here** points your shot at it and picks that
  club. A BREAK dial appears on the green.
- **A full 14-club bag**: Driver, 3 and 5 Wood, 4 through 9 Iron, Pitching, Gap,
  Sand and Lob Wedge, and Putter. Tap the club name (or press `B`) to open the
  bag and see each club's distance from your current lie. Rough and bunkers cost
  distance and accuracy; water and out-of-bounds cost a stroke.
- Out/In/Total scorecard against par 71, and your best 18-hole score is saved
  in your browser. Playable with touch, mouse or keyboard (`←` `→` aim, `↑` `↓`
  club, `Space` swing, `B` bag, `M` map, `H` holes, `Esc` menu).

---

# Giraffatron

A side-scrolling arcade score-chaser. A giraffe skateboards through **Downtown**,
skates the **Countryside**, then straps on skis for the **Alpine Slopes**, and the
three stages loop, getting faster each lap.

- **Eye lasers:** tap or hold anywhere on the screen and the giraffe's eyes fire
  at that spot, locking onto the nearest target. Hold too long and they overheat.
- **Hoof blasters:** hold BLAST to fire the laser guns on the front hooves.
- **Wings:** hold FLY to flap up over the rooftops and let go to glide down.
  Flying uses the WINGS meter, which refills on the ground and from power
  cells. Fly into drones, saucers and other flying robots to ram them.
- **Demolish buildings:** robot-company buildings (marked with a robot sign)
  line the road. Laser or blast them until they collapse for big points.
- **Mothership:** every so often a huge spaceship hovers high overhead. Fly up
  and blast it or ram it for 1,000 points.
- **Turbo ramps:** the glowing yellow ramps launch you at 10 times your speed
  with an automatic backflip and 360 ollie, smashing through anything in the
  way.
- **Jump** cones, fences, rocks, trees and gaps; launch off ramps; grind rails.
  Tap JUMP again in the air for a kickflip (a daffy on skis), then a backflip,
  then a 360 ollie. Land it cleanly for points; land mid-trick and you bail.
- **MEGA:** lasering targets, landing tricks, grinding and grabbing power cells
  charge the meter. Hit MEGA to transform into a robot giraffe for 10 seconds:
  invincible, hover-board over gaps, smash through obstacles, twin auto-lasers,
  double points.
- **Score** comes from targets (robots, drones, saucers, scarecrow bots, snow
  bots and more), tricks, grinds, smashes and distance, multiplied by your
  combo. Three crashes end the run; your best score is saved.
- Keyboard: `Space` jump, hold `↑` or `W` to fly, `J` blast, `K` mega, `F` eye lasers at the nearest
  target, mouse to aim, `P` pause.

---

# Lucky Seven Casino

A Las Vegas-style casino for play money only: no real money, no prizes, no
purchases. Open `casino.html` for the lobby.

- **Shared players.** The cashier keeps a roster of up to six players, each
  human or computer, each with one bankroll that follows them from table to
  table (saved on the device). Pass the phone around: every human bets on
  their own turn. Out of chips? The cashier tops you up for free.
- **Craps** (`craps.html`) has every bet on the layout: Pass / Don't Pass,
  Come / Don't Come, free odds up to 3-4-5x (and 6x lay), Place, Buy and Lay,
  Field, Big 6 / Big 8, Hardways, Any 7, Any Craps, 2, 3, 11, 12, C&E, Horn,
  and all 21 Hop bets. Up to six players share the table and **the dice pass
  to the next shooter after every seven-out**; computer shooters roll on their
  own. The Odds sheet lists every payout and house edge, and a stats sheet
  charts your rolls against the odds.
- **Blackjack** (`blackjack.html`): six decks, dealer stands on soft 17,
  blackjack pays 3 to 2, double after split, up to four hands, late
  surrender, insurance, and a basic-strategy Hint. Up to five seats.
- **Roulette** (`roulette.html`): American double-zero or European
  single-zero wheel. Tap a number, the line between numbers (split), a corner,
  a street or a six line, plus dozens, columns and even-money bets. Basket,
  First four and the European call bets (Voisins, Orphelins, Tiers, Jeu zéro)
  live under Special. Everyone bets on the same spin.
- **Honest odds.** The rules engines (`craps-engine.js`, `blackjack-engine.js`,
  `roulette-engine.js`) are plain, DOM-free JavaScript. Every craps and
  roulette bet reproduces its published house edge exactly, and perfect basic
  strategy at the blackjack table measures about 0.4% over millions of hands.

---

# Decathlon

All ten decathlon events in their real order over two days, scored with the
official World Athletics points tables.

- **Day one:** 100 metres, long jump, shot put, high jump, 400 metres.
  **Day two:** 110m hurdles, discus, pole vault, javelin, 1500 metres.
- **One to five athletes.** At least one is human. The rest can be more humans
  passing the device around, or computer athletes at *Rookie* (about 4,000 to
  6,000 points), *Pro* (6,000 to 8,000) or *Olympian* (8,000 to 9,000) level.
  Computer athletes run in the lanes beside you.
- **Controls.** Tap LEFT and RIGHT in turn to run: the faster you alternate,
  the faster you go. ACTION jumps hurdles and takes off at the board, plants
  the pole and releases throws. For jumps, shot and javelin, keep holding
  ACTION and let go at the right angle. Release the discus while the arrow is
  in the green sector.
- **Real rules.** Two false starts and you are out. Overstepping the board or
  the line is a foul, and the best of three attempts counts. High jump and pole
  vault use a rising bar: jump, pass a height or retire, and three misses in a
  row ends your competition. In the 400 and 1500, sprinting flat out drains
  your energy, so pace yourself and kick at the end.
- **Standings** after every event, a podium and event-by-event points at the
  finish, and the best human totals are saved on the device. The decathlon
  saves after each event; **Continue** on the title screen picks it up.
- Keyboard: `←` `→` (or `Z` `X`, `A` `D`) to run, `Space` / `↑` / `Enter` for
  action, `P` to pause. The rules engine (`decathlon-engine.js`) has no DOM
  and can be tested on its own.

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
