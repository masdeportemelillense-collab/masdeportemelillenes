const URL = "https://futbolme.com/resultados-directo/torneo/tercera-federacion-grupo-9/3079/";
const UA = "MasDeporteMelillense/1.0 (+https://masdeportemelillenes.netlify.app)";

export type Group9Match = {
  home: string;
  away: string;
  score: string;
  played: boolean;
};

export type Group9Round = {
  jornada: number;
  matches: Group9Match[];
  source: string;
};

function strip(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&/g, "&").replace(/\s+/g, " ").trim();
}

export async function fetchGroup9(): Promise<Group9Round> {
  const res = await fetch(URL, { headers: { "user-agent": UA, accept: "text/html" } });
  if (!res.ok) throw new Error(`futbolme ${res.status}`);
  const html = await res.text();
  const jornada = Number(html.match(/Jornada\s+(\d+)/i)?.[1] ?? 0);
  const cards = html.split('class="cajaPartido"').slice(1);
  const matches: Group9Match[] = [];
  for (const card of cards) {
    const title = card.match(/itemprop="name"\s+content="([^"]+)"/i)?.[1] ?? "";
    const parts = title.split(/\s+-\s+/);
    if (parts.length < 2) continue;
    const result = card.match(/class="col-2 resultadoPartido"([\s\S]*?)<\/div>\s*<\/div>/i)?.[1] ?? "";
    const nums = [...result.matchAll(/>(\d+)</g)].map((m) => m[1]);
    const hora = strip(result.match(/horaPartido[\s\S]*?(\d{1,2}:\d{2})/)?.[1] ?? "");
    const played = nums.length >= 2;
    matches.push({
      home: parts[0].trim(),
      away: parts.slice(1).join(" - ").trim(),
      score: played ? `${nums[0]}-${nums[1]}` : hora || "–",
      played,
    });
  }
  return { jornada, matches, source: URL };
}
