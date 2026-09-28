import { solofutsalBadge } from "@/data/solofutsal-badges";
import { shortFor } from "@/lib/api/map";
import type { ApiEvent } from "@/lib/api/types";
import type { StandingRow } from "@/lib/types";

const BASE = "https://futsal.rfef.es";
const BADGE = (id: string) => `https://thumb2.besoccerapps.com/lnfs/guia/teams/${id}.png?size=80`;
const FETCH_MS = 14_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const COMPS = [
  { path: "primera-femenina", leagueId: "fs-primera-f", leagueName: "Primera División Femenina FS", mustInclude: /torreblanca/i },
  { path: "segunda", leagueId: "fs-segunda-m", leagueName: "Segunda División FS", mustInclude: /melistar/i },
  { path: "segunda-femenina", leagueId: "fs-segunda-f", leagueName: "Segunda División Femenina FS · Grupo 3", mustInclude: /torreblanca/i },
] as const;

const TEAM_HINTS: Array<{ re: RegExp; id: string }> = [
  { re: /torreblanca.*\bb\b|\bb\b.*torreblanca/i, id: "torreblanca-b" },
  { re: /torreblanca/i, id: "torreblanca" },
  { re: /melistar/i, id: "melistar" },
  { re: /nueva\s*era/i, id: "nueva-era" },
  { re: /rusadir/i, id: "rusadir-fs-dh" },
  { re: /pe[nñ]a\s*real\s*madrid|p\.?r\.?\s*madrid/i, id: "pena-rm-fs" },
];

function slugForName(name: string): string | undefined {
  for (const hint of TEAM_HINTS) if (hint.re.test(name)) return hint.id;
  return undefined;
}

function isMelillaSide(name: string): boolean {
  return /melilla|melistar|torreblanca|nueva\s*era|rusadir|pe[nñ]a\s*real/i.test(name);
}

function decode(html: string): string {
  return html.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": UA, "Accept-Language": "es-ES,es;q=0.9" },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`RFEF ${res.status} ${url}`);
  return decode(await res.text());
}

const MONTHS: Record<string, number> = {
  ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6, JUL: 7, AGO: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12,
};

