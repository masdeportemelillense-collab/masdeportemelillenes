export type Quiniela = "1" | "X" | "2";

export type PorraMatch = {
  id: string;
  home: string;
  away: string;
  kickoff?: string;
  result?: Quiniela | null;
  allowDraw?: boolean;
};

export type PorraSlate = {
  id: string;
  title: string;
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
  /** Copia para que el admin pueda recuperar o reenviar la clave. */
  passPlain?: string;
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

export type PorraAccountRow = {
  id: string;
  name: string;
  avatar?: string;
  password: string | null;
  createdAt: number;
};

export type PorraPublicState = {
  now: number;
  user: PorraUserPublic | null;
  slates: PorraSlate[];
  myPicks: PorraPick[];
  board: PorraBoardRow[];
  jornadas: PorraJornadaSummary[];
};
