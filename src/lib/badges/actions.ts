import { createServerFn } from "@tanstack/react-start";

export const adminSetBadge = createServerFn({ method: "POST" })
  .inputValidator((d: { teamId?: string; name: string; badgeUrl: string }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const name = String(data.name ?? "").trim();
    if (name.length < 2) return { ok: false as const, error: "Falta el nombre del equipo." };
    const { setBadgeOverride } = await import("./store.server");
    await setBadgeOverride(data.teamId, name, String(data.badgeUrl ?? ""));
    return { ok: true as const };
  });

export const adminSetName = createServerFn({ method: "POST" })
  .inputValidator((d: { teamId?: string; originalName: string; name: string }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const original = String(data.originalName ?? "").trim();
    const name = String(data.name ?? "").trim();
    if (original.length < 2 || name.length < 2) return { ok: false as const, error: "El nombre es demasiado corto." };
    const { setNameOverride } = await import("./store.server");
    await setNameOverride(data.teamId, original, name);
    return { ok: true as const };
  });
