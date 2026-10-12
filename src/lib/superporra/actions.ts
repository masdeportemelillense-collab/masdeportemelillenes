import { createServerFn } from "@tanstack/react-start";
import type { SportKind, SuperPublic } from "./types";
import { buildBoard, buildViews } from "./score";

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._'-]{3,24}$/;

function clean(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

async function webAdmin(): Promise<boolean> {
  try {
    const { readSession } = await import("@/lib/admin/session.server");
    const session = await readSession();
    return session.ok && session.scope === "all";
  } catch {
    return false;
  }
}

async function publishedSlates() {
  const { listSlates } = await import("@/lib/porra/store.server");
  return (await listSlates()).filter((s) => s.published);
}

async function state(leagueId?: string, userOverride?: { id: string; name: string } | null): Promise<SuperPublic> {
  const session = await import("./session.server");
  const store = await import("./store.server");
  const me = userOverride === undefined ? await session.currentSuperUser() : userOverride;
  const admin = await webAdmin();
  const slates = await publishedSlates();
  const latest = slates[0];
  if (latest && leagueId) {
    try { await store.autofill(leagueId, latest); } catch { /* ignore */ }
  }
  const box = await store.listAll();
  const user = me ? box.users.find((u) => u.id === me.id) : undefined;
  const league = leagueId ? box.leagues.find((l) => l.id === leagueId) : undefined;
  const canSee = Boolean(league && (admin || (user && league.participants.includes(user.id))));
  const jornadas = canSee ? box.jornadas.filter((j) => j.leagueId === leagueId).sort((a, b) => a.number - b.number) : [];
  const closedIds = new Set(jornadas.filter((j) => j.matches.some((m) => m.officialHome != null)).map((j) => j.id));
  const picks = canSee && user ? box.picks.filter((p) => p.leagueId === leagueId && p.userId === user.id) : [];
  const rivalPicks = canSee ? box.picks.filter((p) => p.leagueId === leagueId && closedIds.has(p.jornadaId) && p.userId !== user?.id) : [];
  const currentJornada = jornadas.at(-1);
  const predicted = currentJornada ? new Set(box.picks.filter((p) => p.jornadaId === currentJornada.id).map((p) => p.userId)) : new Set();
  const predictionCount = currentJornada && league ? league.participants.filter((id) => predicted.has(id)).length : 0;
  const predictionTotal = league?.participants.length ?? 0;
  const fixtures = canSee ? buildViews(box.fixtures.filter((f) => f.leagueId === leagueId), jornadas, box.picks, box.users) : [];
  const board = canSee && league ? buildBoard(league.participants, fixtures, box.users) : [];
  const chat = canSee
    ? box.chat.filter((m) => m.leagueId === leagueId).slice(-80).map((m) => {
        const author = box.users.find((u) => u.id === m.userId);
        return { ...m, name: author?.name ?? "Jugador", avatar: author?.avatar };
      })
    : [];
  return {
    now: Date.now(),
    user: user ? { id: user.id, name: user.name, avatar: user.avatar } : null,
    leagues: box.leagues
      .filter((l) => admin || (user && l.participants.includes(user.id)))
      .map((l) => ({ id: l.id, name: l.name, ownerId: l.ownerId, participants: l.participants.length, max: l.maxParticipants, started: l.started, mine: Boolean(user && l.participants.includes(user.id)) })),
    league: canSee && league ? { ...league, ownerName: box.users.find((u) => u.id === league.ownerId)?.name ?? "Admin" } : null,
    isOwner: Boolean(league && user && league.ownerId === user.id),
    isWebAdmin: admin,
    jornadas,
    picks,
    rivalPicks,
    predictionCount,
    predictionTotal,
    fixtures,
    board,
    chat,
    announcements: canSee ? box.announcements.filter((a) => a.leagueId === leagueId).slice(0, 12) : [],
    slates: slates.slice(0, 4).map((s) => ({ id: s.id, title: s.title, createdAt: s.createdAt, matches: s.matches.map((m) => ({ id: m.id, home: m.home, away: m.away })) })),
    accounts: admin ? box.users.map((u) => ({ id: u.id, name: u.name, password: u.passPlain ?? null })) : undefined,
    allLeagues: admin ? box.leagues.map((l) => ({ id: l.id, name: l.name, password: l.password, owner: box.users.find((u) => u.id === l.ownerId)?.name ?? l.ownerId })) : undefined,
  };
}

export const superState = createServerFn({ method: "GET" })
  .inputValidator((d: { leagueId?: string }) => d)
  .handler(async ({ data }) => state(data?.leagueId));

export const superRegister = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; password: string; avatar?: string }) => d)
  .handler(async ({ data }) => {
    const name = clean(data.name);
    if (!NAME_RE.test(name)) return { ok: false as const, error: "El usuario debe tener entre 3 y 24 caracteres." };
    if (String(data.password ?? "").length < 4) return { ok: false as const, error: "La contraseña es demasiado corta." };
    const store = await import("./store.server");
    const session = await import("./session.server");
    if (await store.findUserByName(name)) return { ok: false as const, error: "Ese usuario ya existe." };
    const user = await store.createUser(name, data.password, data.avatar);
    await session.writeSuperCookie(await session.issueUserToken(user.id, user.name));
    return { ok: true as const, state: await state(undefined, { id: user.id, name: user.name }) };
  });

