import { getTeam } from "@/data/teams";
import { shortFor } from "@/lib/api/map";
import type { StandingRow } from "@/lib/types";

const BASE = "https://futbolme.com";
const FETCH_MS = 12_000;
const TTL_MS = 10 * 60_000;
const UA = "MasDeporteMelillense/1.0 (+https://masdeportemelillenes.netlify.app)";

/** Tournament pages that publish a live classification table. */
export const FUTBOLME_TABLES: Array<{
  leagueId: string;
  path: string;
}> = [
  { leagueId: "tercera-g9", path: "/resultados-directo/torneo/tercera-federacion-grupo-9/3079/" },
  { leagueId: "dh-juvenil-g4", path: "/resultados-directo/torneo/division-de-honor-juvenil-grupo-4/37/" },
  { leagueId: "lnj-g13", path: "/resultados-directo/torneo/liga-nacional-juvenil-grupo-13/34/" },
  { leagueId: "tercera-fem", path: "/resultados-directo/torneo/tercera-federacion-femenina-grupo-9/3244/" },
];

const SLUG_HINTS: Array<{ re: RegExp; id: string }> = [
  { re: /^(ud)?melilla$/, id: "ud-melilla" },
  { re: /atleticomelilla/, id: "atletico-melilla-dh" },
  { re: /melillacity/, id: "melilla-city" },
  { re: /atmmelilla/, id: "atm-melilla" },
];

type CacheBox = { at: number; tables: Record<string, StandingRow[]> };
let cache: CacheBox | null = null;
let inflight: Promise<Record<string, StandingRow[]>> | null = null;

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function norm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\b(ud|cd|cf|fc|bm|cv|cb|fs|club|de|del|la|el|las|los|real|sporting)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function slugFor(name: string): string | undefined {
  const n = norm(name);
  for (const hint of SLUG_HINTS) {
    if (hint.re.test(n)) return hint.id;
  }
  return undefined;
}

function cellsOf(rowHtml: string): string[] {
  return [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1]);
}

function teamNameFromCell(cell: string): string {
  const desktop = cell.match(/d-none d-sm-inline-block">([^<]+)</i);
  if (desktop?.[1]) return desktop[1].replace(/\s+/g, " ").trim();
  const anySpan = cell.match(/itemprop="name"[\s\S]*?<span[^>]*>([^<]+)</i);
  if (anySpan?.[1]) return anySpan[1].replace(/\s+/g, " ").trim();
  return stripTags(cell);
}

function firstInt(html: string): number {
  const m = stripTags(html).match(/-?\d+/);
  return m ? Number(m[0]) : 0;
}

function uniqueByName(rows: StandingRow[]): StandingRow[] {
  const seen = new Set<string>();
  const out: StandingRow[] = [];
  for (const row of rows) {
    const key = row.teamId || norm(row.name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

export function parseFutbolmeTable(html: string): StandingRow[] {
  const start = html.search(/id=["']latabla["']/i);
  if (start < 0) return [];
  const end = html.indexOf("</table>", start);
  const table = end > start ? html.slice(start, end) : html.slice(start);
  const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  const out: StandingRow[] = [];
  for (const row of rows) {
    const cells = cellsOf(row);
    if (cells.length < 9) continue;
    const name = teamNameFromCell(cells[1]);
    if (!name || /^equipo$/i.test(name)) continue;
    const slug = slugFor(name);
    const team = slug ? getTeam(slug) : undefined;
    out.push({
      pos: firstInt(cells[0]) || out.length + 1,
      teamId: team?.id ?? slug,
      name: team?.name ?? name,
      short: team?.short ?? shortFor(name, slug),
      pts: firstInt(cells[2]),
      pj: firstInt(cells[3]),
      g: firstInt(cells[4]),
      e: firstInt(cells[5]),
      p: firstInt(cells[6]),
      gf: firstInt(cells[7]),
      gc: firstInt(cells[8]),
      form: [],
    });
  }
  return uniqueByName(out).sort((a, b) => a.pos - b.pos);
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
  if (!res.ok) throw new Error(`Futbolme ${res.status} ${url}`);
  return res.text();
}

async function pullTables(): Promise<Record<string, StandingRow[]>> {
  const settled = await Promise.allSettled(
    FUTBOLME_TABLES.map(async (t) => {
      const html = await getText(`${BASE}${t.path}`);
      const rows = parseFutbolmeTable(html);
      if (!rows.length) throw new Error(`empty table ${t.leagueId}`);
      return [t.leagueId, rows] as const;
    }),
  );
  const tables: Record<string, StandingRow[]> = {};
  for (const item of settled) {
    if (item.status === "fulfilled") tables[item.value[0]] = item.value[1];
  }
  return tables;
}

export async function fetchFutbolmeTables(): Promise<Record<string, StandingRow[]>> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.tables;
  if (inflight) return inflight;
  inflight = pullTables()
    .then((tables) => {
      if (Object.keys(tables).length) cache = { at: Date.now(), tables };
      else if (cache) return cache.tables;
      return tables;
    })
    .catch(() => cache?.tables ?? {})
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
