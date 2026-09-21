import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { AdminOverride } from "@/lib/admin/types";

const FILE = "/tmp/mdm-admin-overrides.json";
const g = globalThis as typeof globalThis & { __mdmOverrides?: Map<string, AdminOverride> };

function box(): Map<string, AdminOverride> {
  if (!g.__mdmOverrides) g.__mdmOverrides = new Map();
  return g.__mdmOverrides;
}

let loaded = false;

async function hydrate(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await readFile(FILE, "utf8");
    const list = JSON.parse(raw) as AdminOverride[];
    const store = box();
    for (const row of list) {
      if (row?.matchId) store.set(row.matchId, row);
    }
  } catch {
    /* first run */
  }
}

async function persist(): Promise<void> {
  try {
    await mkdir(dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify([...box().values()], null, 2));
  } catch {
    /* ephemeral FS on some hosts */
  }
}

export async function listOverrides(): Promise<AdminOverride[]> {
  await hydrate();
  return [...box().values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertOverride(patch: AdminOverride): Promise<AdminOverride> {
  await hydrate();
  const next: AdminOverride = { ...box().get(patch.matchId), ...patch, updatedAt: Date.now() };
  box().set(next.matchId, next);
  await persist();
  return next;
}

export async function removeOverride(matchId: string): Promise<void> {
  await hydrate();
  box().delete(matchId);
  await persist();
}

export async function replaceOverrides(rows: AdminOverride[]): Promise<AdminOverride[]> {
  await hydrate();
  const store = box();
  store.clear();
  for (const row of rows) {
    if (row?.matchId) store.set(row.matchId, { ...row, updatedAt: row.updatedAt || Date.now() });
  }
  await persist();
  return [...store.values()];
}
