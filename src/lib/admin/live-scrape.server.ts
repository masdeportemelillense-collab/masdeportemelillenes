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

    // 1. FEB specific
    const feb = html.match(/ESTADISTICAS DEL PARTIDO[\s\S]{0,250}?(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/i);
    if (feb) {
      const home = Number(feb[1]);
      const away = Number(feb[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 2. SoloFutsal: look for score near "DIRECTO" or between team names in the main area
    const solo = html.match(/(\d{1,3})\s*[-\u2013]\s*(\d{1,3})[\s\S]{0,120}DIRECTO/i)
      || html.match(/DIRECTO[\s\S]{0,120}(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/i);
    if (solo) {
      const home = Number(solo[1]);
      const away = Number(solo[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 3. Prefer the first score that appears after the match header / venue info
    const headerIdx = html.search(/Pabell[oó]n|Jornada|DIRECTO|Acta del/i);
    const searchFrom = headerIdx > 0 ? headerIdx : 0;
    const mainArea = html.slice(searchFrom, searchFrom + 2500);
    const mainMatch = mainArea.match(/(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/);
    if (mainMatch) {
      const home = Number(mainMatch[1]);
      const away = Number(mainMatch[2]);
      if (isValid(home, away)) return { home, away };
    }

    // 4. Fallback with weighting (avoid historical scores further down)
    const candidates: { home: number; away: number; weight: number }[] = [];
    const scoreRegex = /(\d{1,3})\s*[-\u2013]\s*(\d{1,3})/g;
    let m: RegExpExecArray | null;
    while ((m = scoreRegex.exec(html)) !== null) {
      const home = Number(m[1]);
      const away = Number(m[2]);
      if (!isValid(home, away)) continue;

      let weight = 1;
      const context = html.slice(Math.max(0, m.index - 120), m.index + 120).toLowerCase();

      if (/directo|live|en juego|marcador|resultado/.test(context)) weight += 4;
      if (/pabell|jornada|acta|partido/.test(context)) weight += 2;
      // Prefer earlier scores (main match is usually near the top)
      if (m.index < html.length * 0.3) weight += 2;
      if (m.index > html.length * 0.6) weight -= 1;

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
