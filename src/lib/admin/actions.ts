import { createServerFn } from "@tanstack/react-start";
import type { AdminOverride } from "@/lib/admin/types";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { user: string; password: string }) => d)
  .handler(async ({ data }) => {
    const { credentialsOk, issueToken, writeAdminCookie } = await import("./session.server");
    if (!credentialsOk(data.user, data.password)) {
      return { ok: false as const, error: "Usuario o contraseña incorrectos." };
    }
    await writeAdminCookie(await issueToken());
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { clearAdminCookie } = await import("./session.server");
  await clearAdminCookie();
  return { ok: true as const };
});

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./session.server");
  const ok = await requireAdmin();
  if (!ok) return { ok: false as const, persist: "file" as const };
  const { persistBackend } = await import("@/lib/persist.server");
  return { ok: true as const, persist: await persistBackend() };
});

export const adminListOverrides = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./session.server");
  if (!(await requireAdmin())) return { ok: false as const, overrides: [] as AdminOverride[] };
  const { listOverrides } = await import("./store.server");
  return { ok: true as const, overrides: await listOverrides() };
});

export const adminSaveOverride = createServerFn({ method: "POST" })
  .inputValidator((d: AdminOverride) => d)
  .handler(async ({ data }) => {
    try {
      const { requireAdmin } = await import("./session.server");
      if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
      const { upsertOverride } = await import("./store.server");
      const saved = await upsertOverride(data);
      return { ok: true as const, override: saved };
    } catch (err) {
      console.error("[admin] save override", err);
      return { ok: false as const, error: "No se pudo guardar. Prueba otra vez en unos segundos." };
    }
  });

export const adminDeleteOverride = createServerFn({ method: "POST" })
  .inputValidator((d: { matchId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const { requireAdmin } = await import("./session.server");
      if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
      const { removeOverride } = await import("./store.server");
      await removeOverride(data.matchId);
      return { ok: true as const };
    } catch (err) {
      console.error("[admin] delete override", err);
      return { ok: false as const, error: "No se pudo borrar el cambio." };
    }
  });
