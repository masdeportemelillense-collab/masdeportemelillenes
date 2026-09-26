import type { MatchEvent, MatchStatus } from "@/lib/types";

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
  periodLabel?: string;
  /** Epoch ms when the current period clock started. */
  clockAnchorAt?: number;
  /** Minutes already on the clock when the current period started. */
  clockBaseMinute?: number;
  note?: string;
  events?: MatchEvent[];
  deleted?: boolean;
  updatedAt: number;
};
