> This repo is a small **retro arcade** with nine self-contained browser games.
> Open [`index.html`](index.html) for the **menu**, then pick a game:
>
> | Game | File | Description |
> |------|------|-------------|
> | **Cubert** | [`cubert.html`](cubert.html) | cube-hopping isometric arcade with 20 levels you can start from — see [`CUBERT.md`](CUBERT.md) |
> | **Miner 2049er** | [`miner.html`](miner.html) | platformer (documented below) |
> | **Ferrow Light** | [`ferrow-light.html`](ferrow-light.html) | a four-chapter Zork-style text adventure |
> | **Mulligan Cup** | [`golf.html`](golf.html) | eighteen-hole golf from behind the ball — see below |
> | **Giraffatron** | [`giraffe.html`](giraffe.html) | skateboarding, skiing, flying laser giraffe — see below |
> | **Lucky Seven Casino** | [`casino.html`](casino.html) | craps, blackjack, roulette, pai gow and hold'em with several players — see below |
> | **Decathlon** | [`decathlon.html`](decathlon.html) | all ten track and field events for one to five athletes — see below |
> | **Powder Cup** | [`winter.html`](winter.html) | ski and snowboard: races, moguls, halfpipe and big air — see below |
> | **Brain Box** | [`logic.html`](logic.html) | logic puzzles: clue grids, sudoku, picture cross and queens — see below |
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

An eighteen-hole golf game in the spirit of the 1990s console classics, in
real 3D (WebGL, using three.js stored in the repo as `three.module.min.js`, so
it still works offline). Rolling hills, sunken bunkers, tilted greens, ponds,
3D trees with shadows, and round, smooth-shaded golfers that swing the club.
Original characters and courses. `golf3d.js` draws the scene; the rules and
physics stay in `golf.html`, which falls back to its older 2D view on devices
without WebGL.

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
- **Face Up Pai Gow** (`paigow.html`): seven cards each from a deck with one
  joker. The dealer's hand is dealt face up and set the house way first, so you
  can set yours knowing what to beat (the Best play button finds the strongest
  setting). Even money with no commission, ties go to the dealer, and every
  main bet pushes when the dealer has an ace-high pai gow. Optional $5 Fortune
  bonus pays 2 to 1 for a straight up to 8,000 to 1 for a seven-card straight
  flush.
- **Texas Hold'em** (`holdem.html`): no-limit, blinds $5/$10, two to six
  players. Your stack is your casino bankroll. Side pots and split pots are
  handled for you. Computer players estimate their odds by simulation and bluff
  now and then. With several humans, the table asks everyone else to look away
  before showing each player their cards.
- Roulette pays out on the layout: after the ball lands, losing chips are swept
  away and a stack of payout chips slides in beside each winning bet.
- **Honest odds.** The rules engines (`craps-engine.js`, `blackjack-engine.js`,
  `roulette-engine.js`, `poker-engine.js`) are plain, DOM-free JavaScript. Every craps and
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
- **Full 3D stadium.** A 400 m track with eight lanes, a packed crowd,
  floodlights and every field event laid out in the infield. The cameras track
  you down the straight, swing round the bends and follow the javelin, shot
  and discus through the air. Devices without WebGL get the original 2D view.
- **Controls.** Tap LEFT and RIGHT in turn to run: the faster you alternate,
  the faster you go. Speed builds up and fades smoothly, so a missed tap or two
  will not stall you. ACTION jumps hurdles and takes off at the board, plants
  the pole and releases throws. For jumps, shot and javelin, keep holding
  ACTION and let go at the right angle. Release the discus while the arrow is
  in the green sector. In the high jump, tap ACTION again to arch your back
  just as you reach the bar. In the pole vault, push off when the swing meter
  peaks.
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
  and can be tested on its own; `decathlon3d.js` draws the 3D stadium with
  three.js.

---

# Powder Cup

Six ski and snowboard events for one to four riders. Each rider picks skis or
a snowboard; humans pass the device around and computer riders (Rookie, Pro or
Legend) fill the field. Play the full cup (cup points 100, 80, 60, 50 per
event) or any single event.

- **Downhill:** the fastest race, over 110 km/h. The course is slick and icy:
  skis keep sliding sideways after you turn, and shiny blue bands of sheet ice
  are slicker still. Three big jumps.
- **Giant slalom:** wide, sweeping gates. **Slalom:** flat and fast, with tight
  gates every few metres. In all three races, hold ◀ ▶ to steer and TUCK for
  speed; a missed gate costs 3 seconds.
- **Moguls:** tap ◀ or ▶ as each bump arrives, in the arrow's direction, then
  throw tricks off the two kickers. Judged like the real thing: turns 60%,
  air 20%, speed 20%.
- **Halfpipe:** pump like a real rider: hold PUMP to crouch as you drop toward
  the flat, then let go to stand up as you ride up the wall. Letting go on the
  green part of the wall adds the most speed, a speedometer shows the gain,
  and without pumping you slow down. Six hits. **Big air:**
  one huge jump, three tries, best two count.
- **Tricks:** in the air hold ◀ or ▶ to spin (180 to 1440 and beyond), FLIP
  to flip and GRAB to grab, and let go in time to land straight. Tricks get
  their real names, such as *Backside Double Cork 1440 Melon* or *Left 1080
  Japan*, and score on difficulty, height and landing (clean, sketchy or
  crash). In the halfpipe, repeating a trick scores half.
- The cup saves after every event; **Continue** on the title screen resumes it.
  Best results per event are kept on the device.
- Keyboard: `←` `→` steer or spin, `↓` / `Z` tuck or flip, `Space` / `↑` / `X`
  pump, pop or grab, `P` pause. The rules engine (`winter-engine.js`) has no DOM.

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

---

# Brain Box

Four kinds of logic puzzles, each at five levels: **Kids, Easy, Medium, Hard
and Expert**. Every puzzle is generated fresh, has exactly one answer, and can
be solved by reasoning alone. The generator checks this before you ever see it.

| Puzzle | How it works | Sizes |
|--------|--------------|-------|
| **Logic Grid** | Clues like "Theo finished 2nd" and "The cat owner is younger than Ava". Work out who has which pet, color, snack, sport, age or finishing place. Tap a square for ×, again for ●; a ● crosses out the rest of its row and column. Tap a clue to cross it off. | 3 people, 2 categories up to 5 people, 3 categories |
| **Sudoku** | Each row, column and box holds every number once. Notes mode for pencil marks. Hard needs pairs and pointing; Expert needs more. | 4×4, 6×6, 9×9 |
| **Picture Cross** | Number clues give the runs of filled squares in each row and column, in order. Drag to paint, switch to × to mark empty squares. Clues dim when a line is satisfied. | 5×5 to 15×15 |
| **Queens** | One ♛ in every row, column and colored region, and no two queens touching, even at a corner. | 5×5 to 9×9 |

- **Undo, Check, Hint and New** on every puzzle. Check shows how many marks
  are wrong; Hint fixes a mistake or fills in one correct square.
- A timer runs while you play, and solved counts and best times are saved per
  puzzle type and level. Leave mid-puzzle and **Continue** picks it up later.
- The generators and solvers live in `logic-engine.js`, which has no DOM and
  can be tested in Node.

