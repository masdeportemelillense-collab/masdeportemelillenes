import { matchesPartA } from "@/data/matches-part-a";
import { matchesPartB } from "@/data/matches-part-b";
import type { Match } from "@/lib/types";

export const matches: Match[] = [
  ...matchesPartA,
  ...matchesPartB,
];

export const matchById = Object.fromEntries(matches.map((m) => [m.id, m])) as Record<
  string,
  Match
>;
