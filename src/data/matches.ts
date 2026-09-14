import { udmMatches } from "@/data/matches-udm";
import { basketAMatches } from "@/data/matches-basket-a";
import { restoMatches } from "@/data/matches-resto";
import type { Match } from "@/lib/types";

export const matches: Match[] = [
  ...udmMatches,
  ...basketAMatches,
  ...restoMatches,
];

export const matchById = Object.fromEntries(matches.map((m) => [m.id, m])) as Record<
  string,
  Match
>;
