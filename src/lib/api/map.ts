import { getTeam } from "@/data/teams";
import type { Sport } from "@/lib/types";

/** TheSportsDB team id → Melilla Directo slug. */
export const TSDB_TEAM_TO_SLUG: Record<string, string> = {
  "137847": "ud-melilla",
  "144622": "melilla-baloncesto",
};

export const API_TRACKED_SLUGS = new Set(Object.values(TSDB_TEAM_TO_SLUG));

export const TSDB_SPORT: Record<string, Sport> = {
  Soccer: "futbol",
  Football: "futbol",
  Basketball: "baloncesto",
  Volleyball: "voleibol",
  Handball: "balonmano",
  Futsal: "futsal",
};

type LeagueMap = { id: string; cup?: boolean };

export const TSDB_LEAGUE: Record<string, LeagueMap> = {
  "spanish tercera federacion group 9": { id: "tercera-g9" },
  "spanish copa federacion": { id: "copa-federacion", cup: true },
  "spanish copa rfef": { id: "copa-federacion", cup: true },
  "spanish segunda feb": { id: "segunda-feb" },
  "spanish primera feb": { id: "primera-feb" },
  "spanish segunda rfef group 4": { id: "segunda-rfef-g4" },
  "spanish segunda federacion group 4": { id: "segunda-rfef-g4" },
};

export function normName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\b(ud|cd|cf|fc|bm|cv|cb|fs|club|de|la|el|las|los)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function slugForTsdbTeam(id?: string, name?: string): string | undefined {
  if (id && TSDB_TEAM_TO_SLUG[id]) return TSDB_TEAM_TO_SLUG[id];
  if (!name) return undefined;
  const n = normName(name);
  if (n === "melillabaloncesto" || n === "clubmelillabaloncesto") return "melilla-baloncesto";
  if (n === "melilla" || n === "udmelilla") return "ud-melilla";
  return undefined;
}

export function shortFor(name: string, slug?: string): string {
  if (slug) {
    const team = getTeam(slug);
    if (team) return team.short;
  }
  const cleaned = name.replace(/\b(UD|CD|CF|FC|CB|CV|BM|FS)\b/g, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

export function leagueFor(name?: string): LeagueMap {
  if (!name) return { id: "api-other" };
  const key = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  if (TSDB_LEAGUE[key]) return TSDB_LEAGUE[key];
  const cup = /copa|cup|eliminator/i.test(name);
  return { id: `api-${key.replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`, cup };
}

export function sportFor(value?: string): Sport {
  if (!value) return "futbol";
  return TSDB_SPORT[value] ?? "futbol";
}
