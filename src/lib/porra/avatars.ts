import { badgeFor } from "@/data/badges";
import { futbolmeBadge } from "@/data/futbolme-badges";
import { officialBadge } from "@/data/official-badges";
import { solofutsalBadge } from "@/data/solofutsal-badges";
import { teams } from "@/data/teams";

export function crestSrc(id?: string, name?: string): string | undefined {
  return officialBadge(id, name) || solofutsalBadge(id, name) || futbolmeBadge(id, name) || badgeFor(id, name);
}

export type PorraAvatarOption = {
  id: string;
  name: string;
  short: string;
  sport: string;
  src?: string;
};

export function porraAvatarOptions(): PorraAvatarOption[] {
  return teams.map((t) => ({
    id: t.id,
    name: t.name,
    short: t.short,
    sport: t.sport,
    src: crestSrc(t.id, t.name),
  }));
}

export function isPorraAvatar(id?: string | null): id is string {
  return Boolean(id && teams.some((t) => t.id === id));
}
