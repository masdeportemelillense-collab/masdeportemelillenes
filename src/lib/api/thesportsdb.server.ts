import { getTeam } from "@/data/teams";
import {
  leagueFor,
  shortFor,
  slugForTsdbTeam,
  sportFor,
} from "@/lib/api/map";
import type { ApiEvent, LiveSnapshot } from "@/lib/api/types";
import type { MatchStatus, StandingRow } from "@/lib/types";

const BASE = "https://www.thesportsdb.com/api/v1/json/123";
const TTL_MS = 20_000;
const FETCH_MS = 8_000;
const TEAM_IDS = new Set(["137847", "144622"]);
const MAX_AGE_MS = 220 * 24 * 60 * 60 * 1000;

type CacheBox = { at: number; data: LiveSnapshot };
let cache: CacheBox | null = null;
let inflight: Promise<LiveSnapshot> | null = null;

type TsdbEvent = {
  idEvent?: string;
  idHomeTeam?: string;
  idAwayTeam?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  intHomeScore?: string | number | null;
  intAwayScore?: string | number | null;
  dateEvent?: string;
  strTime?: string;
  strTimestamp?: string;
  strStatus?: string;
  strProgress?: string | null;
  strVenue?: string;
  strLeague?: string;
  idLeague?: string;
  intRound?: string | number | null;
  strSport?: string;
  strEventTime?: string;
};

type TsdbTableRow = {
  idTeam?: string;
  strTeam?: string;
  intRank?: string | number;
  intPlayed?: string | number;
  intWin?: string | number;
  intDraw?: string | number;
  intLoss?: string | number;
  intGoalsFor?: string | number;
  intGoalsAgainst?: string | number;
  intPoints?: string | number;
  strForm?: string;
};

async function tsdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "MelillaDirecto/1.0",
    },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`TheSportsDB ${path} ${res.status}`);
  return (await res.json()) as T;
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function kickoffIso(ev: TsdbEvent): string {
  const ts = ev.strTimestamp?.trim();
  if (ts) {
    if (ts.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(ts)) return ts;
    return `${ts}Z`;
  }
  const date = ev.dateEvent ?? "1970-01-01";
  const time = (ev.strTime || ev.strEventTime || "12:00:00").padEnd(8, ":00").slice(0, 8);
  return `${date}T${time}Z`;
}

const LIVE_STATUS = new Set([
  "1H",
  "2H",
  "HT",
  "ET",
  "P",
  "PEN",
  "LIVE",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "OT",
  "BT",
  "INT",
]);
const DONE_STATUS = new Set(["FT", "AET", "AWARDED", "WO", "ABD"]);

function statusOf(ev: TsdbEvent): MatchStatus {
  const s = (ev.strStatus ?? "").toUpperCase();
  if (DONE_STATUS.has(s)) return "finished";
  if (LIVE_STATUS.has(s)) return "live";
  const progress = String(ev.strProgress ?? "").trim();
  if (progress && progress !== "0" && s !== "NS") return "live";
  return "scheduled";
}

function clockOf(sport: ApiEvent["sport"], ev: TsdbEvent, status: MatchStatus): {
  minute: number;
  displayClock: string;
  period: string;
} {
  const s = (ev.strStatus ?? "").toUpperCase();
  const progress = String(ev.strProgress ?? "").trim();
  if (status === "finished") return { minute: 90, displayClock: "Fin", period: "Finalizado" };
  if (status === "scheduled") return { minute: 0, displayClock: "", period: "Previsto" };

  if (s === "HT" || progress === "HT") return { minute: 45, displayClock: "DT", period: "Descanso" };
  if (s === "1H") {
    const minute = num(progress) || 1;
    return { minute, displayClock: `${minute}'`, period: "1ª parte" };
  }
  if (s === "2H") {
    const minute = num(progress.replace("90+", "")) || 46;
    const clock = progress.includes("+") ? `${progress}'` : `${minute}'`;
    return { minute, displayClock: clock, period: "2ª parte" };
  }
  if (/^Q[1-4]$/i.test(s) || /^Q[1-4]$/i.test(progress)) {
    const q = (progress || s).toUpperCase();
    return { minute: num(q.slice(1)) * 10, displayClock: q, period: q };
  }
  if (progress) {
    const minute = num(progress);
    return {
      minute,
      displayClock: /[a-z]/i.test(progress) ? progress : `${progress}'`,
      period: sport === "baloncesto" ? progress : `${progress}'`,
    };
  }
  return { minute: 1, displayClock: "En juego", period: "En juego" };
}

function mapEvent(ev: TsdbEvent): ApiEvent | null {
  const externalId = ev.idEvent;
  if (!externalId) return null;
  const homeName = ev.strHomeTeam?.trim();
  const awayName = ev.strAwayTeam?.trim();
  if (!homeName || !awayName) return null;

  const homeId = slugForTsdbTeam(ev.idHomeTeam, homeName);
  const awayId = slugForTsdbTeam(ev.idAwayTeam, awayName);
  const sport = sportFor(ev.strSport);
  const league = leagueFor(ev.strLeague);
  const status = statusOf(ev);
  const kickoff = kickoffIso(ev);
  const age = Date.now() - Date.parse(kickoff);
  if (Number.isFinite(age) && age > MAX_AGE_MS && status === "finished") return null;

  const { minute, displayClock, period } = clockOf(sport, ev, status);
  const round = num(ev.intRound);
  const home = homeId ? getTeam(homeId) : undefined;
  const away = awayId ? getTeam(awayId) : undefined;

  return {
    externalId,
    sport,
    leagueId: league.id,
    leagueName: ev.strLeague || league.id,
    isCup: Boolean(league.cup),
    venue: ev.strVenue?.trim() || home?.venue || "",
    jornada: league.cup ? 0 : round,
    homeId,
    homeName: home?.name ?? homeName,
    homeShort: home?.short ?? shortFor(homeName, homeId),
    homeBadge: ev.strHomeTeamBadge || undefined,
    awayId,
    awayName: away?.name ?? awayName,
    awayShort: away?.short ?? shortFor(awayName, awayId),
    awayBadge: ev.strAwayTeamBadge || undefined,
    kickoff,
    status,
    minute,
    homeScore: num(ev.intHomeScore),
    awayScore: num(ev.intAwayScore),
    displayClock,
    period,
    events: [],
    duration: sport === "baloncesto" ? 48 : 95,
  };
}

