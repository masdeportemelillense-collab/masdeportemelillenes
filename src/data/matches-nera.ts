import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";
const PEZ = "Guillermo García Pezzi";
const rows: Spec[] = [
{id:"nera-j1", league:"fs-segunda-b", sport:"futsal", at:"2026-09-19T19:30:00+02:00", venue:"Pabellón Municipal Salvatierra", jornada:1, home:"C.D. Salvatierra F.S.|SAL", away:"nueva-era"},
{id:"nera-j2", league:"fs-segunda-b", sport:"futsal", at:"2026-09-26T19:30:00+02:00", venue:PEZ, jornada:2, home:"nueva-era", away:"C.D. Virgili Cádiz F.S.|VIR"},
{id:"nera-j3", league:"fs-segunda-b", sport:"futsal", at:"2026-10-03T19:30:00+02:00", venue:"Pabellón Municipal Dos Hermanas", jornada:3, home:"C.D. Dos Hermanas F.S.|DSH", away:"nueva-era"},
{id:"nera-j4", league:"fs-segunda-b", sport:"futsal", at:"2026-10-10T19:30:00+02:00", venue:PEZ, jornada:4, home:"nueva-era", away:"C.D. Beconet Bujalance F.S.|BUJ"},
{id:"nera-j5", league:"fs-segunda-b", sport:"futsal", at:"2026-10-17T19:30:00+02:00", venue:"Pabellón Municipal Málaga", jornada:5, home:"C.D. Malacitano FutSal|MAL", away:"nueva-era"},
{id:"nera-j6", league:"fs-segunda-b", sport:"futsal", at:"2026-10-24T19:30:00+02:00", venue:PEZ, jornada:6, home:"nueva-era", away:"Sporting F.S. Almería|ALM"},
{id:"nera-j7", league:"fs-segunda-b", sport:"futsal", at:"2026-10-31T19:30:00+01:00", venue:"Pabellón Municipal Blanca", jornada:7, home:"Nawter Blanca F.S.|BLA", away:"nueva-era"},
{id:"nera-j8", league:"fs-segunda-b", sport:"futsal", at:"2026-11-07T19:30:00+01:00", venue:PEZ, jornada:8, home:"nueva-era", away:"Sima Granada F.S.|SIM"},
{id:"nera-j9", league:"fs-segunda-b", sport:"futsal", at:"2026-11-14T19:30:00+01:00", venue:PEZ, jornada:9, home:"nueva-era", away:"Crevillent Futsal Starts|CRE"},
{id:"nera-j10", league:"fs-segunda-b", sport:"futsal", at:"2026-11-21T19:30:00+01:00", venue:"Pabellón Municipal Mengíbar", jornada:10, home:"Oleoinnova Mengíbar|MEN", away:"nueva-era"},
{id:"nera-j11", league:"fs-segunda-b", sport:"futsal", at:"2026-11-28T19:30:00+01:00", venue:PEZ, jornada:11, home:"nueva-era", away:"FLEXLIVING Jumilla F.S.|JUM"},
{id:"nera-j12", league:"fs-segunda-b", sport:"futsal", at:"2026-12-05T19:30:00+01:00", venue:"Pabellón Municipal Moral", jornada:12, home:"GH Distribución Moral F.S.|MOR", away:"nueva-era"},
{id:"nera-j13", league:"fs-segunda-b", sport:"futsal", at:"2026-12-12T19:30:00+01:00", venue:PEZ, jornada:13, home:"nueva-era", away:"Imperio Los Rosales|IMP"},
{id:"nera-j14", league:"fs-segunda-b", sport:"futsal", at:"2026-12-19T19:30:00+01:00", venue:"Pabellón Municipal Cartagena", jornada:14, home:"Jimbee Cartagena F.S. B|JIM", away:"nueva-era"},
{id:"nera-j15", league:"fs-segunda-b", sport:"futsal", at:"2027-01-09T19:30:00+01:00", venue:PEZ, jornada:15, home:"nueva-era", away:"Joasan Constr. C.F.S. Pinatar B|PIN"},
{id:"nera-j16", league:"fs-segunda-b", sport:"futsal", at:"2027-01-16T19:30:00+01:00", venue:PEZ, jornada:16, home:"nueva-era", away:"C.D. Salvatierra F.S.|SAL"},
{id:"nera-j17", league:"fs-segunda-b", sport:"futsal", at:"2027-01-23T19:30:00+01:00", venue:"Pabellón Municipal Cádiz", jornada:17, home:"C.D. Virgili Cádiz F.S.|VIR", away:"nueva-era"},
{id:"nera-j18", league:"fs-segunda-b", sport:"futsal", at:"2027-01-30T19:30:00+01:00", venue:PEZ, jornada:18, home:"nueva-era", away:"C.D. Dos Hermanas F.S.|DSH"},
{id:"nera-j19", league:"fs-segunda-b", sport:"futsal", at:"2027-02-06T19:30:00+01:00", venue:"P. José Pérez Pozuelo", jornada:19, home:"C.D. Beconet Bujalance F.S.|BUJ", away:"nueva-era"},
{id:"nera-j20", league:"fs-segunda-b", sport:"futsal", at:"2027-02-13T19:30:00+01:00", venue:PEZ, jornada:20, home:"nueva-era", away:"C.D. Malacitano FutSal|MAL"},
{id:"nera-j21", league:"fs-segunda-b", sport:"futsal", at:"2027-02-20T19:30:00+01:00", venue:"Pabellón Municipal Almería", jornada:21, home:"Sporting F.S. Almería|ALM", away:"nueva-era"},
{id:"nera-j22", league:"fs-segunda-b", sport:"futsal", at:"2027-02-27T19:30:00+01:00", venue:PEZ, jornada:22, home:"nueva-era", away:"Nawter Blanca F.S.|BLA"},
{id:"nera-j23", league:"fs-segunda-b", sport:"futsal", at:"2027-03-06T19:30:00+01:00", venue:"Pabellón Municipal Granada", jornada:23, home:"Sima Granada F.S.|SIM", away:"nueva-era"},
{id:"nera-j24", league:"fs-segunda-b", sport:"futsal", at:"2027-03-20T19:30:00+01:00", venue:"Pabellón Municipal Crevillent", jornada:24, home:"Crevillent Futsal Starts|CRE", away:"nueva-era"},
{id:"nera-j25", league:"fs-segunda-b", sport:"futsal", at:"2027-04-03T19:30:00+02:00", venue:PEZ, jornada:25, home:"nueva-era", away:"Oleoinnova Mengíbar|MEN"},
{id:"nera-j26", league:"fs-segunda-b", sport:"futsal", at:"2027-04-10T19:30:00+02:00", venue:"Pabellón Municipal Jumilla", jornada:26, home:"FLEXLIVING Jumilla F.S.|JUM", away:"nueva-era"},
{id:"nera-j27", league:"fs-segunda-b", sport:"futsal", at:"2027-04-17T19:30:00+02:00", venue:PEZ, jornada:27, home:"nueva-era", away:"GH Distribución Moral F.S.|MOR"},
{id:"nera-j28", league:"fs-segunda-b", sport:"futsal", at:"2027-04-24T19:30:00+02:00", venue:"Pabellón Municipal Los Rosales", jornada:28, home:"Imperio Los Rosales|IMP", away:"nueva-era"},
{id:"nera-j29", league:"fs-segunda-b", sport:"futsal", at:"2027-05-01T19:30:00+02:00", venue:PEZ, jornada:29, home:"nueva-era", away:"Jimbee Cartagena F.S. B|JIM"},
{id:"nera-j30", league:"fs-segunda-b", sport:"futsal", at:"2027-05-08T19:30:00+02:00", venue:"Pabellón Príncipe de Asturias", jornada:30, home:"Joasan Constr. C.F.S. Pinatar B|PIN", away:"nueva-era"},
];
export const neraMatches: Match[] = rows.map(m);
