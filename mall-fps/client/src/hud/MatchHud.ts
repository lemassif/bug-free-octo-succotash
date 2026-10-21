import { CHARACTERS, TEAMS, WEAPONS, type EndEvent, type KillEvent, type RosterEntry } from "@bfb/shared";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function clock(sec: number) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Match-level HUD: scores and clock, kill feed, personal score popups,
 *  damage direction, respawn countdown, Tab scoreboard, end screen. */
export class MatchHud {
  private top = document.createElement("div");
  private feed = document.createElement("div");
  private popups = document.createElement("div");
  private dmg = document.createElement("div");
  private vignette = document.createElement("div");
  private dead = document.createElement("div");
  private board = document.createElement("div");
  private endEl = document.createElement("div");
  private roster = new Map<number, RosterEntry>();
  private lastTop = "";
  private hurtT = 0;
  private endAt = 0;
  myId = 0;
  myTeam = 0;
  killTarget = 50;

  constructor(root: HTMLElement) {
    this.top.className = "topbar";
    this.feed.className = "killfeed";
    this.popups.className = "popups";
    this.dmg.className = "dmg-dir";
    this.vignette.className = "vignette";
    this.dead.className = "deadmsg";
    this.board.className = "scoreboard";
    this.endEl.className = "endscreen";
    this.board.hidden = this.dead.hidden = this.endEl.hidden = true;
    root.append(this.vignette, this.dmg, this.top, this.feed, this.popups, this.dead, this.board, this.endEl);
    addEventListener("keydown", (e) => {
      if (e.code === "Tab") { e.preventDefault(); this.board.hidden = false; this.renderBoard(); }
    });
    addEventListener("keyup", (e) => {
      if (e.code === "Tab") this.board.hidden = true;
    });
  }

  setRoster(r: RosterEntry[]) {
    this.roster = new Map(r.map((e) => [e.id, e]));
    const me = this.roster.get(this.myId);
    if (me) this.myTeam = me.team;
    if (!this.board.hidden) this.renderBoard();
  }

  name(id: number | null) {
    return id === null ? "" : this.roster.get(id)?.name ?? "?";
  }

  update(dt: number, scores: [number, number], timeLeft: number, alive: boolean, respawnIn: number, hp: number) {
    const mine = this.myTeam, other = 1 - mine;
    const key = `${scores}|${Math.ceil(timeLeft)}|${mine}`;
    if (key !== this.lastTop) {
      this.lastTop = key;
      const side = (t: number) => `<div class="tb-team t${t} ${t === mine ? "mine" : ""}"><span class="tb-name">${TEAMS[t].name}</span><b>${scores[t]}</b></div>`;
      this.top.innerHTML = `${side(mine)}<div class="tb-clock"><b class="${timeLeft < 60 ? "hurry" : ""}">${clock(timeLeft)}</b><span>FIRST TO ${this.killTarget}</span></div>${side(other)}`;
    }
    this.dead.hidden = alive;
    if (!alive) this.dead.innerHTML = `<b>KNOCKED OUT</b><span>Back in stock in ${respawnIn.toFixed(1)} s</span>`;
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.dmg.style.opacity = String(Math.min(1, this.hurtT * 2));
    this.vignette.style.opacity = String(Math.max(this.hurtT * 0.8, alive ? (1 - hp / 100) * 0.7 * (hp < 50 ? 1 : 0) : 0));
    if (!this.endEl.hidden && this.endAt) {
      const s = this.endEl.querySelector(".end-next");
      if (s) s.textContent = `Next sale starts in ${Math.max(0, Math.ceil((this.endAt - performance.now()) / 1000))} s`;
    }
  }

  /** Red arc pointing toward whoever hit you. */
  hurt(from: [number, number] | null, myX: number, myZ: number, myYaw: number) {
    this.hurtT = 0.9;
    if (!from) return;
    const ang = Math.atan2(-(from[0] - myX), -(from[1] - myZ)) - myYaw;
    this.dmg.style.transform = `translate(-50%, -50%) rotate(${-ang}rad)`;
  }

