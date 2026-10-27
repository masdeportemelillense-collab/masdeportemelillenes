/**
 * Live score scraper.
 * For SoloFutsal: only reads the score-badge-hero element.
 * For FEB: reads ESTADISTICAS DEL PARTIDO.
 * For Beach Soccer Worldwide: reads the main score display.
 * Ignores team names completely.
 */
export async function scrapeLiveScore(url: string): Promise<{ home: number; away: number } | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();

    // SoloFutsal
    if (/solofutsal\.es/i.test(url)) {
      const hero = html.match(/<div[^>]*class=["'][^"']*score-badge-hero[^"']*["'][^>]*>\s*(\d+)\s*[-\u2013]\s*(\d+)\s*<\/div>/i);
      if (hero) {
        const home = Number(hero[1]);
        const away = Number(hero[2]);
        if (isValid(home, away)) return { home, away };
      }
      const nearDirecto = html.match(/(\d+)\s*[-\u2013]\s*(\d+)[\s\S]{0,80}DIRECTO/i);
      if (nearDirecto) {
        const home = Number(nearDirecto[1]);
        const away = Number(nearDirecto[2]);
        if (isValid(home, away)) return { home, away };
      }
      return null;
    }

    // FEB
    const feb = html.match(/ESTADISTICAS DEL PARTIDO[\s\S]{0,300}?(\d+)\s*[-\u2013]\s*(\d+)/i);
    if (feb) {
      const home = Number(feb[1]);
      const away = Number(feb[2]);
      if (isValid(home, away)) return { home, away };
    }

    // Beach Soccer Worldwide (beachsoccer.com)
    if (/beachsoccer\.com/i.test(url)) {
      // Look for the score in the match header, e.g. "0 - 8" or similar prominent display
      const scoreMatch = html.match(/(\d+)\s*[-\u2013]\s*(\d+)/);
      if (scoreMatch) {
        const home = Number(scoreMatch[1]);
        const away = Number(scoreMatch[2]);
        if (isValid(home, away)) return { home, away };
      }
    }

    return null;
  } catch {
    return null;
  }
}

function isValid(home: number, away: number): boolean {
  return Number.isFinite(home) && Number.isFinite(away) && home >= 0 && away >= 0 && home < 250 && away < 250;
}
