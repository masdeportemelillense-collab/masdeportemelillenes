import { teams as staticTeams } from "@/data/teams";
import type { CatalogMatch, CatalogState, CatalogTeam, MatchDraft, TeamDraft } from "@/lib/catalog/types";
import { readDoc, updateDoc } from "@/lib/persist.server";
import type { MatchEvent, Sport } from "@/lib/types";

const KEY = "catalog";
const EMPTY: CatalogState = { teams: [], matches: [] };

const DURATION: Record<Sport, number> = {
  futbol: 95,
  baloncesto: 48,
  voleibol: 110,
  balonmano: 70,
  futsal: 48,
  bsr: 48,
};

function slugify(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || `equipo-${Date.now()}`;
}

export async function getCatalog(): Promise<CatalogState> {
  const doc = await readDoc<CatalogState>(KEY, EMPTY);
  return {
    teams: Array.isArray(doc.teams) ? doc.teams : [],
    matches: Array.isArray(doc.matches) ? doc.matches : [],
  };
}

export async function saveTeam(draft: TeamDraft): Promise<CatalogTeam> {
  const id = (draft.id?.trim() || slugify(draft.name)).toLowerCase();
  const base = staticTeams.find((t) => t.id === id);
  const team: CatalogTeam = {
    id,
    name: draft.name.trim() || base?.name || id,
    short: (draft.short.trim() || base?.short || draft.name.slice(0, 4)).toUpperCase(),
    sport: draft.sport || base?.sport || "futbol",
    gender: draft.gender || base?.gender || "m",
    category: draft.category.trim() || base?.category || "Senior",
    leagueId: draft.leagueId.trim() || base?.leagueId || "",
    venue: draft.venue.trim() || base?.venue || "",
    founded: Number(draft.founded) || base?.founded || new Date().getFullYear(),
    primary: base?.primary || "#15233a",
    secondary: base?.secondary || "#e8e6dc",
    nickname: draft.nickname.trim() || base?.nickname || draft.name.trim(),
    summary: draft.summary.trim() || base?.summary || "",
    badgeUrl: draft.badgeUrl.trim() || undefined,
    hidden: false,
    updatedAt: Date.now(),
  };
  await updateDoc<CatalogState>(KEY, EMPTY, (cur) => {
    const others = cur.teams.filter((t) => t.id !== id);
    return { ...cur, teams: [...others, team] };
  });
  return team;
}

export async function hideTeam(id: string): Promise<void> {
  await updateDoc<CatalogState>(KEY, EMPTY, (cur) => ({
    ...cur,
    teams: cur.teams.map((t) => (t.id === id ? { ...t, hidden: true, updatedAt: Date.now() } : t)),
  }));
}

export async function saveMatch(draft: MatchDraft): Promise<CatalogMatch> {
  const id = draft.id?.trim() || `adm-${slugify(`${draft.homeName}-${draft.awayName}-${draft.kickoff}`)}`;
  const hs = Number(draft.homeScore) || 0;
  const as = Number(draft.awayScore) || 0;
  const events: MatchEvent[] = draft.finished
    ? [{ minute: 90, side: hs >= as ? "home" : "away", kind: "punto", player: "Final", homeScore: hs, awayScore: as, note: `*${hs}-${as}` }]
    : [];
  const kickoff = draft.kickoff.length === 16 ? `${draft.kickoff}:00` : draft.kickoff;
  const match: CatalogMatch = {
    id,
    leagueId: draft.leagueId.trim(),
    sport: draft.sport,
    venue: draft.venue.trim(),
    jornada: Number(draft.jornada) || 0,
    homeId: draft.homeId.trim() || undefined,
    homeName: draft.homeName.trim(),
    homeShort: (draft.homeShort.trim() || draft.homeName.slice(0, 3)).toUpperCase(),
    homeBadge: draft.homeBadge.trim() || undefined,
    awayId: draft.awayId.trim() || undefined,
    awayName: draft.awayName.trim(),
    awayShort: (draft.awayShort.trim() || draft.awayName.slice(0, 3)).toUpperCase(),
    awayBadge: draft.awayBadge.trim() || undefined,
    kickoff,
    events,
    duration: DURATION[draft.sport] ?? 90,
    source: "catalog",
    updatedAt: Date.now(),
  };
  await updateDoc<CatalogState>(KEY, EMPTY, (cur) => {
    const others = cur.matches.filter((m) => m.id !== id);
    return { ...cur, matches: [...others, match] };
  });
  return match;
}

export async function deleteMatch(id: string): Promise<void> {
  await updateDoc<CatalogState>(KEY, EMPTY, (cur) => ({
    ...cur,
    matches: cur.matches.filter((m) => m.id !== id),
  }));
}
