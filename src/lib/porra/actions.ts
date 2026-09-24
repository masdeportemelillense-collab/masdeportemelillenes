import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { jornadaSummaries, leaderboard } from "./score";
import { isLocked, nextFridayLockIso } from "./time";
import type { PorraMatch, PorraPublicState, PorraSlate, Quiniela } from "./types";

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._'-]{3,24}$/;

function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function asPublic(u?: { id: string; name: string; avatar?: string } | null) {
  if (!u) return null;
  return { id: u.id, name: u.name, avatar: u.avatar };
}

async function publicState(userOverride?: { id: string; name: string; avatar?: string } | null): Promise<PorraPublicState> {
  const { currentPorraUser } = await import("./session.server");
  const store = await import("./store.server");
  const [cookieUser, users, slates, picks] = await Promise.all([
    userOverride === undefined ? currentPorraUser() : Promise.resolve(userOverride),
    store.listUsers(),
    store.listSlates(),
    store.listPicks(),
  ]);
  const raw = userOverride === undefined ? cookieUser : userOverride;
  const stored = raw ? users.find((u) => u.id === raw.id) : undefined;
  const me = asPublic(stored ?? raw);
  const visible = slates.filter((s) => s.published);
  return {
    now: Date.now(),
    user: me,
    slates: visible,
    myPicks: me ? picks.filter((p) => p.userId === me.id) : [],
    board: leaderboard(users, visible, picks),
    jornadas: jornadaSummaries(users, visible, picks),
  };
}

export const porraState = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await publicState();
  } catch (err) {
    console.error("[porra] state", err);
    return { now: Date.now(), user: null, slates: [], myPicks: [], board: [], jornadas: [] };
  }
});
