import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { jornadaSummaries, leaderboard } from "./score";
import { isLocked, nextFridayLockIso } from "./time";
import type { PorraAccountRow, PorraMatch, PorraNotice, PorraPublicState, PorraSlate, Quiniela } from "./types";

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._'-]{3,24}$/;

function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function asPublic(u?: { id: string; name: string; avatar?: string; email?: string } | null) {
  if (!u) return null;
  return { id: u.id, name: u.name, avatar: u.avatar, email: u.email };
}

async function publicState(userOverride?: { id: string; name: string; avatar?: string; email?: string } | null): Promise<PorraPublicState> {
  const session = await import("./session.server");
  const store = await import("./store.server");
  try {
    await store.autofillFirstJornadaIfLocked();
  } catch (err) {
    console.error("[porra] jornada1 autofill", err);
  }
  const [cookieUser, users, slates, picks, tickets, notices] = await Promise.all([
    userOverride === undefined ? session.currentPorraUser() : Promise.resolve(userOverride),
    store.listUsers(),
    store.listSlates(),
    store.listPicks(),
    store.listTickets(),
    store.listNotices(),
  ]);
  const raw = userOverride === undefined ? cookieUser : userOverride;
  const stored = raw ? users.find((u) => u.id === raw.id) : undefined;
  const me = asPublic(stored ?? raw);
  if (me && userOverride === undefined) {
    await session.touchPorraSession({ id: me.id, name: me.name });
  }
  const visible = slates.filter((s) => s.published);
  return {
    now: Date.now(),
    user: me,
    slates: visible,
    myPicks: me ? picks.filter((p) => p.userId === me.id) : [],
    board: leaderboard(users, visible, picks),
    jornadas: jornadaSummaries(users, visible, picks),
    tickets: me ? tickets.filter((t) => t.userId === me.id && t.enabled).map((t) => t.slateId) : [],
    notices: me ? notices.filter((n) => n.userId === me.id).slice(0, 20) : [],
  };
}

const emptyState = (): PorraPublicState => ({ now: Date.now(), user: null, slates: [], myPicks: [], board: [], jornadas: [], tickets: [], notices: [] });

export const porraState = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await publicState();
  } catch (err) {
    console.error("[porra] state", err);
    return emptyState();
  }
});

export const porraRegister = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; password: string; avatar?: string; email?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const name = cleanName(data.name ?? "");
      const password = String(data.password ?? "");
      if (!NAME_RE.test(name)) return { ok: false as const, error: "El alias debe tener entre 3 y 24 caracteres." };
      if (password.length < 4) return { ok: false as const, error: "La contraseña necesita al menos 4 caracteres." };
      const store = await import("./store.server");
      if (data.email && !store.isEmail(data.email)) return { ok: false as const, error: "El email no es válido." };
      if (await store.findUserByName(name)) return { ok: false as const, error: "Ese alias ya está en uso." };
      const { isPorraAvatar } = await import("./avatars");
      const avatar = isPorraAvatar(data.avatar) ? data.avatar : undefined;
      const user = await store.createUser(name, password, avatar, data.email);
      const session = await import("./session.server");
      const me = { id: user.id, name: user.name, avatar: user.avatar, email: user.email };
      await session.writePorraCookie(await session.issueUserToken(me.id, me.name));
      return { ok: true as const, state: await publicState(me) };
    } catch (err) {
      console.error("[porra] register", err);
      return { ok: false as const, error: "No se pudo registrar. Prueba de nuevo." };
    }
  });

export const porraLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; password: string }) => d)
  .handler(async ({ data }) => {
    try {
      const store = await import("./store.server");
      const password = String(data.password ?? "");
      const user = await store.findUserByName(cleanName(data.name ?? ""));
      if (!user || !(await store.checkPass(password, user.pass))) {
        return { ok: false as const, error: "Alias o contraseña incorrectos." };
      }
      await store.rememberPlain(user.id, password);
      const session = await import("./session.server");
      const me = { id: user.id, name: user.name, avatar: user.avatar, email: user.email };
      await session.writePorraCookie(await session.issueUserToken(me.id, me.name));
      return { ok: true as const, state: await publicState(me) };
    } catch (err) {
      console.error("[porra] login", err);
      return { ok: false as const, error: "No se pudo entrar. Prueba de nuevo." };
    }
  });

