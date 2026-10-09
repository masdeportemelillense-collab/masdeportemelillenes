import { applyAdminOverrides } from "@/lib/admin/apply";
import { leagueById } from "@/data/leagues";
import { matches } from "@/data/matches";
import { API_TRACKED_SLUGS, normName } from "@/lib/api/map";
import type { ApiEvent, LiveSnapshot } from "@/lib/api/types";
import { resolveMatch, standingsFor } from "@/lib/live";
import type { Match, ResolvedMatch, StandingRow, Team } from "@/lib/types";
import { teams as staticTeams } from "@/data/teams";
import type { CatalogTeam } from "@/lib/catalog/types";

const MATCH_WINDOW_MS = 36 * 60 * 60 * 1000;

function badgePick(id: string | undefined, name: string | undefined, map: Map<string, string>): string | undefined {
  if (id && map.get(`id:${id}`)) return map.get(`id:${id}`);
  const key = `name:${(name ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")}`;
  return map.get(key);
}

export function mergeRoster(extra?: CatalogTeam[], badgeOverrides?: { key: string; badgeUrl: string }[]): Team[] {
  const map = new Map<string, Team>();
  for (const t of staticTeams) map.set(t.id, t);
  for (const t of extra ?? []) {
    if (t.hidden) {
      map.delete(t.id);
      continue;
    }
    const prev = map.get(t.id);
    map.set(t.id, { ...(prev ?? t), ...t });
  }
  const badges = new Map((badgeOverrides ?? []).map((b) => [b.key, b.badgeUrl]));
  return [...map.values()].map((t) => {
    const url = badgePick(t.id, t.name, badges);
    return url ? { ...t, badgeUrl: url } : t;
  });
}
