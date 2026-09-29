import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const LAZ = "Pabellón Lázaro Fernández";

const rows: Spec[] = [
  {id:"vdv-j1", league:"bm-primera-f", sport:"balonmano", at:"2026-09-20T18:00:00+02:00", venue:LAZ, jornada:1, home:"virgen-victoria", away:"BM Ciudad de Málaga|CDM", duration:70},
  {id:"vdv-j2", league:"bm-primera-f", sport:"balonmano", at:"2026-09-27T18:00:00+02:00", venue:"Pabellón Carranque, Málaga", jornada:2, home:"Trops Málaga|MLG", away:"virgen-victoria", duration:70, events:[[60,"A","punto","Final","*26-27"]]},
  {id:"vdv-j3", league:"bm-primera-f", sport:"balonmano", at:"2026-10-04T18:00:00+02:00", venue:LAZ, jornada:3, home:"virgen-victoria", away:"BM Pozoblanco|PZB", duration:70},
  {id:"vdv-j4", league:"bm-primera-f", sport:"balonmano", at:"2026-10-11T18:00:00+02:00", venue:"Pabellón Municipal", jornada:4, home:"BM Sanse|SAN", away:"virgen-victoria", duration:70},
  {id:"vdv-j5", league:"bm-primera-f", sport:"balonmano", at:"2026-10-18T18:00:00+02:00", venue:LAZ, jornada:5, home:"virgen-victoria", away:"BM Algeciras|ALG", duration:70},
];

export const vdvMatches: Match[] = rows.map(m);
