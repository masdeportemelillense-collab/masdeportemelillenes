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

const NAME_ALIASES: Record<string, string[]> = {
  "ud-melilla": ["melilla", "udmelilla", "uniondeportivamelilla"],
  huetorvega: ["huetorvega", "cdhuetorvega"],
  torredelmar: ["torredelmar", "udtorredelmar"],
  malagajuniors: ["malagajuniors", "malagacfjuvenil", "malagacf", "atleticomalagueno", "malagueno"],
  torredonjimeno: ["torredonjimeno", "udctorredonjimeno", "ciudaddetorredonjimeno"],
  motril: ["motril", "cfmotril"],
  arenasdearmilla: ["armilla", "arenasdearmilla", "arenasarmilla"],
  marbelli: ["marbelli", "fcmarbelli", "marbella"],
  almeriab: ["almeriab", "udalmeriab", "almeria"],
  alhaurino: ["alhaurino", "cdalhaurino"],
  porcuna: ["porcuna", "atleticoporcuna"],
  manchareal: ["manchareal", "atleticomanchareal"],
  recreativogranada: ["recreativogranada", "granadab", "granadacf"],
  sanpedro: ["sanpedro", "udsanpedro"],
  churriana: ["churriana", "churrianadelavega", "cdchurriana"],
  marbella: ["marbella", "atleticodemarbella", "atleticomarbella"],
  cantoria: ["cantoria", "cantoria2017"],
};

function tokens(name: string): string {
  return normName(name);
}

function sameClub(a: string, b: string): boolean {
  const na = tokens(a);
  const nb = tokens(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return na.length >= 5 && nb.length >= 5;
  for (const aliases of Object.values(NAME_ALIASES)) {
    const hitA = aliases.some((x) => na.includes(x) || x.includes(na));
    const hitB = aliases.some((x) => nb.includes(x) || x.includes(nb));
    if (hitA && hitB) return true;
  }
  return false;
}

function rowKey(row: StandingRow): string {
  if (row.teamId) return `id:${row.teamId}`;
  return `n:${tokens(row.name)}`;
}

function attachLocal(leagueId: string, row: StandingRow): StandingRow {
  const league = leagueById[leagueId];
  if (!league) return row;
  if (row.teamId && league.teams.some((t) => t.id === row.teamId)) {
    const t = league.teams.find((x) => x.id === row.teamId)!;
    return { ...row, teamId: t.id, name: t.name, short: t.short };
  }
  const hit = league.teams.find((t) => sameClub(t.name, row.name) || (t.id && sameClub(t.id, row.name)));
  if (!hit) return row;
  return { ...row, teamId: hit.id, name: hit.name, short: hit.short };
}

function dedupeRows(rows: StandingRow[]): StandingRow[] {
  const byKey = new Map<string, StandingRow>();
  for (const row of rows) {
    const key = rowKey(row);
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, row);
      continue;
    }
    const prevEmpty = prev.pj === 0 && prev.pts === 0;
    const nextEmpty = row.pj === 0 && row.pts === 0;
    if (prevEmpty && !nextEmpty) byKey.set(key, row);
  }
  const out = [...byKey.values()];
  const collapsed: StandingRow[] = [];
  for (const row of out) {
    const twin = collapsed.find((o) => sameClub(o.name, row.name));
    if (!twin) {
      collapsed.push(row);
      continue;
    }
    if (twin.pj === 0 && row.pj > 0) {
      collapsed.splice(collapsed.indexOf(twin), 1, row);
    }
  }
  return collapsed;
}

export function mergeOfficialTable(leagueId: string, official: StandingRow[]): StandingRow[] {
  const league = leagueById[leagueId];
  const cleaned = dedupeRows(official.map((r) => attachLocal(leagueId, r)));
  if (!league) {
    return cleaned
      .sort(sortRows)
      .map((r, i) => ({ ...r, pos: i + 1 }));
  }

  // Tabla oficial = fuente. No rellenar con el catálogo local (eso duplicaba equipos).
  if (cleaned.length >= Math.max(8, Math.floor(league.teams.length * 0.6))) {
    return cleaned.sort(sortRows).map((r, i) => ({ ...r, pos: i + 1 }));
  }

  const seen = new Set(cleaned.map(rowKey));
  const extras: StandingRow[] = [];
  for (const t of league.teams) {
    const key = t.id ? `id:${t.id}` : `n:${tokens(t.name)}`;
    if (seen.has(key) || cleaned.some((r) => sameClub(r.name, t.name))) continue;
    extras.push({
      pos: 0,
      teamId: t.id,
      name: t.name,
      short: t.short,
      pj: 0,
      g: 0,
      e: 0,
      p: 0,
      gf: 0,
      gc: 0,
      pts: 0,
      form: [],
    });
  }
  return dedupeRows([...cleaned, ...extras])
    .sort(sortRows)
    .map((r, i) => ({ ...r, pos: i + 1 }));
}

function sortRows(a: StandingRow, b: StandingRow): number {
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
