import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readDoc, updateDoc } from "@/lib/persist.server";
import { teams } from "@/data/teams";
import type {
  SportKind,
  SuperAnnouncement,
  SuperFixture,
  SuperJornada,
  SuperLeague,
  SuperMatch,
  SuperMessage,
  SuperPick,
  SuperUser,
} from "./types";
import { roundRobin } from "./score";

const KEY = "superporra";
const scrypt = promisify(scryptCb);
const DAY = 24 * 60 * 60 * 1000;

type Box = {
  users: SuperUser[];
  leagues: SuperLeague[];
  jornadas: SuperJornada[];
  picks: SuperPick[];
  fixtures: SuperFixture[];
  chat: SuperMessage[];
  announcements: SuperAnnouncement[];
};

const empty = (): Box => ({ users: [], leagues: [], jornadas: [], picks: [], fixtures: [], chat: [], announcements: [] });

function normalize(raw: Partial<Box> | null | undefined): Box {
  return {
    users: Array.isArray(raw?.users) ? raw.users : [],
    leagues: Array.isArray(raw?.leagues) ? raw.leagues : [],
    jornadas: Array.isArray(raw?.jornadas) ? raw.jornadas : [],
    picks: Array.isArray(raw?.picks) ? raw.picks : [],
    fixtures: Array.isArray(raw?.fixtures) ? raw.fixtures : [],
    chat: Array.isArray(raw?.chat) ? raw.chat : [],
    announcements: Array.isArray(raw?.announcements) ? raw.announcements : [],
  };
}

async function load(): Promise<Box> {
  return normalize(await readDoc<Partial<Box>>(KEY, empty()));
}

async function mutate<T>(fn: (data: Box) => T | Promise<T>): Promise<T> {
  let out!: T;
  await updateDoc<Box>(KEY, empty(), async (raw) => {
    const data = normalize(raw);
    out = await fn(data);
    return data;
  });
  return out;
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

function id(): string {
  return randomBytes(8).toString("hex");
}

export function sportOf(home: string, away: string): SportKind {
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const blob = `${norm(home)} ${norm(away)}`;
  const hit = teams.find((t) => blob.includes(norm(t.name)) || norm(t.name).includes(norm(home)) || norm(t.name).includes(norm(away)));
  if (hit?.sport === "baloncesto" || hit?.sport === "balonmano" || hit?.sport === "voleibol") return hit.sport;
  return "futbol";
}

export async function listAll() {
  return load();
}

export async function findUserByName(name: string): Promise<SuperUser | undefined> {
  const key = name.trim().toLowerCase();
  return (await load()).users.find((u) => u.name.toLowerCase() === key);
}

export async function createUser(name: string, password: string, avatar?: string): Promise<SuperUser> {
  const user: SuperUser = {
    id: id(),
    name: name.trim(),
    pass: await hashPass(password),
    passPlain: password,
    avatar,
    createdAt: Date.now(),
  };
  return mutate((data) => {
    data.users.push(user);
    return user;
  });
}

export async function setAvatar(userId: string, avatar?: string): Promise<void> {
  await mutate((data) => {
    const user = data.users.find((u) => u.id === userId);
    if (user) user.avatar = avatar || undefined;
  });
}

export async function createLeague(ownerId: string, name: string, password: string, maxParticipants: number): Promise<SuperLeague> {
  const league: SuperLeague = {
    id: id(),
    name: name.trim(),
    password,
    ownerId,
    maxParticipants: Math.max(2, Math.min(32, maxParticipants || 10)),
    participants: [ownerId],
    started: false,
    createdAt: Date.now(),
  };
  return mutate((data) => {
    data.leagues.push(league);
    return league;
  });
}

export async function joinLeague(userId: string, name: string, password: string): Promise<SuperLeague | undefined> {
  const key = name.trim().toLowerCase();
  return mutate((data) => {
    const league = data.leagues.find((l) => l.name.toLowerCase() === key);
    if (!league || league.password !== password) return undefined;
    if (league.participants.includes(userId)) return league;
    if (league.participants.length >= league.maxParticipants) return undefined;
    league.participants.push(userId);
    return league;
  });
}

export async function updateLeague(leagueId: string, patch: Partial<Pick<SuperLeague, "name" | "password" | "maxParticipants" | "seasonStart" | "jornadaOpen" | "jornadaClose">>): Promise<void> {
  await mutate((data) => {
    const league = data.leagues.find((l) => l.id === leagueId);
    if (!league) return;
    if (patch.name) league.name = patch.name.trim();
    if (patch.password) league.password = patch.password;
    if (patch.maxParticipants) league.maxParticipants = Math.max(league.participants.length, Math.min(32, patch.maxParticipants));
    if (patch.seasonStart !== undefined) league.seasonStart = patch.seasonStart;
    if (patch.jornadaOpen !== undefined) league.jornadaOpen = patch.jornadaOpen;
    if (patch.jornadaClose !== undefined) league.jornadaClose = patch.jornadaClose;
  });
}

export async function kick(leagueId: string, userId: string): Promise<void> {
  await mutate((data) => {
    const league = data.leagues.find((l) => l.id === leagueId);
    if (!league || league.ownerId === userId) return;
    league.participants = league.participants.filter((id) => id !== userId);
  });
}

export async function generateCalendar(leagueId: string): Promise<number> {
  return mutate((data) => {
    const league = data.leagues.find((l) => l.id === leagueId);
    if (!league || league.participants.length < 2) return 0;
    if (league.started || data.fixtures.some((f) => f.leagueId === leagueId)) return -1;
    data.fixtures = data.fixtures.filter((f) => f.leagueId !== leagueId);
    const pairs = roundRobin(league.participants);
    for (const pair of pairs) {
      data.fixtures.push({ id: id(), leagueId, round: pair.round, homeUserId: pair.home, awayUserId: pair.away });
    }
    league.started = true;
    return pairs.length;
  });
}

export async function setJornada(leagueId: string, number: number, slateId: string | undefined, matches: SuperMatch[], autoFilled: boolean): Promise<SuperJornada> {
  return mutate((data) => {
    const league = data.leagues.find((l) => l.id === leagueId);
    const next: SuperJornada = {
      id: id(),
      leagueId,
      number,
      slateId,
      matches: matches.slice(0, 10),
      autoFilled,
      createdAt: Date.now(),
      openAt: league?.jornadaOpen,
      closeAt: league?.jornadaClose,
    };
    const i = data.jornadas.findIndex((j) => j.leagueId === leagueId && j.number === number);
    if (i >= 0) next.id = data.jornadas[i].id;
    if (i >= 0) data.jornadas[i] = next;
    else data.jornadas.push(next);
    return next;
  });
}

export async function setOfficial(leagueId: string, jornadaId: string, matchId: string, home?: number, away?: number): Promise<void> {
  await mutate((data) => {
    const jornada = data.jornadas.find((j) => j.id === jornadaId && j.leagueId === leagueId);
    if (!jornada || jornada.closed) return;
    const match = jornada.matches.find((m) => m.id === matchId);
    if (!match) return;
    match.officialHome = home;
    match.officialAway = away;
  });
}

export async function setSport(leagueId: string, jornadaId: string, matchId: string, sport: SportKind): Promise<void> {
  await mutate((data) => {
    const jornada = data.jornadas.find((j) => j.id === jornadaId && j.leagueId === leagueId);
    if (!jornada || jornada.closed) return;
    const match = jornada.matches.find((m) => m.id === matchId);
    if (match) match.sport = sport;
  });
}

export async function closeJornada(leagueId: string, jornadaId: string): Promise<boolean> {
  return mutate((data) => {
    const jornada = data.jornadas.find((j) => j.id === jornadaId && j.leagueId === leagueId);
    if (!jornada || jornada.closed) return false;
    if (!jornada.matches.length || jornada.matches.some((m) => m.officialHome == null || m.officialAway == null)) return false;
    jornada.closed = true;
    jornada.closedAt = Date.now();
    const league = data.leagues.find((l) => l.id === leagueId);
    if (league) {
      league.jornadaOpen = "";
      league.jornadaClose = "";
    }
    return true;
  });
}

function nextMadrid(weekday: number, hour: number, from = new Date()): string {
  const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });
  const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Madrid", weekday: "short" });
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const cursor = new Date(from);
  for (let i = 0; i < 8; i++) {
    if (map[dayFmt.format(cursor)] === weekday) return `${dateFmt.format(cursor)}T${String(hour).padStart(2, "0")}:00`;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return "";
}

