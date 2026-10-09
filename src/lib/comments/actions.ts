import { createServerFn } from "@tanstack/react-start";
import type { MatchComment } from "./store.server";

function clean(value: string, max: number): string {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export const listMatchComments = createServerFn({ method: "GET" })
  .inputValidator((d: { matchId: string }) => d)
  .handler(async ({ data }): Promise<MatchComment[]> => {
    const { listComments } = await import("./store.server");
    return listComments(String(data.matchId || ""));
  });

export const addMatchComment = createServerFn({ method: "POST" })
  .inputValidator((d: { matchId: string; name: string; text: string }) => d)
  .handler(async ({ data }) => {
    const name = clean(data.name ?? "", 24);
    const text = clean(data.text ?? "", 280);
    if (name.length < 2) return { ok: false as const, error: "Pon un nombre de al menos 2 letras." };
    if (text.length < 2) return { ok: false as const, error: "Escribe un comentario." };
    const { addComment } = await import("./store.server");
    const comment = await addComment(String(data.matchId), name, text);
    return { ok: true as const, comment };
  });
