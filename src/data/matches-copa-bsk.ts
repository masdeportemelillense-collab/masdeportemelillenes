import { m } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const IMB = "Javier Imbroda Ortiz";

export const copaBskMatches: Match[] = [
  m({
    id: "melb-copa-j1",
    league: "copa-espana-bsk",
    sport: "baloncesto",
    at: "2026-09-12T13:30:00+02:00",
    venue: "Pabellón Dr. Juan Carlos Mateo",
    jornada: 1,
    home: "CB Algeciras|ALG",
    away: "melilla-baloncesto",
    duration: 40,
    events: [
      [10, "A", "periodo", "Q1", "*24-27"],
      [20, "A", "periodo", "Q2", "*36-49"],
      [30, "A", "periodo", "Q3", "*45-68"],
      [40, "A", "punto", "Final", "*63-87"],
    ],
  }),
  m({
    id: "melb-copa-j2",
    league: "copa-espana-bsk",
    sport: "baloncesto",
    at: "2026-09-20T12:00:00+02:00",
    venue: IMB,
    jornada: 2,
    home: "melilla-baloncesto",
    away: "Jaén Paraíso Interior|JAE",
    duration: 40,
    events: [
      [10, "H", "periodo", "Q1", "*29-17"],
      [20, "H", "periodo", "Q2", "*44-41"],
      [30, "H", "periodo", "Q3", "*75-49"],
      [40, "H", "punto", "Final", "*92-60"],
    ],
  }),
  m({
    id: "melb-copa-j3",
    league: "copa-espana-bsk",
    sport: "baloncesto",
    at: "2026-09-26T12:00:00+02:00",
    venue: "Pabellón Alameda, Morón",
    jornada: 3,
    home: "CB Starlabs Morón|MOR",
    away: "melilla-baloncesto",
    duration: 40,
  }),
];
