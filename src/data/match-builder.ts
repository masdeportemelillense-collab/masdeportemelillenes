import { teamById } from "@/data/teams";
import { badgeFor } from "@/data/badges";
import { futbolmeBadge } from "@/data/futbolme-badges";
import { officialBadge } from "@/data/official-badges";
import { solofutsalBadge } from "@/data/solofutsal-badges";
import type { EventKind, Match, MatchEvent, Side, Sport } from "@/lib/types";

const DURATION: Record<Sport, number> = {
  futbol: 95,
  baloncesto: 48,
  voleibol: 110,
  balonmano: 70,
  futsal: 48,
  bsr: 48,
};

export type EventSpec = [number, "H" | "A", EventKind, string, string?];

export type Spec = {
  id: string;
  league: string;
  sport: Sport;
  at: string;
  venue: string;
  jornada: number;
  home: string;
  away: string;
  live?: number;
  duration?: number;
  events?: EventSpec[];
};

export function sideOf(token: string): { id?: string; name: string; short: string } {
  const team = teamById[token];
  if (team) return { id: team.id, name: team.name, short: team.short };
  const [name, short] = token.includes("|") ? token.split("|") : [token, token.slice(0, 3).toUpperCase()];
  return { name, short };
}

export function parseMatchScore(note?: string): { home: number; away: number } | null {
  if (!note) return null;
  const m = note.match(/^\*(\d+)-(\d+)$/);
  if (!m) return null;
  return { home: Number(m[1]), away: Number(m[2]) };
}

export function buildEvents(specs: EventSpec[] | undefined): MatchEvent[] {
  if (!specs?.length) return [];
  let home = 0;
  let away = 0;
  return specs.map(([minute, ha, kind, player, note]) => {
    const side: Side = ha === "H" ? "home" : "away";
    const parsed = parseMatchScore(note);
    if (parsed) {
      home = parsed.home;
      away = parsed.away;
    } else if (kind === "gol" || kind === "gol_pp" || kind === "punto" || kind === "set") {
      if (side === "home") home += 1;
      else away += 1;
    }
    return { minute, side, kind, player, homeScore: home, awayScore: away, note };
  });
}

function resolveBadge(id?: string, name?: string): string | undefined {
  return officialBadge(id, name) || solofutsalBadge(id, name) || futbolmeBadge(id, name) || badgeFor(id, name);
}

export function m(spec: Spec): Match {
  const home = sideOf(spec.home);
  const away = sideOf(spec.away);
  return {
    id: spec.id,
    leagueId: spec.league,
    sport: spec.sport,
    venue: spec.venue,
    jornada: spec.jornada,
    homeId: home.id,
    homeName: home.name,
    homeShort: home.short,
    homeBadge: resolveBadge(home.id, home.name),
    awayId: away.id,
    awayName: away.name,
    awayShort: away.short,
    awayBadge: resolveBadge(away.id, away.name),
    kickoff: spec.at,
    liveElapsed: spec.live,
    events: buildEvents(spec.events),
    duration: spec.duration ?? DURATION[spec.sport],
  };
}
