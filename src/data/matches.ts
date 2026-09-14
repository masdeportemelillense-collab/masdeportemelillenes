import { udmMatches } from "@/data/matches-udm";
import { futbolBaseMatches } from "@/data/matches-futbol-base";
import { basketMatches } from "@/data/matches-basket";
import { restoMatches } from "@/data/matches-resto";
import type { Match } from "@/lib/types";

export const matches: Match[] = [
  ...udmMatches,
  ...futbolBaseMatches,
  ...basketMatches,
  ...restoMatches,
];

export const matchById = Object.fromEntries(matches.map((m) => [m.id, m])) as Record<
  string,
  Match
>;
