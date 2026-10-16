import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const LAZ = "Pabellón Lázaro Fernández";

const rows: Spec[] = [
  // Placeholder - actualizar con datos de fandaluzabm.org / isquad cuando estén disponibles
  {id:"fortaleza-j1", league:"bm-pa-masc", sport:"balonmano", at:"2026-10-18T18:00:00+02:00", venue:LAZ, jornada:1, home:"fortaleza-melilla", away:"Rival por determinar|RIV", duration:70},
];

export const fortalezaMatches: Match[] = rows.map(m);
