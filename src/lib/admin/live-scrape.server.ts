/**
 * Generic live score scraper.
 * Works for FEB, SoloFutsal, Futbolme and most sports sites.
 * Looks for score numbers only (home - away), ignores team names.
 */
export async function scrapeLiveScore(url: string): Promise<{ home: number; away: number } | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MasDeporteMelillense/1.0)",
        Accept: "text/html",
      },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();

    // 1. FEB specific: ESTADISTICAS DEL PARTIDO line
    const feb = html.match(/ESTADISTICAS DEL PARTIDO[\s\S]{0,250}?(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/i);
    if (feb) {
      const home = Number(feb[1]);
      const away = Number(feb[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 2. Common score patterns (SoloFutsal, Futbolme, Flashscore-style, etc.)
    const candidates: { home: number; away: number; weight: number }[] = [];

    const scoreRegex = /(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/g;
    let m: RegExpExecArray | null;
    while ((m = scoreRegex.exec(html)) !== null) {
      const home = Number(m[1]);
      const away = Number(m[2]);
      if (!isValid(home, away)) continue;

      let weight = 1;
      const context = html.slice(Math.max(0, m.index - 100), m.index + 100).toLowerCase();

      if (/marcador|resultado|score|livescore|en directo|directo|live|final|partido|boxscore/.test(context)) weight += 3;
      if (/estadisticas|ficha|match/.test(context)) weight += 2;
      if (m.index > html.length * 0.4) weight += 1;
      // Slightly prefer more realistic scores
      if (home + away > 0) weight += 0.5;

      candidates.push({ home, away, weight });
    }

    if (candidates.length) {
      candidates.sort((a, b) => b.weight - a.weight);
      return { home: candidates[0].home, away: candidates[0].away };
    }

    return null;
  } catch {
    return null;
  }
}

function isValid(home: number, away: number): boolean {
  return (
    Number.isFinite(home) &&
    Number.isFinite(away) &&
    home >= 0 &&
    away >= 0 &&
    home < 250 &&
    away < 250
  );
}
