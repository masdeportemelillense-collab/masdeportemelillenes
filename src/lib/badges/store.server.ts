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

export async function setBadgeOverride(
  teamId: string | undefined,
  names: string[],
  badgeUrl: string,
): Promise<void> {
  const url = badgeUrl.trim();
  const keys = [...new Set(names.filter(Boolean).map(badgeNameKey))];
  if (teamId) keys.push(badgeIdKey(teamId));
  await updateDoc<BadgeOverride[]>(KEY, [], (rows) => {
    const next = rows.filter((row) => !keys.includes(row.key));
    if (url) {
      for (const key of keys) next.push({ key, badgeUrl: url });
    }
    return next;
  });
}

export type NameOverride = { key: string; name: string };

const NAME_KEY = "name-overrides";

export async function listNameOverrides(): Promise<NameOverride[]> {
  return readDoc<NameOverride[]>(NAME_KEY, []);
}

export async function setNameOverride(teamId: string | undefined, originalName: string, nextName: string): Promise<void> {
  const name = nextName.trim();
  const keys = [badgeNameKey(originalName)];
  if (teamId) keys.push(badgeIdKey(teamId));
  await updateDoc<NameOverride[]>(NAME_KEY, [], (rows) => {
    const next = rows.filter((row) => !keys.includes(row.key));
    if (name) {
      for (const key of keys) next.push({ key, name });
    }
    return next;
  });
}
