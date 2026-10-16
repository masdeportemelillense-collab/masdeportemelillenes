// matches-aciras.ts - Calendario estático Aciras / Fortaleza
// Datos conocidos de noticias + placeholders para auto-update futuro
export const acirasMatches = [
  // Masculino - Primera Andaluza Senior Masculina
  {
    id: "aciras-m-j1",
    teamId: "aciras-masc",
    jornada: 1,
    at: "2026-10-18T20:00:00+02:00",
    venue: "Pabellón Lázaro Fernández / a domicilio",
    home: "CD Agrinova BM Vícar",
    away: "Balonmano El Aciras",
    status: "scheduled",
  },
  // Femenino - Primera Nacional Femenina
  {
    id: "aciras-f-j1",
    teamId: "aciras-fem",
    jornada: 1,
    at: "2026-10-11T00:00:00+02:00",
    venue: "Ciudad Deportiva de Carranque (Málaga)",
    home: "Universidad de Granada",
    away: "Balonmano El Aciras",
    status: "finished",
    score: { home: 34, away: 20 },
    note: "Derrota en el debut. 34-20",
  },
  // Más jornadas placeholder
  {
    id: "aciras-m-j2",
    teamId: "aciras-masc",
    jornada: 2,
    at: "2026-10-25T00:00:00+02:00",
    venue: "Por confirmar",
    home: "Balonmano El Aciras",
    away: "Rival Grupo A",
    status: "scheduled",
  },
];

export const classificationAciras = {
  masculino: [
    { pos: 1, team: "Líder Grupo A", pts: 0, pj: 0 },
    { pos: 2, team: "Balonmano El Aciras", pts: 0, pj: 0, note: "Debut 18/10" },
  ],
  femenino: [
    { pos: 3, team: "Universidad de Granada", pts: 2, pj: 1 },
    { pos: 5, team: "Balonmano El Aciras", pts: 0, pj: 1, note: "Derrota 20-34" },
  ],
};
