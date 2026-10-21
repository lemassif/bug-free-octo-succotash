import "./style.css";
import { buildGym, buildMall } from "@bfb/shared";
import { Game } from "./game/Game.ts";
import { WeaponController } from "./game/WeaponController.ts";
import { Dummies } from "./game/Dummies.ts";
import { Hud } from "./hud/Hud.ts";
import { initAudio, sfx } from "./game/audio.ts";
import { loadBake } from "./world/loadBake.ts";
import { loadKtx2Textures } from "./world/loadTextures.ts";

const params = new URLSearchParams(location.search);
const ui = document.getElementById("ui")!;
const canvas = document.getElementById("game") as HTMLCanvasElement;

const range = params.get("map") === "gym";
const game = new Game(canvas, { map: range ? buildGym() : buildMall() });
const [bake, textures] = await Promise.all([range ? null : loadBake(), params.has("notex") ? null : loadKtx2Textures(game.renderer)]);
game.buildLevel({ baked: bake?.colors, propLight: bake?.propLight, textures: textures ?? undefined });
const weapons = new WeaponController(game);
const hud = new Hud(ui);
const dummies = new Dummies(game.scene, range ? [[0, 0, -14], [-8, 0, -16], [8, 3, -3], [14, 0, 8]] : [[-14, 0, 8], [-4, 5, 9], [-20, 0, -9]], weapons.fx);
weapons.targets = () => dummies.targets();
weapons.onShot = (hit, inp) => {
  if (!hit.target) return;
  const r = dummies.damage(hit, game.me.weapon);
  void inp;
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
(window as unknown as { __bfb: unknown }).__bfb = { game, weapons, dummies };

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
prompt.textContent = "Click to play. WASD move, Shift sprint, Space jump, mouse fire/scope, R reload, 1/2 weapons.";
prompt.addEventListener("click", () => {
  initAudio();
  game.controls.lock();
});
ui.appendChild(prompt);
game.controls.onLockChange = (locked) => (prompt.hidden = locked);

game.start();
