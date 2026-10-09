import { readDoc, updateDoc } from "@/lib/persist.server";

export type BadgeOverride = { key: string; badgeUrl: string };

const KEY = "badge-overrides";

export function badgeNameKey(name: string): string {
  return `name:${name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")}`;
}

export function badgeIdKey(id: string): string {
  return `id:${id}`;
}

export async function listBadgeOverrides(): Promise<BadgeOverride[]> {
  return readDoc<BadgeOverride[]>(KEY, []);
}

export async function setBadgeOverride(teamId: string | undefined, name: string, badgeUrl: string): Promise<void> {
  const url = badgeUrl.trim();
  const keys = [badgeNameKey(name)];
  if (teamId) keys.push(badgeIdKey(teamId));
  await updateDoc<BadgeOverride[]>(KEY, [], (rows) => {
    const next = rows.filter((row) => !keys.includes(row.key));
    if (url) {
      for (const key of keys) next.push({ key, badgeUrl: url });
    }
    return next;
  });
}