export const superLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; password: string }) => d)
  .handler(async ({ data }) => {
    const store = await import("./store.server");
    const session = await import("./session.server");
    const user = await store.findUserByName(clean(data.name));
    if (!user || !(await store.checkPass(data.password, user.pass))) return { ok: false as const, error: "Usuario o contraseña incorrectos." };
    await session.writeSuperCookie(await session.issueUserToken(user.id, user.name));
    return { ok: true as const, state: await state(undefined, { id: user.id, name: user.name }) };
  });

export const superLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await import("./session.server");
  await session.clearSuperCookie();
  return { ok: true as const };
});

export const superSetAvatar = createServerFn({ method: "POST" })
  .inputValidator((d: { avatar?: string }) => d)
  .handler(async ({ data }) => {
    const session = await import("./session.server");
    const store = await import("./store.server");
    const me = await session.currentSuperUser();
    if (!me) return { ok: false as const, error: "Inicia sesión." };
    await store.setAvatar(me.id, data.avatar);
    return { ok: true as const, state: await state() };
  });

export const superCreateLeague = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; password: string; max: number }) => d)
  .handler(async ({ data }) => {
    const session = await import("./session.server");
    const store = await import("./store.server");
    const me = await session.currentSuperUser();
    if (!me) return { ok: false as const, error: "Inicia sesión." };
    const name = clean(data.name);
    if (name.length < 3) return { ok: false as const, error: "Pon un nombre de liga." };
    if (String(data.password ?? "").length < 3) return { ok: false as const, error: "La liga necesita contraseña." };
    const league = await store.createLeague(me.id, name, data.password, Number(data.max) || 10);
    return { ok: true as const, state: await state(league.id) };
  });

export const superJoinLeague = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; password: string }) => d)
  .handler(async ({ data }) => {
    const session = await import("./session.server");
    const store = await import("./store.server");
    const me = await session.currentSuperUser();
    if (!me) return { ok: false as const, error: "Inicia sesión." };
    const league = await store.joinLeague(me.id, clean(data.name), data.password);
    if (!league) return { ok: false as const, error: "Liga, contraseña o plazas no válidas." };
    return { ok: true as const, state: await state(league.id) };
  });

async function canManage(leagueId: string): Promise<boolean> {
  const session = await import("./session.server");
  const store = await import("./store.server");
  const me = await session.currentSuperUser();
  const admin = await webAdmin();
  const league = (await store.listAll()).leagues.find((l) => l.id === leagueId);
  return Boolean(league && (admin || (me && league.ownerId === me.id)));
}

export const superUpdateLeague = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string; name?: string; password?: string; max?: number; seasonStart?: string; jornadaOpen?: string; jornadaClose?: string }) => d)
  .handler(async ({ data }) => {
    if (!(await canManage(data.leagueId))) return { ok: false as const, error: "No puedes administrar esta liga." };
    const store = await import("./store.server");
    await store.updateLeague(data.leagueId, {
      name: data.name,
      password: data.password,
      maxParticipants: data.max,
      seasonStart: data.seasonStart,
      jornadaOpen: data.jornadaOpen,
      jornadaClose: data.jornadaClose,
    });
    return { ok: true as const, state: await state(data.leagueId) };
  });

export const superKick = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string; userId: string }) => d)
  .handler(async ({ data }) => {
    if (!(await canManage(data.leagueId))) return { ok: false as const, error: "No puedes administrar esta liga." };
    const store = await import("./store.server");
    await store.kick(data.leagueId, data.userId);
    return { ok: true as const, state: await state(data.leagueId) };
  });