  kill(e: KillEvent) {
    const killer = e.k !== null ? this.roster.get(e.k) : undefined;
    const victim = this.roster.get(e.v);
    const mineKill = e.k === this.myId, mineDeath = e.v === this.myId;
    const row = document.createElement("div");
    row.className = `kf-row ${mineKill ? "me" : ""} ${mineDeath ? "dead" : ""}`;
    const w = WEAPONS[e.w]?.short ?? "";
    const kTeam = killer ? `t${killer.team}` : "";
    const vTeam = victim ? `t${victim.team}` : "";
    const top = killer
      ? `<span class="kf-name ${kTeam}">${esc(killer.name)}</span><span class="kf-w">${w}${e.hs ? " ◎" : ""}</span><span class="kf-name ${vTeam}">${esc(victim?.name ?? "?")}</span>`
      : `<span class="kf-name ${vTeam}">${esc(victim?.name ?? "?")}</span><span class="kf-w">tripped over a pallet</span>`;
    const labels = e.labels.map((l) => `<span class="kf-label">${esc(l[0])} <b>+${l[1]}</b></span>`).join("");
    row.innerHTML = `<div class="kf-top">${top}</div>${labels ? `<div class="kf-labels">${labels}</div>` : ""}`;
    this.feed.prepend(row);
    while (this.feed.children.length > 6) this.feed.lastElementChild!.remove();
    setTimeout(() => row.classList.add("fade"), 7000);
    setTimeout(() => row.remove(), 8000);
    if (mineKill) this.popup(e.labels);
  }

  /** Personal score popups under the crosshair. */
  private popup(labels: [string, number][]) {
    labels.forEach((l, i) => {
      const p = document.createElement("div");
      p.className = "popup";
      p.style.animationDelay = `${i * 0.12}s`;
      p.innerHTML = `${esc(l[0])} <b>+${l[1]}</b>`;
      this.popups.appendChild(p);
      setTimeout(() => p.remove(), 2600 + i * 120);
    });
  }

  private renderBoard() {
    const rows = (t: number) => [...this.roster.values()].filter((r) => r.team === t).sort((a, b) => b.pts - a.pts || b.k - a.k)
      .map((r) => `<tr class="${r.id === this.myId ? "me" : ""}"><td>${esc(r.name)}${r.bot ? ' <i>bot</i>' : ""}</td><td>${CHARACTERS[r.char]?.short ?? ""}</td><td>${r.k}</td><td>${r.d}</td><td>${r.pts}</td></tr>`).join("");
    this.board.innerHTML = [0, 1].map((t) => `<div class="sb-team t${t}"><h3>${TEAMS[t].name}</h3><table><tr><th>Shopper</th><th></th><th>K</th><th>D</th><th>Pts</th></tr>${rows(t)}</table></div>`).join("");
  }

  end(e: EndEvent) {
    const mvp = e.mvp !== null ? this.roster.get(e.mvp) : undefined;
    const title = e.winner < 0 ? "IT'S A TIE" : e.winner === this.myTeam ? "YOU WIN THE SALE" : "SOLD OUT";
    const sub = e.winner < 0 ? "Everyone leaves with a receipt and regrets." : `${TEAMS[e.winner].name} cleaned out the mall.`;
    this.endEl.innerHTML = `<div class="end-card"><h2>${title}</h2><p>${sub}</p>
      <div class="end-score"><span class="t0">${TEAMS[0].name} ${e.sc[0]}</span> · <span class="t1">${e.sc[1]} ${TEAMS[1].name}</span></div>
      ${mvp ? `<div class="end-mvp">Shopper of the day: <b>${esc(mvp.name)}</b> (${mvp.pts} pts)</div>` : ""}
      <div class="end-next"></div></div>`;
    this.endAt = performance.now() + e.next * 1000;
    this.endEl.hidden = false;
  }

  start() {
    this.endEl.hidden = true;
    this.feed.innerHTML = "";
  }
}
