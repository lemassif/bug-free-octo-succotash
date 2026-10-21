// Kill-feed labels and points. Every knockout gets a base label; bonuses
// stack on top. Keep labels short: they share a line in the kill feed.

export interface KillContext {
  victimName: string;
  weapon: number;
  headshot: boolean;
  distance: number;
  /** Knockouts by the killer within the multi-kill window, including this one. */
  multi: number;
  /** Killer's streak after this knockout. */
  streak: number;
  victimStreak: number;
  revenge: boolean;
  firstBlood: boolean;
  killerAirborne: boolean;
  victimReloading: boolean;
  killerHp: number;
  inOffice: boolean;
}

export type Label = [text: string, points: number];

const BASE_VERBS = ["Dismissed", "Marked down", "Rang up", "Price-checked", "Returned", "Clearanced", "Bagged", "Restocked"];

export const MULTI_WINDOW_MS = 4000;

export function killLabels(c: KillContext, rand: () => number = Math.random): Label[] {
  const verb = c.weapon === 1 && rand() < 0.5 ? "Dismissed" : BASE_VERBS[Math.floor(rand() * BASE_VERBS.length)];
  const out: Label[] = [[`${verb} ${c.victimName}`, 100]];
  if (c.firstBlood) out.push(["Early bird special", 100]);
  if (c.headshot) out.push(["Doorbuster", 50]);
  if (c.multi === 2) out.push(["Two for one", 50]);
  else if (c.multi === 3) out.push(["Buy two, get one free", 100]);
  else if (c.multi >= 4) out.push(["Clearance event", 150]);
  if (c.victimStreak >= 3) out.push(["Sale's over", 75]);
  if (c.revenge) out.push(["Exchange accepted", 50]);
  if (c.distance >= 35) out.push(["Curbside pickup", 50]);
  if (c.inOffice) out.push(["Spoke to the manager", 50]);
  if (c.victimReloading) out.push(["Out of stock", 25]);
  if (c.killerAirborne) out.push(["Price drop", 25]);
  if (c.killerHp > 0 && c.killerHp <= 25) out.push(["Last one on the shelf", 50]);
  if (c.streak === 5) out.push(["Rewards member", 100]);
  else if (c.streak === 10) out.push(["Platinum rewards", 200]);
  return out;
}
