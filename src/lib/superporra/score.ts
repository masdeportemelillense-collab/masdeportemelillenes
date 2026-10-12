import type { BoardRow, FixtureView, SportKind, SuperFixture, SuperJornada, SuperPick, SuperUser } from "./types";

export function scoreMatch(sport: SportKind, pickHome: number, pickAway: number, offHome?: number, offAway?: number): number {
  if (offHome == null || offAway == null) return 0;
  const exact = pickHome === offHome && pickAway === offAway;
  const pickSide = Math.sign(pickHome - pickAway);
  const offSide = Math.sign(offHome - offAway);
  if (sport === "baloncesto" || sport === "balonmano") {
    if (exact) return 3;
    if (pickSide !== 0 && pickSide === offSide && pickHome - pickAway === offHome - offAway) return 2;
    if (pickSide === offSide) return 1;
    return 0;
  }
  if (exact) return 2;
  if (pickSide === offSide) return 1;
  return 0;
}

export function userPoints(userId: string, jornada: SuperJornada, picks: SuperPick[]): number {
  return jornada.matches.reduce((sum, match) => {
    const pick = picks.find((p) => p.userId === userId && p.jornadaId === jornada.id && p.matchId === match.id);
    if (!pick) return sum;
    return sum + scoreMatch(match.sport, pick.home, pick.away, match.officialHome, match.officialAway);
  }, 0);
}

export function jornadaReady(jornada?: SuperJornada): boolean {
  return Boolean(jornada && jornada.matches.some((m) => m.officialHome != null && m.officialAway != null));
}

export function buildViews(
  fixtures: SuperFixture[],
  jornadas: SuperJornada[],
  picks: SuperPick[],
  users: SuperUser[],
): FixtureView[] {
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "Jugador";
  return fixtures.map((fx) => {
    const jornada = jornadas.find((j) => j.leagueId === fx.leagueId && j.number === fx.round);
    const ready = jornadaReady(jornada);
    const homePoints = jornada && ready ? userPoints(fx.homeUserId, jornada, picks) : undefined;
    const awayPoints = jornada && ready ? userPoints(fx.awayUserId, jornada, picks) : undefined;
    const result = ready && homePoints != null && awayPoints != null
      ? homePoints > awayPoints ? "home" : awayPoints > homePoints ? "away" : "draw"
      : undefined;
    return { ...fx, homeName: nameOf(fx.homeUserId), awayName: nameOf(fx.awayUserId), homePoints, awayPoints, result, resolved: Boolean(result) };
  });
}

export function buildBoard(userIds: string[], views: FixtureView[], users: SuperUser[]): BoardRow[] {
  return userIds.map((id) => {
    const mine = views.filter((v) => v.resolved && (v.homeUserId === id || v.awayUserId === id));
    let won = 0, drawn = 0, lost = 0, gf = 0, gc = 0;
    for (const fx of mine) {
      const home = fx.homeUserId === id;
      const minePts = home ? fx.homePoints ?? 0 : fx.awayPoints ?? 0;
      const oppPts = home ? fx.awayPoints ?? 0 : fx.homePoints ?? 0;
      gf += minePts;
      gc += oppPts;
      if (fx.result === "draw") drawn += 1;
      else if ((home && fx.result === "home") || (!home && fx.result === "away")) won += 1;
      else lost += 1;
    }
    const user = users.find((u) => u.id === id);
    return {
      userId: id,
      name: user?.name ?? "Jugador",
      avatar: user?.avatar,
      played: mine.length,
      won,
      drawn,
      lost,
      gf,
      gc,
      pts: won * 3 + drawn,
    };
  }).sort((a, b) => b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc) || a.name.localeCompare(b.name, "es"));
}

export function roundRobin(ids: string[]): Array<{ round: number; home: string; away: string }> {
  const list = [...ids];
  if (list.length < 2) return [];
  if (list.length % 2) list.push("BYE");
  const n = list.length;
  const rounds = n - 1;
  const half = n / 2;
  const first: Array<{ round: number; home: string; away: string }> = [];
  let arr = [...list];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== "BYE" && b !== "BYE") first.push({ round: r + 1, home: r % 2 ? b : a, away: r % 2 ? a : b });
    }
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }
  const second = first.map((fx) => ({ round: fx.round + rounds, home: fx.away, away: fx.home }));
  return [...first, ...second];
}
