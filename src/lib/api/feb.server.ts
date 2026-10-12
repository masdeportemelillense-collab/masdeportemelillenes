import type { ApiEvent, StandingRow } from "@/lib/api/types";
import type { MatchStatus } from "@/lib/types";

const UA = "MasDeporteMelillense/1.0 (+https://masdeportemelillenes.netlify.app)";
const SEGUNDA = "https://www.feb.es/competiciones/resultados/segundafeb/2/2026";
const TERCERA = "https://baloncestoenvivo.feb.es/resultados/ligaeba/7/2026";
const CHALLENGE = "https://www.feb.es/lfchallenge/clasificacion.aspx";
const CALENDAR = "https://baloncestoenvivo.feb.es/calendario.aspx?g=3&t=2026&nm=tercerafeb";

function strip(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&/g, "&").replace(/"/g, '"').replace(/\s+/g, " ").trim();
}

function shortOf(name: string): string {
  const clean = name.replace(/\b(CB|C\.B\.|CLUB|BALONCESTO|CIUDAD|DEL|DE|LA|SDP|MELILLA)\b/gi, "").replace(/\s+/g, " ").trim();
  return (clean || name).slice(0, 12).toUpperCase();
}

function teamId(name: string): string | undefined {
  const n = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (n.includes("enrique soler")) return "enrique-soler";
  if (n.includes("salle")) return "la-salle-fem";
  if (n.includes("melilla") && !n.includes("soler")) return "melilla-baloncesto";
  return undefined;
}

function parseTable(html: string): StandingRow[] {
  const table = html.match(/clasificacionDataGrid[\s\S]*?<\/table>/i)?.[0] ?? "";
  const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].slice(1);
  const out: StandingRow[] = [];
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
    if (cells.length < 7) continue;
    const pos = Number(cells[0]);
    const name = cells[1];
    const pj = Number(cells[2]) || 0;
    const pg = Number(cells[3]) || 0;
    const pp = Number(cells[4]) || 0;
    const pf = Number(cells[5]) || 0;
    const pc = Number(cells[6]) || 0;
    if (!name || !pos) continue;
    out.push({ pos, teamId: teamId(name), name, short: shortOf(name), pj, g: pg, e: 0, p: pp, gf: pf, gc: pc, pts: pg * 2, form: [] });
  }
  return out;
}