export const porraRecover = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; email: string; password: string }) => d)
  .handler(async ({ data }) => {
    try {
      const store = await import("./store.server");
      const password = String(data.password ?? "");
      if (password.length < 4) return { ok: false as const, error: "La nueva contraseña necesita al menos 4 caracteres." };
      if (!store.isEmail(data.email)) return { ok: false as const, error: "Pon el email que guardaste en el perfil." };
      const user = await store.recoverPassword(cleanName(data.name ?? ""), data.email, password);
      if (!user) return { ok: false as const, error: "No hay ninguna cuenta con ese alias y ese email." };
      const session = await import("./session.server");
      const me = { id: user.id, name: user.name, avatar: user.avatar, email: user.email };
      await session.writePorraCookie(await session.issueUserToken(me.id, me.name));
      return { ok: true as const, state: await publicState(me) };
    } catch (err) {
      console.error("[porra] recover", err);
      return { ok: false as const, error: "No se pudo recuperar la cuenta." };
    }
  });

export const porraLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await import("./session.server");
  await session.clearPorraCookie();
  return { ok: true as const, state: await publicState(null) };
});

export const porraSetAvatar = createServerFn({ method: "POST" })
  .inputValidator((d: { avatar?: string; email?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const session = await import("./session.server");
      const me = await session.currentPorraUser();
      if (!me) return { ok: false as const, error: "Entra para editar el perfil." };
      const store = await import("./store.server");
      if (data.email && !store.isEmail(data.email)) return { ok: false as const, error: "El email no es válido." };
      const { isPorraAvatar } = await import("./avatars");
      const avatar = data.avatar === undefined ? undefined : isPorraAvatar(data.avatar) ? data.avatar : "";
      const user = await store.setUserProfile(me.id, { avatar, email: data.email });
      return { ok: true as const, state: await publicState(user ? { id: user.id, name: user.name, avatar: user.avatar, email: user.email } : me) };
    } catch (err) {
      console.error("[porra] profile", err);
      return { ok: false as const, error: "No se pudo guardar el perfil." };
    }
  });

export const porraSetTicket = createServerFn({ method: "POST" })
  .inputValidator((d: { slateId: string; enabled: boolean }) => d)
  .handler(async ({ data }) => {
    try {
      const session = await import("./session.server");
      const me = await session.currentPorraUser();
      if (!me) return { ok: false as const, error: "Entra para activar el ticket." };
      const store = await import("./store.server");
      await store.setTicket(me.id, data.slateId, !!data.enabled);
      return { ok: true as const, state: await publicState() };
    } catch (err) {
      console.error("[porra] ticket", err);
      return { ok: false as const, error: "No se pudo guardar el ticket." };
    }
  });

export const porraReadNotices = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const session = await import("./session.server");
    const me = await session.currentPorraUser();
    if (!me) return { ok: false as const, error: "Entra para ver avisos." };
    const store = await import("./store.server");
    await store.markNoticesRead(me.id);
    return { ok: true as const, state: await publicState() };
  } catch (err) {
    return { ok: false as const, error: "No se pudieron marcar." };
  }
});

export const porraSavePicks = createServerFn({ method: "POST" })
  .inputValidator((d: { slateId: string; picks: Array<{ matchId: string; pick: Quiniela }> }) => d)
  .handler(async ({ data }) => {
    try {
      const session = await import("./session.server");
      const me = await session.currentPorraUser();
      if (!me) return { ok: false as const, error: "Regístrate para pronosticar." };
      const store = await import("./store.server");
      const slates = await store.listSlates();
      const slate = slates.find((s) => s.id === data.slateId && s.published);
      if (!slate) return { ok: false as const, error: "Jornada no encontrada." };
      if (isLocked(slate.lockAt)) return { ok: false as const, error: "La porra ya está cerrada." };
      const allowed = new Set(slate.matches.map((m) => m.id));
      for (const row of data.picks ?? []) {
        if (!allowed.has(row.matchId)) continue;
        const match = slate.matches.find((mm) => mm.id === row.matchId);
        if (!match) continue;
        if (row.pick !== "1" && row.pick !== "2" && !(match.allowDraw !== false && row.pick === "X")) continue;
        await store.savePick({ userId: me.id, slateId: slate.id, matchId: row.matchId, pick: row.pick, updatedAt: Date.now() });
      }
      return { ok: true as const, state: await publicState() };
    } catch (err) {
      console.error("[porra] save picks", err);
      return { ok: false as const, error: "No se pudieron guardar los pronósticos." };
    }
  });

