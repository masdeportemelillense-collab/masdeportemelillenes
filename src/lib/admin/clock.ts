import type { AdminOverride } from "@/lib/admin/types";
import type { Sport } from "@/lib/types";

export const LIVE_PERIODS = [
  "1ª Parte",
  "2ª Parte",
  "1er Cuarto",
  "2º Cuarto",
  "3er Cuarto",
  "4º Cuarto",
  "Prórroga",
  "1er Set",
  "2º Set",
  "3er Set",
  "4º Set",
  "5º Set",
] as const;

export type LivePeriod = (typeof LIVE_PERIODS)[number];

export function defaultPeriod(sport: Sport): LivePeriod {
  if (sport === "baloncesto" || sport === "bsr") return "1er Cuarto";
  if (sport === "voleibol") return "1er Set";
  return "1ª Parte";
}

export function usesFootballClock(sport: Sport): boolean {
  return sport === "futbol" || sport === "futsal" || sport === "balonmano";
}

export function periodBaseMinute(label: string): number {
  if (label === "2ª Parte") return 45;
  if (label === "Prórroga") return 90;
  return 0;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function clockFromOverride(
  hit: Pick<AdminOverride, "clockAnchorAt" | "clockBaseMinute" | "minute" | "periodLabel">,
  now = Date.now(),
): { minute: number; seconds: number; display: string } {
  const base = hit.clockBaseMinute ?? 0;
  if (hit.clockAnchorAt && Number.isFinite(hit.clockAnchorAt)) {
    const elapsed = Math.max(0, now - hit.clockAnchorAt);
    const totalSec = Math.floor(elapsed / 1000) + base * 60;
    const minute = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return { minute, seconds, display: `${pad(minute)}:${pad(seconds)}` };
  }
  const minute = hit.minute ?? 0;
  return { minute, seconds: 0, display: `${pad(minute)}:00` };
}

export function kickoffAnchor(kickoff?: string, now = Date.now()): number {
  const t = kickoff ? Date.parse(kickoff) : Number.NaN;
  if (Number.isFinite(t) && t <= now && now - t < 3 * 60 * 60 * 1000) return t;
  return now;
}
