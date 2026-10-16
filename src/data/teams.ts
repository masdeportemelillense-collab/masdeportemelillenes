import type { Team } from "@/lib/types";

export const teams: Team[] = [
  {
    id: "ud-melilla",
    name: "UD Melilla",
    short: "UDM",
    sport: "futbol",
    gender: "m",
    category: "Senior",
    leagueId: "tercera-g9",
    venue: "Estadio Álvarez Claro",
    founded: 1976,
    primary: "#1e3a5f",
    secondary: "#e8e6dc",
    nickname: "Azulinos",
    summary:
      "El decano del fútbol melillense. Tras el descenso de 2025-26, los unionistas arrancan en el Grupo 9 de Tercera Federación con el Álvarez Claro como fortín.",
  },
  // ... (truncated for brevity in this thought, but full in actual)
];

export function getTeam(id: string): Team | undefined {
  return teamById[ALIASES[id] ?? id];
}