export const porraAdminList = createServerFn({ method: "GET" }).handler(async () => {
  const emptyAccounts: PorraAccountRow[] = [];
  const { requireAdmin } = await import("@/lib/admin/session.server");
  if (!(await requireAdmin())) {
    return { ok: false as const, slates: [] as PorraSlate[], users: 0, stats: [] as Array<{ slateId: string; predicted: number; complete: number; matches: number }>, accounts: emptyAccounts };
  }
  const store = await import("./store.server");
  try {
    await store.autofillFirstJornadaIfLocked();
  } catch (err) {
    console.error("[porra] jornada1 autofill admin", err);
  }
  const [slates, picks, users] = await Promise.all([store.listSlates(), store.listPicks(), store.listUsers()]);
  const stats = slates.map((slate) => {
    const mine = picks.filter((p) => p.slateId === slate.id);
    const byUser = new Map<string, Set<string>>();
    for (const p of mine) {
      const set = byUser.get(p.userId) ?? new Set<string>();
      set.add(p.matchId);
      byUser.set(p.userId, set);
    }
    const totalMatches = slate.matches.length;
    return { slateId: slate.id, predicted: byUser.size, complete: [...byUser.values()].filter((set) => set.size >= totalMatches && totalMatches > 0).length, matches: totalMatches };
  });
  const accounts: PorraAccountRow[] = users
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar, email: u.email ?? null, password: u.passPlain?.trim() ? u.passPlain : null, createdAt: u.createdAt }));
  return { ok: true as const, slates, users: users.length, stats, accounts };
});

export const porraAdminSetPassword = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; password: string }) => d)
  .handler(async ({ data }) => {
    try {
      const { requireAdmin } = await import("@/lib/admin/session.server");
      if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
      const password = String(data.password ?? "");
      if (password.length < 4) return { ok: false as const, error: "La nueva clave necesita al menos 4 caracteres." };
      const store = await import("./store.server");
      const user = await store.setUserPassword(data.userId, password);
      if (!user) return { ok: false as const, error: "Usuario no encontrado." };
      return { ok: true as const, name: user.name, password };
    } catch (err) {
      return { ok: false as const, error: "No se pudo cambiar la contraseña." };
    }
  });

export const porraAdminSaveSlate = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      id?: string;
      title: string;
      lockAt?: string;
      published?: boolean;
      matches: Array<{ id?: string; home: string; away: string; kickoff?: string; result?: Quiniela | null; allowDraw?: boolean; suspended?: boolean }>;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const { requireAdmin } = await import("@/lib/admin/session.server");
      if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
      const title = String(data.title ?? "").trim();
      if (title.length < 3) return { ok: false as const, error: "Pon un nombre a la jornada." };
      const matches: PorraMatch[] = (data.matches ?? [])
        .map((m) => {
          const allowDraw = m.allowDraw !== false;
          const suspended = m.suspended === true;
          const result = suspended ? null : m.result === "1" || m.result === "2" || (allowDraw && m.result === "X") ? m.result : null;
          return { id: m.id?.trim() || randomBytes(5).toString("hex"), home: String(m.home ?? "").trim(), away: String(m.away ?? "").trim(), kickoff: m.kickoff?.trim() || undefined, result, allowDraw, suspended };
        })
        .filter((m) => m.home && m.away);
      if (!matches.length) return { ok: false as const, error: "Añade al menos un partido." };
      const store = await import("./store.server");
      const existing = data.id ? (await store.listSlates()).find((s) => s.id === data.id) : undefined;
      const slate: PorraSlate = {
        id: existing?.id || data.id?.trim() || randomBytes(6).toString("hex"),
        title,
        lockAt: data.lockAt?.trim() || existing?.lockAt || nextFridayLockIso(),
        matches,
        createdAt: existing?.createdAt || Date.now(),
        published: data.published ?? existing?.published ?? true,
      };
      await store.upsertSlate(slate);
      return { ok: true as const, slate };
    } catch (err) {
      console.error("[porra] save slate", err);
      return { ok: false as const, error: "No se pudo guardar la jornada." };
    }
  });

export const porraAdminDeleteSlate = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const { requireAdmin } = await import("@/lib/admin/session.server");
      if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
      const store = await import("./store.server");
      await store.removeSlate(data.id);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: "No se pudo borrar la jornada." };
    }
  });
