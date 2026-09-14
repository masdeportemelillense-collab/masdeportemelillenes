import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";
const IMB = "Javier Imbroda Ortiz";
const rows: Spec[] = [
{id:"mls-j1", league:"fs-segunda-m", sport:"futsal", at:"2026-09-19T19:00:00+02:00", venue:IMB, jornada:1, home:"melistar", away:"Zambu CFS Pinatar|PIN"},
{id:"mls-j2", league:"fs-segunda-m", sport:"futsal", at:"2026-09-26T19:00:00+02:00", venue:"Pabellón Municipal Mataró", jornada:2, home:"C.E.F. Gestoria Luis Mataró|MAT", away:"melistar"},
{id:"mls-j3", league:"fs-segunda-m", sport:"futsal", at:"2026-10-03T19:00:00+02:00", venue:"Pabellón Municipal Entrerríos", jornada:3, home:"Entrerríos Automatización|ENT", away:"melistar"},
{id:"mls-j4", league:"fs-segunda-m", sport:"futsal", at:"2026-10-10T19:00:00+02:00", venue:"Ciudad Deportiva La Fortuna", jornada:4, home:"C.D. Leganés F.S.|LEG", away:"melistar"},
{id:"mls-j5", league:"fs-segunda-m", sport:"futsal", at:"2026-10-17T19:00:00+02:00", venue:"Pabellón Municipal Martorell", jornada:5, home:"Sala 5 Martorell MCD Grup|S5M", away:"melistar"},
{id:"mls-j6", league:"fs-segunda-m", sport:"futsal", at:"2026-10-24T19:00:00+02:00", venue:IMB, jornada:6, home:"melistar", away:"Xerez Toyota Nimauto|XER"},
{id:"mls-j7", league:"fs-segunda-m", sport:"futsal", at:"2026-10-31T19:00:00+01:00", venue:IMB, jornada:7, home:"melistar", away:"Family Cash Alzira F.S.|ALZ"},
{id:"mls-j8", league:"fs-segunda-m", sport:"futsal", at:"2026-11-07T19:00:00+01:00", venue:"Pabellón Eva Manguan", jornada:8, home:"MRB - FS Móstoles|MOS", away:"melistar"},
{id:"mls-j9", league:"fs-segunda-m", sport:"futsal", at:"2026-11-14T19:00:00+01:00", venue:IMB, jornada:9, home:"melistar", away:"Barça Atlètic|BAR"},
{id:"mls-j10", league:"fs-segunda-m", sport:"futsal", at:"2026-11-21T19:00:00+01:00", venue:"Pabellón Municipal Burela", jornada:10, home:"REYCO Burela F.S.|BUR", away:"melistar"},
{id:"mls-j11", league:"fs-segunda-m", sport:"futsal", at:"2026-11-28T19:00:00+01:00", venue:IMB, jornada:11, home:"melistar", away:"Gasifred Atlético F.S.|GAS"},
{id:"mls-j12", league:"fs-segunda-m", sport:"futsal", at:"2026-12-05T19:00:00+01:00", venue:"Pabellón Municipal Ribera", jornada:12, home:"C.F.S Ribera Navarra|RIB", away:"melistar"},
{id:"mls-j13", league:"fs-segunda-m", sport:"futsal", at:"2026-12-12T19:00:00+01:00", venue:IMB, jornada:13, home:"melistar", away:"ElPozo Ciudad de Murcia|EPO"},
{id:"mls-j14", league:"fs-segunda-m", sport:"futsal", at:"2026-12-19T19:00:00+01:00", venue:"Pabellón Guillermo Molina", jornada:14, home:"Unión África Ceutí|CEU", away:"melistar"},
{id:"mls-j15", league:"fs-segunda-m", sport:"futsal", at:"2027-01-09T19:00:00+01:00", venue:IMB, jornada:15, home:"melistar", away:"C.D. Avanza Jaén Paraíso Interior|JAE"},
{id:"mls-j16", league:"fs-segunda-m", sport:"futsal", at:"2027-01-16T19:00:00+01:00", venue:"Pabellón Príncipe de Asturias", jornada:16, home:"Zambu CFS Pinatar|PIN", away:"melistar"},
{id:"mls-j17", league:"fs-segunda-m", sport:"futsal", at:"2027-01-23T19:00:00+01:00", venue:IMB, jornada:17, home:"melistar", away:"C.E.F. Gestoria Luis Mataró|MAT"},
{id:"mls-j18", league:"fs-segunda-m", sport:"futsal", at:"2027-01-30T19:00:00+01:00", venue:"Pabellón José Mª Ruiz Mateos", jornada:18, home:"Xerez Toyota Nimauto|XER", away:"melistar"},
{id:"mls-j19", league:"fs-segunda-m", sport:"futsal", at:"2027-02-06T19:00:00+01:00", venue:IMB, jornada:19, home:"melistar", away:"REYCO Burela F.S.|BUR"},
{id:"mls-j20", league:"fs-segunda-m", sport:"futsal", at:"2027-02-13T19:00:00+01:00", venue:"Poliesportiu Insular", jornada:20, home:"Gasifred Atlético F.S.|GAS", away:"melistar"},
{id:"mls-j21", league:"fs-segunda-m", sport:"futsal", at:"2027-02-20T19:00:00+01:00", venue:IMB, jornada:21, home:"melistar", away:"C.D. Leganés F.S.|LEG"},
{id:"mls-j22", league:"fs-segunda-m", sport:"futsal", at:"2027-02-27T19:00:00+01:00", venue:"Palacio de Deportes Murcia", jornada:22, home:"ElPozo Ciudad de Murcia|EPO", away:"melistar"},
{id:"mls-j23", league:"fs-segunda-m", sport:"futsal", at:"2027-03-06T19:00:00+01:00", venue:IMB, jornada:23, home:"melistar", away:"Unión África Ceutí|CEU"},
{id:"mls-j24", league:"fs-segunda-m", sport:"futsal", at:"2027-03-20T19:00:00+01:00", venue:IMB, jornada:24, home:"melistar", away:"C.F.S Ribera Navarra|RIB"},
{id:"mls-j25", league:"fs-segunda-m", sport:"futsal", at:"2027-04-03T19:00:00+02:00", venue:"Pabellón Municipal Alzira", jornada:25, home:"Family Cash Alzira F.S.|ALZ", away:"melistar"},
{id:"mls-j26", league:"fs-segunda-m", sport:"futsal", at:"2027-04-10T19:00:00+02:00", venue:IMB, jornada:26, home:"melistar", away:"MRB - FS Móstoles|MOS"},
{id:"mls-j27", league:"fs-segunda-m", sport:"futsal", at:"2027-04-17T19:00:00+02:00", venue:"Ciudad Deportiva Joan Gamper", jornada:27, home:"Barça Atlètic|BAR", away:"melistar"},
{id:"mls-j28", league:"fs-segunda-m", sport:"futsal", at:"2027-04-24T19:00:00+02:00", venue:IMB, jornada:28, home:"melistar", away:"Entrerríos Automatización|ENT"},
{id:"mls-j29", league:"fs-segunda-m", sport:"futsal", at:"2027-05-01T19:00:00+02:00", venue:"Pabellón La Salobreja", jornada:29, home:"C.D. Avanza Jaén Paraíso Interior|JAE", away:"melistar"},
{id:"mls-j30", league:"fs-segunda-m", sport:"futsal", at:"2027-05-08T19:00:00+02:00", venue:IMB, jornada:30, home:"melistar", away:"Sala 5 Martorell MCD Grup|S5M"},
];
export const mlsMatches: Match[] = rows.map(m);
