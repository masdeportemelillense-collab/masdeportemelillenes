import { createServerFn } from "@tanstack/react-start";

export const adminSetBadge = createServerFn({ method: "POST" })
  .inputValidator((d: { teamId?: string; name: string; originalName?: string; badgeUrl: string }) => d)
  .handler(async ({ data }) => {
    const { readSession } = await import("@/lib/admin/session.server");
    const session = await readSession();
    if (!session.ok) return { ok: false as const, error: "Sesión caducada." };
    if (session.scope !== "all") return { ok: false as const, error: "Solo el administrador principal puede cambiar escudos." };
    const names = [String(data.originalName ?? ""), String(data.name ?? "")].map((n) => n.trim()).filter((n) => n.length >= 2);
    if (!names.length) return { ok: false as const, error: "Falta el nombre del equipo." };
    const { setBadgeOverride } = await import("./store.server");
    await setBadgeOverride(data.teamId, names, String(data.badgeUrl ?? ""));
    return { ok: true as const };
  });

export const adminSetName = createServerFn({ method: "POST" })
  .inputValidator((d: { teamId?: string; originalName: string; name: string }) => d)
  .handler(async ({ data }) => {
    const { readSession } = await import("@/lib/admin/session.server");
    const session = await readSession();
    if (!session.ok) return { ok: false as const, error: "Sesión caducada." };
    if (session.scope !== "all") return { ok: false as const, error: "Solo el administrador principal puede cambiar nombres." };
    const original = String(data.originalName ?? "").trim();
    const name = String(data.name ?? "").trim();
    if (original.length < 2 || name.length < 2) return { ok: false as const, error: "El nombre es demasiado corto." };
    const { setNameOverride } = await import("./store.server");
    await setNameOverride(data.teamId, original, name);
    return { ok: true as const };
  });
