import { createServerFn } from "@tanstack/react-start";
import type { CatalogState, MatchDraft, TeamDraft } from "@/lib/catalog/types";

export const catalogGet = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogState> => {
  try {
    const { getCatalog } = await import("./store.server");
    return await getCatalog();
  } catch {
    return { teams: [], matches: [] };
  }
});

export const catalogSaveTeam = createServerFn({ method: "POST" })
  .inputValidator((d: TeamDraft) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    if (!data.name.trim()) return { ok: false as const, error: "Pon el nombre del equipo." };
    const { saveTeam } = await import("./store.server");
    const team = await saveTeam(data);
    return { ok: true as const, team };
  });

export const catalogHideTeam = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const { hideTeam } = await import("./store.server");
    await hideTeam(data.id);
    return { ok: true as const };
  });

export const catalogSaveMatch = createServerFn({ method: "POST" })
  .inputValidator((d: MatchDraft) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    if (!data.homeName.trim() || !data.awayName.trim() || !data.kickoff) {
      return { ok: false as const, error: "Faltan equipos o fecha." };
    }
    const { saveMatch } = await import("./store.server");
    const match = await saveMatch(data);
    return { ok: true as const, match };
  });

export const catalogDeleteMatch = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const { deleteMatch } = await import("./store.server");
    await deleteMatch(data.id);
    return { ok: true as const };
  });