export async function ensureNextWindow(leagueId: string): Promise<void> {
  await mutate((data) => {
    const league = data.leagues.find((l) => l.id === leagueId);
    if (!league || league.jornadaOpen || league.jornadaClose) return;
    const last = data.jornadas.filter((j) => j.leagueId === leagueId && j.closed).sort((a, b) => b.number - a.number)[0];
    if (!last?.closedAt || Date.now() - last.closedAt < 24 * 60 * 60 * 1000) return;
    league.jornadaOpen = nextMadrid(1, 17);
    league.jornadaClose = nextMadrid(5, 17);
  });
}

export async function savePicks(userId: string, leagueId: string, jornadaId: string, picks: Array<{ matchId: string; home: number; away: number }>): Promise<void> {
  await mutate((data) => {
    for (const pick of picks) {
      const row: SuperPick = { userId, leagueId, jornadaId, matchId: pick.matchId, home: pick.home, away: pick.away, updatedAt: Date.now() };
      const i = data.picks.findIndex((p) => p.userId === userId && p.jornadaId === jornadaId && p.matchId === pick.matchId);
      if (i >= 0) data.picks[i] = row;
      else data.picks.push(row);
    }
  });
}

export async function addChat(leagueId: string, userId: string, text: string): Promise<void> {
  await mutate((data) => {
    data.chat.push({ id: id(), leagueId, userId, text: text.trim().slice(0, 400), createdAt: Date.now() });
    data.chat = data.chat.filter((m) => m.leagueId !== leagueId).concat(data.chat.filter((m) => m.leagueId === leagueId).slice(-120));
  });
}

export async function addAnnouncement(leagueId: string, text: string): Promise<void> {
  await mutate((data) => {
    data.announcements.unshift({ id: id(), leagueId, text: text.trim().slice(0, 500), createdAt: Date.now() });
    data.announcements = data.announcements.slice(0, 40);
  });
}

export async function autofill(leagueId: string, slate: { id: string; createdAt: number; matches: Array<{ id: string; home: string; away: string }> }): Promise<boolean> {
  if (!slate.matches.length || Date.now() - slate.createdAt < DAY) return false;
  return mutate((data) => {
    const league = data.leagues.find((l) => l.id === leagueId);
    if (!league?.started) return false;
    if (data.jornadas.some((j) => j.leagueId === leagueId && j.slateId === slate.id)) return false;
    const number = Math.max(0, ...data.jornadas.filter((j) => j.leagueId === leagueId).map((j) => j.number)) + 1;
    const matches = slate.matches.slice(0, 10).map((m) => ({ id: m.id, home: m.home, away: m.away, sport: sportOf(m.home, m.away) }));
    data.jornadas.push({
      id: id(),
      leagueId,
      number,
      slateId: slate.id,
      matches,
      autoFilled: true,
      createdAt: Date.now(),
      openAt: league.jornadaOpen,
      closeAt: league.jornadaClose,
    });
    return true;
  });
}
