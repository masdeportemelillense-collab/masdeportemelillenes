/** Escudos oficiales de futbolme.com para el Grupo 9, Copa RFEF y juveniles. */
const FM = "https://futbolme.com/static/img/club";

const BY_KEY: Record<string, string> = {
  "ud-melilla": `${FM}/escudo117.png`,
  udmelilla: `${FM}/escudo117.png`,
  "atletico-melilla-dh": `${FM}/escudo7785.png`,
  atleticomelilla: `${FM}/escudo7785.png`,
  atleticomelillacf: `${FM}/escudo7785.png`,
  atmj: `${FM}/escudo7785.png`,
  "udc torredonjimeno": `${FM}/escudo5232.png`,
  udctorredonjimeno: `${FM}/escudo5232.png`,
  torredonjimeno: `${FM}/escudo5232.png`,
  tdj: `${FM}/escudo5232.png`,
  "cd huetor vega": `${FM}/escudo2946.png`,
  huetorvega: `${FM}/escudo2946.png`,
  huv: `${FM}/escudo2946.png`,
  "ud torre del mar": `${FM}/escudo4004.png`,
  torremar: `${FM}/escudo4004.png`,
  tdm: `${FM}/escudo4004.png`,
  "malaga juniors fc": `${FM}/escudo2097.png`,
  malagajuniors: `${FM}/escudo2097.png`,
  mjf: `${FM}/escudo2097.png`,
  "cd alhaurino": `${FM}/escudo4738.png`,
  alhaurino: `${FM}/escudo4738.png`,
  alh9: `${FM}/escudo4738.png`,
  "ud san pedro": `${FM}/escudo4766.png`,
  sanpedro: `${FM}/escudo4766.png`,
  spe: `${FM}/escudo4766.png`,
  "atletico de porcuna cf": `${FM}/escudo7939.png`,
  atleticoporcuna: `${FM}/escudo7939.png`,
  por: `${FM}/escudo7939.png`,
  "cantoria 2017 fc": `${FM}/escudo16448.png`,
  cantoria2017: `${FM}/escudo16448.png`,
  can17: `${FM}/escudo16448.png`,
  "club atletico malagueno": `${FM}/escudo4424.png`,
  atleticomalagueno: `${FM}/escudo4424.png`,
  mlgn: `${FM}/escudo4424.png`,
  "club recreativo granada": `${FM}/escudo4561.png`,
  recreativogranada: `${FM}/escudo4561.png`,
  rgr: `${FM}/escudo4561.png`,
  "ud almeria b": `${FM}/escudo80.png`,
  almeriab: `${FM}/escudo80.png`,
  almb: `${FM}/escudo80.png`,
  "churriana de la vega cf": `${FM}/escudo5692.png`,
  churrianavega: `${FM}/escudo5692.png`,
  chv: `${FM}/escudo5692.png`,
  "cf motril": `${FM}/escudo8958.png`,
  motril: `${FM}/escudo8958.png`,
  mot: `${FM}/escudo8958.png`,
  "atletico de marbella balompie": `${FM}/escudo16450.png`,
  atleticomarbellabalompie: `${FM}/escudo16450.png`,
  amb: `${FM}/escudo16450.png`,
  "fc marbelli": `${FM}/escudo2022.png`,
  marbelli: `${FM}/escudo2022.png`,
  mrb: `${FM}/escudo2022.png`,
  "arenas de armilla cyd cf": `${FM}/escudo4719.png`,
  arenasarmillacyd: `${FM}/escudo4719.png`,
  arm: `${FM}/escudo4719.png`,
  "atletico mancha real": `${FM}/escudo4679.png`,
  atleticomancha: `${FM}/escudo4679.png`,
  amr: `${FM}/escudo4679.png`,
  "conil cf": `${FM}/escudo4807.png`,
  conil: `${FM}/escudo4807.png`,
  conilcf: `${FM}/escudo4807.png`,
};

function norm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(ud|cd|cf|fc|bm|cv|cb|fs|fsf|club|de|del|la|el|las|los|real|sporting)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function futbolmeBadge(id?: string, name?: string): string | undefined {
  if (id && BY_KEY[id]) return BY_KEY[id];
  if (id && BY_KEY[norm(id)]) return BY_KEY[norm(id)];
  if (name && BY_KEY[norm(name)]) return BY_KEY[norm(name)];
  if (name && BY_KEY[name.toLowerCase()]) return BY_KEY[name.toLowerCase()];
  return undefined;
}
