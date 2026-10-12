import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const LAZ = "Pabellón Lázaro Fernández";
const rows: Spec[] = [
  {id:"vdv-j1", league:"bm-primera-f", sport:"balonmano", at:"2026-09-19T17:00:00+02:00", venue:LAZ, jornada:1, home:"virgen-victoria", away:"Ars Naranjas de Palma del Río|ARS", duration:70, events:[[60,"H","punto","Final","*28-26"]]},
  {id:"vdv-j2", league:"bm-primera-f", sport:"balonmano", at:"2026-09-27T12:30:00+02:00", venue:"Trops Málaga", jornada:2, home:"Trops Málaga|MLG", away:"virgen-victoria", duration:70, events:[[60,"A","punto","Final","*26-27"]]},
  {id:"vdv-j3", league:"bm-primera-f", sport:"balonmano", at:"2026-10-10T19:00:00+02:00", venue:"Cantera Sur", jornada:3, home:"Club Balonmano Cantera Sur|SUR", away:"virgen-victoria", duration:70, events:[[60,"A","punto","Final","*24-29"]]},
  {id:"vdv-j4", league:"bm-primera-f", sport:"balonmano", at:"2026-12-09T19:00:00+01:00", venue:LAZ, jornada:4, home:"virgen-victoria", away:"BM Bolaños|BOL", duration:70},
  {id:"vdv-j5", league:"bm-primera-f", sport:"balonmano", at:"2026-10-18T13:00:00+02:00", venue:LAZ, jornada:5, home:"virgen-victoria", away:"Cajasol Sevilla BM Proin|SEV", duration:70},
  {id:"vdv-j6", league:"bm-primera-f", sport:"balonmano", at:"2026-11-01T12:30:00+01:00", venue:LAZ, jornada:6, home:"virgen-victoria", away:"Dypre BM Ciudad de Algeciras|ALG", duration:70},
  {id:"vdv-j7", league:"bm-primera-f", sport:"balonmano", at:"2026-11-07T18:00:00+01:00", venue:"Limobel BM Pozuelo", jornada:7, home:"Limobel BM Pozuelo|POZ", away:"virgen-victoria", duration:70},
  {id:"vdv-j8", league:"bm-primera-f", sport:"balonmano", at:"2026-11-14T20:30:00+01:00", venue:LAZ, jornada:8, home:"virgen-victoria", away:"Hostel Cleaning BM Málaga|MLG", duration:70},
  {id:"vdv-j9", league:"bm-primera-f", sport:"balonmano", at:"2026-11-22T12:00:00+01:00", venue:"BM Montequinto", jornada:9, home:"BM Montequinto Ciudad de Dos Hermanas|MON", away:"virgen-victoria", duration:70},
  {id:"vdv-j10", league:"bm-primera-f", sport:"balonmano", at:"2026-11-29T17:00:00+01:00", venue:LAZ, jornada:10, home:"virgen-victoria", away:"Fundación Kutxabank CBM|KUT", duration:70},
  {id:"vdv-j11", league:"bm-primera-f", sport:"balonmano", at:"2026-12-06T18:00:00+01:00", venue:"Agrinova BM Vícar", jornada:11, home:"CD Agrinova BM Vícar|VIC", away:"virgen-victoria", duration:70},
  {id:"vdv-j12", league:"bm-primera-f", sport:"balonmano", at:"2026-12-13T19:00:00+01:00", venue:LAZ, jornada:12, home:"virgen-victoria", away:"Caserío de Ciudad Real|CAS", duration:70},
  {id:"vdv-j13", league:"bm-primera-f", sport:"balonmano", at:"2026-12-20T12:00:00+01:00", venue:"Pan Moguer", jornada:13, home:"Pan Moguer|MOG", away:"virgen-victoria", duration:70},
  {id:"vdv-j14", league:"bm-primera-f", sport:"balonmano", at:"2027-01-10T12:00:00+01:00", venue:"Ars Naranjas", jornada:14, home:"Ars Naranjas de Palma del Río|ARS", away:"virgen-victoria", duration:70},
  {id:"vdv-j15", league:"bm-primera-f", sport:"balonmano", at:"2027-01-17T17:00:00+01:00", venue:LAZ, jornada:15, home:"virgen-victoria", away:"Trops Málaga|MLG", duration:70},
  {id:"vdv-j16", league:"bm-primera-f", sport:"balonmano", at:"2027-01-24T12:00:00+01:00", venue:"BM Bolaños", jornada:16, home:"BM Bolaños|BOL", away:"virgen-victoria", duration:70},
  {id:"vdv-j17", league:"bm-primera-f", sport:"balonmano", at:"2027-01-31T19:00:00+01:00", venue:LAZ, jornada:17, home:"virgen-victoria", away:"Club Balonmano Cantera Sur|SUR", duration:70},
  {id:"vdv-j18", league:"bm-primera-f", sport:"balonmano", at:"2027-02-07T12:00:00+01:00", venue:"Cajasol Sevilla", jornada:18, home:"Cajasol Sevilla BM Proin|SEV", away:"virgen-victoria", duration:70},
  {id:"vdv-j19", league:"bm-primera-f", sport:"balonmano", at:"2027-02-14T12:00:00+01:00", venue:"Dypre Algeciras", jornada:19, home:"Dypre BM Ciudad de Algeciras|ALG", away:"virgen-victoria", duration:70},
  {id:"vdv-j20", league:"bm-primera-f", sport:"balonmano", at:"2027-02-21T19:00:00+01:00", venue:LAZ, jornada:20, home:"virgen-victoria", away:"Limobel BM Pozuelo|POZ", duration:70},
  {id:"vdv-j21", league:"bm-primera-f", sport:"balonmano", at:"2027-02-28T12:00:00+01:00", venue:"Hostel Cleaning BM Málaga", jornada:21, home:"Hostel Cleaning BM Málaga|MLG", away:"virgen-victoria", duration:70},
  {id:"vdv-j22", league:"bm-primera-f", sport:"balonmano", at:"2027-03-07T17:00:00+01:00", venue:LAZ, jornada:22, home:"virgen-victoria", away:"BM Montequinto Ciudad de Dos Hermanas|MON", duration:70},
  {id:"vdv-j23", league:"bm-primera-f", sport:"balonmano", at:"2027-03-14T12:30:00+01:00", venue:"Fundación Kutxabank", jornada:23, home:"Fundación Kutxabank CBM|KUT", away:"virgen-victoria", duration:70},
  {id:"vdv-j24", league:"bm-primera-f", sport:"balonmano", at:"2027-03-21T19:00:00+01:00", venue:LAZ, jornada:24, home:"virgen-victoria", away:"CD Agrinova BM Vícar|VIC", duration:70},
  {id:"vdv-j25", league:"bm-primera-f", sport:"balonmano", at:"2027-04-04T12:00:00+02:00", venue:"Caserío de Ciudad Real", jornada:25, home:"Caserío de Ciudad Real|CAS", away:"virgen-victoria", duration:70},
  {id:"vdv-j26", league:"bm-primera-f", sport:"balonmano", at:"2027-04-11T12:00:00+02:00", venue:LAZ, jornada:26, home:"virgen-victoria", away:"Pan Moguer|MOG", duration:70},
];

export const vdvMatches: Match[] = rows.map(m);
