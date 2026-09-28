import { shortFor } from "@/lib/api/map";
import type { ApiEvent } from "@/lib/api/types";
import type { MatchStatus, StandingRow } from "@/lib/types";

const CAL =
  "https://resultadosbalonmano.isquad.es/calendario.php?seleccion=0&id=1031246&id_superficie=1";
const CLA =
  "https://resultadosbalonmano.isquad.es/clasificacion.php?seleccion=0&id=1031246&id_superficie=1";
const FETCH_MS = 16_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const LEAGUE_ID = "bm-primera-f";
const LEAGUE_NAME = "Primera División Masculina BM · Grupo F";
const CREST =
  "https://resultadosbalonmano.isquad.es/images/escudos/";

function decode(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<br\s*\/?>/gi, " ");
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": UA, "Accept-Language": "es-ES,es;q=0.9" },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`RFEBM ${res.status}`);
  return decode(await res.text());
}

function slugForName(name: string): string | undefined {
  if (/virgen\s*de\s*la\s*victoria|melilla/i.test(name)) return "virgen-victoria";
  return undefined;
}

function isOurs(name: string): boolean {
  return /virgen\s*de\s*la\s*victoria|melilla/i.test(name);
}

function badgeOf(name: string, html: string): string | undefined {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const m = html.match(new RegExp(`src="([^"]*escudos[^"]+)"[^>]*alt="[^"]*${name.slice(0, 8)}`, "i"));
  if (m?.[1]) return m[1].startsWith("http") ? m[1] : `https://resultadosbalonmano.isquad.es/${m[1].replace(/^\//, "")}`;
  const any = html.match(/src="([^"]*(?:escudo|logo)[^"]+)"/i);
  if (any?.[1] && isOurs(name)) return any[1].startsWith("http") ? any[1] : `https://resultadosbalonmano.isquad.es/${any[1].replace(/^\//, "")}`;
  return undefined;
}

function madridIso(dmy: string, time: string): string {
  const [d, m, y] = dmy.split(/[/-]/).map(Number);
  const t = /^\d{1,2}:\d{2}$/.test(time) ? time : "12:00";
  const [hh, mm] = t.split(":").map(Number);
  const offset = m >= 3 && m <= 10 ? "+02:00" : "+01:00";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00${offset}`;
}

function parseCalendar(html: string): ApiEvent[] {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const events: ApiEvent[] = [];
  const jornadaRe = /JORNADA\s+(\d+)\s*\((\d{2}-\d{2}-\d{4})\)/gi;
  const marks = [...text.matchAll(jornadaRe)];
  for (let i = 0; i < marks.length; i++) {
    const jornada = Number(marks[i][1]);
    const chunk = text.slice(marks[i].index, marks[i + 1]?.index);
    const row =
      /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñü0-9 .'\-]{3,60})\s+[-]–\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñü0-9 .'\-]{3,60})\s+(\d{1,3})\s*[-]–\s*(\d{1,3})[\s\S]{0,40}?(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2})/g;
    const pending =
      /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñü0-9 .'\-]{3,60})\s+[-]–\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñü0-9 .'\-]{3,60})\s+(?:-\s*-)?[\s\S]{0,20}?(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2})/g;
    for (const m of chunk.matchAll(row)) {
      const home = m[1].replace(/^VS\s+/i, "").trim();
      const away = m[2].trim();
      if (!isOurs(home) && !isOurs(away)) continue;
      const homeId = slugForName(home);
      const awayId = slugForName(away);
      events.push({
        externalId: `rfebm-${jornada}-${home}-${away}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80),
        sport: "balonmano",
        leagueId: LEAGUE_ID,
        leagueName: LEAGUE_NAME,
        isCup: false,
        venue: "",
        jornada,
        homeId,
        homeName: home,
        homeShort: shortFor(home, homeId),
        homeBadge: badgeOf(home, html),
        awayId,
        awayName: away,
        awayShort: shortFor(away, awayId),
        awayBadge: badgeOf(away, html),
        kickoff: madridIso(m[5], m[6]),
        status: "finished",
        minute: 60,
        homeScore: Number(m[3]),
        awayScore: Number(m[4]),
        displayClock: "Fin",
        period: "Finalizado",
        events: [],
        duration: 70,
      });
    }
    for (const m of chunk.matchAll(pending)) {
      const home = m[1].replace(/^VS\s+/i, "").trim();
      const away = m[2].trim();
      if (!isOurs(home) && !isOurs(away)) continue;
      if (/^\d+$/.test(home) || /^\d+$/.test(away)) continue;
      const homeId = slugForName(home);
      const awayId = slugForName(away);
      const id = `rfebm-${jornada}-${home}-${away}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
      if (events.some((e) => e.externalId === id)) continue;
      events.push({
        externalId: id,
        sport: "balonmano",
        leagueId: LEAGUE_ID,
        leagueName: LEAGUE_NAME,
        isCup: false,
        venue: "",
        jornada,
        homeId,
        homeName: home,
        homeShort: shortFor(home, homeId),
        homeBadge: badgeOf(home, html),
        awayId,
        awayName: away,
        awayShort: shortFor(away, awayId),
        awayBadge: badgeOf(away, html),
        kickoff: madridIso(m[3], m[4]),
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

function parseTable(html: string): StandingRow[] {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const rows: StandingRow[] = [];
  const re =
    /(\d{1,2})\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñü0-9 .'\-]{3,55})\s+(\d{1,3})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,3})\s+(\d{1,3})/g;
  for (const m of text.matchAll(re)) {
    const name = m[2].trim();
    if (/jornada|grupo|equipo/i.test(name)) continue;
    const slug = slugForName(name);
    rows.push({
      pos: Number(m[1]),
      teamId: slug,
      name,
      short: shortFor(name, slug),
      pts: Number(m[3]),
      pj: Number(m[4]),
      g: Number(m[5]),
      e: Number(m[6]),
      p: Number(m[7]),
      gf: Number(m[8]),
      gc: Number(m[9]),
      form: [],
    });
  }
  return rows.slice(0, 16);
}

export async function fetchRfebm(): Promise<{ events: ApiEvent[]; tables: Record<string, StandingRow[]> }> {
  const [cal, cla] = await Promise.allSettled([getText(CAL), getText(CLA)]);
  const events = cal.status === "fulfilled" ? parseCalendar(cal.value) : [];
  const table = cla.status === "fulfilled" ? parseTable(cla.value) : cal.status === "fulfilled" ? parseTable(cal.value) : [];
  return { events, tables: table.length ? { [LEAGUE_ID]: table } : {} };
}
