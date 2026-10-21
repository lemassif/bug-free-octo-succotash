const VOICES = [
  { pitch: 1.25, rate: 1.05 },
  { pitch: 0.7, rate: 0.95 },
  { pitch: 1.5, rate: 1.2 },
];

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Bottom-center subtitles for knockout lines and mall PA announcements.
 *  Optional read-aloud uses the browser's speech voices (V toggles it). */
export class Subtitles {
  private el = document.createElement("div");
  private speak = false;
  private toast = document.createElement("div");

  constructor(root: HTMLElement) {
    this.el.className = "subs";
    this.toast.className = "subs-toast";
    root.append(this.el, this.toast);
    try { this.speak = localStorage.getItem("bfb.speak") === "1"; } catch { /* ignore */ }
    addEventListener("keydown", (e) => {
      if (e.code !== "KeyV" || e.repeat) return;
      this.speak = !this.speak;
      try { localStorage.setItem("bfb.speak", this.speak ? "1" : "0"); } catch { /* ignore */ }
      this.toast.textContent = this.speak ? "Voice lines: read aloud (V)" : "Voice lines: subtitles only (V)";
      this.toast.classList.remove("show");
      void this.toast.offsetWidth;
      this.toast.classList.add("show");
    });
  }

  /** A shopper's line. `mine` lines (your knockouts and your deaths) are
   *  highlighted and are the only ones read aloud. */
  line(char: number, who: string, text: string, mine: boolean) {
    this.push(`<span class="subs-who">${esc(who)}:</span> ${esc(text)}`, mine ? "mine" : "");
    if (mine && this.speak && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      const v = VOICES[char] ?? VOICES[0];
      u.pitch = v.pitch;
      u.rate = v.rate;
      u.volume = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    }
  }

  pa(text: string) {
    this.push(`<span class="subs-who pa">MALL PA:</span> ${esc(text)}`, "pa");
  }

  private push(html: string, cls: string) {
    const row = document.createElement("div");
    row.className = `subs-row ${cls}`;
    row.innerHTML = html;
    this.el.appendChild(row);
    while (this.el.children.length > 2) this.el.firstElementChild!.remove();
    setTimeout(() => row.classList.add("out"), cls === "mine" ? 3600 : 2800);
    setTimeout(() => row.remove(), cls === "mine" ? 4100 : 3300);
  }
}

/** Announcements over the mall PA, triggered by the clock and the score. */
export class MallPA {
  private said = new Set<string>();
  constructor(private subs: Subtitles) {}

  reset() {
    this.said.clear();
  }

  update(timeLeft: number, scores: [number, number], target: number, names: [string, string]) {
    const once = (key: string, text: string) => {
      if (this.said.has(key)) return;
      this.said.add(key);
      this.subs.pa(text);
    };
    if (timeLeft > 595) once("start", "Attention shoppers: the Black Friday sale is now open. Please fight responsibly.");
    if (timeLeft <= 300 && timeLeft > 295) once("5min", "Five minutes left in the sale. Pretzels are half price, and so is your dignity.");
    if (timeLeft <= 60 && timeLeft > 55) once("1min", "One minute left. Please make your way to a register or a respawn point.");
    for (const t of [0, 1]) if (scores[t] >= target - 10 && scores[t] < target) once(`close${t}`, `${names[t]} need ${target - scores[t]} more. Will a manager please come to the atrium.`);
  }
}
