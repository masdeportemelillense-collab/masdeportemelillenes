export type SportKind = "futbol" | "baloncesto" | "balonmano" | "voleibol";

export type SuperUserPublic = {
  id: string;
  name: string;
  avatar?: string;
};

export type SuperUser = SuperUserPublic & {
  pass: string;
  passPlain?: string;
  createdAt: number;
};

export type SuperMatch = {
  id: string;
  home: string;
  away: string;
  sport: SportKind;
  officialHome?: number;
  officialAway?: number;
};

export type SuperJornada = {
  id: string;
  leagueId: string;
  number: number;
  slateId?: string;
  matches: SuperMatch[];
  autoFilled: boolean;
  createdAt: number;
  openAt?: string;
  closeAt?: string;
  closed?: boolean;
  closedAt?: number;
};

export type SuperPick = {
  userId: string;
  leagueId: string;
  jornadaId: string;
  matchId: string;
  home: number;
  away: number;
  updatedAt: number;
};

export type SuperLeague = {
  id: string;
  name: string;
  password: string;
  ownerId: string;
  maxParticipants: number;
  seasonStart?: string;
  jornadaOpen?: string;
  jornadaClose?: string;
  participants: string[];
  started: boolean;
  createdAt: number;
};

export type SuperFixture = {
  id: string;
  leagueId: string;
  round: number;
  homeUserId: string;
  awayUserId: string;
};

export type SuperMessage = {
  id: string;
  leagueId: string;
  userId: string;
  text: string;
  createdAt: number;
};

export type SuperAnnouncement = {
  id: string;
  leagueId: string;
  text: string;
  createdAt: number;
};

export type BoardRow = {
  userId: string;
  name: string;
  avatar?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  gc: number;
  pts: number;
};

export type FixtureView = SuperFixture & {
  homeName: string;
  awayName: string;
  homePoints?: number;
  awayPoints?: number;
  result?: "home" | "away" | "draw";
  resolved: boolean;
};

export type SuperPublic = {
  now: number;
  user: SuperUserPublic | null;
  leagues: Array<{ id: string; name: string; ownerId: string; participants: number; max: number; started: boolean; mine: boolean }>;
  league: (SuperLeague & { ownerName: string }) | null;
  isOwner: boolean;
  isWebAdmin: boolean;
  jornadas: SuperJornada[];
  picks: SuperPick[];
  rivalPicks: SuperPick[];
  predictionCount: number;
  predictionTotal: number;
  fixtures: FixtureView[];
  board: BoardRow[];
  chat: Array<SuperMessage & { name: string; avatar?: string }>;
  announcements: SuperAnnouncement[];
  slates: Array<{ id: string; title: string; createdAt: number; matches: Array<{ id: string; home: string; away: string }> }>;
  accounts?: Array<{ id: string; name: string; password: string | null }>;
  allLeagues?: Array<{ id: string; name: string; password: string; owner: string }>;
};