function isTracked(ev: TsdbEvent): boolean {
  if (ev.idHomeTeam && TEAM_IDS.has(ev.idHomeTeam)) return true;
  if (ev.idAwayTeam && TEAM_IDS.has(ev.idAwayTeam)) return true;
  return /melilla/i.test(`${ev.strHomeTeam ?? ""} ${ev.strAwayTeam ?? ""}`);
}

function formFrom(raw?: string): Array<"W" | "D" | "L"> {
  if (!raw) return [];
  return [...raw.toUpperCase()]
    .filter((c): c is "W" | "D" | "L" => c === "W" || c === "D" || c === "L")
    .slice(-5);
}

function mapTable(rows: TsdbTableRow[]): StandingRow[] {
  return rows
    .map((row, i) => {
      const name = row.strTeam?.trim() || "—";
      const slug = slugForTsdbTeam(row.idTeam, name);
      const team = slug ? getTeam(slug) : undefined;
      return {
        pos: num(row.intRank) || i + 1,
        teamId: slug,
        name: team?.name ?? name,
        short: team?.short ?? shortFor(name, slug),
        pj: num(row.intPlayed),
        g: num(row.intWin),
        e: num(row.intDraw),
        p: num(row.intLoss),
        gf: num(row.intGoalsFor),
        gc: num(row.intGoalsAgainst),
        pts: num(row.intPoints),
        form: formFrom(row.strForm),
      };
    })
    .sort((a, b) => a.pos - b.pos);
}

async function pullSnapshot(): Promise<LiveSnapshot> {
  const settled = await Promise.allSettled([
    tsdb<{ results?: TsdbEvent[] }>("eventslast.php", { id: "137847" }),
    tsdb<{ events?: TsdbEvent[] }>("eventsnext.php", { id: "137847" }),
    tsdb<{ results?: TsdbEvent[] }>("eventslast.php", { id: "144622" }),
    tsdb<{ events?: TsdbEvent[] }>("eventsnext.php", { id: "144622" }),
    tsdb<{ livescore?: TsdbEvent[] }>("livescore.php", { s: "Soccer" }),
    tsdb<{ livescore?: TsdbEvent[] }>("livescore.php", { s: "Basketball" }),
    tsdb<{ table?: TsdbTableRow[] }>("lookuptable.php", { l: "5546", s: "2026-2027" }),
  ]);

  const take = <T>(i: number): T | undefined =>
    settled[i]?.status === "fulfilled" ? (settled[i] as PromiseFulfilledResult<T>).value : undefined;

  const raw: TsdbEvent[] = [
    ...(take<{ results?: TsdbEvent[] }>(0)?.results ?? []),
    ...(take<{ events?: TsdbEvent[] }>(1)?.events ?? []),
    ...(take<{ results?: TsdbEvent[] }>(2)?.results ?? []),
    ...(take<{ events?: TsdbEvent[] }>(3)?.events ?? []),
    ...(take<{ livescore?: TsdbEvent[] }>(4)?.livescore ?? []).filter(isTracked),
    ...(take<{ livescore?: TsdbEvent[] }>(5)?.livescore ?? []).filter(isTracked),
  ];

  const byId = new Map<string, ApiEvent>();
  for (const ev of cache?.data.events ?? []) {
    byId.set(ev.externalId, ev);
  }
  for (const ev of raw) {
    if (!isTracked(ev) && ev.idHomeTeam && ev.idAwayTeam) continue;
    const mapped = mapEvent(ev);
    if (!mapped) continue;
    const prev = byId.get(mapped.externalId);
    if (!prev || mapped.status === "live" || (mapped.status === "finished" && prev.status !== "live")) {
      byId.set(mapped.externalId, mapped);
    }
  }

  const ok = settled.some((s) => s.status === "fulfilled");
  const firstErr = settled.find((s) => s.status === "rejected") as PromiseRejectedResult | undefined;

  const tableRows = take<{ table?: TsdbTableRow[] }>(6)?.table ?? [];

  return {
    fetchedAt: Date.now(),
    ok,
    error: ok ? undefined : String(firstErr?.reason ?? "API no disponible"),
    events: [...byId.values()],
    tables: tableRows.length ? { "tercera-g9": mapTable(tableRows) } : {},
  };
}

export async function fetchLiveSnapshot(): Promise<LiveSnapshot> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.data;
  if (inflight) return inflight;
  inflight = pullSnapshot()
    .then((data) => {
      cache = { at: Date.now(), data };
      return data;
    })
    .catch((err: unknown) => {
      const fallback: LiveSnapshot = {
        fetchedAt: Date.now(),
        ok: false,
        error: err instanceof Error ? err.message : "API no disponible",
        events: cache?.data.events ?? [],
        tables: cache?.data.tables ?? {},
      };
      return fallback;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
