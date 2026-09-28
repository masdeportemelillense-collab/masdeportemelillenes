import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readDoc, updateDoc, writeDoc } from "@/lib/persist.server";
import { scoreSlate } from "./score";
import { isLocked, JORNADA1_LOCK_AT, looksLikeJornada1 } from "./time";
import type { PorraNotice, PorraPick, PorraSlate, PorraTicket, PorraUser, Quiniela } from "./types";

const KEY = "porra";
const TRASH = "porra-trash";
const scrypt = promisify(scryptCb);

type Box = {
  users: PorraUser[];
  slates: PorraSlate[];
  picks: PorraPick[];
  tickets: PorraTicket[];
  notices: PorraNotice[];
  jornada1AutofillAt?: number;
  jornada1AutofillSlateId?: string;
};

type TrashBox = {
  slates: PorraSlate[];
  picks: PorraPick[];
};

const empty = (): Box => ({ users: [], slates: [], picks: [], tickets: [], notices: [] });
const emptyTrash = (): TrashBox => ({ slates: [], picks: [] });

function normalize(raw: Partial<Box> | null | undefined): Box {
  return {
    users: Array.isArray(raw?.users) ? raw.users : [],
    slates: Array.isArray(raw?.slates) ? raw.slates : [],
    picks: Array.isArray(raw?.picks) ? raw.picks : [],
    tickets: Array.isArray(raw?.tickets) ? raw.tickets : [],
    notices: Array.isArray(raw?.notices) ? raw.notices : [],
    jornada1AutofillAt: raw?.jornada1AutofillAt,
    jornada1AutofillSlateId: raw?.jornada1AutofillSlateId,
  };
}

export function cleanEmail(raw?: string): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function isEmail(raw?: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail(raw));
}

async function load(): Promise<Box> {
  return normalize(await readDoc<Partial<Box>>(KEY, empty()));
}

async function mutate<T>(fn: (data: Box) => T): Promise<T> {
  let out!: T;
  await updateDoc<Box>(KEY, empty(), (raw) => {
    const data = normalize(raw);
    out = fn(data);
    return data;
  });
  return out;
}

function firstJornada(slates: PorraSlate[]): PorraSlate | undefined {
  const published = slates.filter((s) => s.published);
  const named = published.find((s) => looksLikeJornada1(s.title));
  if (named) return named;
  return published.slice().sort((a, b) => a.createdAt - b.createdAt)[0];
}

function withJ1Lock(slates: PorraSlate[]): PorraSlate[] {
  const first = firstJornada(slates);
  if (!first) return slates;
  return slates.map((s) => (s.id === first.id ? { ...s, lockAt: JORNADA1_LOCK_AT } : s));
}

export async function listUsers(): Promise<PorraUser[]> {
  return (await load()).users;
}

