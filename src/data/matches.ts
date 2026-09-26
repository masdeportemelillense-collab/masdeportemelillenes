import { udmMatches } from "@/data/matches-udm";
import { basketAMatches } from "@/data/matches-basket-a";
import { restoMatches } from "@/data/matches-resto";
import { juvMatches } from "@/data/matches-juv";
import { atmMatches } from "@/data/matches-atm";
import { atmSrMatches } from "@/data/matches-atm-sr";
import { copaBskMatches } from "@/data/matches-copa-bsk";
import { boomerangMatches } from "@/data/matches-boomerang";
import type { Match } from "@/lib/types";

export const matches: Match[] = [
  ...udmMatches,
  ...juvMatches,
  ...atmMatches,
  ...atmSrMatches,
  ...basketAMatches,
  ...copaBskMatches,
  ...boomerangMatches,
  ...restoMatches,
];

export const matchById = Object.fromEntries(matches.map((m) => [m.id, m])) as Record<
  string,
  Match
>;
