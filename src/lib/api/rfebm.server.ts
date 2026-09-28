import { shortFor } from "@/lib/api/map";
import type { ApiEvent } from "@/lib/api/types";
import type { StandingRow } from "@/lib/types";

const FETCH_MS = 18_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

type Comp = {
  id: string;
  leagueId: string;
  leagueName: string;
  ours: RegExp;
  slug: string;
};

const COMPS: Comp[] = [
  {
    id: "1031246",
    leagueId: "bm-primera-f",
    leagueName: "Primera División Masculina BM · Grupo F",
    ours: /virgen\s*de\s*la\s*victoria|melilla\s+ciudad\s+del\s+deporte\s+balonmano\s+virgen/i,
    slug: "virgen-victoria",
  },
  {
    id: "1031250",
    leagueId: "bm-dh-plata",
    leagueName: "División de Honor Plata Femenina BM · Grupo D",
    ours: /t[\s-]*maravilla/i,
    slug: "t-maravillas",
  },
];

function decode(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": UA, "Accept-Language": "es-ES,es;q=0.9" },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`RFEBM ${res.status}`);
  return decode(await res.text());
}

function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").replace(/^VS\s+/i, "").trim();
}

function slugFor(name: string, comp: Comp): string | undefined {
  return comp.ours.test(name) ? comp.slug : undefined;
}

function madridIso(dmy: string, time: string): string {
  const [d, m, y] = dmy.split(/[/-]/).map(Number);
  const t = /^\d{1,2}:\d{2}$/.test(time) ? time : "12:00";
  const [hh, mm] = t.split(":").map(Number);
  const offset = m >= 3 && m <= 10 ? "+02:00" : "+01:00";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00${offset}`;
}

function parseCalendar(html: string, comp: Comp): ApiEvent[] {
  const events: ApiEvent[] = [];
  const jornadaMarks = [...html.matchAll(/JORNADA\s*(\d+)/gi)];
  for (let i = 0; i < jornadaMarks.length; i++) {
    const jornada = Number(jornadaMarks[i][1]);
    const chunk = html.slice(jornadaMarks[i].index, jornadaMarks[i + 1]?.index);
    const rowRe =
      /id_equipo=(\d+)[^>]*>\s*([^<]+)<\/a>[\s\S]{0,120}?id_equipo=(\d+)[^>]*>\s*([^<]+)<\/a>[\s\S]{0,800}?<span class='resultado'>\s*(\d+)\s*[-]\s*(\d+)\s*<\/span>[\s\S]{0,900}?<td class="fecha">[\s\S]{0,80}?(\d{2}\/\d{2}\/\d{4})[\s\S]{0,40}?(\d{1,2}:\d{2})/gi;
    for (const m of chunk.matchAll(rowRe)) {
      const home = cleanName(m[2]);
      const away = cleanName(m[4]);
      if (!comp.ours.test(home) && !comp.ours.test(away)) continue;
      const homeId = slugFor(home, comp);
      const awayId = slugFor(away, comp);
      const homeBadge = chunk.match(new RegExp(`id_equipo=${m[1]}[\\s\\S]{0,400}?src='(https://balonmano\.isquad\.es/images/afiliacion_clubs/[^']+)'`))?.[1];
      const awayBadge = chunk.match(new RegExp(`id_equipo=${m[3]}[\\s\\S]{0,400}?src='(https://balonmano\.isquad\.es/images/afiliacion_clubs/[^']+)'`))?.[1];
      events.push({
        externalId: `rfebm-${comp.id}-${jornada}-${m[1]}-${m[3]}`,
        sport: "balonmano",
        leagueId: comp.leagueId,
        leagueName: comp.leagueName,
        isCup: false,
        venue: "",
        jornada,
        homeId,
        homeName: home,
        homeShort: shortFor(home, homeId),
        homeBadge,
        awayId,
        awayName: away,
        awayShort: shortFor(away, awayId),
        awayBadge,
        kickoff: madridIso(m[7], m[8]),
        status: "finished",
        minute: 60,
        homeScore: Number(m[5]),
        awayScore: Number(m[6]),
        displayClock: "Fin",
        period: "Finalizado",
        events: [],
        duration: 70,
      });
    }
    const pendingRe =
      /id_equipo=(\d+)[^>]*>\s*([^<]+)<\/a>[\s\S]{0,120}?id_equipo=(\d+)[^>]*>\s*([^<]+)<\/a>[\s\S]{0,900}?<td class="fecha">[\s\S]{0,80}?(\d{2}\/\d{2}\/\d{4})[\s\S]{0,40}?(\d{1,2}:\d{2})/gi;
    for (const m of chunk.matchAll(pendingRe)) {
      const home = cleanName(m[2]);
      const away = cleanName(m[4]);
      if (!comp.ours.test(home) && !comp.ours.test(away)) continue;
      const id = `rfebm-${comp.id}-${jornada}-${m[1]}-${m[3]}`;
      if (events.some((e) => e.externalId === id)) continue;
      const homeId = slugFor(home, comp);
      const awayId = slugFor(away, comp);
      events.push({
        externalId: id,
        sport: "balonmano",
        leagueId: comp.leagueId,
        leagueName: comp.leagueName,
        isCup: false,
        venue: "",
        jornada,
        homeId,
        homeName: home,
        homeShort: shortFor(home, homeId),
        homeBadge: undefined,
        awayId,
        awayName: away,
        awayShort: shortFor(away, awayId),
        awayBadge: undefined,
        kickoff: madridIso(m[5], m[6]),
        status: "scheduled",
        minute: 0,
        homeScore: 0,
        awayScore: 0,
        displayClock: "",
        period: "Previsto",
        events: [],
        duration: 70,
      });
    }
  }
  return events;
}

