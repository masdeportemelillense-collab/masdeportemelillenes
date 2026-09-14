import { tbnMatches } from "@/data/matches-tbn";
import { tbnbMatches } from "@/data/matches-tbnb";
import { mlsMatches } from "@/data/matches-mls";
import { neraMatches } from "@/data/matches-nera";
import { dhfsMatches } from "@/data/matches-dhfs";
import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const IMB = "Javier Imbroda Ortiz";

const bsr: Spec[] = [
  {id:"bsr-pre", league:"bsr-segunda", sport:"bsr", at:"2026-09-07T11:00:00+02:00", venue:IMB, jornada:0, home:"melilla-bsr", away:"Covirán Churriana|CHU", duration:40, events:[[10,"H","periodo","Q1","*14-16"],[20,"H","periodo","Q2","*29-33"],[30,"H","periodo","Q3","*44-49"],[40,"A","punto","Final","*58-61"]]},
  {id:"bsr-j1", league:"bsr-segunda", sport:"bsr", at:"2026-11-29T11:00:00+01:00", venue:IMB, jornada:1, home:"melilla-bsr", away:"Opticlass Raíces Móstoles|MOS"},
  {id:"bsr-j2", league:"bsr-segunda", sport:"bsr", at:"2026-12-14T12:00:00+01:00", venue:"Pabellón Bahía de Cádiz", jornada:2, home:"CDA Bahía de Cádiz|CAD", away:"melilla-bsr"},
  {id:"bsr-j3", league:"bsr-segunda", sport:"bsr", at:"2027-01-18T12:00:00+01:00", venue:"Pabellón Churriana", jornada:3, home:"Covirán Churriana|CHU", away:"melilla-bsr"},
  {id:"bsr-j4", league:"bsr-segunda", sport:"bsr", at:"2027-01-25T12:00:00+01:00", venue:IMB, jornada:4, home:"melilla-bsr", away:"BSR Fortuna Murcia|FOR"},
];

export const restoMatches: Match[] = [
  ...tbnMatches,
  ...tbnbMatches,
  ...mlsMatches,
  ...neraMatches,
  ...dhfsMatches,
  ...bsr.map(m),
];
