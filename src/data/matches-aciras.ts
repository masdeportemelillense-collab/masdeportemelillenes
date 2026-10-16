import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const LAZ = "Pabellón Lázaro Fernández";

const rows: Spec[] = [
  // Femenino - Primera Nacional Femenina (según prensa local)
  {id:"aciras-f-j1", league:"bm-pn-fem", sport:"balonmano", at:"2026-10-12T12:00:00+02:00", venue:"Pabellón Universidad de Granada", jornada:1, home:"Universidad de Granada|UGR", away:"aciras-fem", duration:70},
  // Masculino - Primera Andaluza Senior (debut vs Vícar)
  {id:"aciras-m-j1", league:"bm-pa-masc", sport:"balonmano", at:"2026-10-17T20:00:00+02:00", venue:LAZ, jornada:1, home:"aciras-masc", away:"CD Agrinova BM Vícar|VIC", duration:70},
];

export const acirasMatches: Match[] = rows.map(m);
