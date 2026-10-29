import { m } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const PEZ = "Pabellón Guillermo García Pezzi";

export const maritimoMatches: Match[] = [
  m({ id: "rcmm-j1", league: "n1-masc-d", sport: "baloncesto", at: "2026-10-04T12:00:00+02:00", venue: "Adra", jornada: 1, home: "CD Adra 2012|ADR", away: "maritimo", duration: 40 }),
  m({ id: "rcmm-j2", league: "n1-masc-d", sport: "baloncesto", at: "2026-10-11T12:00:00+02:00", venue: PEZ, jornada: 2, home: "maritimo", away: "Pinkbear Baza|BAZ", duration: 40 }),
  m({ id: "rcmm-j3", league: "n1-masc-d", sport: "baloncesto", at: "2026-10-18T12:00:00+02:00", venue: "Granada", jornada: 3, home: "PC Box GMASB|GMA", away: "maritimo", duration: 40 }),
  m({ id: "rcmm-j4", league: "n1-masc-d", sport: "baloncesto", at: "2026-10-25T12:30:00+02:00", venue: PEZ, jornada: 4, home: "maritimo", away: "CD Roquetas BC|ROQ", duration: 40, status: "finished", events: [[40, "H", "punto", "Final", "*58-43"]] }),
  m({ id: "rcmm-j5", league: "n1-masc-d", sport: "baloncesto", at: "2026-11-08T12:00:00+01:00", venue: "Almería", jornada: 5, home: "CB Almería|ALM", away: "maritimo", duration: 40 }),
  m({ id: "rcmm-j6", league: "n1-masc-d", sport: "baloncesto", at: "2026-11-15T12:00:00+01:00", venue: PEZ, jornada: 6, home: "maritimo", away: "Destino Vera|VER", duration: 40 }),
  m({ id: "rcmm-j7", league: "n1-masc-d", sport: "baloncesto", at: "2026-11-22T12:00:00+01:00", venue: "Atarfe", jornada: 7, home: "CAB Atarfe|ATA", away: "maritimo", duration: 40 }),
  m({ id: "rcmm-j8", league: "n1-masc-d", sport: "baloncesto", at: "2026-11-29T12:00:00+01:00", venue: PEZ, jornada: 8, home: "maritimo", away: "CD Granada|GRA", duration: 40 }),
];
