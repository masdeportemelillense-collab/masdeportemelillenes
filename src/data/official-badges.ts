/** Escudos oficiales con URL pública (Wikipedia / club). Prioridad sobre el mapa local. */
const UD = "/badges/ud-melilla.svg";

const BY_KEY: Record<string, string> = {
  "ud-melilla": UD,
  udmelilla: UD,
  udm: UD,
  melilla: UD,
  "melilla-baloncesto":
    "https://upload.wikimedia.org/wikipedia/en/5/51/Mellila_Baloncesto_logo.png",
  melillabaloncesto:
    "https://upload.wikimedia.org/wikipedia/en/5/51/Mellila_Baloncesto_logo.png",
  melb: "https://upload.wikimedia.org/wikipedia/en/5/51/Mellila_Baloncesto_logo.png",
  "enrique-soler": "https://api.clupik.com/clubs/7669/images/splash.png",
  enriquesoler: "https://api.clupik.com/clubs/7669/images/splash.png",
  soler: "https://api.clupik.com/clubs/7669/images/splash.png",
  camenriquesoler: "https://api.clupik.com/clubs/7669/images/splash.png",
  "virgen-victoria":
    "https://pbs.twimg.com/profile_images/1501476638860718085/vpVJWE8C.jpg",
  virgenvictoria:
    "https://pbs.twimg.com/profile_images/1501476638860718085/vpVJWE8C.jpg",
  virgendevictoria:
    "https://pbs.twimg.com/profile_images/1501476638860718085/vpVJWE8C.jpg",
  vdv: "https://pbs.twimg.com/profile_images/1501476638860718085/vpVJWE8C.jpg",
  maritimo:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Club_MEJORADO.png",
  rcmmelilla:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Club_MEJORADO.png",
  rcmm: "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Club_MEJORADO.png",
  maritimomelilla:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Club_MEJORADO.png",
};

function norm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(ud|cd|cf|fc|bm|cv|cb|fs|fsf|club|de|del|la|el|las|los|real|sporting|cam)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function officialBadge(id?: string, name?: string): string | undefined {
  if (id && BY_KEY[id]) return BY_KEY[id];
  if (id && BY_KEY[norm(id)]) return BY_KEY[norm(id)];
  if (name && BY_KEY[norm(name)]) return BY_KEY[norm(name)];
  return undefined;
}
