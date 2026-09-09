import { useSyncExternalStore } from "react";
import { leagueById } from "@/data/leagues";
import { matches } from "@/data/matches";
import { getTeam } from "@/data/teams";
import type {
  League,
  Match,
  MatchEvent,
  ResolvedMatch,
  StandingRow,
  Sport,
} from "@/lib/types";

const TICK = 1000;
/** Stable SSR/hydration clock — early season 2026-27, Wednesday 9 Sep. */
const FALLBACK = Date.parse("2026-09-09T12:00:00+02:00");

let current = FALLBACK;
const listeners = new Set<() => void>();

function emit(next: number) {
  current = next;
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.setTimeout(() => {
    const tick = () => emit(Math.floor(Date.now() / TICK) * TICK);
    tick();
    window.setInterval(tick, TICK);
  }, 0);
}

export function useNow(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => FALLBACK,
  );
}

function kickoffMs(match: Match, now: number): number {
  if (match.liveElapsed != null) {
    return now - match.liveElapsed * 60_000;
  }
  return new Date(match.kickoff).getTime();
}

function lastScore(events: MatchEvent[], minute: number): { home: number; away: number } {
  let home = 0;
  let away = 0;
  for (const ev of events) {
    if (ev.minute <= minute) {
      home = ev.homeScore;
      away = ev.awayScore;
    }
  }
  return { home, away };
}

function periodFor(sport: Sport, minute: number, duration: number): string {
  if (sport === "futbol") {
    if (minute < 45) return "1ª parte";
    if (minute < 48) return "Descanso";
    if (minute < 93) return "2ª parte";
    return "Añadido";
  }
  if (sport === "futsal") {
    if (minute < 20) return "1ª parte";
    if (minute < 22) return "Descanso";
    return "2ª parte";
  }
  if (sport === "balonmano") {
    if (minute < 30) return "1ª parte";
    if (minute < 32) return "Descanso";
    return "2ª parte";
  }
  if (sport === "baloncesto" || sport === "bsr") {
    const q = Math.min(4, Math.floor(minute / (duration / 4)) + 1);
    return `Q${q}`;
  }
  if (sport === "voleibol") {
    const set = Math.min(5, Math.floor(minute / 22) + 1);
    return `Set ${set}`;
  }
  return `${minute}'`;
}

function clockLabel(sport: Sport, minute: number, duration: number): string {
  if (sport === "futbol") {
    if (minute < 45) return `${minute}'`;
    if (minute < 48) return "DT";
    if (minute <= 90) return `${minute}'`;
    return `90+${minute - 90}'`;
  }
  if (sport === "futsal") {
    if (minute < 20) return `${minute}'`;
    if (minute < 22) return "DT";
    return `${minute}'`;
  }
  if (sport === "baloncesto" || sport === "bsr") {
    return periodFor(sport, minute, duration);
  }
  if (sport === "voleibol") return periodFor(sport, minute, duration);
  return `${minute}'`;
}

export function resolveMatch(match: Match, now: number): ResolvedMatch {
  const start = kickoffMs(match, now);
  const elapsedMin = (now - start) / 60_000;
  const duration = match.duration;

  if (elapsedMin < 0) {
    return {
      ...match,
      status: "scheduled",
      minute: 0,
      homeScore: 0,
      awayScore: 0,
      displayClock: "",
      happened: [],
      period: "Previsto",
    };
  }

  const capped = Math.min(elapsedMin, duration);
  const minute = Math.max(0, Math.floor(capped));
  const happened = match.events.filter((e) => e.minute <= minute);
  const { home, away } = lastScore(match.events, minute);
  const finished = elapsedMin >= duration;

  return {
    ...match,
    status: finished ? "finished" : "live",
    minute,
    homeScore: home,
    awayScore: away,
    displayClock: finished ? "Fin" : clockLabel(match.sport, minute, duration),
    happened,
    period: finished ? "Finalizado" : periodFor(match.sport, minute, duration),
  };
}

