import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const LAZ = "Pabellón Lázaro Fernández";

const rows: Spec[] = [
  // J1
  { id: "dhj-1", league: "fs-dh-juv", sport: "futsal", at: "2026-09-19T18:00:00+02:00", venue: LAZ, jornada: 1, home: "rusadir-fs-dh", away: "C.D. Albolote Futsal Js|CAF", status: "finished", events: [[48, "H", "gol", "", "*3-3"]] },
  { id: "dhj-3", league: "fs-dh-juv", sport: "futsal", at: "2026-09-19T18:00:00+02:00", venue: "Polideportivo Guadaljaire", jornada: 1, home: "C.D. Malacitano FutSal Js|CMF", away: "pena-rm-fs", status: "finished", events: [[48, "H", "gol", "", "*6-1"]] },
  // J2
  { id: "dhj-10", league: "fs-dh-juv", sport: "futsal", at: "2026-09-26T18:00:00+02:00", venue: "Pabellón Jose Mª Ruiz Mateos", jornada: 2, home: "Xerez Constr. Viloita Js|XCV", away: "rusadir-fs-dh", status: "finished", events: [[48, "H", "gol", "", "*5-2"]] },
  { id: "dhj-12", league: "fs-dh-juv", sport: "futsal", at: "2026-09-26T18:00:00+02:00", venue: LAZ, jornada: 2, home: "pena-rm-fs", away: "C.D. Avanza Jaén Js|CAJ", status: "finished", events: [[48, "H", "gol", "", "*7-3"]] },
  // J3
  { id: "dhj-17", league: "fs-dh-juv", sport: "futsal", at: "2026-10-03T18:00:00+02:00", venue: "Centro Deportivo Nuñez Blanca", jornada: 3, home: "Terceto Granada F.S.Js|GRA", away: "pena-rm-fs" },
  { id: "dhj-18", league: "fs-dh-juv", sport: "futsal", at: "2026-10-03T18:00:00+02:00", venue: LAZ, jornada: 3, home: "rusadir-fs-dh", away: "Adecor F.S. Js|AFJ" },
  // J4
  { id: "dhj-25", league: "fs-dh-juv", sport: "futsal", at: "2026-10-10T18:00:00+02:00", venue: LAZ, jornada: 4, home: "pena-rm-fs", away: "Mengibar Puerta de la Bética Js|MEN" },
  { id: "dhj-26", league: "fs-dh-juv", sport: "futsal", at: "2026-10-10T18:00:00+02:00", venue: "Córdoba", jornada: 4, home: "Córdoba P. Humanidad Js|COR", away: "rusadir-fs-dh" },
  // J5
  { id: "dhj-33", league: "fs-dh-juv", sport: "futsal", at: "2026-10-17T18:00:00+02:00", venue: LAZ, jornada: 5, home: "rusadir-fs-dh", away: "pena-rm-fs" },
  // J6 – oficial
  { id: "dhj-41", league: "fs-dh-juv", sport: "futsal", at: "2026-10-23T19:00:00+02:00", venue: "Pabellón Centro Deportivo Mendigorria", jornada: 6, home: "A.D. San Francisco de Paula Js|SFP", away: "rusadir-fs-dh", status: "finished", events: [[48, "A", "gol", "", "*2-3"]] },
  { id: "dhj-42", league: "fs-dh-juv", sport: "futsal", at: "2026-10-24T13:30:00+02:00", venue: LAZ, jornada: 6, home: "pena-rm-fs", away: "Unión África Ceutí Js|UÁC", status: "finished", events: [[48, "H", "gol", "", "*4-2"]] },
  // J7
  { id: "dhj-49", league: "fs-dh-juv", sport: "futsal", at: "2026-10-31T18:00:00+01:00", venue: "P.M. Guillermo Molina Ríos", jornada: 7, home: "C.D. Marqués de Nervión Js|CMD", away: "pena-rm-fs", homeBadge: "https://pbs.twimg.com/profile_images/1425413243971977216/1t3hh0ob_400x400.jpg" },
  { id: "dhj-50", league: "fs-dh-juv", sport: "futsal", at: "2026-10-31T18:00:00+01:00", venue: LAZ, jornada: 7, home: "rusadir-fs-dh", away: "C.D. Puerto On365 Js|CPO" },
  // J8
  { id: "dhj-57", league: "fs-dh-juv", sport: "futsal", at: "2026-11-07T18:00:00+01:00", venue: LAZ, jornada: 8, home: "pena-rm-fs", away: "C.D. Albolote Futsal Js|CAF" },
  { id: "dhj-58", league: "fs-dh-juv", sport: "futsal", at: "2026-11-07T18:00:00+01:00", venue: "Priego", jornada: 8, home: "C.D. Boca F.S. Priego Js|CBF", away: "rusadir-fs-dh" },
  // J9
  { id: "dhj-65", league: "fs-dh-juv", sport: "futsal", at: "2026-11-14T18:00:00+01:00", venue: "Xerez", jornada: 9, home: "Xerez Constr. Viloita Js|XCV", away: "pena-rm-fs" },
  { id: "dhj-66", league: "fs-dh-juv", sport: "futsal", at: "2026-11-14T18:00:00+01:00", venue: LAZ, jornada: 9, home: "rusadir-fs-dh", away: "C.D. Malacitano FutSal Js|CMF" },
  // J10
  { id: "dhj-73", league: "fs-dh-juv", sport: "futsal", at: "2026-11-21T18:00:00+01:00", venue: LAZ, jornada: 10, home: "pena-rm-fs", away: "Adecor F.S. Js|AFJ" },
  { id: "dhj-74", league: "fs-dh-juv", sport: "futsal", at: "2026-11-21T18:00:00+01:00", venue: "Jaén", jornada: 10, home: "C.D. Avanza Jaén Js|CAJ", away: "rusadir-fs-dh" },
];

export const dhfsMatches: Match[] = rows.map(m);
