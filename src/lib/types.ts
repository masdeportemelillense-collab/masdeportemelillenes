export type Sport =
  | "futbol"
  | "baloncesto"
  | "voleibol"
  | "balonmano"
  | "futsal"
  | "bsr";

export type Gender = "m" | "f" | "mixto";

export type MatchStatus = "scheduled" | "live" | "finished";

export type EventKind =
  | "gol"
  | "gol_pp"
  | "amarilla"
  | "roja"
  | "punto"
  | "set"
  | "periodo"
  | "tiempo";

export type Side = "home" | "away";

export type Team = {
  id: string;
  name: string;
  short: string;
  sport: Sport;
  gender: Gender;
  category: string;
  leagueId: string;
  venue: string;
  founded: number;
  primary: string;
  secondary: string;
  nickname: string;
  summary: string;
};

export type LeagueTeam = {
  id?: string;
  name: string;
  short: string;
};

export type League = {
  id: string;
  name: string;
  shortName: string;
  sport: Sport;
  scoring: "football" | "basket" | "volley";
  format?: "league" | "cup";
  teams: LeagueTeam[];
};

export type MatchEvent = {
  minute: number;
  side: Side;
  kind: EventKind;
  player: string;
  homeScore: number;
  awayScore: number;
  note?: string;
};

export type Match = {
  id: string;
  leagueId: string;
  sport: Sport;
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
  /** Absolute kickoff, or ignored when liveElapsed is set. */
  kickoff: string;
  /** If set, the match is always shown live at this elapsed minute. */
  liveElapsed?: number;
  events: MatchEvent[];
  duration: number;
  periodLabel?: string;
  source?: "catalog" | "api";
  externalId?: string;
  isCup?: boolean;
  competition?: string;
};

export type StandingRow = {
  pos: number;
  teamId?: string;
  name: string;
  short: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  pts: number;
  form: Array<"W" | "D" | "L">;
};

export type ResolvedMatch = Match & {
  status: MatchStatus;
  minute: number;
  homeScore: number;
  awayScore: number;
  displayClock: string;
  happened: MatchEvent[];
  period: string;
};
