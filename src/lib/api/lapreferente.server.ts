import { lapreferenteBadge, LP_TEAM_ID } from "@/data/lapreferente-badges";
import { solofutsalBadge } from "@/data/solofutsal-badges";
import { shortFor } from "@/lib/api/map";
import type { ApiEvent } from "@/lib/api/types";
import type { MatchStatus, StandingRow } from "@/lib/types";

const BASE = "https://www.lapreferente.com";
const FETCH_MS = 14_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

type Club = {
  slug: string;
  lpId: number;
  leagueId: string;
  leagueName: string;
  comps: number[];
};

const CLUBS: Club[] = [
  { slug: "torreblanca", lpId: 15881, leagueId: "fs-primera-f", leagueName: "Primera División Femenina FS", comps: [26730, 22747] },
  { slug: "torreblanca-b", lpId: 41892, leagueId: "fs-segunda-f", leagueName: "Segunda División Femenina FS", comps: [26731, 22748] },
  { slug: "melistar", lpId: 10683, leagueId: "fs-segunda-m", leagueName: "Segunda División FS", comps: [26726, 22316] },
  { slug: "nueva-era", lpId: 41893, leagueId: "fs-segunda-b", leagueName: "Segunda División B FS · Grupo 5", comps: [26732, 22746] },
  { slug: "rusadir-fs-dh", lpId: 37520, leagueId: "fs-dh-juv", leagueName: "División de Honor Juvenil FS", comps: [26733] },
  { slug: "pena-rm-fs", lpId: 37521, leagueId: "fs-dh-juv", leagueName: "División de Honor Juvenil FS", comps: [26733] },
];

const TEAM_HINTS: Array<{ re: RegExp; id: string }> = [
  { re: /torreblanca.*\bb\b|\bb\b.*torreblanca/i, id: "torreblanca-b" },
  { re: /torreblanca/i, id: "torreblanca" },
  { re: /melistar/i, id: "melistar" },
  { re: /nueva\s*era/i, id: "nueva-era" },
  { re: /rusadir/i, id: "rusadir-fs-dh" },
  { re: /pe[nñ]a\s*real\s*madrid|p\.?r\.?\s*madrid|melilla\s*s\.?c/i, id: "pena-rm-fs" },
];

function slugForName(name: string): string | undefined {
  const n = name.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  for (const hint of TEAM_HINTS) if (hint.re.test(n)) return hint.id;
  return undefined;
}

function isMelillaSide(name: string): boolean {
  return /melilla|melistar|torreblanca|nueva\s*era|rusadir|pe[nñ]a\s*real/i.test(name);
}

function decode(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": UA,
      "Accept-Language": "es-ES,es;q=0.9",
    },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`LaPreferente ${res.status} ${url}`);
  return res.text();
}

function madridIso(day: string, time: string): string {
  const t = /^\d{1,2}:\d{2}$/.test(time) ? time : "12:00";
  const [d, m, y] = day.split(/[/-]/).map(Number);
  const year = y < 100 ? 2000 + y : y;
  const [hh, mm] = t.split(":").map(Number);
  const offset = m >= 3 && m <= 10 ? "+02:00" : "+01:00";
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00${offset}`;
}

function badgeOf(id: string | undefined, name: string, html?: string, lpId?: number): string | undefined {
  if (html) {
    const fromPage = html.match(/src="([^"]*(?:escudo|logo|equipo)[^"]+)"/i);
    if (fromPage?.[1]) {
      const src = fromPage[1].startsWith("http") ? fromPage[1] : `${BASE}/${fromPage[1].replace(/^\//, "")}`;
      return src;
    }
  }
  return lapreferenteBadge(id, name, lpId) || solofutsalBadge(id, name);
}

function mapMatch(
  club: Club,
  jornada: number,
  date: string,
  time: string,
  homeName: string,
  awayName: string,
  score: { h: number; a: number } | null,
  html?: string,
): ApiEvent | null {
  const home = homeName.replace(/\s+/g, " ").trim();
  const away = awayName.replace(/\s+/g, " ").trim();
  if (!home || !away) return null;
  if (!isMelillaSide(home) && !isMelillaSide(away)) return null;
  const homeId = slugForName(home);
  const awayId = slugForName(away);
  const status: MatchStatus = score ? "finished" : "scheduled";
  const key = `${club.slug}-${jornada}-${home}-${away}-${date}`;
  return {
    externalId: `lp-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80)}`,
    sport: "futsal",
    leagueId: club.leagueId,
    leagueName: club.leagueName,
    isCup: /copa|supercopa/i.test(club.leagueName),
    venue: "",
    jornada,
    homeId,
    homeName: home,
    homeShort: shortFor(home, homeId),
    homeBadge: badgeOf(homeId, home, html, homeId ? LP_TEAM_ID[homeId] : undefined),
    awayId,
    awayName: away,
    awayShort: shortFor(away, awayId),
    awayBadge: badgeOf(awayId, away, html, awayId ? LP_TEAM_ID[awayId] : undefined),
    kickoff: madridIso(date || "25/09/2026", time || "12:00"),
    status,
    minute: status === "finished" ? 40 : 0,
    homeScore: score?.h ?? 0,
    awayScore: score?.a ?? 0,
    displayClock: status === "finished" ? "Fin" : "",
    period: status === "finished" ? "Finalizado" : "Previsto",
    events:
      score
        ? [
            {
              minute: 40,
              side: score.h >= score.a ? "home" : "away",
              kind: "gol",
              player: "La Preferente",
              homeScore: score.h,
              awayScore: score.a,
            },
          ]
        : [],
    duration: 48,
  };
}

