export type SquadPos = "POR" | "DEF" | "MED" | "DEL" | "STAFF";

export type SquadPlayer = {
  num?: number;
  name: string;
  pos: SquadPos;
  role?: string;
};

export type TeamSquad = {
  season: string;
  source: { label: string; href: string };
  note?: string;
  players: SquadPlayer[];
};

const POS_ORDER: SquadPos[] = ["POR", "DEF", "MED", "DEL", "STAFF"];

export const POS_LABEL: Record<SquadPos, string> = {
  POR: "Porteros",
  DEF: "Defensas",
  MED: "Centrocampistas",
  DEL: "Delanteros",
  STAFF: "Cuerpo técnico",
};

/** Plantilla 2026/27 (oficial UD Melilla). Estilo listado BeSoccer. */
export const SQUADS: Record<string, TeamSquad> = {
  "ud-melilla": {
    season: "2026/27",
    source: {
      label: "UD Melilla · BeSoccer",
      href: "https://es.besoccer.com/equipo/plantilla/melilla",
    },
    note: "Plantilla 2026/27 publicada por el club. BeSoccer aún muestra sobre todo la temporada anterior.",
    players: [
      { num: 1, name: "Miguel De la Osa", pos: "POR" },
      { num: 13, name: "Óscar", pos: "POR" },
      { num: 2, name: "Fran Bueno", pos: "DEF" },
      { num: 3, name: "Antonio Poo", pos: "DEF" },
      { num: 4, name: "Ussama", pos: "DEF" },
      { num: 5, name: "Armenteros", pos: "DEF" },
      { num: 15, name: "De la Cruz", pos: "DEF" },
      { num: 20, name: "Alejandro", pos: "DEF" },
      { num: 27, name: "Dani Martínez", pos: "DEF" },
      { num: 6, name: "David Díaz", pos: "MED" },
      { num: 8, name: "Alberto Escudero", pos: "MED" },
      { num: 14, name: "Ayoub", pos: "MED" },
      { num: 16, name: "Alberto", pos: "MED" },
      { num: 24, name: "Konaté", pos: "MED" },
      { num: 7, name: "Robinho", pos: "DEL" },
      { num: 9, name: "Ayoub Al Azami", pos: "DEL" },
      { num: 10, name: "Elliot", pos: "DEL" },
      { num: 11, name: "Adri Nágera", pos: "DEL" },
      { num: 17, name: "Jairo", pos: "DEL" },
      { num: 19, name: "Adil", pos: "DEL" },
      { num: 21, name: "Naim Trujillo", pos: "DEL" },
      { num: 22, name: "Zaki", pos: "DEL" },
    ],
  },
};

export function getSquad(teamId: string): TeamSquad | undefined {
  return SQUADS[teamId];
}

export function groupSquad(squad: TeamSquad): Array<{ pos: SquadPos; label: string; players: SquadPlayer[] }> {
  return POS_ORDER.map((pos) => ({
    pos,
    label: POS_LABEL[pos],
    players: squad.players.filter((p) => p.pos === pos),
  })).filter((g) => g.players.length > 0);
}