export const superGenerate = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string }) => d)
  .handler(async ({ data }) => {
    if (!(await canManage(data.leagueId))) return { ok: false as const, error: "No puedes administrar esta liga." };
    const store = await import("./store.server");
    const n = await store.generateCalendar(data.leagueId);
    if (n < 0) return { ok: false as const, error: "El calendario ya está generado y no se puede volver a crear." };
    if (!n) return { ok: false as const, error: "Hacen falta al menos 2 participantes." };
    return { ok: true as const, state: await state(data.leagueId) };
  });

export const superSelectMatches = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string; slateId: string; matchIds: string[]; number?: number }) => d)
  .handler(async ({ data }) => {
    if (!(await canManage(data.leagueId))) return { ok: false as const, error: "No puedes administrar esta liga." };
    const slates = await publishedSlates();
    const slate = slates.find((s) => s.id === data.slateId);
    if (!slate) return { ok: false as const, error: "Esa jornada de la porra no está publicada." };
    const chosen = slate.matches.filter((m) => data.matchIds.includes(m.id)).slice(0, 10);
    if (!chosen.length) return { ok: false as const, error: "Elige al menos un partido." };
    const store = await import("./store.server");
    const box = await store.listAll();
    const number = data.number || Math.max(0, ...box.jornadas.filter((j) => j.leagueId === data.leagueId).map((j) => j.number)) + 1;
    await store.setJornada(
      data.leagueId,
      number,
      slate.id,
      chosen.map((m) => ({ id: m.id, home: m.home, away: m.away, sport: store.sportOf(m.home, m.away) })),
      false,
    );
    return { ok: true as const, state: await state(data.leagueId) };
  });

export const superSetResult = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string; jornadaId: string; matchId: string; home?: number; away?: number; sport?: SportKind }) => d)
  .handler(async ({ data }) => {
    if (!(await canManage(data.leagueId))) return { ok: false as const, error: "No puedes administrar esta liga." };
    const store = await import("./store.server");
    if (data.sport) await store.setSport(data.leagueId, data.jornadaId, data.matchId, data.sport);
    if (data.home != null && data.away != null) await store.setOfficial(data.leagueId, data.jornadaId, data.matchId, Number(data.home), Number(data.away));
    return { ok: true as const, state: await state(data.leagueId) };
  });

export const superSavePicks = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string; jornadaId: string; picks: Array<{ matchId: string; home: number; away: number }> }) => d)
  .handler(async ({ data }) => {
    const session = await import("./session.server");
    const store = await import("./store.server");
    const me = await session.currentSuperUser();
    if (!me) return { ok: false as const, error: "Inicia sesión." };
    const box = await store.listAll();
    const league = box.leagues.find((l) => l.id === data.leagueId);
    if (!league?.participants.includes(me.id)) return { ok: false as const, error: "No estás en esta liga." };
    const jornada = box.jornadas.find((j) => j.id === data.jornadaId);
    if (jornada?.closeAt && Date.now() > Date.parse(jornada.closeAt)) return { ok: false as const, error: "La jornada ya está cerrada." };
    await store.savePicks(me.id, data.leagueId, data.jornadaId, data.picks.filter((p) => Number.isFinite(p.home) && Number.isFinite(p.away)));
    return { ok: true as const, state: await state(data.leagueId) };
  });

export const superChat = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string; text: string }) => d)
  .handler(async ({ data }) => {
    const session = await import("./session.server");
    const store = await import("./store.server");
    const me = await session.currentSuperUser();
    if (!me) return { ok: false as const, error: "Inicia sesión." };
    const league = (await store.listAll()).leagues.find((l) => l.id === data.leagueId);
    if (!league?.participants.includes(me.id)) return { ok: false as const, error: "No estás en esta liga." };
    if (data.text.trim().length < 1) return { ok: false as const, error: "Escribe un mensaje." };
    await store.addChat(data.leagueId, me.id, data.text);
    return { ok: true as const, state: await state(data.leagueId) };
  });

export const superAnnounce = createServerFn({ method: "POST" })
  .inputValidator((d: { leagueId: string; text: string }) => d)
  .handler(async ({ data }) => {
    if (!(await canManage(data.leagueId))) return { ok: false as const, error: "No puedes administrar esta liga." };
    const store = await import("./store.server");
    await store.addAnnouncement(data.leagueId, data.text);
    return { ok: true as const, state: await state(data.leagueId) };
  });
