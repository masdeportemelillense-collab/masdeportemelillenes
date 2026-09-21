import { solofutsalBadge } from "@/data/solofutsal-badges";
import { shortFor } from "@/lib/api/map";
import type { ApiEvent } from "@/lib/api/types";
import type { MatchStatus } from "@/lib/types";

const BASE = "https://solo-futsal.es";
const FETCH_MS = 12_000;
const UA = "MasDeporteMelillense/1.0 (+https://masdeportemelillene.netlify.app)";

const TOURNAMENT_LEAGUE: Record<string, { id: string; name: string }> = {
  "32": { id: "fs-primera-f", name: "Primera División Femenina FS" },
  "31": { id: "fs-segunda-m", name: "Segunda División Masculina FS" },
  "11": { id: "fs-segunda-f", name: "Segunda División Femenina FS" },
  "3": { id: "fs-segunda-b", name: "Segunda División B FS" },
  "13": { id: "fs-dh-juv", name: "División de Honor Juvenil FS" },
  "4": { id: "fs-tercera-24", name: "Tercera División FS · Melilla" },
  "12": { id: "fs-autonomica-melilla", name: "Liga Autonómica Melilla" },
};

const TEAM_HINTS: Array<{ re: RegExp; id: string }> = [
  { re: /torreblanca.*\bb\b|\bfs\.?\s*b\b.*torreblanca/i, id: "torreblanca-b" },
  { re: /torreblanca/i, id: "torreblanca" },
  { re: /melistar/i, id: "melistar" },
  { re: /nueva\s*era/i, id: "nueva-era" },
  { re: /rusadir/i, id: "rusadir-fs-dh" },
  { re: /p\.?r\.?\s*madrid|peña\s*real\s*madrid|melilla\s*s\.?c/i, id: "pena-rm-fs" },
];

function isMelillaSide(name: string): boolean {
  return /melilla|melistar|torreblanca|nueva\s*era|rusadir|imperio\s*melilla/i.test(name);
}

function slugForName(name: string): string | undefined {
  const n = name.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  for (const hint of TEAM_HINTS) {
    if (hint.re.test(n)) return hint.id;
  }
  return undefined;
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "text/html,application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`SoloFutSal ${res.status} ${url}`);
  return res.text();
}

function madridIso(date: string, time: string): string {
  const t = /^\d{1,2}:\d{2}$/.test(time) ? time : "12:00";
  const [h, min] = t.split(":").map(Number);
  const month = Number(date.slice(5, 7));
  const offset = month >= 3 && month <= 10 ? "+02:00" : "+01:00";
  return `${date}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00${offset}`;
}

function statusOf(played: string | number | undefined): MatchStatus {
  const v = String(played ?? "0");
  if (v === "-1") return "live";
  if (v === "1") return "finished";
  return "scheduled";
}

function jornadaOf(label: string): number {
  const m = label.match(/(\d+)\s*ª?\s*Jornada/i) || label.match(/Jornada\s*(\d+)/i);
  return m ? Number(m[1]) : 0;
}

function extractGrouped(html: string): Record<string, Record<string, { matches: RawMatch[] }>> | null {
  const m = html.match(/const groupedMatches = (\{[\s\S]*?\});\s*\n/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as Record<string, Record<string, { matches: RawMatch[] }>>;
  } catch {
    return null;
  }
}

type RawTeam = { t_name?: string; t_emblem?: string };
type RawMatch = {
  id: number;
  score1?: number;
  score2?: number;
  m_played?: string | number;
  m_date?: string;
  m_time?: string;
  m_location?: string;
  team1?: RawTeam;
  team2?: RawTeam;
  matchday?: {
    m_name?: string;
    season?: { tournament?: { id?: number; name?: string } };
  };
};

