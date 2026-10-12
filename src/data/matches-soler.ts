import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const PEZ = "Pabellón Guillermo García Pezzi";
const rows: Spec[] = [
  {id:"soler-j2", league:"tercera-feb", sport:"baloncesto", at:"2026-10-10T18:00:00+02:00", venue:PEZ, jornada:2, home:"enrique-soler", away:"La Cartonera Lucentina Coto Lucena|LUC", duration:40, events:[[40,"H","punto","","*104-54"]]},
  {id:"soler-j3", league:"tercera-feb", sport:"baloncesto", at:"2026-10-17T19:30:00+02:00", venue:"Baloncesto Comarca de la Axarquía", jornada:3, home:"Baloncesto Comarca de la Axarquía|AXA", away:"enrique-soler", duration:40},
  {id:"soler-j4", league:"tercera-feb", sport:"baloncesto", at:"2026-10-24T18:30:00+02:00", venue:PEZ, jornada:4, home:"enrique-soler", away:"Surseeds - B. Murgi|MUR", duration:40},
  {id:"soler-j5", league:"tercera-feb", sport:"baloncesto", at:"2026-10-31T18:00:00+01:00", venue:"CDBO Byspania Tíjola", jornada:5, home:"CDBO Byspania Tíjola|TIJ", away:"enrique-soler", duration:40},
  {id:"soler-j6", league:"tercera-feb", sport:"baloncesto", at:"2026-11-07T18:30:00+01:00", venue:PEZ, jornada:6, home:"enrique-soler", away:"Caja Rural Jaén Paraíso Interior|JAE", duration:40},
  {id:"soler-j7", league:"tercera-feb", sport:"baloncesto", at:"2026-11-14T19:30:00+01:00", venue:"Ecoculture CB Almería", jornada:7, home:"Ecoculture CB Almería|ALM", away:"enrique-soler", duration:40},
  {id:"soler-j8", league:"tercera-feb", sport:"baloncesto", at:"2026-11-21T17:30:00+01:00", venue:PEZ, jornada:8, home:"enrique-soler", away:"Hospital Ochoa CB Marbella|MAR", duration:40},
  {id:"soler-j9", league:"tercera-feb", sport:"baloncesto", at:"2026-11-28T18:30:00+01:00", venue:"Dehesas Reunidas Peñarroya", jornada:9, home:"Dehesas Reunidas Climanavas Agrometal Peñarroya|PEÑ", away:"enrique-soler", duration:40},
  {id:"soler-j10", league:"tercera-feb", sport:"baloncesto", at:"2026-12-05T19:30:00+01:00", venue:PEZ, jornada:10, home:"enrique-soler", away:"CB Novaschool Rincón de la Victoria|NOV", duration:40},
  {id:"soler-j11", league:"tercera-feb", sport:"baloncesto", at:"2026-12-12T19:30:00+01:00", venue:"CB La Zubia", jornada:11, home:"CB La Zubia|ZUB", away:"enrique-soler", duration:40},
  {id:"soler-j12", league:"tercera-feb", sport:"baloncesto", at:"2026-12-19T17:30:00+01:00", venue:PEZ, jornada:12, home:"enrique-soler", away:"Colegio El Pinar|PIN", duration:40},
  {id:"soler-j13", league:"tercera-feb", sport:"baloncesto", at:"2027-01-10T12:00:00+01:00", venue:"Molina Olea CB Costa Motril", jornada:13, home:"Molina Olea CB Costa Motril|MOT", away:"enrique-soler", duration:40},
  {id:"soler-j15", league:"tercera-feb", sport:"baloncesto", at:"2027-01-24T12:00:00+01:00", venue:"La Cartonera Lucentina", jornada:15, home:"La Cartonera Lucentina Coto Lucena|LUC", away:"enrique-soler", duration:40},
  {id:"soler-j16", league:"tercera-feb", sport:"baloncesto", at:"2027-01-30T18:30:00+01:00", venue:PEZ, jornada:16, home:"enrique-soler", away:"Baloncesto Comarca de la Axarquía|AXA", duration:40},
  {id:"soler-j17", league:"tercera-feb", sport:"baloncesto", at:"2027-02-07T12:00:00+01:00", venue:"Surseeds B. Murgi", jornada:17, home:"Surseeds - B. Murgi|MUR", away:"enrique-soler", duration:40},
  {id:"soler-j18", league:"tercera-feb", sport:"baloncesto", at:"2027-02-13T18:30:00+01:00", venue:PEZ, jornada:18, home:"enrique-soler", away:"CDBO Byspania Tíjola|TIJ", duration:40},
  {id:"soler-j19", league:"tercera-feb", sport:"baloncesto", at:"2027-02-21T12:30:00+01:00", venue:"Caja Rural Jaén", jornada:19, home:"Caja Rural Jaén Paraíso Interior|JAE", away:"enrique-soler", duration:40},
  {id:"soler-j20", league:"tercera-feb", sport:"baloncesto", at:"2027-02-27T20:00:00+01:00", venue:PEZ, jornada:20, home:"enrique-soler", away:"Ecoculture CB Almería|ALM", duration:40},
  {id:"soler-j21", league:"tercera-feb", sport:"baloncesto", at:"2027-03-06T17:30:00+01:00", venue:"Hospital Ochoa CB Marbella", jornada:21, home:"Hospital Ochoa CB Marbella|MAR", away:"enrique-soler", duration:40},
  {id:"soler-j22", league:"tercera-feb", sport:"baloncesto", at:"2027-03-13T17:30:00+01:00", venue:PEZ, jornada:22, home:"enrique-soler", away:"Dehesas Reunidas Climanavas Agrometal Peñarroya|PEÑ", duration:40},
  {id:"soler-j23", league:"tercera-feb", sport:"baloncesto", at:"2027-03-20T18:30:00+01:00", venue:"CB Novaschool Rincón", jornada:23, home:"CB Novaschool Rincón de la Victoria|NOV", away:"enrique-soler", duration:40},
  {id:"soler-j24", league:"tercera-feb", sport:"baloncesto", at:"2027-04-03T18:30:00+02:00", venue:PEZ, jornada:24, home:"enrique-soler", away:"CB La Zubia|ZUB", duration:40},
  {id:"soler-j25", league:"tercera-feb", sport:"baloncesto", at:"2027-04-10T19:00:00+02:00", venue:"Colegio El Pinar", jornada:25, home:"Colegio El Pinar|PIN", away:"enrique-soler", duration:40},
  {id:"soler-j26", league:"tercera-feb", sport:"baloncesto", at:"2027-04-17T19:00:00+02:00", venue:PEZ, jornada:26, home:"enrique-soler", away:"Molina Olea CB Costa Motril|MOT", duration:40},
];

export const solerMatches: Match[] = rows.map(m);