function parseTable(html: string, comp: Comp): StandingRow[] {
  const rows: StandingRow[] = [];
  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] ?? html;
  for (const rm of tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const chunk = rm[1];
    const pos = chunk.match(/celda_peque'>\s*(\d+)/)?.[1];
    const name = cleanName(chunk.match(/nombre-clasi'[\s\S]*?<\/div>[\s\S]*?([A-ZÁÉÍÓÚÑ][^<]{3,80})</)?.[1] ?? chunk.match(/escudo_tabla_clasificacion'[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?([A-ZÁÉÍÓÚÑ][^<]{3,80})</)?.[1] ?? "");
    const fallbackName = cleanName((chunk.match(/id_equipo=\d+[^>]*>[\s\S]*?([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñü .'\-]{4,80})</) || [])[1] ?? "");
    const teamName = name.length > 3 ? name : fallbackName;
    if (!pos || teamName.length < 3) continue;
    const g = Number(chunk.match(/mostrarPartidos\('[^']+','g'[^>]*>\s*(\d+)/)?.[1] ?? "0");
    const e = Number(chunk.match(/mostrarPartidos\('[^']+','e'[^>]*>\s*(\d+)/)?.[1] ?? "0");
    const p = Number(chunk.match(/mostrarPartidos\('[^']+','p'[^>]*>\s*(\d+)/)?.[1] ?? "0");
    const goals = [...chunk.matchAll(/negrita centrado p-t-15'>\s*([+-]?\d+)/g)].map((x) => Number(x[1]));
    const gf = goals[0] ?? 0;
    const gc = goals[1] ?? 0;
    const slug = slugFor(teamName, comp);
    rows.push({
      pos: Number(pos),
      teamId: slug,
      name: teamName,
      short: shortFor(teamName, slug),
      pts: g * 2 + e,
      pj: g + e + p,
      g,
      e,
      p,
      gf,
      gc,
      form: [],
    });
  }
  return rows.slice(0, 16);
}

async function fetchComp(comp: Comp): Promise<{ events: ApiEvent[]; table: StandingRow[] }> {
  const calUrl = `https://resultadosbalonmano.isquad.es/calendario.php?seleccion=0&id=${comp.id}&id_superficie=1`;
  const claUrl = `https://resultadosbalonmano.isquad.es/clasificacion.php?seleccion=0&id=${comp.id}&id_superficie=1`;
  const [cal, cla] = await Promise.allSettled([getText(calUrl), getText(claUrl)]);
  const events = cal.status === "fulfilled" ? parseCalendar(cal.value, comp) : [];
  const table = cla.status === "fulfilled" ? parseTable(cla.value, comp) : [];
  return { events, table };
}

export async function fetchRfebm(): Promise<{ events: ApiEvent[]; tables: Record<string, StandingRow[]> }> {
  const settled = await Promise.allSettled(COMPS.map(fetchComp));
  const events: ApiEvent[] = [];
  const tables: Record<string, StandingRow[]> = {};
  COMPS.forEach((comp, i) => {
    const item = settled[i];
    if (item.status !== "fulfilled") return;
    events.push(...item.value.events);
    if (item.value.table.length) tables[comp.leagueId] = item.value.table;
  });
  return { events, tables };
}
