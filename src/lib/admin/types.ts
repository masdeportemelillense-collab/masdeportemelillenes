import type { MatchStatus } from "@/lib/types";

export type AdminOverride = {
  matchId: string;
  homeScore?: number;
  awayScore?: number;
  status?: MatchStatus;
  kickoff?: string;
  venue?: string;
  jornada?: number;
  homeName?: string;
  awayName?: string;
  minute?: number;
  note?: string;
  deleted?: boolean;
  updatedAt: number;
};
