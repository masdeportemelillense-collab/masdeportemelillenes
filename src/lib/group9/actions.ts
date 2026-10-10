import { createServerFn } from "@tanstack/react-start";

export const adminSetGroup9Score = createServerFn({ method: "POST" })
  .inputValidator((d: { jornada: number; home: string; away: string; score: string }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const score = String(data.score ?? "").trim();
    if (score && !/^\d+\s*-\s*\d+$/.test(score)) return { ok: false as const, error: "Pon el resultado como 2-1." };
    const { setGroup9Score } = await import("./store.server");
    await setGroup9Score(Number(data.jornada), String(data.home), String(data.away), score.replace(/\s+/g, ""));
    return { ok: true as const };
  });