export async function listSlates(): Promise<PorraSlate[]> {
  return withJ1Lock((await load()).slates).slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function listPicks(): Promise<PorraPick[]> {
  return (await load()).picks;
}

export async function listTickets(): Promise<PorraTicket[]> {
  return (await load()).tickets;
}

export async function listNotices(): Promise<PorraNotice[]> {
  return (await load()).notices;
}

export async function findUserByName(name: string): Promise<PorraUser | undefined> {
  const key = name.trim().toLowerCase();
  return (await load()).users.find((u) => u.name.toLowerCase() === key);
}

export async function findUserById(id: string): Promise<PorraUser | undefined> {
  return (await load()).users.find((u) => u.id === id);
}

export async function hashPass(password: string): Promise<string> {
  const salt = randomBytes(16);
  const buf = (await scrypt(password, salt, 32)) as Buffer;
  return `s$${salt.toString("hex")}$${buf.toString("hex")}`;
}

export async function checkPass(password: string, stored: string): Promise<boolean> {
  const [kind, saltHex, hashHex] = stored.split("$");
  if (kind !== "s" || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const buf = (await scrypt(password, salt, 32)) as Buffer;
  if (buf.length !== expected.length) return false;
  return timingSafeEqual(buf, expected);
}

export async function createUser(name: string, password: string, avatar?: string, email?: string): Promise<PorraUser> {
  const user: PorraUser = {
    id: randomBytes(8).toString("hex"),
    name: name.trim(),
    pass: await hashPass(password),
    passPlain: password,
    createdAt: Date.now(),
    avatar,
    email: isEmail(email) ? cleanEmail(email) : undefined,
  };
  return mutate((data) => {
    data.users.push(user);
    return user;
  });
}

export async function rememberPlain(userId: string, password: string): Promise<void> {
  await mutate((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (user) user.passPlain = password;
  });
}

export async function setUserPassword(userId: string, password: string): Promise<PorraUser | undefined> {
  const hash = await hashPass(password);
  return mutate((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return undefined;
    user.pass = hash;
    user.passPlain = password;
    return user;
  });
}

export async function setUserProfile(userId: string, patch: { avatar?: string; email?: string }): Promise<PorraUser | undefined> {
  return mutate((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return undefined;
    if (patch.avatar !== undefined) user.avatar = patch.avatar || undefined;
    if (patch.email !== undefined) user.email = isEmail(patch.email) ? cleanEmail(patch.email) : undefined;
    return user;
  });
}

export async function recoverPassword(name: string, email: string, password: string): Promise<PorraUser | undefined> {
  const key = name.trim().toLowerCase();
  const mail = cleanEmail(email);
  const hash = await hashPass(password);
  return mutate((data) => {
    const user = data.users.find((u) => u.name.toLowerCase() === key && cleanEmail(u.email) === mail && !!u.email);
    if (!user) return undefined;
    user.pass = hash;
    user.passPlain = password;
    return user;
  });
}

export async function setTicket(userId: string, slateId: string, enabled: boolean): Promise<void> {
  await mutate((data) => {
    const i = data.tickets.findIndex((t) => t.userId === userId && t.slateId === slateId);
    if (i >= 0) data.tickets[i] = { userId, slateId, enabled };
    else data.tickets.push({ userId, slateId, enabled });
  });
}

export async function markNoticesRead(userId: string): Promise<void> {
  await mutate((data) => {
    for (const n of data.notices) if (n.userId === userId) n.read = true;
  });
}

function pushNotices(data: Box, prev: PorraSlate | undefined, next: PorraSlate) {
  const before = new Map((prev?.matches ?? []).map((m) => [m.id, m.result ?? null]));
  const closed = next.matches.filter((m) => m.result && before.get(m.id) !== m.result);
  if (!closed.length) return;
  const holders = data.tickets.filter((t) => t.slateId === next.id && t.enabled);
  const now = Date.now();
  for (const ticket of holders) {
    const mine = data.picks.filter((p) => p.userId === ticket.userId && p.slateId === next.id);
    const score = scoreSlate(ticket.userId, next, mine);
    const lines = closed.map((m) => {
      const pick = mine.find((p) => p.matchId === m.id)?.pick;
      const hit = pick && pick === m.result;
      return `${m.home} – ${m.away}: salió ${m.result}${pick ? ` · tu ${pick}` : " · sin pronóstico"}${hit ? " · acierto" : pick ? " · fallado" : ""}`;
    });
    data.notices.unshift({
      id: randomBytes(6).toString("hex"),
      userId: ticket.userId,
      slateId: next.id,
      title: next.title,
      body: `${lines.join(" \n")}\nLlevas ${score.correct}/${score.resolved || closed.length} en esta jornada.`,
      createdAt: now,
      read: false,
    });
  }
  data.notices = data.notices.slice(0, 400);
}

export async function upsertSlate(slate: PorraSlate): Promise<PorraSlate> {
  return mutate((data) => {
    const next = looksLikeJornada1(slate.title) ? { ...slate, lockAt: JORNADA1_LOCK_AT } : slate;
    const i = data.slates.findIndex((s) => s.id === next.id);
    const prev = i >= 0 ? data.slates[i] : undefined;
    if (i >= 0) data.slates[i] = next;
    else data.slates.push(next);
    pushNotices(data, prev, next);
    return next;
  });
}

export async function removeSlate(id: string): Promise<void> {
  const current = await load();
  const slate = current.slates.find((s) => s.id === id);
  const picks = current.picks.filter((p) => p.slateId === id);
  if (slate) {
    const trash = await readDoc<TrashBox>(TRASH, emptyTrash());
    trash.slates = [slate, ...trash.slates.filter((s) => s.id !== id)].slice(0, 20);
    trash.picks = [...picks, ...trash.picks.filter((p) => p.slateId !== id)].slice(0, 5000);
    await writeDoc(TRASH, trash);
  }
  await mutate((data) => {
    data.slates = data.slates.filter((s) => s.id !== id);
  });
}

export async function restoreSlate(id: string): Promise<PorraSlate | undefined> {
  const trash = await readDoc<TrashBox>(TRASH, emptyTrash());
  const slate = trash.slates.find((s) => s.id === id);
  if (!slate) return undefined;
  const picks = trash.picks.filter((p) => p.slateId === id);
  await mutate((data) => {
    if (!data.slates.some((s) => s.id === slate.id)) data.slates.push(slate);
    for (const pick of picks) {
      const i = data.picks.findIndex(
        (p) => p.userId === pick.userId && p.slateId === pick.slateId && p.matchId === pick.matchId,
      );
      if (i < 0) data.picks.push(pick);
    }
  });
  trash.slates = trash.slates.filter((s) => s.id !== id);
  trash.picks = trash.picks.filter((p) => p.slateId !== id);
  await writeDoc(TRASH, trash);
  return slate;
}

export async function listTrash(): Promise<PorraSlate[]> {
  return (await readDoc<TrashBox>(TRASH, emptyTrash())).slates;
}

export async function savePick(pick: PorraPick): Promise<PorraPick> {
  return mutate((data) => {
    const i = data.picks.findIndex(
      (p) => p.userId === pick.userId && p.slateId === pick.slateId && p.matchId === pick.matchId,
    );
    if (i >= 0) data.picks[i] = pick;
    else data.picks.push(pick);
    return pick;
  });
}

export async function picksForUser(userId: string): Promise<PorraPick[]> {
  return (await load()).picks.filter((p) => p.userId === userId);
}

export async function setUserAvatar(userId: string, avatar?: string): Promise<PorraUser | undefined> {
  return setUserProfile(userId, { avatar });
}

function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randomQuiniela(userId: string, matchId: string, allowDraw: boolean): Quiniela {
  const opts: Quiniela[] = allowDraw ? ["1", "X", "2"] : ["1", "2"];
  const n = hash32(`${userId}:${matchId}:j1-autofill`);
  return opts[n % opts.length]!;
}

export async function autofillFirstJornadaIfLocked(): Promise<number> {
  return mutate((data) => {
    const slate = firstJornada(data.slates);
    if (!slate || !slate.matches.length) return 0;
    slate.lockAt = JORNADA1_LOCK_AT;
    if (!isLocked(JORNADA1_LOCK_AT)) return 0;
    if (data.jornada1AutofillSlateId === slate.id && data.jornada1AutofillAt) return 0;
    const lockCut = Date.parse(JORNADA1_LOCK_AT);
    const usersWithPicks = new Set(data.picks.filter((p) => p.slateId === slate.id).map((p) => p.userId));
    let added = 0;
    const now = Date.now();
    for (const user of data.users) {
      if (user.createdAt > lockCut) continue;
      if (usersWithPicks.has(user.id)) continue;
      for (const match of slate.matches) {
        data.picks.push({
          userId: user.id,
          slateId: slate.id,
          matchId: match.id,
          pick: randomQuiniela(user.id, match.id, match.allowDraw !== false),
          updatedAt: now,
        });
        added += 1;
      }
    }
    data.jornada1AutofillAt = now;
    data.jornada1AutofillSlateId = slate.id;
    return added;
  });
}