export function resolveAll(now: number): ResolvedMatch[] {
  return matches.map((m) => resolveMatch(m, now));
}

export function matchesForTeam(teamId: string, now: number): ResolvedMatch[] {
  return resolveAll(now)
    .filter((m) => m.homeId === teamId || m.awayId === teamId)
    .sort((a, b) => kickoffMs(a, now) - kickoffMs(b, now));
}

export function liveMatches(now: number): ResolvedMatch[] {
  return resolveAll(now)
    .filter((m) => m.status === "live")
    .sort((a, b) => b.minute - a.minute);
}

export function upcomingMatches(now: number, limit = 12): ResolvedMatch[] {
  return resolveAll(now)
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => kickoffMs(a, now) - kickoffMs(b, now))
    .slice(0, limit);
}

export function recentMatches(now: number, limit = 12): ResolvedMatch[] {
  return resolveAll(now)
    .filter((m) => m.status === "finished")
    .sort((a, b) => kickoffMs(b, now) - kickoffMs(a, now))
    .slice(0, limit);
}

export function standingsFor(
  leagueId: string,
  now: number,
  resolved?: ResolvedMatch[],
): StandingRow[] {
  const league: League | undefined = leagueById[leagueId];
  if (!league) return [];

  type Acc = {
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

  const table = new Map<string, Acc>();
  for (const t of league.teams) {
    table.set(t.name, {
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

  const pool = resolved ?? resolveAll(now);
  const finished = pool
    .filter((m) => m.leagueId === leagueId && m.status === "finished" && m.jornada > 0)
    .sort((a, b) => kickoffMs(a, now) - kickoffMs(b, now));

  const apply = (name: string, gf: number, gc: number, scoring: League["scoring"]) => {
    const row = table.get(name);
    if (!row) return;
    row.pj += 1;
    row.gf += gf;
    row.gc += gc;
    if (gf > gc) {
      row.g += 1;
      row.pts += scoring === "volley" ? (gf === 3 && gc <= 1 ? 3 : 2) : scoring === "basket" ? 1 : 3;
      row.form.push("W");
    } else if (gf < gc) {
      row.p += 1;
      if (scoring === "volley") row.pts += gf === 2 ? 1 : 0;
      row.form.push("L");
    } else {
      row.e += 1;
      if (scoring === "football") row.pts += 1;
      row.form.push("D");
    }
    if (row.form.length > 5) row.form.shift();
  };

  for (const match of finished) {
    apply(match.homeName, match.homeScore, match.awayScore, league.scoring);
    apply(match.awayName, match.awayScore, match.homeScore, league.scoring);
  }

  const rows = [...table.values()].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const dgA = a.gf - a.gc;
    const dgB = b.gf - b.gc;
    if (dgB !== dgA) return dgB - dgA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name, "es");
  });

  return rows.map((r, i) => ({ ...r, pos: i + 1 }));
}

export function teamResult(match: ResolvedMatch, teamId: string): "W" | "D" | "L" | null {
  if (match.status !== "finished") return null;
  const isHome = match.homeId === teamId;
  const gf = isHome ? match.homeScore : match.awayScore;
  const gc = isHome ? match.awayScore : match.homeScore;
  if (gf > gc) return "W";
  if (gf < gc) return "L";
  return "D";
}

export function nextMatchFor(teamId: string, now: number): ResolvedMatch | undefined {
  return matchesForTeam(teamId, now).find((m) => m.status === "scheduled");
}

export function formFor(teamId: string, now: number): Array<"W" | "D" | "L"> {
  return matchesForTeam(teamId, now)
    .filter((m) => m.status === "finished")
    .slice(-5)
    .map((m) => teamResult(m, teamId))
    .filter((r): r is "W" | "D" | "L" => r != null);
}

export function isMelillaTeam(id?: string): boolean {
  return Boolean(id && getTeam(id));
}
