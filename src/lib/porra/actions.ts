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

export const porraRegister = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; password: string; avatar?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const name = cleanName(data.name ?? "");
      const password = String(data.password ?? "");
      if (!NAME_RE.test(name)) {
        return { ok: false as const, error: "El alias debe tener entre 3 y 24 caracteres." };
      }
      if (password.length < 4) {
        return { ok: false as const, error: "La contraseña necesita al menos 4 caracteres." };
      }
      const store = await import("./store.server");
      if (await store.findUserByName(name)) {
        return { ok: false as const, error: "Ese alias ya está en uso." };
      }
      const { isPorraAvatar } = await import("./avatars");
      const avatar = isPorraAvatar(data.avatar) ? data.avatar : undefined;
      const user = await store.createUser(name, password, avatar);
      const session = await import("./session.server");
      const me = { id: user.id, name: user.name, avatar: user.avatar };
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
      const user = await store.findUserByName(cleanName(data.name ?? ""));
      if (!user || !(await store.checkPass(String(data.password ?? ""), user.pass))) {
        return { ok: false as const, error: "Alias o contraseña incorrectos." };
      }
      const session = await import("./session.server");
      const me = { id: user.id, name: user.name, avatar: user.avatar };
      await session.writePorraCookie(await session.issueUserToken(me.id, me.name));
      return { ok: true as const, state: await publicState(me) };
    } catch (err) {
      console.error("[porra] login", err);
      return { ok: false as const, error: "No se pudo entrar. Prueba de nuevo." };
    }
  });

export const porraLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await import("./session.server");
  await session.clearPorraCookie();
  return { ok: true as const, state: await publicState(null) };
});

export const porraSetAvatar = createServerFn({ method: "POST" })
  .inputValidator((d: { avatar?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const session = await import("./session.server");
      const me = await session.currentPorraUser();
      if (!me) return { ok: false as const, error: "Entra para elegir avatar." };
      const { isPorraAvatar } = await import("./avatars");
      const avatar = isPorraAvatar(data.avatar) ? data.avatar : undefined;
      const store = await import("./store.server");
      const user = await store.setUserAvatar(me.id, avatar);
      return { ok: true as const, state: await publicState(user ? { id: user.id, name: user.name, avatar: user.avatar } : me) };
    } catch (err) {
      console.error("[porra] avatar", err);
      return { ok: false as const, error: "No se pudo guardar el escudo." };
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
      if (isLocked(slate.lockAt)) {
        return { ok: false as const, error: "La porra se cerró el viernes a las 17:00 (hora española)." };
      }
      const allowed = new Set(slate.matches.map((m) => m.id));
      for (const row of data.picks ?? []) {
        if (!allowed.has(row.matchId)) continue;
        if (row.pick !== "1" && row.pick !== "X" && row.pick !== "2") continue;
        await store.savePick({
          userId: me.id,
          slateId: slate.id,
          matchId: row.matchId,
          pick: row.pick,
          updatedAt: Date.now(),
        });
      }
      return { ok: true as const, state: await publicState() };
    } catch (err) {
      console.error("[porra] save picks", err);
      return { ok: false as const, error: "No se pudieron guardar los pronósticos." };
    }
  });

export const porraAdminList = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/admin/session.server");
  if (!(await requireAdmin())) return { ok: false as const, slates: [] as PorraSlate[] };
  const store = await import("./store.server");
  return { ok: true as const, slates: await store.listSlates() };
});

export const porraAdminSaveSlate = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      id?: string;
      title: string;
      lockAt?: string;
      published?: boolean;
      matches: Array<{ id?: string; home: string; away: string; kickoff?: string; result?: Quiniela | null }>;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const { requireAdmin } = await import("@/lib/admin/session.server");
      if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
      const title = String(data.title ?? "").trim();
      if (title.length < 3) return { ok: false as const, error: "Pon un nombre a la jornada." };
      const matches: PorraMatch[] = (data.matches ?? [])
        .map((m) => ({
          id: m.id?.trim() || randomBytes(5).toString("hex"),
          home: String(m.home ?? "").trim(),
          away: String(m.away ?? "").trim(),
          kickoff: m.kickoff?.trim() || undefined,
          result: m.result === "1" || m.result === "X" || m.result === "2" ? m.result : null,
        }))
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
      console.error("[porra] delete slate", err);
      return { ok: false as const, error: "No se pudo borrar la jornada." };
    }
  });
