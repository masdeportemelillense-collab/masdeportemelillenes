import type { Gender, Match, Sport, Team } from "@/lib/types";

export type CatalogTeam = Team & {
  badgeUrl?: string;
  hidden?: boolean;
  updatedAt: number;
};

export type CatalogMatch = Match & {
  homeBadge?: string;
  awayBadge?: string;
  updatedAt: number;
};

export type CatalogState = {
  teams: CatalogTeam[];
  matches: CatalogMatch[];
};

export type TeamDraft = {
  id?: string;
  name: string;
  short: string;
  sport: Sport;
  gender: Gender;
  category: string;
  leagueId: string;
  venue: string;
  founded: string;
  summary: string;
  nickname: string;
  badgeUrl: string;
};

export type MatchDraft = {
  id?: string;
  leagueId: string;
  sport: Sport;
  venue: string;
  jornada: string;
  kickoff: string;
  homeId: string;
  homeName: string;
  homeShort: string;
  homeBadge: string;
  awayId: string;
  awayName: string;
  awayShort: string;
  awayBadge: string;
  homeScore: string;
  awayScore: string;
  finished: boolean;
};
