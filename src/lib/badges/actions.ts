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
