export type Quiniela = "1" | "X" | "2";

export type PorraMatch = {
  id: string;
  home: string;
  away: string;
  kickoff?: string;
  result?: Quiniela | null;
  /** Si es false, solo se pronostica 1 o 2 (baloncesto, voleibol...). */
  allowDraw?: boolean;
};

export type PorraSlate = {
  id: string;
  title: string;
  /** ISO instant. After this, picks are frozen. Default: Friday 17:00 Europe/Madrid. */
  lockAt: string;
  matches: PorraMatch[];
  createdAt: number;
  published: boolean;
};

export type PorraUserPublic = {
  id: string;
  name: string;
  avatar?: string;
};

export type PorraUser = PorraUserPublic & {
  pass: string;
  createdAt: number;
};

export type PorraPick = {
  userId: string;
  slateId: string;
  matchId: string;
  pick: Quiniela;
  updatedAt: number;
};

export type PorraBoardRow = {
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  played: number;
  correct: number;
};

export type PorraJornadaSummary = {
  slateId: string;
  title: string;
  createdAt: number;
  resolved: number;
  total: number;
  finished: boolean;
  board: PorraBoardRow[];
  winners: PorraBoardRow[];
};

export type PorraPublicState = {
  now: number;
  user: PorraUserPublic | null;
  slates: PorraSlate[];
  myPicks: PorraPick[];
  board: PorraBoardRow[];
  jornadas: PorraJornadaSummary[];
};
