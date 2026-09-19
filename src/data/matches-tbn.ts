import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";

const IMB = "Javier Imbroda Ortiz";

const rows: Spec[] = [
  {id:"tbn-j1", league:"fs-primera-f", sport:"futsal", at:"2026-09-04T18:00:00+02:00", venue:IMB, jornada:1, home:"torreblanca", away:"Nueces de Ronda Atl. Torcal|TOR", events:[[40,"H","gol","Final","*6-3"]]},
  {id:"tbn-j2", league:"fs-primera-f", sport:"futsal", at:"2026-09-12T18:00:00+02:00", venue:"Pabellón Les Corts", jornada:2, home:"A.E.F. Les Corts UBAE|LCO", away:"torreblanca", events:[[40,"A","gol","Final","*0-1"]]},
  {id:"tbn-j3", league:"fs-primera-f", sport:"futsal", at:"2026-09-19T12:30:00+02:00", venue:IMB, jornada:3, home:"torreblanca", away:"MRB F.S.F. Móstoles|MOS"},
  {id:"tbn-j4", league:"fs-primera-f", sport:"futsal", at:"2026-10-17T18:00:00+02:00", venue:"Pabellón Municipal Poio", jornada:4, home:"Poio Pescamar F.S.F.|POI", away:"torreblanca"},
  {id:"tbn-j5", league:"fs-primera-f", sport:"futsal", at:"2026-10-24T18:00:00+02:00", venue:"Pabellón Municipal Alcorcón", jornada:5, home:"ARRIVA A.D. Alcorcón F.S.F.|ALC", away:"torreblanca"},
  {id:"tbn-j6", league:"fs-primera-f", sport:"futsal", at:"2026-10-31T18:00:00+01:00", venue:IMB, jornada:6, home:"torreblanca", away:"Estrela Revoltosa Verín F.S.F.|VER"},
  {id:"tbn-j7", league:"fs-primera-f", sport:"futsal", at:"2026-11-07T18:00:00+01:00", venue:"Pabellón InterSala 10", jornada:7, home:"Wanapix Aldelis InterSala10|INT", away:"torreblanca"},
  {id:"tbn-j8", league:"fs-primera-f", sport:"futsal", at:"2026-11-14T18:00:00+01:00", venue:IMB, jornada:8, home:"torreblanca", away:"El Gaitero Rodiles F.S.F.|ROD"},
  {id:"tbn-j9", league:"fs-primera-f", sport:"futsal", at:"2026-11-28T18:00:00+01:00", venue:"Pabellón Municipal Castro", jornada:9, home:"F.S.F. Castro Bloques Cando|CAS", away:"torreblanca"},
  {id:"tbn-j10", league:"fs-primera-f", sport:"futsal", at:"2026-12-05T18:00:00+01:00", venue:IMB, jornada:10, home:"torreblanca", away:"STV Roldán F.S.F.|ROL"},
  {id:"tbn-j11", league:"fs-primera-f", sport:"futsal", at:"2026-12-08T18:00:00+01:00", venue:"Pabellón Municipal Guadalcacín", jornada:11, home:"Guadalcacín F.S.F.|GUA", away:"torreblanca"},
  {id:"tbn-j12", league:"fs-primera-f", sport:"futsal", at:"2026-12-12T18:00:00+01:00", venue:IMB, jornada:12, home:"torreblanca", away:"LBTL Futsal Alcantarilla|ALC2"},
  {id:"tbn-j13", league:"fs-primera-f", sport:"futsal", at:"2026-12-19T18:00:00+01:00", venue:IMB, jornada:13, home:"torreblanca", away:"C.D. Futsi At. Navalcarnero|FUT"},
  {id:"tbn-j14", league:"fs-primera-f", sport:"futsal", at:"2027-01-05T18:00:00+01:00", venue:"Pabellón Municipal Ceuta", jornada:14, home:"Ceuta Agr. Deportiva|CEU", away:"torreblanca"},
  {id:"tbn-j15", league:"fs-primera-f", sport:"futsal", at:"2027-01-09T18:00:00+01:00", venue:IMB, jornada:15, home:"torreblanca", away:"Ourense Ontime|OUR"},
  {id:"tbn-j16", league:"fs-primera-f", sport:"futsal", at:"2027-01-16T18:00:00+01:00", venue:"Pabellón Municipal Verín", jornada:16, home:"Estrela Revoltosa Verín F.S.F.|VER", away:"torreblanca"},
  {id:"tbn-j17", league:"fs-primera-f", sport:"futsal", at:"2027-01-23T18:00:00+01:00", venue:IMB, jornada:17, home:"torreblanca", away:"Poio Pescamar F.S.F.|POI"},
  {id:"tbn-j18", league:"fs-primera-f", sport:"futsal", at:"2027-02-06T18:00:00+01:00", venue:"Pabellón Municipal Rodiles", jornada:18, home:"El Gaitero Rodiles F.S.F.|ROD", away:"torreblanca"},
  {id:"tbn-j19", league:"fs-primera-f", sport:"futsal", at:"2027-02-13T18:00:00+01:00", venue:"Pabellón Municipal Móstoles", jornada:19, home:"MRB F.S.F. Móstoles|MOS", away:"torreblanca"},
  {id:"tbn-j20", league:"fs-primera-f", sport:"futsal", at:"2027-02-20T18:00:00+01:00", venue:IMB, jornada:20, home:"torreblanca", away:"ARRIVA A.D. Alcorcón F.S.F.|ALC"},
  {id:"tbn-j21", league:"fs-primera-f", sport:"futsal", at:"2027-02-27T18:00:00+01:00", venue:"Pabellón Municipal Alcantarilla", jornada:21, home:"LBTL Futsal Alcantarilla|ALC2", away:"torreblanca"},
  {id:"tbn-j22", league:"fs-primera-f", sport:"futsal", at:"2027-03-27T18:00:00+01:00", venue:IMB, jornada:22, home:"torreblanca", away:"F.S.F. Castro Bloques Cando|CAS"},
  {id:"tbn-j23", league:"fs-primera-f", sport:"futsal", at:"2027-04-03T18:00:00+02:00", venue:"Pabellón Municipal Roldán", jornada:23, home:"STV Roldán F.S.F.|ROL", away:"torreblanca"},
  {id:"tbn-j24", league:"fs-primera-f", sport:"futsal", at:"2027-04-10T18:00:00+02:00", venue:"Pabellón La Estación", jornada:24, home:"C.D. Futsi At. Navalcarnero|FUT", away:"torreblanca"},
  {id:"tbn-j25", league:"fs-primera-f", sport:"futsal", at:"2027-04-24T18:00:00+02:00", venue:IMB, jornada:25, home:"torreblanca", away:"Ceuta Agr. Deportiva|CEU"},
  {id:"tbn-j26", league:"fs-primera-f", sport:"futsal", at:"2027-05-01T18:00:00+02:00", venue:IMB, jornada:26, home:"torreblanca", away:"A.E.F. Les Corts UBAE|LCO"},
  {id:"tbn-j27", league:"fs-primera-f", sport:"futsal", at:"2027-05-08T18:00:00+02:00", venue:"Pabellón Municipal Ourense", jornada:27, home:"Ourense Ontime|OUR", away:"torreblanca"},
  {id:"tbn-j28", league:"fs-primera-f", sport:"futsal", at:"2027-05-15T18:00:00+02:00", venue:IMB, jornada:28, home:"torreblanca", away:"Guadalcacín F.S.F.|GUA"},
  {id:"tbn-j29", league:"fs-primera-f", sport:"futsal", at:"2027-05-22T18:00:00+02:00", venue:"Pabellón Municipal Torcal", jornada:29, home:"Nueces de Ronda Atl. Torcal|TOR", away:"torreblanca"},
  {id:"tbn-j30", league:"fs-primera-f", sport:"futsal", at:"2027-05-29T18:00:00+02:00", venue:IMB, jornada:30, home:"torreblanca", away:"Wanapix Aldelis InterSala10|INT"},
];

export const tbnMatches: Match[] = rows.map(m);
