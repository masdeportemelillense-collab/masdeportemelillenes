import { m } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const IMB = "Pabellón Javier Imbroda Ortiz";

export const voleyMatches: Match[] = [
  // Masculino
  m({ id: "cvm-j1", league: "superliga-m", sport: "voleibol", at: "2026-10-17T12:00:00+02:00", venue: IMB, jornada: 1, home: "cv-melilla-m", away: "Conqueridor Valencia|CON" }),
  m({ id: "cvm-j2", league: "superliga-m", sport: "voleibol", at: "2026-10-24T12:00:00+02:00", venue: "Teruel", jornada: 2, home: "CV Teruel|TER", away: "cv-melilla-m" }),
  m({ id: "cvm-j3", league: "superliga-m", sport: "voleibol", at: "2026-10-31T12:00:00+01:00", venue: IMB, jornada: 3, home: "cv-melilla-m", away: "CV Guaguas|GUA" }),
  m({ id: "cvm-j4", league: "superliga-m", sport: "voleibol", at: "2026-11-07T12:00:00+01:00", venue: "Almería", jornada: 4, home: "Unicaja Costa de Almería|UAL", away: "cv-melilla-m" }),
  // Femenino
  m({ id: "cvmf-j1", league: "superliga-f", sport: "voleibol", at: "2026-10-28T19:30:00+01:00", venue: IMB, jornada: 1, home: "cv-melilla-f", away: "Kiele Socuéllamos|KIE" }),
  m({ id: "cvmf-j2", league: "superliga-f", sport: "voleibol", at: "2026-11-01T12:00:00+01:00", venue: "Lugo", jornada: 2, home: "Emevé Lugo|EME", away: "cv-melilla-f" }),
  m({ id: "cvmf-j3", league: "superliga-f", sport: "voleibol", at: "2026-11-08T12:00:00+01:00", venue: IMB, jornada: 3, home: "cv-melilla-f", away: "Heidelberg Volkswagen|HEI" }),
];
