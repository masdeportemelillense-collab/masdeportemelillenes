/**
 * Lightweight scraper for live scores from external pages.
 * Optimized for FEB BoxScore.aspx.
 * Extracts only the score numbers (home - away) from the stats line,
 * ignoring team names completely.
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

    // Primary: FEB "ESTADISTICAS DEL PARTIDO" line — grab only the numbers around the dash
    // Example: ESTADISTICAS DEL PARTIDO\nMELILLA CIUDAD DEL DEPORTE 83 - 77 GRUPO ALEGA
    const feb = html.match(
      /ESTADISTICAS DEL PARTIDO[\s\S]{0,200}?(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/i,
    );
    if (feb) {
      const home = Number(feb[1]);
      const away = Number(feb[2]);
      if (isValidScore(home, away)) return { home, away };
    }

    // Secondary: look for a score near the end of the page (common in BoxScore)
    const nearEnd = html.slice(-4000);
    const endMatch = nearEnd.match(/(\d{1,3})\s*[-\u2013]\s*(\d{1,3})(?!\d)/g);
    if (endMatch && endMatch.length) {
      // Take the last reasonable score found near the bottom
      for (let i = endMatch.length - 1; i >= 0; i--) {
        const m = endMatch[i].match(/(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/);
        if (m) {
          const home = Number(m[1]);
          const away = Number(m[2]);
          if (isValidScore(home, away)) return { home, away };
        }
      }
    }

    // Fallback: first reasonable "NN - NN" that is not a percentage or tiny number
    const generic = html.match(/(\d{1,3})\s*[-\u2013]\s*(\d{1,3})(?!\s*%)/);
    if (generic) {
      const home = Number(generic[1]);
      const away = Number(generic[2]);
      if (isValidScore(home, away) && (home > 5 || away > 5)) return { home, away };
    }

    return null;
  } catch {
    return null;
  }
}

function isValidScore(home: number, away: number): boolean {
  return (
    Number.isFinite(home) &&
    Number.isFinite(away) &&
    home >= 0 &&
    away >= 0 &&
    home < 200 &&
    away < 200
  );
}
