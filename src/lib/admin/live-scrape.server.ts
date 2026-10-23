/**
 * Generic live score scraper.
 * Works for FEB, SoloFutsal, Futbolme and most sports sites.
 * Looks for score numbers only (home - away), ignores team names.
 */
export async function scrapeLiveScore(url: string): Promise<{ home: number; away: number } | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();

    // 1. SoloFutsal: score-badge-hero is the main live score
    const soloHero = html.match(/score-badge-hero[^>]*>\s*(\d+)\s*[-\u2013]\s*(\d+)/i);
    if (soloHero) {
      const home = Number(soloHero[1]);
      const away = Number(soloHero[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 2. Alternative SoloFutsal pattern (sometimes the class is split)
    const soloAlt = html.match(/class=["']score-badge-hero["'][^>]*>\s*(\d+)\s*[-\u2013]\s*(\d+)/i);
    if (soloAlt) {
      const home = Number(soloAlt[1]);
      const away = Number(soloAlt[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 3. FEB
    const feb = html.match(/ESTADISTICAS DEL PARTIDO[\s\S]{0,300}?(\d+)\s*[-\u2013]\s*(\d+)/i);
    if (feb) {
      const home = Number(feb[1]);
      const away = Number(feb[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 4. Score right before or after DIRECTO badge
    const directo = html.match(/(\d+)\s*[-\u2013]\s*(\d+)[\s\S]{0,200}DIRECTO/i)
      || html.match(/DIRECTO[\s\S]{0,200}(\d+)\s*[-\u2013]\s*(\d+)/i);
    if (directo) {
      const home = Number(directo[1]);
      const away = Number(directo[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 5. First score in the main content area (after the date/jornada header)
    const header = html.search(/Jornada|Pabell|score-badge|DIRECTO/i);
    if (header > 0) {
      const area = html.slice(header, header + 1500);
      const first = area.match(/(\d+)\s*[-\u2013]\s*(\d+)/);
      if (first) {
        const home = Number(first[1]);
        const away = Number(first[2]);
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