function mapRaw(match: RawMatch, tournamentId: string, matchdayName: string): ApiEvent | null {
  const homeName = (match.team1?.t_name ?? "").replace(/\s+/g, " ").trim();
  const awayName = (match.team2?.t_name ?? "").replace(/\s+/g, " ").trim();
  if (!homeName || !awayName) return null;
  if (!isMelillaSide(homeName) && !isMelillaSide(awayName)) return null;

  const leagueMeta =
    TOURNAMENT_LEAGUE[tournamentId] ??
    TOURNAMENT_LEAGUE[String(match.matchday?.season?.tournament?.id ?? "")] ?? {
      id: `fs-sfs-${tournamentId}`,
      name: match.matchday?.season?.tournament?.name || matchdayName || "Fútbol sala",
    };

  const status = statusOf(match.m_played);
  const homeScore = Number(match.score1) || 0;
  const awayScore = Number(match.score2) || 0;
  const date = match.m_date || "2026-09-21";
  const time = match.m_time || "12:00";
  const homeId = slugForName(homeName);
  const awayId = slugForName(awayName);
  const live = status === "live";
  const finished = status === "finished";

  return {
    externalId: `sfs-${match.id}`,
    sport: "futsal",
    leagueId: leagueMeta.id,
    leagueName: leagueMeta.name,
    isCup: /copa|supercopa/i.test(leagueMeta.name + matchdayName),
    venue: (match.m_location || "").trim(),
    jornada: jornadaOf(matchdayName),
    homeId,
    homeName,
    homeShort: shortFor(homeName, homeId),
    homeBadge: solofutsalBadge(homeId, homeName),
    awayId,
    awayName,
    awayShort: shortFor(awayName, awayId),
    awayBadge: solofutsalBadge(awayId, awayName),
    kickoff: madridIso(date, time),
    status,
    minute: live ? 20 : finished ? 40 : 0,
    homeScore: status === "scheduled" ? 0 : homeScore,
    awayScore: status === "scheduled" ? 0 : awayScore,
    displayClock: live ? "LIVE" : finished ? "Fin" : "",
    period: live ? "En directo" : finished ? "Finalizado" : "Previsto",
    events:
      finished || live
        ? [
            {
              minute: finished ? 40 : 20,
              side: homeScore >= awayScore ? "home" : "away",
              kind: "gol",
              player: "SoloFutSal",
              homeScore,
              awayScore,
            },
          ]
        : [],
    duration: 48,
  };
}

function datesAround(now = new Date()): string[] {
  const out: string[] = [];
  for (let i = -4; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    out.push(`${dd}-${mm}-${yyyy}`);
  }
  return out;
}

async function fetchDay(date: string): Promise<ApiEvent[]> {
  const html = await getText(`${BASE}/livescores?date=${date}&filter=all`);
  const grouped = extractGrouped(html);
  if (!grouped) return [];
  const events: ApiEvent[] = [];
  for (const [tid, matchdays] of Object.entries(grouped)) {
    for (const [label, payload] of Object.entries(matchdays)) {
      for (const match of payload.matches ?? []) {
        const mapped = mapRaw(match, tid, label);
        if (mapped) events.push(mapped);
      }
    }
  }
  return events;
}

async function fetchLiveEndpoint(): Promise<ApiEvent[]> {
  try {
    const res = await fetch(`${BASE}/live-scores`, {
      headers: { Accept: "application/json", "User-Agent": UA },
      signal: AbortSignal.timeout(FETCH_MS),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { original?: unknown };
    if (!Array.isArray(body.original)) return [];
    const events: ApiEvent[] = [];
    for (const competition of body.original as Array<Record<string, { matches?: RawMatch[] }>>) {
      for (const payload of Object.values(competition)) {
        for (const match of payload?.matches ?? []) {
          const mapped = mapRaw(match, String(match.matchday?.season?.tournament?.id ?? ""), match.matchday?.m_name ?? "");
          if (mapped) events.push(mapped);
        }
      }
    }
    return events;
  } catch {
    return [];
  }
}

export async function fetchSoloFutsalEvents(): Promise<ApiEvent[]> {
  const days = datesAround();
  const settled = await Promise.allSettled([fetchLiveEndpoint(), ...days.map(fetchDay)]);
  const byId = new Map<string, ApiEvent>();
  for (const item of settled) {
    if (item.status !== "fulfilled") continue;
    for (const ev of item.value) {
      const prev = byId.get(ev.externalId);
      if (!prev || ev.status === "live" || (ev.status === "finished" && prev.status !== "live")) {
        byId.set(ev.externalId, ev);
      }
    }
  }
  return [...byId.values()];
}
