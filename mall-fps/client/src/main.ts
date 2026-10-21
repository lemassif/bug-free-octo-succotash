import "./style.css";
import { buildGym, buildMall, type KillEvent } from "@bfb/shared";
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
  for (;;) {
    const auto = params.get("autojoin");
    const choice = auto
      ? { name: params.get("name") ?? "Tester", char: Number(params.get("char") ?? 0), mode: auto as "online" | "local" }
      : await showLobby(ui, status);
    initAudio();
    const transport: Transport = choice.mode === "local" ? new LocalTransport(Number(params.get("lag") ?? 0)) : new ColyseusTransport();
    const net = new NetClient(game, weapons, transport, {
      kill: (e: KillEvent) => {
        weapons.fx.tagBurst(e.at[0], e.at[1], e.at[2]);
        if (e.k === net.welcome?.id) sfx.kill();
      },
      hit: (e) => {
        hud.crosshair.hit(e.kill ? "kill" : e.hs ? "head" : "body");
        if (!e.kill) sfx.hit(e.hs);
      },
      hurt: () => sfx.hurt(),
      roster: () => {},
      end: () => {},
      start: () => {},
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
    game.onFrame.push((dt) => {
      hud.update(game.me, net.hp);
      hud.crosshair.update(dt, game.me, weapons.spread(game.me), weapons.fov, weapons.fov < 40, weapons.steady, weapons.steadying);
    });
    if (!auto) {
      prompt.hidden = false;
      game.controls.lock();
    }
    return;
  }
}
