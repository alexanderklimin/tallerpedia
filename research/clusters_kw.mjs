// Spanish auto niche demand (Keyword Planner ideas, read-only). Run from /opt/google-ads-mcp with its .env loaded.
//   node auto_kw.mjs <out.json>
import { googleAdsRequest } from "/opt/google-ads-mcp/src/googleAdsClient.js";
import { readConfigFromEnv } from "/opt/google-ads-mcp/src/googleAuth.js";
import fs from "node:fs";
const CLP = 950;
const GEOS = { ALL: [2724, 2484, 2840, 2032, 2170, 2152, 2604], ES: [2724], MX: [2484], US: [2840], AR: [2032], CO: [2170], CL: [2152], PE: [2604] };
const T = {
  codigos_obd: { seeds: ["codigo p0420", "codigo p0300", "codigo p0171", "codigos obd2", "codigo de falla p0", "escaner automotriz"], re: /\bp[0-3]\d{3}\b|c[oó]digo.*(falla|obd|motor|error)|obd|esc[aá]ner (automotriz|obd|para (auto|carro|coche))/ },
  testigos_tablero: { seeds: ["testigos del tablero", "luces del tablero significado", "luz check engine", "testigo de aceite", "luz de motor encendida"], re: /testigo|luz|luces|check engine|tablero|indicador/ },
  medidas_llantas: { seeds: ["medidas de llantas", "medida de neumaticos", "equivalencia de llantas", "205/55 r16", "que significan los numeros de la llanta", "medidas de rines"], re: /llanta|neum[aá]tic|rin(es)?\b|r1[3-9]|r2[0-2]|\d{3}\/\d{2}|cubierta|goma/ },
  presion_llantas: { seeds: ["presion de llantas", "presion de neumaticos", "cuantas libras de aire llevan las llantas", "psi llantas"], re: /presi[oó]n|libras de aire|psi|inflad/ },
  calculadoras: { seeds: ["calculadora de llantas", "calculadora de neumaticos", "calculadora consumo de combustible", "calcular consumo de gasolina", "calculadora de credito automotriz", "simulador credito auto", "calculadora de velocidad y rpm"], re: /calcula|simulador|consumo|rendimiento|cuanto gasta|km por litro|litros por/ },
  aceite_mantenimiento: { seeds: ["que aceite lleva mi carro", "cada cuanto cambiar aceite", "tipo de aceite para mi auto", "cada cuantos km se cambia", "liquido de frenos"], re: /aceite|cada cu[aá]nto|mantenimiento|afinaci[oó]n|bater[ií]a|frenos?|refrigerante|anticongelante|buj[ií]a|filtro/ },
  fusibles_manuales: { seeds: ["caja de fusibles", "diagrama de fusibles", "manual del propietario", "fusible de"], re: /fusible|diagrama|manual/ },
  ruidos_fallas: { seeds: ["mi carro no arranca", "ruido al frenar", "el carro se calienta", "por que mi auto tiembla", "falla de motor"], re: /no arranca|ruido|se calienta|tiembla|vibra|falla|humo|olor|jalonea|se apaga/ },
  multas_tramites: { seeds: ["verificacion vehicular", "tenencia", "multas de transito", "itv", "revision tecnico mecanica", "soat"], re: /verificaci[oó]n|tenencia|multa|itv|t[eé]cnico ?mec|soat|refrendo|placas|permiso de circulaci|revisi[oó]n t[eé]cnica|patente/ },
  precios_valor: { seeds: ["cuanto vale mi carro", "precio de autos usados", "libro azul", "tasacion de autos", "valor fiscal"], re: /cu[aá]nto vale|precio|libro azul|tasaci|valor|cotiza/ },
};
const c = readConfigFromEnv(); const out = {};
for (const [topic, { seeds, re }] of Object.entries(T)) {
  out[topic] = {};
  for (const [g, geos] of Object.entries(GEOS)) {
    try {
      const r = await googleAdsRequest(c, { method: "POST", path: "/customers/6962355647:generateKeywordIdeas", body: { language: "languageConstants/1003", geoTargetConstants: geos.map((x) => `geoTargetConstants/${x}`), keywordPlanNetwork: "GOOGLE_SEARCH", keywordSeed: { keywords: seeds }, pageSize: g === "ALL" ? 5000 : 2000 } });
      const rows = (r.results || []).map((x) => ({ k: x.text, v: +(x.keywordIdeaMetrics?.avgMonthlySearches || 0), hi: +(x.keywordIdeaMetrics?.highTopOfPageBidMicros || 0) / 1e6 / CLP })).filter((x) => re.test(x.k));
      rows.sort((a, b) => b.v - a.v);
      out[topic][g] = g === "ALL" ? rows : rows.reduce((s, x) => s + x.v, 0);
    } catch (e) { out[topic][g] = "ERR " + String(e.message).slice(0, 80); }
    await new Promise((s) => setTimeout(s, 1300));
  }
  const rows = out[topic].ALL || [];
  if (Array.isArray(rows)) {
    const paid = rows.filter((x) => x.hi > 0).map((x) => x.hi).sort((a, b) => a - b);
    console.log(topic.padEnd(22), "kw", String(rows.length).padStart(5), "| sum", String(rows.reduce((s, x) => s + x.v, 0)).padStart(9), "| ≥1k", String(rows.filter((x) => x.v >= 1000).length).padStart(4), "| med top bid $", (paid[Math.floor(paid.length / 2)] || 0).toFixed(2),
      "| ES", out[topic].ES, "MX", out[topic].MX, "US", out[topic].US, "AR", out[topic].AR, "CO", out[topic].CO, "CL", out[topic].CL, "PE", out[topic].PE);
    console.log("     top:", rows.slice(0, 8).map((x) => `${x.k} ${x.v}`).join("; "));
  } else console.log(topic, rows);
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));
