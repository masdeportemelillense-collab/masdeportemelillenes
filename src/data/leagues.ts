import type { League } from "@/lib/types";

const t = (name: string, short: string, id?: string) => ({ name, short, id });

export const CUP_LEAGUE_IDS = new Set(["copa-federacion", "copa-espana-bsk", "copa-del-rey", "copa-rey-fs", "wwc-fem"]);

export const leagues: League[] = [
  // ... all previous leagues remain the same ...
  {
    id: "bsr-segunda",
    name: "Segunda División BSR · Grupo B",
    shortName: "2ª BSR Gr. B",
    sport: "bsr",
    scoring: "basket",
    teams: [
      t("Melilla Baloncesto BSR", "MBSR", "melilla-bsr"),
      t("Opticlass Raíces Móstoles", "MOS"),
      t("CDA Bahía de Cádiz", "CAD"),
      t("Covirán Churriana", "CHU"),
      t("BSR Fortuna Murcia", "FOR"),
    ],
  },
  {
    id: "wwc-fem",
    name: "Women's World Winners Cup 2026",
    shortName: "WWC Fem. Alanya",
    sport: "futbol",
    scoring: "football",
    format: "cup",
    teams: [
      t("Higicontrol Melilla", "HIGI", "higicontrol-melilla"),
      t("Union Vrede BS", "UNV"),
      t("Ceilândia EC", "CEI"),
      t("Barra de Santiago", "BAR"),
    ],
  },
];

export const leagueById = Object.fromEntries(leagues.map((l) => [l.id, l])) as Record<
  string,
  League
>;
