/** Escudos de lapreferente.com por id de club. */
const BASE = "https://www.lapreferente.com/imagenes/escudos";

export const LP_TEAM_ID: Record<string, number> = {
  torreblanca: 15881,
  "torreblanca-b": 41892,
  melistar: 10683,
  "nueva-era": 41893,
  "rusadir-fs-dh": 37520,
  "pena-rm-fs": 37521,
};

const NAME_TO_ID: Array<{ re: RegExp; id: number }> = [
  { re: /torreblanca.*\bb\b|\bb\b.*torreblanca/i, id: 41892 },
  { re: /torreblanca/i, id: 15881 },
  { re: /melistar/i, id: 10683 },
  { re: /nueva\s*era/i, id: 41893 },
  { re: /rusadir/i, id: 37520 },
  { re: /pe[nñ]a\s*real\s*madrid|p\.?r\.?\s*madrid/i, id: 37521 },
];

export function lpTeamId(id?: string, name?: string): number | undefined {
  if (id && LP_TEAM_ID[id]) return LP_TEAM_ID[id];
  if (!name) return undefined;
  for (const row of NAME_TO_ID) {
    if (row.re.test(name)) return row.id;
  }
  return undefined;
}

export function lapreferenteBadge(id?: string, name?: string, lpId?: number): string | undefined {
  const n = lpId || lpTeamId(id, name);
  if (!n) return undefined;
  return `${BASE}/${n}.jpg`;
}
