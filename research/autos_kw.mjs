// Spanish auto demand matrices via Keyword Planner historical metrics (read-only).
// Run from /opt/google-ads-mcp with its .env loaded:
//   cd /opt/google-ads-mcp && set -a && . ./.env && set +a && node /opt/autos-es/research/autos_kw.mjs
// Writes research/models_es.json, obd_es.json, tires_es.json, oils_es.json (+ oil ideas cluster).
import { googleAdsRequest } from "/opt/google-ads-mcp/src/googleAdsClient.js";
import { readConfigFromEnv } from "/opt/google-ads-mcp/src/googleAuth.js";
import fs from "node:fs";
const DIR = "/opt/autos-es/research";
const CLP = 950;
const GEOS = [2724, 2484, 2840, 2032, 2170, 2152, 2604].map((g) => `geoTargetConstants/${g}`); // ES MX US AR CO CL PE
const c = readConfigFromEnv();

async function hist(keywords) {
  const out = {};
  for (let i = 0; i < keywords.length; i += 700) {
    const r = await googleAdsRequest(c, { method: "POST", path: "/customers/6962355647:generateKeywordHistoricalMetrics",
      body: { keywords: keywords.slice(i, i + 700), language: "languageConstants/1003", geoTargetConstants: GEOS, keywordPlanNetwork: "GOOGLE_SEARCH" } });
    for (const x of r.results || []) {
      const m = { v: +(x.keywordMetrics?.avgMonthlySearches || 0), hi: +(x.keywordMetrics?.highTopOfPageBidMicros || 0) / 1e6 / CLP, group: [x.text, ...(x.closeVariants || [])].sort()[0] };
      out[x.text] = m; for (const cv of x.closeVariants || []) out[cv] ??= m;
    }
    await new Promise((s) => setTimeout(s, 1300));
  }
  return out;
}
async function ideas(seeds, re) {
  const r = await googleAdsRequest(c, { method: "POST", path: "/customers/6962355647:generateKeywordIdeas",
    body: { language: "languageConstants/1003", geoTargetConstants: GEOS, keywordPlanNetwork: "GOOGLE_SEARCH", keywordSeed: { keywords: seeds }, pageSize: 5000 } });
  return (r.results || []).map((x) => ({ k: x.text, v: +(x.keywordIdeaMetrics?.avgMonthlySearches || 0), hi: +(x.keywordIdeaMetrics?.highTopOfPageBidMicros || 0) / 1e6 / CLP })).filter((x) => re.test(x.k)).sort((a, b) => b.v - a.v);
}

// 1) Car models × intents
const MODELS = ["nissan versa", "nissan sentra", "nissan march", "nissan tsuru", "nissan np300", "nissan frontier", "nissan kicks", "chevrolet aveo", "chevrolet spark", "chevrolet onix", "chevrolet sail", "chevrolet beat", "chevrolet cruze", "chevrolet silverado", "chevrolet tracker", "toyota corolla", "toyota hilux", "toyota yaris", "toyota rav4", "toyota fortuner", "honda civic", "honda cr-v", "honda city", "mazda 3", "mazda 2", "mazda cx-5", "kia rio", "kia picanto", "kia sportage", "kia seltos", "hyundai accent", "hyundai tucson", "hyundai creta", "hyundai elantra", "volkswagen jetta", "volkswagen vento", "volkswagen gol", "volkswagen polo", "volkswagen golf", "volkswagen amarok", "ford ranger", "ford fiesta", "ford focus", "ford ecosport", "ford f-150", "renault logan", "renault sandero", "renault duster", "renault kwid", "renault clio", "peugeot 208", "peugeot 2008", "peugeot 308", "fiat cronos", "fiat palio", "fiat uno", "fiat strada", "suzuki swift", "suzuki vitara", "mitsubishi l200", "seat ibiza", "seat leon", "dacia sandero", "citroen c3", "chery tiggo", "mg zs"];
const MI = {
  aceite: (m) => [`que aceite lleva el ${m}`, `aceite ${m}`, `capacidad de aceite ${m}`],
  presion: (m) => [`presion de llantas ${m}`, `presion neumaticos ${m}`],
  llantas: (m) => [`medida de llantas ${m}`, `medida neumaticos ${m}`, `rines ${m}`],
  fusibles: (m) => [`fusibles ${m}`, `caja de fusibles ${m}`],
  consumo: (m) => [`consumo ${m}`, `rendimiento ${m}`],
  fallas: (m) => [`fallas comunes ${m}`, `problemas ${m}`],
  distribucion: (m) => [`correa de distribucion ${m}`, `cadena de distribucion ${m}`],
  bateria: (m) => [`bateria ${m}`],
  ficha: (m) => [`ficha tecnica ${m}`],
};
const mk = MODELS.flatMap((m) => Object.values(MI).flatMap((f) => f(m)));
const mh = await hist(mk);
const models = {};
for (const m of MODELS) { models[m] = {}; for (const [i, f] of Object.entries(MI)) { const seen = new Set(); let v = 0; const kws = []; for (const k of f(m)) { const x = mh[k]; if (!x || seen.has(x.group)) continue; seen.add(x.group); v += x.v; kws.push([k, x.v, +x.hi.toFixed(2)]); } models[m][i] = { v, kws }; } }
fs.writeFileSync(`${DIR}/models_es.json`, JSON.stringify(models));
console.log("models done", MODELS.length);

