import { m } from "@/data/match-builder";
import type { Spec } from "@/data/match-builder";
import type { Match } from "@/lib/types";
const PEZ = "Guillermo García Pezzi";
const rows: Spec[] = [
{id:"tbnb-j1", league:"fs-segunda-f", sport:"futsal", at:"2026-09-19T16:00:00+02:00", venue:PEZ, jornada:1, home:"torreblanca-b", away:"Majadahonda F.S.F. Afar 4|MAJ"},
{id:"tbnb-j2", league:"fs-segunda-f", sport:"futsal", at:"2026-09-26T17:00:00+02:00", venue:"Pabellón Ramón y Cajal", jornada:2, home:"Ramón y Cajal Féminas|RYC", away:"torreblanca-b"},
{id:"tbnb-j3", league:"fs-segunda-f", sport:"futsal", at:"2026-10-03T17:00:00+02:00", venue:PEZ, jornada:3, home:"torreblanca-b", away:"Sporting Club Garrovilla|GAR"},
{id:"tbnb-j4", league:"fs-segunda-f", sport:"futsal", at:"2026-10-10T17:00:00+02:00", venue:"Pabellón Municipal Almagro", jornada:4, home:"C.D.B. Almagro F.S.|ALM", away:"torreblanca-b"},
{id:"tbnb-j5", league:"fs-segunda-f", sport:"futsal", at:"2026-10-17T17:00:00+02:00", venue:PEZ, jornada:5, home:"torreblanca-b", away:"U.D. Albacete Futsal F.|AFA"},
{id:"tbnb-j6", league:"fs-segunda-f", sport:"futsal", at:"2026-10-24T17:00:00+02:00", venue:"Pabellón IES Luis de Camoens", jornada:6, home:"IES Luis de Camoens|CAM", away:"torreblanca-b"},
{id:"tbnb-j7", league:"fs-segunda-f", sport:"futsal", at:"2026-10-31T17:00:00+01:00", venue:PEZ, jornada:7, home:"torreblanca-b", away:"F.S.F. San Fernando|SFE"},
{id:"tbnb-j8", league:"fs-segunda-f", sport:"futsal", at:"2026-11-08T17:00:00+01:00", venue:"Ciudad Deportiva La Fortuna", jornada:8, home:"C.D. Leganés F.S.F. Masdeporte|LEG", away:"torreblanca-b"},
{id:"tbnb-j9", league:"fs-segunda-f", sport:"futsal", at:"2026-11-14T17:00:00+01:00", venue:"Pabellón Municipal Granada", jornada:9, home:"C.D. Granada F.S.F. 2020|GRA", away:"torreblanca-b"},
{id:"tbnb-j10", league:"fs-segunda-f", sport:"futsal", at:"2026-11-21T17:00:00+01:00", venue:PEZ, jornada:10, home:"torreblanca-b", away:"Salesianos Puertollano F.S.F.|SAL"},
{id:"tbnb-j11", league:"fs-segunda-f", sport:"futsal", at:"2026-11-28T17:00:00+01:00", venue:"Pabellón Municipal Dos Hermanas", jornada:11, home:"C.D. Dos Hermanas F.S.F.|DSH", away:"torreblanca-b"},
{id:"tbnb-j12", league:"fs-segunda-f", sport:"futsal", at:"2026-12-05T17:00:00+01:00", venue:PEZ, jornada:12, home:"torreblanca-b", away:"Global Caja Albacete F.|ALB"},
{id:"tbnb-j13", league:"fs-segunda-f", sport:"futsal", at:"2026-12-12T17:00:00+01:00", venue:"Pabellón Municipal Alcorcón", jornada:13, home:"A.D. Alcorcón F.S.F. B|ALC", away:"torreblanca-b"},
{id:"tbnb-j14", league:"fs-segunda-f", sport:"futsal", at:"2026-12-19T17:00:00+01:00", venue:PEZ, jornada:14, home:"torreblanca-b", away:"C.D. Futsi At. Navalcarnero B|NAV"},
{id:"tbnb-j15", league:"fs-segunda-f", sport:"futsal", at:"2027-01-09T17:00:00+01:00", venue:"Pabellón Municipal Martos", jornada:15, home:"Martos F.S.F. Jaén Paraiso|MAR", away:"torreblanca-b"},
{id:"tbnb-j16", league:"fs-segunda-f", sport:"futsal", at:"2027-01-17T17:00:00+01:00", venue:"Pabellón Municipal Majadahonda", jornada:16, home:"Majadahonda F.S.F. Afar 4|MAJ", away:"torreblanca-b"},
{id:"tbnb-j17", league:"fs-segunda-f", sport:"futsal", at:"2027-01-23T17:00:00+01:00", venue:PEZ, jornada:17, home:"torreblanca-b", away:"Ramón y Cajal Féminas|RYC"},
{id:"tbnb-j18", league:"fs-segunda-f", sport:"futsal", at:"2027-02-06T17:00:00+01:00", venue:"Pabellón Municipal Garrovilla", jornada:18, home:"Sporting Club Garrovilla|GAR", away:"torreblanca-b"},
{id:"tbnb-j19", league:"fs-segunda-f", sport:"futsal", at:"2027-02-13T17:00:00+01:00", venue:PEZ, jornada:19, home:"torreblanca-b", away:"C.D.B. Almagro F.S.|ALM"},
{id:"tbnb-j20", league:"fs-segunda-f", sport:"futsal", at:"2027-02-20T17:00:00+01:00", venue:"Pabellón U.D. Albacete", jornada:20, home:"U.D. Albacete Futsal F.|AFA", away:"torreblanca-b"},
{id:"tbnb-j21", league:"fs-segunda-f", sport:"futsal", at:"2027-03-06T17:00:00+01:00", venue:PEZ, jornada:21, home:"torreblanca-b", away:"IES Luis de Camoens|CAM"},
{id:"tbnb-j22", league:"fs-segunda-f", sport:"futsal", at:"2027-03-13T17:00:00+01:00", venue:"Pabellón Justo Gómez Salto", jornada:22, home:"F.S.F. San Fernando|SFE", away:"torreblanca-b"},
{id:"tbnb-j23", league:"fs-segunda-f", sport:"futsal", at:"2027-03-20T17:00:00+01:00", venue:PEZ, jornada:23, home:"torreblanca-b", away:"C.D. Leganés F.S.F. Masdeporte|LEG"},
{id:"tbnb-j24", league:"fs-segunda-f", sport:"futsal", at:"2027-04-03T17:00:00+02:00", venue:PEZ, jornada:24, home:"torreblanca-b", away:"C.D. Granada F.S.F. 2020|GRA"},
{id:"tbnb-j25", league:"fs-segunda-f", sport:"futsal", at:"2027-04-10T17:00:00+02:00", venue:"Pabellón Salesianos Puertollano", jornada:25, home:"Salesianos Puertollano F.S.F.|SAL", away:"torreblanca-b"},
{id:"tbnb-j26", league:"fs-segunda-f", sport:"futsal", at:"2027-04-24T17:00:00+02:00", venue:PEZ, jornada:26, home:"torreblanca-b", away:"C.D. Dos Hermanas F.S.F.|DSH"},
{id:"tbnb-j27", league:"fs-segunda-f", sport:"futsal", at:"2027-05-01T17:00:00+02:00", venue:"Pabellón Universitario Albacete", jornada:27, home:"Global Caja Albacete F.|ALB", away:"torreblanca-b"},
{id:"tbnb-j28", league:"fs-segunda-f", sport:"futsal", at:"2027-05-08T17:00:00+02:00", venue:PEZ, jornada:28, home:"torreblanca-b", away:"A.D. Alcorcón F.S.F. B|ALC"},
{id:"tbnb-j29", league:"fs-segunda-f", sport:"futsal", at:"2027-05-15T17:00:00+02:00", venue:"Pabellón La Estación", jornada:29, home:"C.D. Futsi At. Navalcarnero B|NAV", away:"torreblanca-b"},
{id:"tbnb-j30", league:"fs-segunda-f", sport:"futsal", at:"2027-05-22T17:00:00+02:00", venue:PEZ, jornada:30, home:"torreblanca-b", away:"Martos F.S.F. Jaén Paraiso|MAR"},
];
export const tbnbMatches: Match[] = rows.map(m);
