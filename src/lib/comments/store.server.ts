import { readDoc, updateDoc } from "@/lib/persist.server";

export type MatchComment = {
  id: string;
  matchId: string;
  name: string;
  text: string;
  createdAt: number;
};

const KEY = "match-comments";

export async function listComments(matchId: string): Promise<MatchComment[]> {
  const all = await readDoc<MatchComment[]>(KEY, []);
  return all.filter((c) => c.matchId === matchId).sort((a, b) => a.createdAt - b.createdAt).slice(-80);
}

export async function addComment(matchId: string, name: string, text: string): Promise<MatchComment> {
  const row: MatchComment = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    matchId,
    name,
    text,
    createdAt: Date.now(),
  };
  await updateDoc<MatchComment[]>(KEY, [], (rows) => {
    const next = [...rows.filter((c) => c.matchId !== matchId || Date.now() - c.createdAt < 1000 * 60 * 60 * 24 * 120), row];
    const mine = next.filter((c) => c.matchId === matchId);
    const others = next.filter((c) => c.matchId !== matchId);
    return [...others, ...mine.slice(-80)];
  });
  return row;
}
