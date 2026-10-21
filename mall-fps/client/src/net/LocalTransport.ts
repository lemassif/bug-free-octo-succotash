import { DT, Match, buildMall, type Input, type JoinOptions, type Welcome } from "@bfb/shared";
import { Emitter, type Handler, type Transport } from "./transport.ts";

/** Runs the authoritative match inside this tab, against bots. An optional
 *  fake latency (ms, round trip) exercises prediction exactly like online. */
export class LocalTransport implements Transport {
  readonly kind = "local";
  // ?target=N shortens practice matches (handy for testing the end screen).
  readonly match = new Match(buildMall(), { killTarget: Number(new URLSearchParams(location.search).get("target")) || undefined });
  private ev = new Emitter();
  private id = 0;
  private timer = 0;
  private acc = 0;
  private last = 0;
  onClose: (reason: string) => void = () => {};

  constructor(private lagMs = 0) {}

  async connect(opts: JoinOptions): Promise<Welcome> {
    const p = this.match.addHuman(opts.name, opts.char);
    this.id = p.id;
    this.last = performance.now();
    this.timer = window.setInterval(() => this.pump(), 8);
    const w: Welcome = { id: p.id, team: p.team, map: "mall", killTarget: this.match.killTarget };
    this.deliver("roster", this.match.roster());
    return w;
  }

  private pump() {
    const now = performance.now();
    this.acc += Math.min(250, now - this.last);
    this.last = now;
    while (this.acc >= DT * 1000) {
      this.acc -= DT * 1000;
      const m = this.match;
      m.step();
      for (const o of m.drainEvents()) if (o.to === "all" || o.to === this.id) this.deliver(o.ev.type, o.ev.data);
      if (m.snapshotDue) this.deliver("s", m.snapshots([this.id]).get(this.id));
    }
  }

  private deliver(type: string, data: unknown) {
    if (this.lagMs > 0) setTimeout(() => this.ev.emit(type, data), this.lagMs / 2);
    else this.ev.emit(type, data);
  }

  send(inputs: Input[]) {
    const copy = inputs.map((i) => ({ ...i }));
    if (this.lagMs > 0) setTimeout(() => this.match.queueInputs(this.id, copy), this.lagMs / 2);
    else this.match.queueInputs(this.id, copy);
  }

  on(type: string, h: Handler) {
    this.ev.on(type, h);
  }

  close() {
    clearInterval(this.timer);
  }
}
