/** Friday 17:00 Europe/Madrid lock helpers. */

const TZ = "Europe/Madrid";

/** Cierre excepcional de la primera jornada (sábado 26/09/2026 12:00 Madrid). */
export const JORNADA1_LOCK_AT = "2026-09-26T12:00:00+02:00";

export function madridParts(ms = Date.now()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
} {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date(ms))) {
    if (p.type !== "literal") bag[p.type] = p.value;
  }
  const weekMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    weekday: weekMap[bag.weekday] ?? 0,
  };
}

function lastSunday(year: number, month: number): number {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dow = new Date(Date.UTC(year, month - 1, last)).getUTCDay();
  return last - dow;
}

/** EU DST: last Sunday of March 01:00 UTC → last Sunday of October 01:00 UTC. */
export function madridOffset(year: number, month: number, day: number): "+01:00" | "+02:00" {
  const start = lastSunday(year, 3);
  const end = lastSunday(year, 10);
  const n = month * 100 + day;
  if (n > 3 * 100 + start && n < 10 * 100 + end) return "+02:00";
  return "+01:00";
}

export function madridWallToIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string {
  const off = madridOffset(year, month, day);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${off}`;
}

/** Next Friday 17:00 Madrid. If it is Friday before 17:00, use today. */
export function nextFridayLockIso(ms = Date.now()): string {
  const p = madridParts(ms);
  let add = (5 - p.weekday + 7) % 7;
  if (add === 0 && p.hour >= 17) add = 7;
  const base = Date.UTC(p.year, p.month - 1, p.day) + add * 86_400_000;
  const d = new Date(base);
  return madridWallToIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 17, 0);
}

export function isLocked(lockAt: string, now = Date.now()): boolean {
  const t = Date.parse(lockAt);
  return Number.isFinite(t) ? now >= t : true;
}

export function formatMadrid(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString("es-ES", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function looksLikeJornada1(title: string): boolean {
  return /jornada\s*1\b/i.test(title);
}
