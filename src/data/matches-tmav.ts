import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const LAZ = "Pabellón Lázaro Fernández";

const rows: Spec[] = [
  {id:"tmav-j1", league:"bm-dh-plata", sport:"balonmano", at:"2026-09-20T13:00:00+02:00", venue:"Pabellón San Basilio, Murcia", jornada:1, home:"UCAM BM Murcia|UCA", away:"t-maravillas", duration:70, events:[[60,"H","punto","Final","*36-30"]]},
  {id:"tmav-j2", league:"bm-dh-plata", sport:"balonmano", at:"2026-09-27T18:30:00+02:00", venue:LAZ, jornada:2, home:"t-maravillas", away:"Casa Álvarez Ciudad Imperial|CAI", duration:70, events:[[60,"A","punto","Final","*22-24"]]},
  {id:"tmav-j3", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-04T16:30:00+02:00", venue:"Pabellón Municipal Carrión de Calatrava", jornada:3, home:"Ayto Carrión BM Pozuelo|POZ", away:"t-maravillas", duration:70},
  {id:"tmav-j4", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-11T18:30:00+02:00", venue:LAZ, jornada:4, home:"t-maravillas", away:"Helvetia Montequinto|MON", duration:70},
  {id:"tmav-j5", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-18T18:00:00+02:00", venue:"Pabellón de los Sueños", jornada:5, home:"BM Alcobendas|ALC", away:"t-maravillas", duration:70},
  {id:"tmav-j6", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-25T18:30:00+02:00", venue:LAZ, jornada:6, home:"t-maravillas", away:"CD Urci Almería|URC", duration:70},
];

export const tmavMatches: Match[] = rows.map(m);
