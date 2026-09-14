import { futbolMatches } from "@/data/matches-futbol";
import { basketAMatches } from "@/data/matches-basket-a";
import { basketBMatches } from "@/data/matches-basket-b";
import { restoMatches } from "@/data/matches-resto";
import type { Match } from "@/lib/types";

export const matches: Match[] = [
  ...futbolMatches,
  ...basketAMatches,
  ...basketBMatches,
  ...restoMatches,
];

export const matchById = Object.fromEntries(matches.map((m) => [m.id, m])) as Record<
  string,
  Match
>;
