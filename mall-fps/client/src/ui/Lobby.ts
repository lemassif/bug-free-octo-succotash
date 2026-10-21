import { CHARACTERS } from "@bfb/shared";

export interface LobbyChoice {
  name: string;
  char: number;
  mode: "online" | "local";
}

function load<T>(k: string, d: T): T {
  try {
    const v = localStorage.getItem(k);
    return v === null ? d : (JSON.parse(v) as T);
  } catch {
    return d;
  }
}
function save(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ }
}

/** Title screen: pick a name and a shopper, then play online or practice. */
export function showLobby(root: HTMLElement, status = ""): Promise<LobbyChoice> {
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.className = "lobby interactive";
    let char = load("bfb.char", 0);
    el.innerHTML = `
      <div class="lobby-card">
        <div class="lobby-kicker">DOORBUSTER MALL · 7v7 TEAM DEATHMATCH</div>
        <h1>BLACK FRIDAY <span>BRAWL</span></h1>
        <p class="lobby-sub">First team to 50 knockouts, or the most when the 10 minute sale ends.</p>
        <label class="lobby-label" for="bfb-name">Your name</label>
        <input id="bfb-name" maxlength="16" autocomplete="off" spellcheck="false" />
        <div class="lobby-label">Pick your shopper</div>
        <div class="chars">${CHARACTERS.map((c) => `<button class="char" data-c="${c.id}"><b>${c.name}</b><span>${c.tagline}</span></button>`).join("")}</div>
        <div class="lobby-actions">
          <button class="go" data-mode="online">Play online</button>
          <button class="go alt" data-mode="local">Practice vs bots</button>
        </div>
        <div class="lobby-status">${status}</div>
        <div class="lobby-help">WASD move · Shift sprint · Space jump · Mouse fire · Right mouse scope (Shift steadies) · R reload · 1/2 or wheel weapons · Tab scores</div>
      </div>`;
    root.appendChild(el);
    const name = el.querySelector<HTMLInputElement>("#bfb-name")!;
    name.value = load("bfb.name", "");
    const paint = () => el.querySelectorAll<HTMLElement>(".char").forEach((b) => b.classList.toggle("on", Number(b.dataset.c) === char));
    paint();
    el.querySelectorAll<HTMLElement>(".char").forEach((b) => b.addEventListener("click", () => { char = Number(b.dataset.c); paint(); }));
    el.querySelectorAll<HTMLButtonElement>(".go").forEach((b) =>
      b.addEventListener("click", () => {
        const n = name.value.trim() || `Shopper ${Math.floor(Math.random() * 900 + 100)}`;
        save("bfb.name", n);
        save("bfb.char", char);
        el.remove();
        resolve({ name: n, char, mode: b.dataset.mode as "online" | "local" });
      }),
    );
  });
}
