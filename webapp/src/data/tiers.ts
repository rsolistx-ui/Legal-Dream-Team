export interface Tier {
  id: number;
  name: string;
  seatIds: number[];
  // Tailwind color token for header accents.
  accent: string;
}

export const TIERS: Tier[] = [
  { id: 1, name: "Strategy and Trial", seatIds: [1, 2, 3], accent: "indigo" },
  { id: 2, name: "Texas Procedure", seatIds: [4, 5, 6, 7], accent: "sky" },
  {
    id: 3,
    name: "Evidence and Damages",
    seatIds: [8, 9, 10, 11],
    accent: "emerald",
  },
  {
    id: 4,
    name: "Resolution and Risk",
    seatIds: [12, 13, 14],
    accent: "teal",
  },
  {
    id: 5,
    name: "Hard Veto Compliance",
    seatIds: [15, 16, 17],
    accent: "red",
  },
  { id: 6, name: "Truth and Skeptic", seatIds: [18, 19], accent: "amber" },
  { id: 7, name: "Research", seatIds: [20], accent: "violet" },
  { id: 8, name: "Parallel Track", seatIds: [21], accent: "rose" },
  { id: 9, name: "Post Judgment Reserve", seatIds: [22], accent: "rose" },
];

export function getTier(seatId: number): Tier {
  const tier = TIERS.find((t) => t.seatIds.includes(seatId));
  if (!tier) throw new Error(`No tier found for seat ${seatId}`);
  return tier;
}
