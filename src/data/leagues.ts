import type { League } from "@/lib/types";

const t = (name: string, short: string, id?: string) => ({ name, short, id });

export const CUP_LEAGUE_IDS = new Set(["copa-federacion", "copa-espana-bsk", "copa-del-rey", "copa-rey-fs"]);

export const leagues: League[] = [
  {
    id: "tercera-g9",
    name: "Tercera Federación · Grupo 9",
    shortName: "3ª RFEF Gr. 9",
    sport: "futbol",
    scoring: "football",
    teams: [
      t("UD Melilla", "UDM", "ud-melilla"),
      t("CD Huétor Vega", "HUV"),
      t("UD Torre del Mar", "TDM"),
      t("Málaga Juniors", "MJF"),
      t("Ciudad de Torredonjimeno", "TDJ"),
      t("CF Motril", "MOT"),
      t("Arenas de Armilla", "ARM"),
      t("FC Marbellí", "MRB"),
      t("Atlético Malagueño", "MLG"),
      t("UD Almería B", "ALM"),
      t("CD Alhaurino", "ALH"),
      t("Atlético Porcuna", "POR"),
      t("Atlético Mancha Real", "AMR"),
      t("Recreativo Granada", "RGR"),
      t("UD San Pedro", "SPE"),
      t("Churriana de la Vega", "CHV"),
      t("Atlético de Marbella", "AMB"),
      t("Cantoria 2017", "CAN"),
    ],
  },
  {
    id: "bm-pa-masc",
    name: "Primera Andaluza Senior Masculina · Grupo A",
    shortName: "1ª Andaluza Masc.",
    sport: "balonmano",
    scoring: "football",
    teams: [
      t("Balonmano El Aciras", "ACIRAS", "aciras-masc"),
      t("CD Agrinova BM Vícar", "VIC"),
      t("CD URCI Almería", "URC"),
      t("BM Pozoblanco", "POZ"),
      t("BM Aguilar", "AGU"),
      t("Maristas Málaga", "MAR"),
      t("Trops Málaga", "TRO"),
      t("Otros equipos Grupo A", "OTR"),
    ],
  },
  {
    id: "bm-pn-fem",
    name: "Primera Nacional Femenina",
    shortName: "1ª Nacional Fem.",
    sport: "balonmano",
    scoring: "football",
    teams: [
      t("Balonmano El Aciras F", "ACIRAS F", "aciras-fem"),
      t("Universidad de Granada", "UGR"),
      t("BM Ciudad de Granada", "GRA"),
      t("Otros equipos PN Fem.", "OTR"),
    ],
  },
  {
    id: "bm-dh-plata",
    name: "División de Honor Plata Femenina",
    shortName: "DH Plata Fem.",
    sport: "balonmano",
    scoring: "football",
    teams: [
      t("T-Maravillas", "TMA", "t-maravillas"),
      t("Estudiantes Ceuta", "CEU"),
      t("BM Roquetas", "ROQ"),
      t("BM Málaga Costa del Sol B", "MLG"),
      t("Rincón Fertilidad Málaga B", "RIN"),
      t("BM Almería", "ALM"),
      t("BM Cádiz", "CAD"),
      t("BM Jerez", "JER"),
      t("BM Sevilla", "SEV"),
      t("BM Córdoba", "COR"),
      t("BM Huelva", "HUE"),
      t("BM Jaén", "JAE"),
    ],
  },
];

export const leagueById = Object.fromEntries(leagues.map((l) => [l.id, l])) as Record<
  string,
  League
>;
