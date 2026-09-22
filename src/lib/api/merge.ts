import { applyAdminOverrides } from "@/lib/admin/apply";
import { leagueById } from "@/data/leagues";
import { matches } from "@/data/matches";
import { API_TRACKED_SLUGS, normName } from "@/lib/api/map";
import type { ApiEvent, LiveSnapshot } from "@/lib/api/types";
import { resolveMatch, standingsFor } from "@/lib/live";
import type { Match, ResolvedMatch, StandingRow } from "@/lib/types";

const MATCH_WINDOW_MS = 36 * 60 * 60 * 1000;

function involvesTracked(match: Match): boolean {
  return Boolean(
    (match.homeId && API_TRACKED_SLUGS.has(match.homeId)) ||
      (match.awayId && API_TRACKED_SLUGS.has(match.awayId)),
  );
}

function stripFakeLive(match: Match): Match {
  if (!involvesTracked(match) || match.liveElapsed == null) return match;
  const { liveElapsed: _drop, ...rest } = match;
  return rest;
}

function shouldDropCatalog(match: Match): boolean {
  return involvesTracked(match) && match.liveElapsed != null;
}

export function findOverlay(match: Match, events: ApiEvent[]): ApiEvent | undefined {
  if (!involvesTracked(match)) return undefined;
  const start = Date.parse(match.kickoff);
  return events.find((ev) => {
    if (ev.sport !== match.sport) return false;
    const share =
      (match.homeId && (ev.homeId === match.homeId || ev.awayId === match.homeId)) ||
      (match.awayId && (ev.homeId === match.awayId || ev.awayId === match.awayId));
    if (!share) return false;
    const delta = Math.abs(Date.parse(ev.kickoff) - start);
    return Number.isFinite(delta) && delta < MATCH_WINDOW_MS;
  });
}

function applyOverlay(match: Match, ev: ApiEvent): ResolvedMatch {
  const happened = ev.events;
  return {
    ...match,
    leagueId: ev.leagueId || match.leagueId,
    venue: ev.venue || match.venue,
    jornada: ev.isCup ? 0 : ev.jornada || match.jornada,
    homeId: ev.homeId ?? match.homeId,
    homeName: ev.homeName,
    homeShort: ev.homeShort,
    homeBadge: ev.homeBadge,
    awayId: ev.awayId ?? match.awayId,
    awayName: ev.awayName,
    awayShort: ev.awayShort,
    awayBadge: ev.awayBadge,
    kickoff: ev.kickoff,
    liveElapsed: undefined,
    events: happened,
    duration: ev.duration,
    source: "api",
    externalId: ev.externalId,
    isCup: ev.isCup,
    competition: ev.leagueName,
    status: ev.status,
    minute: ev.minute,
    homeScore: ev.status === "scheduled" ? 0 : ev.homeScore,
    awayScore: ev.status === "scheduled" ? 0 : ev.awayScore,
    displayClock: ev.displayClock,
    happened,
    period: ev.period,
  };
}

function apiToResolved(ev: ApiEvent): ResolvedMatch {
  return {
    id: `api-${ev.externalId}`,
    leagueId: ev.leagueId,
    sport: ev.sport,
    venue: ev.venue,
    jornada: ev.isCup ? 0 : ev.jornada,
    homeId: ev.homeId,
    homeName: ev.homeName,
    homeShort: ev.homeShort,
    homeBadge: ev.homeBadge,
    awayId: ev.awayId,
    awayName: ev.awayName,
    awayShort: ev.awayShort,
    awayBadge: ev.awayBadge,
    kickoff: ev.kickoff,
    events: ev.events,
    duration: ev.duration,
    source: "api",
    externalId: ev.externalId,
    isCup: ev.isCup,
    competition: ev.leagueName,
    status: ev.status,
    minute: ev.minute,
    homeScore: ev.status === "scheduled" ? 0 : ev.homeScore,
    awayScore: ev.status === "scheduled" ? 0 : ev.awayScore,
    displayClock: ev.displayClock,
    happened: ev.events,
    period: ev.period,
  };
}

export function buildResolvedFeed(now: number, snapshot?: LiveSnapshot | null): ResolvedMatch[] {
  const api = snapshot?.events ?? [];
  const used = new Set<string>();
  const out: ResolvedMatch[] = [];

  for (const raw of matches) {
    if (shouldDropCatalog(raw)) continue;
    const overlay = findOverlay(raw, api);
    if (overlay) {
      used.add(overlay.externalId);
      out.push(applyOverlay(raw, overlay));
    } else {
      out.push(resolveMatch(stripFakeLive(raw), now));
    }
  }

  for (const ev of api) {
    if (used.has(ev.externalId)) continue;
    out.push(apiToResolved(ev));
  }

  return applyAdminOverrides(out, snapshot?.overrides);
}

export function liveOf(list: ResolvedMatch[]): ResolvedMatch[] {
  return list.filter((m) => m.status === "live").sort((a, b) => b.minute - a.minute);
}

export function upcomingOf(list: ResolvedMatch[], limit = 12): ResolvedMatch[] {
  return list
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
    .slice(0, limit);
}

