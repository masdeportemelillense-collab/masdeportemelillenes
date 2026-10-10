import { readDoc, updateDoc } from "@/lib/persist.server";

export type Group9Score = { key: string; score: string };

const KEY = "group9-scores";

export async function listGroup9Scores(): Promise<Group9Score[]> {
  return readDoc<Group9Score[]>(KEY, []);
}

export async function setGroup9Score(jornada: number, home: string, away: string, score: string): Promise<void> {
  const key = `${jornada}|${home.toLowerCase()}|${away.toLowerCase()}`;
  const clean = score.trim();
  await updateDoc<Group9Score[]>(KEY, [], (rows) => {
    const next = rows.filter((row) => row.key !== key);
    if (clean) next.push({ key, score: clean });
    return next;
  });
}
