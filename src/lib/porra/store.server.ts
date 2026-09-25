import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readDoc, updateDoc, writeDoc } from "@/lib/persist.server";
import type { PorraPick, PorraSlate, PorraUser } from "./types";

const KEY = "porra";
const TRASH = "porra-trash";
const scrypt = promisify(scryptCb);

type Box = {
  users: PorraUser[];
  slates: PorraSlate[];
  picks: PorraPick[];
};

type TrashBox = {
  slates: PorraSlate[];
  picks: PorraPick[];
};

const empty = (): Box => ({ users: [], slates: [], picks: [] });
const emptyTrash = (): TrashBox => ({ slates: [], picks: [] });

function normalize(raw: Partial<Box> | null | undefined): Box {
  return {
    users: Array.isArray(raw?.users) ? raw.users : [],
    slates: Array.isArray(raw?.slates) ? raw.slates : [],
    picks: Array.isArray(raw?.picks) ? raw.picks : [],
  };
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

export async function listUsers(): Promise<PorraUser[]> {
  return (await load()).users;
}

export async function listSlates(): Promise<PorraSlate[]> {
  return (await load()).slates.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function listPicks(): Promise<PorraPick[]> {
  return (await load()).picks;
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

export async function createUser(name: string, password: string, avatar?: string): Promise<PorraUser> {
  const user: PorraUser = {
    id: randomBytes(8).toString("hex"),
    name: name.trim(),
    pass: await hashPass(password),
    createdAt: Date.now(),
    avatar,
  };
  return mutate((data) => {
    data.users.push(user);
    return user;
  });
}

export async function upsertSlate(slate: PorraSlate): Promise<PorraSlate> {
  return mutate((data) => {
    const i = data.slates.findIndex((s) => s.id === slate.id);
    if (i >= 0) data.slates[i] = slate;
    else data.slates.push(slate);
    return slate;
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
    // Los pronósticos se conservan por si se restaura la misma jornada.
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
  return mutate((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return undefined;
    user.avatar = avatar;
    return user;
  });
}
