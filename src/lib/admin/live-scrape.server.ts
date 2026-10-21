/**
 * Lightweight scraper for live scores from external pages.
 * Optimized for FEB BoxScore.aspx (looks for "TEAM 70 - 65 TEAM" style lines).
 * Returns null if it cannot confidently extract a score.
 */
export async function scrapeLiveScore(url: string): Promise<{ home: number; away: number } | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MasDeporteMelillense/1.0" },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    // Prefer the explicit stats line used by FEB BoxScore
    const feb = html.match(/ESTADISTICAS DEL PARTIDO[\s\S]{0,400}?([A-Z\u00C0-\u017F0-9 .'-]{3,40})\s+(\d{1,3})\s*[-\u2013]\s*(\d{1,3})\s+([A-Z\u00C0-\u017F0-9 .'-]{3,40})/i);
    if (feb) {
      const home = Number(feb[2]);
      const away = Number(feb[3]);
      if (Number.isFinite(home) && Number.isFinite(away) && home >= 0 && away >= 0 && home < 200 && away < 200) {
        return { home, away };
      }
    }
    // Fallback: first reasonable "NN - NN" near team-like text
    const generic = html.match(/(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/);
    if (generic) {
      const home = Number(generic[1]);
      const away = Number(generic[2]);
      if (Number.isFinite(home) && Number.isFinite(away) && home >= 0 && away >= 0 && home < 200 && away < 200) {
        return { home, away };
      }
    }
    return null;
  } catch {
    return null;
  }
}
