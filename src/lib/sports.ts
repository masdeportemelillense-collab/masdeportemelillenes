import type { Sport } from "@/lib/types";

export const SPORTS: Array<{
  id: Sport;
  label: string;
  short: string;
}> = [
  { id: "futbol", label: "Fútbol", short: "Fútbol" },
  { id: "baloncesto", label: "Baloncesto", short: "Basket" },
  { id: "voleibol", label: "Voleibol", short: "Voley" },
  { id: "balonmano", label: "Balonmano", short: "Handball" },
  { id: "futsal", label: "Fútbol sala", short: "Futsal" },
  { id: "bsr", label: "Silla de ruedas", short: "BSR" },
];

export const sportLabel = Object.fromEntries(SPORTS.map((s) => [s.id, s.label])) as Record<
  Sport,
  string
>;

export const GENDER_LABEL = {
  m: "Masculino",
  f: "Femenino",
  mixto: "Mixto",
} as const;