export function recentOf(list: ResolvedMatch[], limit = 12): ResolvedMatch[] {
  return list
    .filter((m) => m.status === "finished")
    .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))
    .slice(0, limit);
}

export function todayOf(list: ResolvedMatch[], now: number): ResolvedMatch[] {
  const day = madridDay(now);
  return list
    .filter((m) => madridDay(m.kickoff) === day)
    .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
}

export function madridDay(ts: number | string): string {
  return new Date(ts).toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
}

export function forTeam(list: ResolvedMatch[], teamId: string): ResolvedMatch[] {
  return list
    .filter((m) => m.homeId === teamId || m.awayId === teamId)
    .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
}

/** Solo variantes del MISMO club. Marbellí ≠ Marbella. Juniors ≠ Malagueño. */
const NAME_ALIASES: Array<string[]> = [
  ["melilla", "udmelilla", "uniondeportivamelilla"],
  ["huetorvega", "cdhuetorvega"],
  ["torredelmar", "udtorredelmar"],
  ["malagajuniors", "cdmalagajuniors", "malagacity", "fcmalagacity"],
  ["atleticomalagueno", "malagueno", "malagab", "malagacfb"],
  ["torredonjimeno", "udctorredonjimeno", "ciudaddetorredonjimeno"],
  ["motril", "cfmotril"],
  ["armilla", "arenasdearmilla", "arenasarmilla"],
  ["marbelli", "fcmarbelli", "atcomarbelli"],
  ["almeriab", "udalmeriab"],
  ["alhaurino", "cdalhaurino"],
  ["porcuna", "atleticoporcuna"],
  ["manchareal", "atleticomanchareal"],
  ["recreativogranada", "granadab"],
  ["sanpedro", "udsanpedro"],
  ["churriana", "churrianadelavega", "cdchurriana", "churrianacf"],
  ["atleticodemarbella", "atleticomarbella", "cdatleticodemarbella"],
  ["cantoria", "cantoria2017"],
];

function keyName(name: string): string {
  return normName(name);
}

function aliasGroup(name: string): string[] | undefined {
  const n = keyName(name);
  return NAME_ALIASES.find((g) => g.includes(n) || g.some((a) => a === n));
}

function sameClub(a: string, b: string): boolean {
  const na = keyName(a);
  const nb = keyName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const ga = aliasGroup(a);
  const gb = aliasGroup(b);
  return Boolean(ga && gb && ga === gb);
}

function attachLocal(leagueId: string, row: StandingRow): StandingRow {
  const league = leagueById[leagueId];
  if (!league) return row;
  const hit = league.teams.find((t) => sameClub(t.name, row.name) || (t.id && sameClub(t.id.replace(/-/g, ""), row.name)));
  if (!hit) return { ...row, teamId: row.teamId };
  return { ...row, teamId: hit.id, name: hit.name, short: hit.short };
}

function exactDedupe(rows: StandingRow[]): StandingRow[] {
  const seen = new Set<string>();
  const out: StandingRow[] = [];
  for (const row of rows) {
    const k = `${keyName(row.name)}|${row.teamId ?? ""}`;
    if (seen.has(k)) continue;
    // solo quitar la misma fila repetida, no clubes distintos
    if (out.some((o) => sameClub(o.name, row.name) && o.pj === row.pj && o.pts === row.pts && o.gf === row.gf)) {
      continue;
    }
    seen.add(k);
    out.push(row);
  }
  return out;
}

export function mergeOfficialTable(leagueId: string, official: StandingRow[]): StandingRow[] {
  const cleaned = exactDedupe(official.map((r) => attachLocal(leagueId, r)));
  return cleaned.sort(sortRows).map((r, i) => ({ ...r, pos: i + 1 }));
}

function sortRows(a: StandingRow, b: StandingRow): number {
  if (a.pos && b.pos && a.pts === b.pts && a.pj === b.pj && a.gf === b.gf) {
    return a.pos - b.pos;
  }
  if (b.pts !== a.pts) return b.pts - a.pts;
  const dgA = a.gf - a.gc;
  const dgB = b.gf - b.gc;
  if (dgB !== dgA) return dgB - dgA;
  if (b.gf !== a.gf) return b.gf - a.gf;
  if (b.pj !== a.pj) return b.pj - a.pj;
  return a.name.localeCompare(b.name, "es");
}

export function standingsOf(
  leagueId: string,
  list: ResolvedMatch[],
  now: number,
  official?: StandingRow[],
): StandingRow[] {
  if (official?.length) return mergeOfficialTable(leagueId, official);
  return standingsFor(leagueId, now, list);
}

export function formOf(list: ResolvedMatch[], teamId: string): Array<"W" | "D" | "L"> {
  return forTeam(list, teamId)
    .filter((m) => m.status === "finished")
    .slice(-5)
    .map((m) => {
      const isHome = m.homeId === teamId;
      const gf = isHome ? m.homeScore : m.awayScore;
      const gc = isHome ? m.awayScore : m.homeScore;
      if (gf > gc) return "W" as const;
      if (gf < gc) return "L" as const;
      return "D" as const;
    });
}

export function nextOf(list: ResolvedMatch[], teamId: string): ResolvedMatch | undefined {
  return forTeam(list, teamId).find((m) => m.status === "scheduled");
}
