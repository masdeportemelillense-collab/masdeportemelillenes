import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const rows: Spec[] = [
  // Grupo A - Women's World Winners Cup Alanya 2026
  {
    id: "wwc-hig-1",
    league: "wwc-fem",
    sport: "futbol",
    at: "2026-10-26T17:00:00+03:00",
    venue: "Alanya, Turquía (Main Stadium)",
    jornada: 1,
    home: "Union Vrede BS|UNV",
    away: "higicontrol-melilla",
    status: "finished",
    events: [[36, "A", "gol", "Final", "*0-8"]],
  },
  {
    id: "wwc-hig-2",
    league: "wwc-fem",
    sport: "futbol",
    at: "2026-10-26T15:45:00+03:00",
    venue: "Alanya, Turquía (Main Stadium)",
    jornada: 1,
    home: "Barra de Santiago|BAR",
    away: "Ceilândia EC|CEI",
    status: "finished",
    events: [[36, "A", "gol", "Final", "*1-4"]],
  },
  {
    id: "wwc-hig-3",
    league: "wwc-fem",
    sport: "futbol",
    at: "2026-10-27T19:45:00+03:00",
    venue: "Alanya, Turquía (Pitch 2)",
    jornada: 2,
    home: "higicontrol-melilla",
    away: "Ceilândia EC|CEI",
  },
  {
    id: "wwc-hig-4",
    league: "wwc-fem",
    sport: "futbol",
    at: "2026-10-27T18:30:00+03:00",
    venue: "Alanya, Turquía (Pitch 2)",
    jornada: 2,
    home: "Barra de Santiago|BAR",
    away: "Union Vrede BS|UNV",
  },
  {
    id: "wwc-hig-5",
    league: "wwc-fem",
    sport: "futbol",
    at: "2026-10-28T22:15:00+03:00",
    venue: "Alanya, Turquía (Pitch 3)",
    jornada: 3,
    home: "higicontrol-melilla",
    away: "Barra de Santiago|BAR",
  },
  {
    id: "wwc-hig-6",
    league: "wwc-fem",
    sport: "futbol",
    at: "2026-10-28T21:00:00+03:00",
    venue: "Alanya, Turquía (Pitch 3)",
    jornada: 3,
    home: "Ceilândia EC|CEI",
    away: "Union Vrede BS|UNV",
  },
];

export const higicontrolMatches: Match[] = rows.map(m);