// 2) OBD codes
const codes = [];
for (let n = 0; n <= 999; n++) codes.push("p" + String(n).padStart(4, "0"));
codes.push("p2096", "p2097", "p2098", "p2099", "p2187", "p2188", "p2195", "p2196", "p2135", "p2138", "p2270", "p2271", "p2279", "p1133", "p1456", "p1101", "p1000", "u0100", "u0101", "u0121", "u0140", "u0155", "c0035", "c0040", "b1000");
const ok = codes.flatMap((x) => [x, `codigo ${x}`]);
const oh = await hist(ok);
const obd = {};
for (const x of codes) { const a = oh[x], b = oh[`codigo ${x}`]; const v = (a?.v || 0) + (b && b.group !== a?.group ? b.v : 0); if (v) obd[x] = { v, bare: a?.v || 0, codigo: b?.v || 0, hi: Math.max(a?.hi || 0, b?.hi || 0) }; }
fs.writeFileSync(`${DIR}/obd_es.json`, JSON.stringify(obd));
console.log("obd done", Object.keys(obd).length, "codes with volume");

// 3) Tire sizes
const sizes = [];
for (const w of [145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285]) for (const r of [35, 40, 45, 50, 55, 60, 65, 70, 75, 80]) for (const rim of [13, 14, 15, 16, 17, 18, 19, 20]) {
  const d = rim * 25.4 + 2 * w * r / 100; if (d < 540 || d > 820) continue;
  if (rim <= 14 && (w > 195 || r < 60)) continue; if (rim >= 18 && r > 60) continue; if (w <= 165 && rim > 15) continue; sizes.push(`${w} ${r} r${rim}`);
}
const th = await hist(sizes.flatMap((s) => [s, `llantas ${s}`, `neumaticos ${s}`]));
const tires = {};
for (const s of sizes) { const seen = new Set(); let v = 0; for (const k of [s, `llantas ${s}`, `neumaticos ${s}`]) { const x = th[k]; if (!x || seen.has(x.group)) continue; seen.add(x.group); v += x.v; } if (v) tires[s] = { v, hi: Math.max(...[s, `llantas ${s}`, `neumaticos ${s}`].map((k) => th[k]?.hi || 0)) }; }
fs.writeFileSync(`${DIR}/tires_es.json`, JSON.stringify(tires));
console.log("tires done", Object.keys(tires).length, "sizes with volume of", sizes.length);

// 4) Oils
const oils = await ideas(["aceite 5w30", "aceite 10w40", "5w30 o 10w40", "que aceite lleva mi carro", "aceite sintetico o mineral", "aceite 15w40", "aceite para moto"], /aceite|5w|10w|15w|20w|0w|sint[eé]tico|semisint|mineral|viscosidad/);
fs.writeFileSync(`${DIR}/oils_es.json`, JSON.stringify(oils));
console.log("oils done", oils.length, "kw, sum", oils.reduce((s, x) => s + x.v, 0));
