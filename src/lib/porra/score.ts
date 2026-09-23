import type { PorraBoardRow, PorraPick, PorraSlate, PorraUser } from "./types";

export function scoreUser(userId: string, slates: PorraSlate[], picks: PorraPick[]): {
  points: number;
  played: number;
  correct: number;
} {
  let points = 0;
  let played = 0;
  let correct = 0;
  const mine = picks.filter((p) => p.userId === userId);
  for (const slate of slates) {
    const row = scoreSlate(userId, slate, mine);
    points += row.correct;
    played += row.played;
    correct += row.correct;
  }
  return { points, played, correct };
}

export function scoreSlate(
  userId: string,
  slate: PorraSlate,
  picks: PorraPick[],
): { played: number; correct: number; resolved: number; total: number } {
  const mine = picks.filter((p) => p.userId === userId && p.slateId === slate.id);
  let played = 0;
  let correct = 0;
  let resolved = 0;
  for (const match of slate.matches) {
    if (!match.result) continue;
    resolved += 1;
    const hit = mine.find((p) => p.matchId === match.id);
    if (!hit) continue;
    played += 1;
    if (hit.pick === match.result) correct += 1;
  }
  return { played, correct, resolved, total: slate.matches.length };
}

export function leaderboard(users: PorraUser[], slates: PorraSlate[], picks: PorraPick[]): PorraBoardRow[] {
  return users
    .map((u) => {
      const s = scoreUser(u.id, slates, picks);
      return { userId: u.id, name: u.name, avatar: u.avatar, ...s };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (a.played !== b.played) return a.played - b.played;
      return a.name.localeCompare(b.name, "es");
    });
}