function madrid(date: string, time = "18:00"): string {
  const [d, m, y] = date.split("/").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const tz = m > 10 || (m === 10 && d >= 25) || m < 3 || (m === 3 && d < 29) ? "+01:00" : "+02:00";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00${tz}`;
}

function parseCalendar(html: string): ApiEvent[] {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, "\n");
  const lines = text.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const start = lines.findIndex((l) => /^Jornada 1\b/i.test(l));
  const body = start >= 0 ? lines.slice(start) : lines;
  const events: ApiEvent[] = [];
  let jornada = 0;
  let fallback = "";
  let i = 0;
  const isTeam = (s: string) => /[A-ZÁÉÍÓÚÑ]/.test(s) && !/^(JORNADA|LOCAL|RESULTADO|VISITANTE|SÁBADO|DOMINGO|VIERNES|JUEVES|MARTES|MIÉRCOLES|LUNES)$/i.test(s) && !/^\d/.test(s);
  while (i < body.length) {
    const head = body[i].match(/^Jornada (\d+)\s+(\d{2}\/\d{2}\/\d{4})/i);
    if (head) {
      jornada = Number(head[1]);
      fallback = head[2];
      i += 1;
      continue;
    }
    if (isTeam(body[i]) && i + 2 < body.length) {
      const home = body[i];
      const next = body[i + 1];
      if (/^\d+\s*-\s*\d+$/.test(next) && isTeam(body[i + 2])) {
        const [hs, as] = next.split("-").map(Number);
        events.push(eventOf(jornada, home, body[i + 2], madrid(fallback), "finished", hs, as));
        i += 3;
        continue;
      }
      if (/^(SÁBADO|DOMINGO|VIERNES|JUEVES|MARTES|MIÉRCOLES|LUNES)$/i.test(next) && /^\d{2}\/\d{2}\/\d{4}$/.test(body[i + 2]) && /^\d{2}:\d{2}$/.test(body[i + 3] ?? "") && isTeam(body[i + 4] ?? "")) {
        events.push(eventOf(jornada, home, body[i + 4], madrid(body[i + 2], body[i + 3]), "scheduled", 0, 0));
        i += 5;
        continue;
      }
    }
    i += 1;
  }
  return events.filter((e) => e.homeId || e.awayId);
}

function eventOf(jornada: number, home: string, away: string, kickoff: string, status: MatchStatus, homeScore: number, awayScore: number): ApiEvent {
  const homeMelilla = !!teamId(home);
  return {
    externalId: `feb-soler-${jornada}-${home.slice(0, 8)}-${away.slice(0, 8)}`,
    sport: "baloncesto",
    leagueId: "tercera-feb",
    leagueName: "Tercera FEB · Grupo D-A",
    isCup: false,
    venue: homeMelilla ? "Pabellón Guillermo García Pezzi" : "Fuera",
    jornada,
    homeId: teamId(home),
    homeName: home,
    homeShort: shortOf(home),
    awayId: teamId(away),
    awayName: away,
    awayShort: shortOf(away),
    kickoff,
    status,
    minute: status === "finished" ? 40 : 0,
    homeScore,
    awayScore,
    displayClock: status === "finished" ? "Final" : "",
    period: status === "finished" ? "Final" : "Previsto",
    events: [],
    duration: 40,
  };
}


function parseChallenge(html: string): StandingRow[] {
  const rows = [...html.matchAll(/<tr[^>]*trClasificacionTabla[\s\S]*?<\/tr>/gi)];
  const out: StandingRow[] = [];
  for (const row of rows) {
    const cells = [...row[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1]));
    if (cells.length < 7) continue;
    const pos = Number(cells[0]);
    const name = cells[1];
    const pj = Number(cells[2]) || 0;
    const pg = Number(cells[3]) || 0;
    const pp = Number(cells[4]) || 0;
    const pf = Number(cells[5]) || 0;
    const pc = Number(cells[6]) || 0;
    if (!name || !pos) continue;
    out.push({ pos, teamId: teamId(name), name, short: shortOf(name), pj, g: pg, e: 0, p: pp, gf: pf, gc: pc, pts: pg * 2, form: [] });
  }
  return out;
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" } });
  if (!res.ok) throw new Error(`feb ${res.status}`);
  return res.text();
}

async function calendarHtml(): Promise<string> {
  const first = await get(CALENDAR);
  const val = (id: string) => first.match(new RegExp(`id="${id}" value="([^"]*)"`))?.[1] ?? "";
  const body = new URLSearchParams({
    __EVENTTARGET: "_ctl0$MainContentPlaceHolderMaster$gruposDropDownList",
    __EVENTARGUMENT: "",
    __VIEWSTATE: val("__VIEWSTATE"),
    __VIEWSTATEGENERATOR: val("__VIEWSTATEGENERATOR"),
    __EVENTVALIDATION: val("__EVENTVALIDATION"),
    "_ctl0:MainContentPlaceHolderMaster:temporadasDropDownList": "2026",
    "_ctl0:MainContentPlaceHolderMaster:gruposDropDownList": "90065",
  });
  const res = await fetch(CALENDAR, {
    method: "POST",
    headers: { "user-agent": UA, "content-type": "application/x-www-form-urlencoded", referer: CALENDAR },
    body,
  });
  if (!res.ok) return first;
  return res.text();
}

export async function fetchFebSegunda(): Promise<Record<string, StandingRow[]>> {
  const all = await fetchFeb();
  return all.tables;
}

export async function fetchFeb(): Promise<{ tables: Record<string, StandingRow[]>; events: ApiEvent[] }> {
  const tables: Record<string, StandingRow[]> = {};
  let events: ApiEvent[] = [];
  try {
    const segunda = parseTable(await get(SEGUNDA));
    if (segunda.length) tables["segunda-feb"] = segunda;
  } catch { /* keep going */ }
  try {
    const tercera = parseTable(await get(TERCERA));
    if (tercera.length) tables["tercera-feb"] = tercera;
  } catch { /* keep going */ }
  try {
    const challenge = parseChallenge(await get(CHALLENGE));
    if (challenge.length) tables["lf-challenge"] = challenge;
  } catch { /* keep going */ }
  try {
    events = parseCalendar(await calendarHtml());
  } catch { /* keep going */ }
  return { tables, events };
}
