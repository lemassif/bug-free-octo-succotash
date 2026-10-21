import { Room, type Client } from "@colyseus/core";
import { DT, MAX_PLAYERS, Match, buildMall, cleanName, type Input, type JoinOptions, type Welcome } from "@bfb/shared";

interface Seat { id: number }

/** One 7v7 match. The room only moves messages; Match holds the rules. */
export class TdmRoom extends Room {
  maxClients = MAX_PLAYERS;
  private match!: Match;
  private seats = new Map<string, Seat>();

  onCreate(options: { bots?: boolean }) {
    this.match = new Match(buildMall(), { botFill: options?.bots !== false });
    if (process.env.BFB_TEST === "1") {
      // Playtest hook only: lets the automated 2-tab test stage a duel.
      this.onMessage("tp", (client, a: number[]) => {
        const seat = this.seats.get(client.sessionId);
        if (seat && Array.isArray(a) && a.length === 4 && a.every(Number.isFinite)) this.match.teleport(seat.id, a[0], a[1], a[2], a[3]);
      });
    }
    this.autoDispose = true;
    this.setSimulationInterval(() => this.update(), DT * 1000);
    this.onMessage("in", (client, inputs: Input[]) => {
      const seat = this.seats.get(client.sessionId);
      if (seat && Array.isArray(inputs)) this.match.queueInputs(seat.id, inputs.slice(0, 16));
    });
    this.onMessage("ping", (client, t: number) => client.send("pong", t));
    // Clients say hello once their message handlers are ready.
    this.onMessage("hello", (client) => {
      const seat = this.seats.get(client.sessionId);
      const p = seat && this.match.players.get(seat.id);
      if (!p) return;
      const welcome: Welcome = { id: p.id, team: p.team, map: "mall", killTarget: this.match.killTarget };
      client.send("roster", this.match.roster());
      client.send("welcome", welcome);
    });
  }

  onJoin(client: Client, options: Partial<JoinOptions>) {
    const p = this.match.addHuman(cleanName(options?.name), Number(options?.char) || 0);
    this.seats.set(client.sessionId, { id: p.id });
  }

  onLeave(client: Client) {
    const seat = this.seats.get(client.sessionId);
    if (seat) this.match.remove(seat.id);
    this.seats.delete(client.sessionId);
  }

  private update() {
    const m = this.match;
    m.step();
    for (const o of m.drainEvents()) {
      if (o.to === "all") this.broadcast(o.ev.type, o.ev.data);
      else {
        const c = this.clientFor(o.to);
        if (c) c.send(o.ev.type, o.ev.data);
      }
    }
    if (m.snapshotDue) {
      const snaps = m.snapshots([...this.seats.values()].map((s) => s.id));
      for (const c of this.clients) {
        const seat = this.seats.get(c.sessionId);
        const snap = seat && snaps.get(seat.id);
        if (snap) c.send("s", snap);
      }
    }
  }

  private clientFor(id: number): Client | undefined {
    for (const c of this.clients) if (this.seats.get(c.sessionId)?.id === id) return c;
    return undefined;
  }
}