function kickoffFrom(label: string, time: string): string {
  const m = label.match(/(\d{1,2})\s+([A-ZÁÉÍÓÚ]{3})/i);
  const month = m ? MONTHS[m[2].toUpperCase()] ?? 9 : 9;
  const day = m ? Number(m[1]) : 1;
  const year = month >= 8 ? 2026 : 2027;
  const t = /^\d{1,2}:\d{2}$/.test(time) ? time : "12:00";
  const [hh, mm] = t.split(":").map(Number);
  const offset = month >= 3 && month <= 10 ? "+02:00" : "+01:00";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00${offset}`;
}

function badgeOf(id: string | undefined, name: string, rfefId?: string): string | undefined {
  if (rfefId) return BADGE(rfefId);
  return solofutsalBadge(id, name);
}

function parseMatches(html: string, leagueId: string, leagueName: string): ApiEvent[] {
  const events: ApiEvent[] = [];
  const re =
    /href="https:\/\/futsal\.rfef\.es\/partido\/([^/]+)\/([^/]+)\/(\d+)\/(\d+)"[\s\S]*?data-id="([^"]+)"[\s\S]*?(?:status-pill[^>]*>([^<]+)|<span[^>]*class="[^"]*hour[^"]*"[^>]*>(\d{1,2}:\d{2}))[\s\S]*?teams\/(\d+)\.png[\s\S]*?class="name">([^<]+)[\s\S]*?rlocal_[^>]*>([^<]*)[\s\S]*?teams\/(\d+)\.png[\s\S]*?class="name">([^<]+)[\s\S]*?rvisit_[^>]*>([^<]*)[\s\S]*?Jor\.\s*(\d+)/gi;
  for (const m of html.matchAll(re)) {
    const homeName = m[9].trim();
    const awayName = m[12].trim();
    if (!isMelillaSide(homeName) && !isMelillaSide(awayName)) continue;
    const hs = m[10].trim();
    const as = m[13].trim();
    const finished = /finalizado/i.test(m[6] ?? "") || (/^\d+$/.test(hs) && /^\d+$/.test(as));
    const homeId = slugForName(homeName);
    const awayId = slugForName(awayName);
    events.push({
      externalId: `rfef-${m[3]}-${m[4]}`,
      sport: "futsal",
      leagueId,
      leagueName,
      isCup: /copa|supercopa/i.test(leagueName),
      venue: "",
      jornada: Number(m[14]),
      homeId,
      homeName,
      homeShort: shortFor(homeName, homeId),
      homeBadge: badgeOf(homeId, homeName, m[8]),
      awayId,
      awayName,
      awayShort: shortFor(awayName, awayId),
      awayBadge: badgeOf(awayId, awayName, m[11]),
      kickoff: kickoffFrom(m[5], m[7] || "12:00"),
      status: finished ? "finished" : "scheduled",
      minute: finished ? 40 : 0,
      homeScore: Number(hs) || 0,
      awayScore: Number(as) || 0,
      displayClock: finished ? "Fin" : "",
      period: finished ? "Finalizado" : "Previsto",
      events: [],
      duration: 48,
    });
  }
  return events;
}

function parseOneTable(block: string): StandingRow[] {
  const rows: StandingRow[] = [];
  for (const rm of block.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const chunk = rm[1];
    const pos = chunk.match(/<div class="">(\d+)<\/div>/)?.[1];
    const name = chunk.match(/href="\/equipo\/[^"/]+\/\d+\/info"[^>]*>([^<]+)/)?.[1]?.trim();
    const nums = [...chunk.matchAll(/<td[^>]*>\s*(\d+)\s*<\/td>/g)].map((x) => Number(x[1]));
    if (!pos || !name || nums.length < 6) continue;
    const slug = slugForName(name);
    rows.push({
      pos: Number(pos),
      teamId: slug,
      name,
      short: shortFor(name, slug),
      pts: nums[0],
      pj: nums[1],
      g: nums[2],
      e: nums[3],
      p: nums[4],
      gf: nums[5],
      gc: nums[6] ?? 0,
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

function parseTable(html: string, mustInclude?: RegExp): StandingRow[] {
  const blocks = [...html.matchAll(/id="ClassificationFullTable"[\s\S]*?<\/tbody>/gi)].map((m) => m[0]);
  if (!blocks.length) blocks.push(html);
  const tables = blocks.map(parseOneTable).filter((t) => t.length);
  if (mustInclude) {
    const hit = tables.find((t) => t.some((r) => mustInclude.test(r.name)));
    if (hit) return hit;
  }
  return tables[0] ?? [];
}

export async function fetchRfefFutsal(): Promise<{ events: ApiEvent[]; tables: Record<string, StandingRow[]> }> {
  const events: ApiEvent[] = [];
  const tables: Record<string, StandingRow[]> = {};
  const settled = await Promise.allSettled(
    COMPS.flatMap((c) => [
      getText(`${BASE}/competicion/${c.path}/2027/resultados`).then((html) => ({ c, html })),
      getText(`${BASE}/competicion/${c.path}/2027/clasificacion`).then((html) => ({ c, html })),
    ]),
  );
  for (const item of settled) {
    if (item.status !== "fulfilled") continue;
    const { c, html } = item.value;
    for (const ev of parseMatches(html, c.leagueId, c.leagueName)) events.push(ev);
    const table = parseTable(html, c.mustInclude);
    if (table.length && table.some((r) => c.mustInclude.test(r.name))) tables[c.leagueId] = table;
  }
  const byId = new Map<string, ApiEvent>();
  for (const ev of events) byId.set(ev.externalId, ev);
  return { events: [...byId.values()], tables };
}
