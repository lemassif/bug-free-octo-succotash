# Black Friday Brawl

A browser multiplayer FPS. 7v7 team deathmatch in Doorbuster Mall, a two-floor
shopping mall on the busiest shopping day of the year. Nothing to install: open
the URL, pick a name and a shopper, and play.

- First team to 50 knockouts wins, or the team ahead when the 10 minute clock runs out.
- Two weapons: the Markdown AR (hitscan, recoil, 30-round reload) and the
  Layaway Longshot sniper (scope zoom, hold Shift to steady your aim).
- Three shoppers: Coupon Carol, Doorbuster Doug and Influencer Izzy.
- Respawn after 3 seconds at your team's entrance.
- Bots fill empty seats, so a match always plays as 7v7.
- Practice mode runs the whole match in your browser against bots, with no server.

## Controls

| Key | Action |
| --- | --- |
| WASD | Move |
| Shift | Sprint. While scoped: steady aim |
| Space | Jump |
| Left mouse | Fire |
| Right mouse | Scope (sniper) |
| R | Reload |
| 1 / 2 / mouse wheel | Switch weapon |
| Tab | Scoreboard |
| V | Read your knockout lines aloud |
| ` (backquote) | Frame rate and draw-call overlay |

## How to run it locally

You need Node 22 or newer.

```bash
cd mall-fps
npm install
npm run dev
```

`npm run dev` starts the game server on port 2567 and the client on
<http://localhost:5173>. Open that URL in two tabs and choose **Play online** in
both to play against yourself. **Practice vs bots** works without the server.

The first run bakes the lighting and compresses the textures (about 4 seconds).
Later runs skip both unless the map or textures changed.

### Useful URL options

| Option | What it does |
| --- | --- |
| `?map=gym` | Weapon test range with moving mannequins |
| `?debug` | Shows the frame rate, draw calls and position |
| `?autojoin=local&lag=150` | Skips the lobby and starts practice with 150 ms of fake lag |
| `?autojoin=local&target=5` | Practice match to 5 knockouts, to see the end screen quickly |

### Tests

```bash
npm test             # 31 unit tests: movement, hitscan, map walkthrough, match and bots
npm run typecheck
```

The 2-tab playtest drives two real browser tabs against a real server. It stages
a duel, checks that each tab sees the other where the server says, that the
mover's prediction needed no corrections, that hits register, and that the
knockout, voice line and respawn all arrive:

```bash
# terminal 1
BFB_TEST=1 npm run dev -w server
# terminal 2
npm run dev -w client
# terminal 3
npm run playtest
```

`BFB_TEST=1` turns on a teleport message used only by this test. Never set it
in production.

## How to deploy

The client goes to Vercel and the game server goes to Fly.io. Deploy the server
first, because the client build needs its address.

### 1. Server on Fly.io

Install the Fly CLI (<https://fly.io/docs/flyctl/install/>), then from the
`mall-fps` folder:

```bash
cd mall-fps
fly auth login
fly launch --copy-config --no-deploy --name black-friday-brawl --region iad
fly deploy
fly scale count 1 --yes
curl https://black-friday-brawl.fly.dev/health
```

If the name `black-friday-brawl` is taken, pick another and use it everywhere
below. Keep exactly one machine (`fly scale count 1`): rooms live in that
machine's memory, so a second machine would split players into different
matches. The machine sleeps when nobody is playing and wakes on the next join,
which takes a few seconds. Fly asks for a payment card on file before it will
deploy.

### 2. Client on Vercel

```bash
cd mall-fps
npx vercel login
npx vercel link
npx vercel env add VITE_SERVER_URL production
#   when asked for the value, enter: wss://black-friday-brawl.fly.dev
npx vercel --prod
```

Vercel reads `vercel.json`, installs the workspace, bakes the lighting,
compresses the textures and publishes `client/dist`. The URL it prints is the
game. If you change the server address later, update the variable and run
`npx vercel --prod` again.

## How to add voice lines

Every knockout shows a one-line subtitle from the shopper who scored it. The
lines live in [`shared/src/match/voice.ts`](shared/src/match/voice.ts):

```ts
export const VOICE_LINES = {
  0: [ /* Coupon Carol */ "I had a coupon for that.", ... ],
  1: [ /* Doorbuster Doug */ ... ],
  2: [ /* Influencer Izzy */ ... ],
  any: [ /* anyone can say these */ ... ],
};
```

1. Add a string to the list for the right shopper, or to `any`.
2. Keep it short enough to read in 3 seconds, about 60 characters.
3. Run `npm test`. The test checks there are at least 30 lines, that no line
   mentions credit cards, and that the picker never repeats a line twice in a
   row.
4. Redeploy both sides: `fly deploy` for online matches (the server picks the
   lines) and `npx vercel --prod` for practice mode (which runs the match in
   the browser).

The kill-feed labels and their points live in
[`shared/src/match/scoring.ts`](shared/src/match/scoring.ts). Mall PA
announcements are in [`client/src/hud/Subtitles.ts`](client/src/hud/Subtitles.ts).

## How it works

```
mall-fps/
  shared/   game rules used by both sides: movement, collision, weapons,
            hitscan, the mall map, the match, bots, scoring, voice lines
  server/   Colyseus room that wraps the shared Match (WebSocket transport)
  client/   Three.js + Vite: rendering, input, prediction, HUD, lobby
  tests/    unit tests and the 2-tab playtest
