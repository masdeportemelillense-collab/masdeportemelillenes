import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const LAZ = "Pabellón Lázaro Fernández";

const rows: Spec[] = [
  // J1 – 03/10/2026 20:00 local – 23-31 vs Casa Álvarez Ciudad Imperial
  {id:"tmav-j1", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-03T20:00:00+02:00", venue:LAZ, jornada:1, home:"t-maravillas", away:"Casa Álvarez Ciudad Imperial|CAI", duration:70, events:[[60,"A","punto","Final","*23-31"]]},
  // J2 – 11/10/2026 11:00 away – 20-26 win vs Pozuelo
  {id:"tmav-j2", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-11T11:00:00+02:00", venue:"Pabellón Municipal Carrión de Calatrava", jornada:2, home:"Ayto Carrión BM Pozuelo|POZ", away:"t-maravillas", duration:70, events:[[60,"A","punto","Final","*20-26"]]},
  // J3 – 17/10/2026 20:00 local vs Club BM Estudiantes
  {id:"tmav-j3", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-17T20:00:00+02:00", venue:LAZ, jornada:3, home:"t-maravillas", away:"Club BM Estudiantes|EST", duration:70},
  // J4 – 25/10/2026 13:00 away vs Deza CBM
  {id:"tmav-j4", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-25T13:00:00+02:00", venue:"IDM Fátima", jornada:4, home:"Deza CBM|DEZ", away:"t-maravillas", duration:70},
  // J5 – 31/10/2026 16:00 local vs BM Alcobendas
  {id:"tmav-j5", league:"bm-dh-plata", sport:"balonmano", at:"2026-10-31T16:00:00+02:00", venue:LAZ, jornada:5, home:"t-maravillas", away:"Club Balonmano Alcobendas|ALC", duration:70},
  // J6 – 08/11/2026 12:00 away vs Montequinto
  {id:"tmav-j6", league:"bm-dh-plata", sport:"balonmano", at:"2026-11-08T12:00:00+01:00", venue:"Pabellón Municipal de Montequinto", jornada:6, home:"BM Montequinto Ciudad de Dos Hermanas|MON", away:"t-maravillas", duration:70},
  // J7 – 15/11/2026 13:00 local vs Abaranera
  {id:"tmav-j7", league:"bm-dh-plata", sport:"balonmano", at:"2026-11-15T13:00:00+01:00", venue:LAZ, jornada:7, home:"t-maravillas", away:"Agringenia Asoc. Abaranera|ABA", duration:70},
  // J8 – 22/11/2026 12:00 away vs CAB Cartagena
  {id:"tmav-j8", league:"bm-dh-plata", sport:"balonmano", at:"2026-11-22T12:00:00+01:00", venue:"Pabellón Municipal de Deportes Wsell de Guimbarda", jornada:8, home:"CAB Cartagena|CAR", away:"t-maravillas", duration:70},
  // J9 – 28/11/2026 20:00 local vs Caserío Ciudad Real
  {id:"tmav-j9", league:"bm-dh-plata", sport:"balonmano", at:"2026-11-28T20:00:00+01:00", venue:LAZ, jornada:9, home:"t-maravillas", away:"Caserío Ciudad Real|CAS", duration:70},
  // J10 – 05/12/2026 17:00 away vs Fundación Agustinos Alicante
  {id:"tmav-j10", league:"bm-dh-plata", sport:"balonmano", at:"2026-12-05T17:00:00+01:00", venue:"Pabellón Col. San Agustín Alicante", jornada:10, home:"Fundación Agustinos Alicante|AGU", away:"t-maravillas", duration:70},
];

export const tmavMatches: Match[] = rows.map(m);
