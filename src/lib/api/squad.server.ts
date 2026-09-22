import { SQUADS, type SquadPlayer, type SquadPos, type TeamSquad } from "@/data/squads";

const UA = "MasDeporteMelillense/1.0 (+https://masdeportemelillenes.netlify.app)";
const TTL_MS = 6 * 60 * 60 * 1000;
const KEY = "squad-ud-melilla";

const CLUB = "https://udmelilla.es/plantilla/";
const BESOCCER = [
  "https://www.besoccer.com/team/squad/melilla",
  "https://es.besoccer.com/equipo/plantilla/melilla",
];

function strip(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function norm(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function posFrom(raw: string): SquadPos {
  const t = raw.toLowerCase();
  if (/port|gk|goal/.test(t)) return "POR";
  if (/defen|back|lateral/.test(t)) return "DEF";
  if (/centr|mid|medio/.test(t)) return "MED";
  if (/delant|strik|forward|atac|wing/.test(t)) return "DEL";
  return "MED";
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": UA,
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

export function parseClubSquad(html: string): SquadPlayer[] {
  const out: SquadPlayer[] = [];
  const cards = [...html.matchAll(/<div class="tarjeta-jugador">([\s\S]*?)<\/div>\s*<\/div>/gi)];
  const blocks = cards.length ? cards.map((m) => m[1]) : [html];
  for (const block of blocks) {
    const photo = block.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/i);
    const num = block.match(/jugador-numero">\s*(\d+)/i);
    const name = block.match(/jugador-nombre">\s*([^<]+)/i);
    const role = block.match(/jugador-posicion">\s*([^<]+)/i);
    if (!name && !photo?.[2]) continue;
    const n = (name?.[1] ?? photo?.[2] ?? "").trim();
    if (!n || n.length < 2) continue;
    out.push({
      num: num ? Number(num[1]) : undefined,
      name: n,
      pos: posFrom(role?.[1] ?? ""),
      role: role?.[1]?.trim(),
      photo: photo?.[1],
    });
  }
  return out;
}

function parseBeSoccer(html: string): SquadPlayer[] {
  const out: SquadPlayer[] = [];
  let current: SquadPos = "MED";
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  for (const row of rows) {
    const header = strip(row).toLowerCase();
    if (/portero|goalkeeper/.test(header) && !/\d{2,}/.test(header)) {
      current = "POR";
      continue;
    }
    if (/defens/.test(header) && !/\d{2,}/.test(header)) {
      current = "DEF";
      continue;
    }
    if (/centrocamp|midfield/.test(header) && !/\d{2,}/.test(header)) {
      current = "MED";
      continue;
    }
    if (/delant|striker|attack/.test(header) && !/\d{2,}/.test(header)) {
      current = "DEL";
      continue;
    }
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
    if (cells.length < 3) continue;
    const nums = cells.map((c) => c.match(/^\d+$/) ? Number(c) : null);
    const num = nums[0] && nums[0] < 100 ? nums[0] : undefined;
    const nameCell = cells.find((c) => /[A-Za-zÁÉÍÓÚÑ]/.test(c) && c.length > 2 && !/^(pj|pt|mp|gs|edad|age|cm)$/i.test(c));
    if (!nameCell) continue;
    const name = nameCell.replace(/\s+/g, " ").trim();
    if (/^unknown$|^plantilla$|^squad$/i.test(name)) continue;
    const ints = cells.map((c) => {
      const m = c.match(/^-?\d+$/);
      return m ? Number(m[0]) : null;
    });
    const pj = ints[1] ?? ints.find((n, i) => i > 0 && n != null && n < 80) ?? undefined;
    const goals = ints.find((n, i) => i > 2 && n != null && n < 40);
    out.push({
      num,
      name,
      pos: current,
      pj: typeof pj === "number" ? pj : undefined,
      goals: typeof goals === "number" ? goals : undefined,
    });
  }
  return out;
}

function merge(base: SquadPlayer[], extra: SquadPlayer[]): SquadPlayer[] {
  const byNum = new Map<number, SquadPlayer>();
  const byName = new Map<string, SquadPlayer>();
  const put = (p: SquadPlayer) => {
    if (p.num) byNum.set(p.num, p);
    byName.set(norm(p.name), p);
  };
  for (const p of base) put({ ...p });
  for (const e of extra) {
    const hit = (e.num && byNum.get(e.num)) || byName.get(norm(e.name));
    if (hit) {
      hit.pj = e.pj ?? hit.pj;
      hit.goals = e.goals ?? hit.goals;
      hit.assists = e.assists ?? hit.assists;
      hit.yellow = e.yellow ?? hit.yellow;
      hit.age = e.age ?? hit.age;
      hit.height = e.height ?? hit.height;
      if (e.name.length > hit.name.length) hit.name = e.name;
    } else {
      put(e);
    }
  }
  const seen = new Set<SquadPlayer>();
  const out: SquadPlayer[] = [];
  for (const list of [byNum.values(), byName.values()]) {
    for (const p of list) {
      if (seen.has(p)) continue;
      seen.add(p);
      out.push(p);
    }
  }
  return out.sort((a, b) => (a.num ?? 99) - (b.num ?? 99));
}

async function scrapeLive(): Promise<TeamSquad | null> {
  const fallback = SQUADS["ud-melilla"];
  let club: SquadPlayer[] = [];
  try {
    club = parseClubSquad(await getText(CLUB));
  } catch (err) {
    console.error("[squad] club", err);
  }
  let bee: SquadPlayer[] = [];
  for (const url of BESOCCER) {
    try {
      bee = parseBeSoccer(await getText(url));
      if (bee.length) break;
    } catch (err) {
      console.error("[squad] besoccer", url, err);
    }
  }
  const players = merge(club.length ? club : fallback.players, bee);
  if (!players.length) return null;
  return {
    teamId: "ud-melilla",
    season: "2026/27",
    source: {
      label: bee.length ? "BeSoccer · UD Melilla" : "UD Melilla",
      href: bee.length ? BESOCCER[1] : CLUB,
    },
    note: bee.length
      ? "Plantilla y estadísticas actualizadas automáticamente cada jornada."
      : "Nombres del club. BeSoccer no respondió; se reintenta solo.",
    fetchedAt: Date.now(),
    live: true,
    players,
  };
}

export async function getLiveSquad(teamId: string): Promise<TeamSquad | undefined> {
  if (teamId !== "ud-melilla") return SQUADS[teamId];
  const fallback = SQUADS["ud-melilla"];
  try {
    const { readDoc, writeDoc } = await import("@/lib/persist.server");
    const cached = await readDoc<TeamSquad | null>(KEY, null);
    if (cached?.players?.length && cached.fetchedAt && Date.now() - cached.fetchedAt < TTL_MS) {
      return cached;
    }
    const fresh = await scrapeLive();
    if (fresh) {
      try {
        await writeDoc(KEY, fresh);
      } catch {
        /* cache optional */
      }
      return fresh;
    }
    return cached ?? fallback;
  } catch (err) {
    console.error("[squad] live", err);
    return fallback;
  }
}