function parseMatches(club: Club, html: string): ApiEvent[] {
  const text = decode(html);
  const events: ApiEvent[] = [];
  const scored =
    /JORNADA\s*(\d+)[^\d]{0,20}(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})?(?:\s+(\d{1,2}:\d{2}))?[^A-ZÁÉÍÓÚÑ]{0,12}([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñü.'\- ]{2,40})\s+(\d{1,3})\s*[-]–\s*(\d{1,3})\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñü.'\- ]{2,40})/gi;
  for (const m of text.matchAll(scored)) {
    const ev = mapMatch(club, Number(m[1]), m[2] || "25/09/2026", m[3] || "12:00", m[4], m[7], {
      h: Number(m[5]),
      a: Number(m[6]),
    }, html);
    if (ev) events.push(ev);
  }
  const pending =
    /JORNADA\s*(\d+)[^\d]{0,20}(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})?(?:\s+(\d{1,2}:\d{2}))?[^A-ZÁÉÍÓÚÑ]{0,12}([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñü.'\- ]{2,40})\s+(?:[SDLV]·?-)?(\d{1,2}:\d{2}|-)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñü.'\- ]{2,40})/gi;
  for (const m of text.matchAll(pending)) {
    if (/^\d+$/.test(m[5])) continue;
    const time = /\d{1,2}:\d{2}/.test(m[5]) ? m[5] : m[3] || "12:00";
    const ev = mapMatch(club, Number(m[1]), m[2] || "25/09/2026", time, m[4], m[6], null, html);
    if (ev) events.push(ev);
  }
  return events;
}

function parseTable(club: Club, html: string): StandingRow[] {
  const text = decode(html);
  const rows: StandingRow[] = [];
  const re =
    /(\d{1,2})\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñü.'\- ]{2,42})\s+(\d{1,3})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,3})\s+(\d{1,3})\s+([+\-]?\d+)/g;
  for (const m of text.matchAll(re)) {
    const name = m[2].trim();
    if (name.length < 3) continue;
    const slug = slugForName(name);
    rows.push({
      pos: Number(m[1]),
      teamId: slug,
      name,
      short: shortFor(name, slug),
      pj: Number(m[4]),
      g: Number(m[5]),
      e: Number(m[6]),
      p: Number(m[7]),
      gf: Number(m[8]),
      gc: Number(m[9]),
      pts: Number(m[3]),
      form: [],
    });
  }
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = `${r.pos}-${r.name}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function compsFromHtml(html: string, lpId: number, fallback: number[]): number[] {
  const found = [...html.matchAll(new RegExp(`E${lpId}C(\d+)`, "g"))].map((m) => Number(m[1]));
  const extra = [...html.matchAll(/comp=(\d+)/g)].map((m) => Number(m[1]));
  return [...new Set([...found, ...extra, ...fallback])].filter((n) => n > 1000);
}

async function fetchClub(club: Club): Promise<{ events: ApiEvent[]; table: StandingRow[] }> {
  const pages: string[] = [];
  try {
    pages.push(await getText(`${BASE}/E${club.lpId}/club`));
  } catch {
    /* ignore */
  }
  const comps = pages[0] ? compsFromHtml(pages[0], club.lpId, club.comps) : club.comps;
  const primary = comps[0] ?? club.comps[0];
  const urls = [
    `${BASE}/index.php?seccion=estad&comp=${primary}&IDequipo=${club.lpId}`,
    `${BASE}/index.php?comp=${primary}&accion=calendario`,
    `${BASE}/E${club.lpId}C${primary}-1/club`,
  ];
  const settled = await Promise.allSettled(urls.map(getText));
  for (const item of settled) if (item.status === "fulfilled") pages.push(item.value);

  const byId = new Map<string, ApiEvent>();
  let table: StandingRow[] = [];
  for (const html of pages) {
    for (const ev of parseMatches(club, html)) byId.set(ev.externalId, ev);
    const rows = parseTable(club, html);
    if (rows.length > table.length) table = rows;
  }
  return { events: [...byId.values()], table };
}

export async function fetchLaPreferenteFutsal(): Promise<{
  events: ApiEvent[];
  tables: Record<string, StandingRow[]>;
}> {
  const settled = await Promise.allSettled(CLUBS.map(fetchClub));
  const events: ApiEvent[] = [];
  const tables: Record<string, StandingRow[]> = {};
  CLUBS.forEach((club, i) => {
    const item = settled[i];
    if (item.status !== "fulfilled") return;
    events.push(...item.value.events);
    if (item.value.table.length) tables[club.leagueId] = item.value.table;
  });
  return { events, tables };
}
