/** Medal colours for podium ranks; everyone else gets a neutral chip. */
const MEDALS: Record<number, { pill: string; label: string }> = {
  1: { pill: "bg-gold text-on-gold", label: "Gold" },
  2: { pill: "bg-silver text-on-silver", label: "Silver" },
  3: { pill: "bg-bronze text-on-bronze", label: "Bronze" },
};

export function rankPill(rank: number | null | undefined) {
  return (rank && MEDALS[rank]?.pill) || "bg-surface-container-high text-on-surface";
}

export function medalLabel(rank: number) {
  return MEDALS[rank]?.label ?? null;
}
