import { describe, expect, it } from "vitest";
import { Match, buildMall, allLines, VoicePicker, TEAM_SIZE, type KillEvent } from "../../shared/src/index.ts";

describe("match", () => {
  const match = new Match(buildMall(), { seed: 7 });

  it("builds a nav grid that reaches floor 2 and the escalators", () => {
    const n = match.nav;
    expect(n.nodes.length).toBeGreaterThan(1500);
    const a = n.nearest(-32, 0, 0);
    const b = n.nearest(-10, 5, 9);
    const office = n.nearest(0, 5, 18);
    expect(n.path(a, b).length).toBeGreaterThan(5);
    expect(n.path(a, office).length).toBeGreaterThan(5);
    const bridge = n.nearest(0, 5, 0);
    const p = n.path(n.nearest(-15, 0, 0), bridge);
    expect(p.length).toBeGreaterThan(3);
  });

  it("fills both teams with bots to 7v7", () => {
    expect(match.players.size).toBe(TEAM_SIZE * 2);
  });

  it("a human replaces a bot and is put on a team", () => {
    const h = match.addHuman("Rick<script>", 1);
    expect(h.name).toBe("Rickscript");
    expect(match.players.size).toBe(14);
    match.remove(h.id);
    expect(match.players.size).toBe(14);
  });

  it("bots fight: 2 simulated minutes produce knockouts with labels and lines", () => {
    let kills: KillEvent[] = [];
    const all: KillEvent[] = [];
    for (let i = 0; i < 60 * 120; i++) {
      match.step();
      if (match.snapshotDue) match.snapshots([]);
      for (const o of match.drainEvents()) {
        if (o.ev.type === "kill") { kills.push(o.ev.data); all.push(o.ev.data); }
        if (o.ev.type === "start") kills = [];
      }
    }
    const real = kills.filter((k) => k.k !== null);
    expect(all.filter((k) => k.k !== null).length).toBeGreaterThan(5);
    for (const k of real) {
      expect(k.labels[0][1]).toBe(100);
      expect(k.line).toBeTruthy();
    }
    const lines = all.filter((k) => k.k !== null).map((k) => k.line);
    for (let i = 1; i < lines.length; i++) expect(lines[i]).not.toBe(lines[i - 1]);
    expect(match.scores[0] + match.scores[1]).toBe(real.length);
  });

  it("snapshots are small", () => {
    const h = match.addHuman("Tester", 0);
    match.step();
    const snap = match.snapshots([h.id]).get(h.id)!;
    expect(snap.p.length).toBe(13);
    expect(JSON.stringify(snap).length).toBeLessThan(2000);
  });
});

describe("voice lines", () => {
  it("has 30+ lines and never repeats twice in a row", () => {
    expect(allLines().length).toBeGreaterThanOrEqual(30);
    expect(allLines().join(" ").toLowerCase()).not.toMatch(/credit|card|swipe|declined/);
    const v = new VoicePicker();
    let last = "";
    for (let i = 0; i < 2000; i++) {
      const l = v.pick(i % 3);
      expect(l).not.toBe(last);
      last = l;
    }
  });
});
