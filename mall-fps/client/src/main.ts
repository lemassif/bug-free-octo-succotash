import "./style.css";
import { buildGym } from "@bfb/shared";
import { Game } from "./game/Game.ts";

const params = new URLSearchParams(location.search);
const ui = document.getElementById("ui")!;
const canvas = document.getElementById("game") as HTMLCanvasElement;

const game = new Game(canvas, { map: buildGym() });
(window as unknown as { __bfb: unknown }).__bfb = { game };

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
prompt.textContent = "Click to play. WASD move, Shift sprint, Space jump.";
prompt.addEventListener("click", () => game.controls.lock());
ui.appendChild(prompt);
game.controls.onLockChange = (locked) => (prompt.hidden = locked);

game.start();
