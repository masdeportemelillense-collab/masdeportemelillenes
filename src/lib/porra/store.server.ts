import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PorraPick, PorraSlate, PorraUser } from "./types";

const FILE = "/tmp/mdm-porra.json";
const scrypt = promisify(scryptCb);

type Box = {
  users: PorraUser[];
  slates: PorraSlate[];
  picks: PorraPick[];
};

const g = globalThis as typeof globalThis & { __mdmPorra?: Box };
const empty = (): Box => ({ users: [], slates: [], picks: [] });

function box(): Box {
  if (!g.__mdmPorra) g.__mdmPorra = empty();
  return g.__mdmPorra;
}

let loaded = false;

async function hydrate(): Promise<Box> {
  if (!loaded) {
    loaded = true;
    try {
      const raw = await readFile(FILE, "utf8");
      const data = JSON.parse(raw) as Partial<Box>;
      g.__mdmPorra = {
        users: Array.isArray(data.users) ? data.users : [],
        slates: Array.isArray(data.slates) ? data.slates : [],
        picks: Array.isArray(data.picks) ? data.picks : [],
      };
    } catch {
      g.__mdmPorra = empty();
    }
  }
  return box();
}

async function persist(): Promise<void> {
  try {
    await mkdir(dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(box(), null, 2));
  } catch {
    /* ephemeral FS */
  }
}

export async function listUsers(): Promise<PorraUser[]> {
  return (await hydrate()).users;
}

export async function listSlates(): Promise<PorraSlate[]> {
  return (await hydrate()).slates.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function listPicks(): Promise<PorraPick[]> {
  return (await hydrate()).picks;
}

export async function findUserByName(name: string): Promise<PorraUser | undefined> {
  const key = name.trim().toLowerCase();
  return (await hydrate()).users.find((u) => u.name.toLowerCase() === key);
}

export async function findUserById(id: string): Promise<PorraUser | undefined> {
  return (await hydrate()).users.find((u) => u.id === id);
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

export async function createUser(name: string, password: string): Promise<PorraUser> {
  const data = await hydrate();
  const user: PorraUser = {
    id: randomBytes(8).toString("hex"),
    name: name.trim(),
    pass: await hashPass(password),
    createdAt: Date.now(),
  };
  data.users.push(user);
  await persist();
  return user;
}

export async function upsertSlate(slate: PorraSlate): Promise<PorraSlate> {
  const data = await hydrate();
  const i = data.slates.findIndex((s) => s.id === slate.id);
  if (i >= 0) data.slates[i] = slate;
  else data.slates.push(slate);
  await persist();
  return slate;
}

export async function removeSlate(id: string): Promise<void> {
  const data = await hydrate();
  data.slates = data.slates.filter((s) => s.id !== id);
  data.picks = data.picks.filter((p) => p.slateId !== id);
  await persist();
}

export async function savePick(pick: PorraPick): Promise<PorraPick> {
  const data = await hydrate();
  const i = data.picks.findIndex(
    (p) => p.userId === pick.userId && p.slateId === pick.slateId && p.matchId === pick.matchId,
  );
  if (i >= 0) data.picks[i] = pick;
  else data.picks.push(pick);
  await persist();
  return pick;
}

export async function picksForUser(userId: string): Promise<PorraPick[]> {
  return (await hydrate()).picks.filter((p) => p.userId === userId);
}
