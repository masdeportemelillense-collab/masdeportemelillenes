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
  /** If true, the public site shows a running MM:SS clock. */
  showClock?: boolean;
  /** Epoch ms when the current period clock started. */
  clockAnchorAt?: number;
  /** Minutes already on the clock when the current period started. */
  clockBaseMinute?: number;
  note?: string;
  events?: MatchEvent[];
  /** Voleibol: puntos del set en juego. */
  pointHome?: number;
  pointAway?: number;
  /** Voleibol: marcador de cada set cerrado. */
  setScores?: { home: number; away: number }[];
  deleted?: boolean;
  updatedAt: number;
};
