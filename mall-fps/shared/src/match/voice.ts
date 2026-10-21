// Subtitle voice lines, one per knockout. Lines are grouped by the
// character who says them, plus a shared pool anyone can say.
//
// To add a line, append a string to the right list. The picker never
// plays the same line twice in a row, across the whole match.

export const VOICE_LINES: { [char: number]: string[]; any: string[] } = {
  // Coupon Carol
  0: [
    "I had a coupon for that.",
    "Sorry, sweetie. This coupon doesn't expire.",
    "Exact change. Keep the receipt.",
    "I clipped you like a Sunday circular.",
    "Limit one per customer. That was yours.",
    "I've been in line since Thursday. Move.",
    "Double coupon day, honey.",
    "You looked like a markdown to me.",
    "I'll be speaking to your manager about this.",
    "Price match THAT.",
    "I brought a folding chair and a grudge.",
    "Ooh, that's going in the scrapbook.",
  ],
  // Doorbuster Doug
  1: [
    "Doors open at five. So do I.",
    "I came for the TV. I stayed for this.",
    "That's what I call a Doug-buster.",
    "Save the receipt, pal.",
    "Sixty-five inches of pure victory.",
    "I skipped pie for this.",
    "Tell the wife I got the big one.",
    "Cart's full. You're not getting in.",
    "Back in my day we fought over VCRs.",
    "Somebody grab me a pretzel.",
    "Hope you kept the gift receipt.",
    "I've got a parking spot to get back to.",
  ],
  // Influencer Izzy
  2: [
    "Smash that like button. Oh wait, I did.",
    "This is going straight to my story.",
    "Link in bio, babe.",
    "Not sponsored. Just better.",
    "You've been unfollowed.",
    "Okay but the lighting on that was perfect.",
    "Get ready with me: winning.",
    "Ratio.",
    "This haul is SO worth it.",
    "Can we do that again? I wasn't recording.",
    "That was giving clearance rack.",
    "Ten out of ten, no notes.",
  ],
  any: [
    "Cleanup on aisle you.",
    "All sales are final.",
    "Thank you for shopping with us.",
    "No refunds. No exchanges.",
    "Attention shoppers: one fewer shopper.",
    "Your total comes to zero dollars and zero cents.",
    "Paper or plastic? Neither. You're done.",
  ],
};

export function allLines(): string[] {
  return [...VOICE_LINES[0], ...VOICE_LINES[1], ...VOICE_LINES[2], ...VOICE_LINES.any];
}

/** Picks a line for a character, never repeating the previous pick. */
export class VoicePicker {
  private last = "";
  private rand: () => number;
  constructor(rand: () => number = Math.random) {
    this.rand = rand;
  }

  pick(char: number): string {
    const own = VOICE_LINES[char] ?? [];
    // Mostly the character's own lines, sometimes a shared one.
    const pool = this.rand() < 0.75 && own.length ? own : [...own, ...VOICE_LINES.any];
    const options = pool.filter((l) => l !== this.last);
    const line = options[Math.floor(this.rand() * options.length)] ?? pool[0];
    this.last = line;
    return line;
  }

  get previous() {
    return this.last;
  }
}