```

**Server-authoritative.** The server runs the match at 60 ticks a second and is
the only judge of positions, hits, knockouts, score and the clock. Clients send
inputs, never results.

**Shared simulation.** Movement, collision and weapon timing are one pure
function in `shared/src/movement.ts`. The browser and the server run the same
code, so the client's prediction matches the server step for step.

**Prediction and reconciliation.** Each input carries a sequence number. The
client applies it immediately. Every snapshot (20 a second) includes the last
input the server processed. The client resets to the server's state, replays
the inputs the server has not seen yet, and eases any difference out over
about 100 ms.

**Interpolation and lag compensation.** Other players are drawn 100 ms in the
past, between two snapshots. Each shot carries that render time, and the server
rewinds everyone to where the shooter saw them before checking the hit. Tracers,
recoil and hit sparks happen on your screen the instant you click; the hit
marker and the cash register sound come with the server's confirmation.

**Bots.** A navigation grid is generated from the collision geometry at
startup, including the stairs and escalator lanes. Bots path with A*, react
after a short delay, strafe, fire in bursts, and their aim tightens the longer
they track you. They send the same inputs a player would.

**Performance.**
- The level is merged into one mesh per material, about a dozen draw calls for
  the whole mall.
- Repeated props (plants, shelves, benches, lights, pallets) are instanced, one
  draw call per prop type.
- Lighting is baked at build time (`client/tools/bake-lighting.ts`). It
  raytraces the skylight, a sun shaft and 86 ceiling lights into vertex colors,
  so the world uses unlit materials with no runtime lights or shadows.
- Textures are compressed to KTX2 (Basis ETC1S with mipmaps) at build time
  (`client/tools/compress-textures.ts`) and stay compressed on the GPU.
- A typical view is 40 to 100 draw calls and about 110k triangles.
- If the frame rate drops below 50, the game lowers its render resolution, and
  raises it again when there is headroom.

## Known limits

- Rooms live in one server process, so one Fly machine handles every match.
  Each room holds 14 players; Colyseus opens a new room when one fills.
- The server trusts the aim direction a client sends, within 20 degrees of
  where that player is looking. That is normal for a casual shooter but is not
  cheat-proof.
- `npm audit` flags an old `nanoid` inside Colyseus 0.16. The advisory covers
  custom ID alphabets and sizes, which Colyseus does not use.
- Frame rate was checked in a software-rendered headless browser, which cannot
  show real GPU performance. Run with `?debug` on your laptop to see real
  numbers.
