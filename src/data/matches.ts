import { udmMatches } from "@/data/matches-udm";
import { basketAMatches } from "@/data/matches-basket-a";
import { restoMatches } from "@/data/matches-resto";
import { juvMatches } from "@/data/matches-juv";
import type { Match } from "@/lib/types";

export const matches: Match[] = [
  ...udmMatches,
  ...juvMatches,
  ...basketAMatches,
  ...restoMatches,
];

export const matchById = Object.fromEntries(matches.map((m) => [m.id, m])) as Record<
  string,
  Match
>;
