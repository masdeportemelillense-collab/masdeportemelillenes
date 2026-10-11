import type { StandingRow } from "@/lib/types";

const URL = "https://www.feb.es/competiciones/resultados/segundafeb/2/2026";
const UA = "MasDeporteMelillense/1.0 (+https://masdeportemelillenes.netlify.app)";

function strip(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&/g, "&").replace(/\s+/g, " ").trim();
}

function shortOf(name: string): string {
  const clean = name.replace(/\b(CB|C\.B\.|CLUB|BALONCESTO|CIUDAD|DEL|DE|LA|SDP)\b/gi, "").replace(/\s+/g, " ").trim();
  return (clean || name).slice(0, 12).toUpperCase();
}

function teamId(name: string): string | undefined {
  const n = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (n.includes("melilla")) return "melilla-baloncesto";
  return undefined;
}

export async function fetchFebSegunda(): Promise<Record<string, StandingRow[]>> {
  const res = await fetch(URL, { headers: { "user-agent": UA, accept: "text/html" } });
  if (!res.ok) throw new Error(`feb ${res.status}`);
  const html = await res.text();
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
    out.push({
      pos,
      teamId: teamId(name),
      name,
      short: shortOf(name),
      pj,
      g: pg,
      e: 0,
      p: pp,
      gf: pf,
      gc: pc,
      pts: pg * 2,
      form: [],
    });
  }
  return out.length ? { "segunda-feb": out } : {};
}
