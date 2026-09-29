import type { AdminOverride } from "@/lib/admin/types";
import type { CatalogMatch, CatalogTeam } from "@/lib/catalog/types";
import type { MatchEvent, MatchStatus, Sport, StandingRow } from "@/lib/types";

export type ApiEvent = {
  externalId: string;
  sport: Sport;
  leagueId: string;
  leagueName: string;
  isCup: boolean;
  venue: string;
  jornada: number;
  homeId?: string;
  homeName: string;
  homeShort: string;
  homeBadge?: string;
  awayId?: string;
  awayName: string;
  awayShort: string;
  awayBadge?: string;
  kickoff: string;
  status: MatchStatus;
  minute: number;
  homeScore: number;
  awayScore: number;
  displayClock: string;
  period: string;
  events: MatchEvent[];
  duration: number;
};

export type LiveSnapshot = {
  fetchedAt: number;
  ok: boolean;
  error?: string;
  events: ApiEvent[];
  tables: Record<string, StandingRow[]>;
  overrides?: AdminOverride[];
  catalogTeams?: CatalogTeam[];
  catalogMatches?: CatalogMatch[];
};
