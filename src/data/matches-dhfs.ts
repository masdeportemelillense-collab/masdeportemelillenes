import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const rows: Spec[] = [
  { id: "dhj-1", league: "fs-dh-juv", sport: "futsal", at: "2026-09-19T18:00:00+02:00", venue: "Pabellón Lázaro Fernández", jornada: 1, home: "rusadir-fs-dh", away: "C.D. Albolote Futsal Js|CAF", status: "finished", events: [[48, "H", "gol", "", "*3-3"]] },
  { id: "dhj-3", league: "fs-dh-juv", sport: "futsal", at: "2026-09-19T18:00:00+02:00", venue: "Polideportivo Guadaljaire", jornada: 1, home: "C.D. Malacitano FutSal Js|CMF", away: "pena-rm-fs", status: "finished", events: [[48, "H", "gol", "", "*6-1"]] },
  { id: "dhj-10", league: "fs-dh-juv", sport: "futsal", at: "2026-09-26T18:00:00+02:00", venue: "Pabellón Jose Mª Ruiz Mateos", jornada: 2, home: "Xerez Constr. Viloita Js|XCV", away: "rusadir-fs-dh", status: "finished", events: [[48, "H", "gol", "", "*5-2"]] },
  { id: "dhj-12", league: "fs-dh-juv", sport: "futsal", at: "2026-09-26T18:00:00+02:00", venue: "Pabellón Lázaro Fernández", jornada: 2, home: "pena-rm-fs", away: "C.D. Avanza Jaén Js|CAJ", status: "finished", events: [[48, "H", "gol", "", "*7-3"]] },
  { id: "dhj-17", league: "fs-dh-juv", sport: "futsal", at: "2026-10-03T18:00:00+02:00", venue: "Pabellón Lázaro Fernández", jornada: 3, home: "rusadir-fs-dh", away: "C.D. Avanza Jaén Js|CAJ", status: "finished", events: [[48, "H", "gol", "", "*4-2"]] },
  { id: "dhj-18", league: "fs-dh-juv", sport: "futsal", at: "2026-10-03T18:00:00+02:00", venue: "P.M. Tiro De Pichón", jornada: 3, home: "pena-rm-fs", away: "C.D. Marqués de Nervión Js|CMD", status: "finished", events: [[48, "H", "gol", "", "*3-1"]] },
  { id: "dhj-25", league: "fs-dh-juv", sport: "futsal", at: "2026-10-10T18:00:00+02:00", venue: "Pabellón Lázaro Fernández", jornada: 4, home: "rusadir-fs-dh", away: "Adecor F.S. Js|AFJ", status: "finished", events: [[48, "H", "gol", "", "*5-4"]] },
  { id: "dhj-26", league: "fs-dh-juv", sport: "futsal", at: "2026-10-10T18:00:00+02:00", venue: "P.M. Tiro De Pichón", jornada: 4, home: "pena-rm-fs", away: "C.D. Boca F.S. Priego Js|CBF", status: "finished", events: [[48, "H", "gol", "", "*2-2"]] },
  { id: "dhj-33", league: "fs-dh-juv", sport: "futsal", at: "2026-10-17T18:00:00+02:00", venue: "Pabellón Lázaro Fernández", jornada: 5, home: "rusadir-fs-dh", away: "C.D. Puerto On365 Js|CPO", status: "finished", events: [[48, "H", "gol", "", "*3-1"]] },
  { id: "dhj-34", league: "fs-dh-juv", sport: "futsal", at: "2026-10-17T18:00:00+02:00", venue: "P.M. Tiro De Pichón", jornada: 5, home: "pena-rm-fs", away: "Xerez Constr. Viloita Js|XCV", status: "finished", events: [[48, "H", "gol", "", "*4-3"]] },
  { id: "dhj-41", league: "fs-dh-juv", sport: "futsal", at: "2026-10-24T18:00:00+02:00", venue: "Pabellón Lázaro Fernández", jornada: 6, home: "rusadir-fs-dh", away: "Mengibar Puerta de la Bética Js|MPD" },
  { id: "dhj-42", league: "fs-dh-juv", sport: "futsal", at: "2026-10-24T18:00:00+02:00", venue: "P.M. Tiro De Pichón", jornada: 6, home: "pena-rm-fs", away: "Unión África Ceutí Js|UÁC" },
  { id: "dhj-49", league: "fs-dh-juv", sport: "futsal", at: "2026-10-31T18:00:00+01:00", venue: "Pabellón Lázaro Fernández", jornada: 7, home: "rusadir-fs-dh", away: "C.D. Boca F.S. Priego Js|CBF" },
  { id: "dhj-50", league: "fs-dh-juv", sport: "futsal", at: "2026-10-31T18:00:00+01:00", venue: "P.M. Tiro De Pichón", jornada: 7, home: "pena-rm-fs", away: "Terceto Granada F.S.Js|TGF" },
  { id: "dhj-57", league: "fs-dh-juv", sport: "futsal", at: "2026-11-07T18:00:00+01:00", venue: "Pabellón Lázaro Fernández", jornada: 8, home: "rusadir-fs-dh", away: "Xerez Constr. Viloita Js|XCV" },
  { id: "dhj-58", league: "fs-dh-juv", sport: "futsal", at: "2026-11-07T18:00:00+01:00", venue: "P.M. Tiro De Pichón", jornada: 8, home: "pena-rm-fs", away: "C.D. Albolote Futsal Js|CAF" },
];

export const dhfsMatches: Match[] = rows.map(m);
