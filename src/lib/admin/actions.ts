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
  return { ok: await requireAdmin() };
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
    const { requireAdmin } = await import("./session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const { upsertOverride } = await import("./store.server");
    const saved = await upsertOverride(data);
    return { ok: true as const, override: saved };
  });

export const adminDeleteOverride = createServerFn({ method: "POST" })
  .inputValidator((d: { matchId: string }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const { removeOverride } = await import("./store.server");
    await removeOverride(data.matchId);
    return { ok: true as const };
  });
