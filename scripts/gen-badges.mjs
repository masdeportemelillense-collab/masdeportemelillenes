import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public/badges");
mkdirSync(dir, { recursive: true });

function norm(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(ud|cd|cf|fc|bm|cv|cb|fs|fsf|club|de|del|la|el|las|los|real|sporting)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const OFFICIAL = [
  ["ud-melilla.png", ["ud-melilla", "UD Melilla"]],
  ["melilla-baloncesto.png", ["melilla-baloncesto", "Melilla Baloncesto", "Melilla Ciudad del Deporte", "Club Melilla Baloncesto"]],
  ["la-salle-tw.png", ["la-salle-fem", "la-salle-b", "La Salle Melilla", "La Salle B", "MCD La Salle", "Melilla Ciudad del Deporte La Salle"]],
  ["cv-melilla-tw.png", ["cv-melilla-m", "cv-melilla-f", "CV Melilla", "Club Voleibol Melilla"]],
  ["city-tw.png", ["melilla-city", "Melilla City CF", "Melilla City"]],
  ["melistar-tw.png", ["melistar", "Melistar FS", "CD Melistar"]],
  ["huetor-tw.png", ["CD Huétor Vega", "Huétor Vega"]],
  ["almeria-tw.png", ["UD Almería", "UD Almería B", "Almería B", "Almería B Juvenil", "Almería Femenino", "UD Almería SAD", "UD Almería Juvenil"]],
  ["motril-tw.png", ["CF Motril", "Motril", "Motril Juvenil", "Motril Femenino", "Club de Fútbol Motril"]],
  ["sevilla.png", ["Sevilla FC"]],
  ["betis.png", ["Real Betis"]],
  ["malaga.png", ["Málaga CF", "Atlético Malagueño", "Málaga C", "Málaga Femenino B", "Málaga CF B", "Málaga CF SAD", "Málaga CF Juvenil", "CD PFC Málaga"]],
  ["granada.png", ["Granada CF", "Recreativo Granada", "Granada C", "Granada C Femenino", "Granada CF SAD"]],
  ["cadiz.png", ["Cádiz CF"]],
  ["cordoba.png", ["Córdoba CF"]],
  ["arenas-armilla.png", ["Arenas de Armilla", "Arenas de Armilla Cultura y Deporte"]],
  ["mancha-real.png", ["Atlético Mancha Real"]],
  ["churriana.png", ["Churriana de la Vega"]],
  ["torredonjimeno.png", ["Ciudad de Torredonjimeno"]],
  ["unicaja.png", ["Unicaja", "Unicaja Mijas", "Unicaja SD", "Baloncesto Málaga"]],
  ["estudiantes.png", ["Estudiantes", "Movistar Estudiantes"]],
  ["guaguas.png", ["CV Guaguas", "Guaguas"]],
  ["conil-tw.png", ["conil", "Conil CF", "CON"]],
  ["marbelli-tw.png", ["marbelli", "FC Marbellí", "MRB"]],
  ["san-pedro-tw.png", ["san-pedro", "UD San Pedro", "UD San Pedro Juvenil", "SPE"]],
  ["calavera-tw.png", ["Calavera CF", "CAL"]],
  ["mosquito-tw.png", ["CD Mosquito", "MOS"]],
  ["san-felix-tw.png", ["San Félix CD", "SFX"]],
  ["ceuta-juv-tw.png", ["Sporting Atlético Ceuta", "Sporting Atlético", "CEU"]],
  ["zabal-tw.png", ["Atlético Zabal", "ZAB"]],
];

const PALETTE = [
  ["#15233a", "#e8e6dc"],
  ["#1c3d6e", "#f2f0ea"],
  ["#8b1e1e", "#f0ebe3"],
  ["#1a4a5c", "#e4d7b8"],
  ["#16324f", "#d6d2c8"],
  ["#3d2a28", "#e8e2d6"],
  ["#2e3d32", "#e8e6dc"],
  ["#1b3c6e", "#f0eee6"],
  ["#3a3f4a", "#e8e6dc"],
  ["#2c4a62", "#d9cfc0"],
  ["#1c5c3a", "#e8e6dc"],
  ["#6b1c2a", "#e8e6dc"],
  ["#c9a227", "#1a2740"],
  ["#f47d20", "#1a2740"],
];

function svgCrest(short, primary, secondary) {
  const label = short.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  const size = label.length > 3 ? 20 : 26;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${primary}"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0.84"/>
    </linearGradient>
  </defs>
  <path d="M64 6 L116 24 V64 C116 96 92 116 64 122 C36 116 12 96 12 64 V24 Z" fill="url(#g)" stroke="${secondary}" stroke-width="5"/>
  <path d="M64 16 L104 30 V62 C104 86 86 104 64 109 C42 104 24 86 24 62 V30 Z" fill="none" stroke="${secondary}" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M64 6 L64 122" stroke="${secondary}" stroke-opacity="0.12" stroke-width="10"/>
  <circle cx="64" cy="34" r="5" fill="${secondary}"/>
  <text x="64" y="78" text-anchor="middle" fill="${secondary}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="700">${label}</text>
</svg>`;
}

const KNOWN = [
  ["atletico-melilla-dh", "ATMJ", "Atlético Melilla", "#8b1e1e", "#f0ebe3"],
  ["atm-melilla", "ATM", "ATM Melilla", "#2c4a62", "#d9cfc0"],
  ["enrique-soler", "SOLER", "Enrique Soler", "#3a3f4a", "#e8e6dc"],
  ["maritimo", "RCMM", "RC Marítimo Melilla", "#16324f", "#d6d2c8"],
  ["virgen-victoria", "VDV", "Virgen de la Victoria", "#3d2a28", "#e8e2d6"],
  ["t-maravillas", "TMA", "T-Maravillas", "#4a3a32", "#ece6da"],
  ["torreblanca", "TBN", "Torreblanca", "#1b3c6e", "#f0eee6"],
  ["torreblanca-b", "TBNB", "Torreblanca B", "#1b3c6e", "#c5ccd4"],
  ["nueva-era", "NERA", "Nueva Era Melilla", "#2e3d32", "#e8e6dc"],
  ["rusadir-fs-dh", "RUS", "Rusadir CF Juvenil", "#3d4f3a", "#e8e6dc"],
  ["pena-rm-fs", "PRM", "Peña Real Madrid", "#1a2740", "#e8e6dc"],
  ["melilla-bsr", "MBSR", "Melilla Baloncesto BSR", "#1a2740", "#e8e6dc"],
];

const byId = {};
const byName = {};

function add(file, keys) {
  const path = `/badges/${file}`;
  for (const key of keys) {
    if (!key) continue;
    const compact = key.replace(/\s+/g, "");
    if (!key.includes(" ")) byId[key] = path;
    const n = norm(key);
    const nc = norm(compact);
    if (n && n !== "melilla") byName[n] = path;
    if (nc && nc !== "melilla") byName[nc] = path;
  }
}

for (const [file, keys] of OFFICIAL) {
  if (!existsSync(join(dir, file))) continue;
  add(file, keys);
}

for (const [slug, short, name, primary, secondary] of KNOWN) {
  const file = `${slug}.svg`;
  writeFileSync(join(dir, file), svgCrest(short, primary, secondary));
  add(file, [slug, short, name]);
}

const leaguesSrc = readFileSync(join(root, "src/data/leagues.ts"), "utf8");
const teamNames = [...leaguesSrc.matchAll(/t\("([^"]+)",\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]);
const matchesSrc = readFileSync(join(root, "src/data/matches.ts"), "utf8");
for (const m of matchesSrc.matchAll(/home: "([^"]+)"|away: "([^"]+)"/g)) {
  const token = m[1] || m[2];
  if (!token || !token.includes("|")) continue;
  const [name, short] = token.split("|");
  teamNames.push([name, short]);
}

const seen = new Set(Object.keys(byName));
let i = 0;
for (const [name, short] of teamNames) {
  const key = norm(name);
  if (!key || key === "melilla") continue;
  if (byName[key] || seen.has(key)) continue;
  seen.add(key);
  const slug = key.slice(0, 28) || `club${i}`;
  const [primary, secondary] = PALETTE[i % PALETTE.length];
  const file = `${slug}.svg`;
  writeFileSync(join(dir, file), svgCrest(short || name.slice(0, 3), primary, secondary));
  add(file, [slug, name, short]);
  i += 1;
}

const ts = `/** Auto-generated crest map. Official files in /public/badges, SVG fallbacks for the rest. */
const BY_ID: Record<string, string> = ${JSON.stringify(byId, null, 2)};

const BY_NAME: Record<string, string> = ${JSON.stringify(byName, null, 2)};

export function normBadgeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/\\b(ud|cd|cf|fc|bm|cv|cb|fs|fsf|club|de|del|la|el|las|los|real|sporting)\\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function badgeFor(id?: string, name?: string): string | undefined {
  if (id && BY_ID[id]) return BY_ID[id];
  if (name) {
    const n = normBadgeKey(name);
    if (BY_NAME[n]) return BY_NAME[n];
    if (BY_ID[n]) return BY_ID[n];
  }
  return undefined;
}
`;

writeFileSync(join(root, "src/data/badges.ts"), ts);
console.log("badges", Object.keys(byId).length, "ids", Object.keys(byName).length, "names", "generated", i);
