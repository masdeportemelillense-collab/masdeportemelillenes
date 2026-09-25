import { m } from "@/data/match-builder";
import type { Match } from "@/lib/types";

export const atmSrMatches: Match[] = [
  m({
    id: "atm-sr-copa-ida",
    league: "copa-del-rey",
    sport: "futbol",
    at: "2026-09-26T20:00:00+02:00",
    venue: "Estadio Municipal José Antonio Pérez",
    jornada: 0,
    home: "UD Pinatar|PIN",
    away: "atletico-melilla-sr",
  }),
  m({
    id: "atm-sr-copa-vuelta",
    league: "copa-del-rey",
    sport: "futbol",
    at: "2026-10-04T12:00:00+02:00",
    venue: "Campo Federativo La Espiguera",
    jornada: 0,
    home: "atletico-melilla-sr",
    away: "UD Pinatar|PIN",
  }),
];
