export interface CharacterDef {
  id: number;
  name: string;
  short: string;
  tagline: string;
}

export const CHARACTERS: CharacterDef[] = [
  { id: 0, name: "Coupon Carol", short: "Carol", tagline: "Forty pounds of coupons and a folding chair." },
  { id: 1, name: "Doorbuster Doug", short: "Doug", tagline: "Camped since Thursday. Brought a cooler." },
  { id: 2, name: "Influencer Izzy", short: "Izzy", tagline: "Streaming the whole thing. Smash that like." },
];

export const BOT_NAMES = [
  "Bargain Barb", "Rollback Ron", "Layaway Lou", "Clearance Clara", "Penny Pete", "Rebate Rita",
  "Markdown Mike", "Sale Sally", "Coupon Cody", "Thrifty Theo", "Discount Dave", "Haggle Hank",
  "Wholesale Wendy", "Receipt Rhonda", "Price-Match Pam", "Outlet Otis", "Bulk Bob", "Doorbell Dot",
  "Aisle Al", "Cartwheel Carl",
];
