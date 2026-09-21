import type { AdminOverride } from "@/lib/admin/types";
import { readDoc, updateDoc } from "@/lib/persist.server";

const KEY = "admin-overrides";

function asMap(rows: AdminOverride[]): Map<string, AdminOverride> {
  const store = new Map<string, AdminOverride>();
  for (const row of rows) {
    if (row?.matchId) store.set(row.matchId, row);
  }
  return store;
}

export async function listOverrides(): Promise<AdminOverride[]> {
  const rows = await readDoc<AdminOverride[]>(KEY, []);
  return rows
    .filter((row) => row?.matchId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertOverride(patch: AdminOverride): Promise<AdminOverride> {
  let saved: AdminOverride = { ...patch, updatedAt: Date.now() };
  await updateDoc<AdminOverride[]>(KEY, [], (rows) => {
    const store = asMap(rows);
    saved = { ...store.get(patch.matchId), ...patch, updatedAt: Date.now() };
    store.set(saved.matchId, saved);
    return [...store.values()];
  });
  return saved;
}

export async function removeOverride(matchId: string): Promise<void> {
  await updateDoc<AdminOverride[]>(KEY, [], (rows) =>
    rows.filter((row) => row.matchId !== matchId),
  );
}

export async function replaceOverrides(rows: AdminOverride[]): Promise<AdminOverride[]> {
  const store = asMap(
    rows.map((row) => ({ ...row, updatedAt: row.updatedAt || Date.now() })),
  );
  const next = [...store.values()];
  await updateDoc<AdminOverride[]>(KEY, [], () => next);
  return next;
}
