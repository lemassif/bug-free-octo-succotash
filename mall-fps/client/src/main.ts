import "./style.css";
import { TEAMS, buildGym, buildMall, type KillEvent } from "@bfb/shared";
import { Game } from "./game/Game.ts";
import { WeaponController } from "./game/WeaponController.ts";
import { Dummies } from "./game/Dummies.ts";
import { Hud } from "./hud/Hud.ts";
import { initAudio, sfx } from "./game/audio.ts";
import { loadBake } from "./world/loadBake.ts";
import { loadKtx2Textures } from "./world/loadTextures.ts";
import { showLobby } from "./ui/Lobby.ts";
import { NetClient } from "./net/NetClient.ts";
import { ColyseusTransport } from "./net/ColyseusTransport.ts";
import { LocalTransport } from "./net/LocalTransport.ts";
import type { Transport } from "./net/transport.ts";
import { MatchHud } from "./hud/MatchHud.ts";
import { Minimap, type Blip } from "./hud/Minimap.ts";
import { MallPA, Subtitles } from "./hud/Subtitles.ts";
import { renderPortraits } from "./ui/portraits.ts";

const params = new URLSearchParams(location.search);
const ui = document.getElementById("ui")!;
const canvas = document.getElementById("game") as HTMLCanvasElement;
const range = params.get("map") === "gym";

const game = new Game(canvas, { map: range ? buildGym() : buildMall() });
const [bake, textures] = await Promise.all([range ? null : loadBake(), params.has("notex") ? null : loadKtx2Textures(game.renderer)]);
game.buildLevel({ baked: bake?.colors, propLight: bake?.propLight, textures: textures ?? undefined });
const weapons = new WeaponController(game);
const hud = new Hud(ui);
const debug = document.createElement("div");
debug.className = "debug";
debug.hidden = !params.has("debug");
ui.appendChild(debug);
game.debugEl = debug;
addEventListener("keydown", (e) => {
  if (e.code === "Backquote") debug.hidden = !debug.hidden;
});

const prompt = document.createElement("div");
prompt.className = "center-msg";
prompt.textContent = "Click to play";
prompt.hidden = true;
prompt.addEventListener("click", () => {
  initAudio();
  game.controls.lock();
});
ui.appendChild(prompt);
game.controls.onLockChange = (locked) => (prompt.hidden = locked);

const exposed: Record<string, unknown> = { game, weapons, hud };
(window as unknown as { __bfb: unknown }).__bfb = exposed;

if (range) startRange();
else void startMatch();

/** Weapon test range with mannequins (?map=gym). */
function startRange() {
  const dummies = new Dummies(game.scene, [[0, 0, -14], [-8, 0, -16], [8, 3, -3], [14, 0, 8]], weapons.fx);
  exposed.dummies = dummies;
  weapons.targets = () => dummies.targets();
  weapons.onShot = (hit) => {
    if (!hit.target) return;
    const r = dummies.damage(hit, game.me.weapon);
    if (r) {
      hud.crosshair.hit(r);
      if (r === "kill") sfx.kill(); else sfx.hit(r === "head");
    }
  };
  game.onFrame.push((dt) => {
    dummies.update(dt);
    hud.update(game.me, 100);
    hud.crosshair.update(dt, game.me, weapons.spread(game.me), weapons.fov, weapons.fov < 40, weapons.steady, weapons.steadying);
  });
  prompt.hidden = false;
  game.start();
}

async function startMatch() {
  game.start();
  let status = "";
  let portraits: string[] = [];
  try { portraits = renderPortraits(game.renderer); } catch { /* text-only lobby */ }
  for (;;) {
    const auto = params.get("autojoin");
    const choice = auto
      ? { name: params.get("name") ?? "Tester", char: Number(params.get("char") ?? 0), mode: auto as "online" | "local" }
      : await showLobby(ui, status, portraits);
    initAudio();
    const mhud = new MatchHud(ui);
    const minimap = new Minimap(ui, game.map);
    const subs = new Subtitles(ui);
    const pa = new MallPA(subs);
    exposed.mhud = mhud;
    const transport: Transport = choice.mode === "local" ? new LocalTransport(Number(params.get("lag") ?? 0)) : new ColyseusTransport();
    const net = new NetClient(game, weapons, transport, {
      kill: (e: KillEvent) => {
        weapons.fx.tagBurst(e.at[0], e.at[1], e.at[2]);
        mhud.kill(e);
        const myId = net.welcome?.id;
        if (e.k === myId) sfx.kill();
        if (e.line && e.k !== null) subs.line(e.who, mhud.name(e.k), e.line, e.k === myId || e.v === myId);
      },
      hit: (e) => {
        hud.crosshair.hit(e.kill ? "kill" : e.hs ? "head" : "body");
        if (!e.kill) sfx.hit(e.hs);
      },
      hurt: (e) => {
        sfx.hurt();
        mhud.hurt(e.from, game.me.x, game.me.z, game.controls.yaw);
      },
      roster: (r) => mhud.setRoster(r),
      end: (e) => {
        mhud.end(e);
        subs.pa(e.winner < 0 ? "The sale has ended in a tie. Nobody gets the TV." : `The sale has ended. ${TEAMS[e.winner].name} take home the doorbusters.`);
      },
      start: () => {
        mhud.start();
        pa.reset();
      },
      closed: (reason) => {
        status = `Disconnected: ${reason}`;
      },
    });
    exposed.net = net;
    try {
      await net.join(choice.name, choice.char);
    } catch (e) {
      status = `Could not reach the server (${(e as Error).message || e}). Try practice mode.`;
      if (auto) throw e;
      continue;
    }
    mhud.myId = net.welcome.id;
    mhud.killTarget = net.welcome.killTarget;
    mhud.setRoster(net.roster);
    const blips: Blip[] = [];
    game.onFrame.push((dt) => {
      const me = game.me;
      hud.update(me, net.hp);
      hud.crosshair.update(dt, me, weapons.spread(me), weapons.fov, weapons.fov < 40, weapons.steady, weapons.steadying);
      mhud.update(dt, net.scores, net.timeLeft, me.alive, net.respawnIn, net.hp);
      blips.length = 0;
      const now = performance.now();
      const team = net.myTeam;
      for (const [id, p] of net.poses) {
        const r = net.roster.find((e) => e.id === id);
        if (!r) continue;
        const enemy = r.team !== team;
        // Enemies show up for 2 s after they fire.
        if (enemy && now - (net.lastShot.get(id) ?? -1e9) > 2000) continue;
        blips.push({ x: p.x, z: p.z, kind: enemy ? 1 : 0, floor: p.y > 3 ? 1 : 0, flags: p.flags });
      }
      minimap.update(me.x, me.y, me.z, game.controls.yaw, blips);
      if (net.phase === 0 && net.timeLeft > 0) pa.update(net.timeLeft, net.scores, net.welcome.killTarget, [TEAMS[0].name, TEAMS[1].name]);
    });
    if (!auto) {
      prompt.hidden = false;
      game.controls.lock();
    }
    return;
  }
}
