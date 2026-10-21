// Tunables shared by client and server. Changing a movement value changes
// prediction on both sides at once, so they never disagree.

export const TICK_RATE = 60;
export const DT = 1 / TICK_RATE;
export const SNAPSHOT_EVERY_TICKS = 3; // 20 Hz state updates
export const TEAM_SIZE = 7;
export const MAX_PLAYERS = TEAM_SIZE * 2;
export const KILL_TARGET = 50;
export const MATCH_SECONDS = 600;
export const RESPAWN_SECONDS = 3;
export const END_SCREEN_SECONDS = 12;
export const SPAWN_PROTECT_SECONDS = 1.5;
export const MAX_HEALTH = 100;
export const REGEN_DELAY = 5;
export const REGEN_PER_SEC = 12;

export const INTERP_DELAY_MS = 100;
export const LAGCOMP_MAX_MS = 300;
export const INPUT_TIMEOUT_MS = 250;

export const PLAYER = {
  radius: 0.35,
  height: 1.8,
  eye: 1.6,
  walk: 5.2,
  sprint: 8.0,
  scoped: 2.4,
  gravity: 22,
  jump: 8.0,
  step: 0.55,
  groundRate: 12,
  airRate: 2.5,
  snapDown: 0.6,
};

export const TEAMS = [
  { id: 0, name: "Doorbusters", color: 0xe8453c, css: "#ff5a4e" },
  { id: 1, name: "Bargain Hunters", color: 0x3c8ce8, css: "#4ea2ff" },
] as const;
