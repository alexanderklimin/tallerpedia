# Builds research/content_plan.csv + plan_summary.txt for the Spanish auto site from the Keyword Planner data.
#   python3 -I research/build_plan.py      (run from /opt/autos-es)
import csv, json, re, unicodedata, collections as C
D = "research"
models = json.load(open(f"{D}/models_es.json")); obd = json.load(open(f"{D}/obd_es.json"))
tires = json.load(open(f"{D}/tires_es.json")); oils = json.load(open(f"{D}/oils_es.json")); cl = json.load(open(f"{D}/clusters_es.json"))
slug = lambda s: re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode()).strip("-")
rows = []
def add(wave, topic, fmt, url, query, volume, variants="", gate=""):
    rows.append({"wave": wave, "topic": topic, "format": fmt, "url": url, "query": query, "volume": int(volume), "variants": variants, "gate": gate})

SAFE = "Только общий порядок диагностики; при рисках для безопасности (тормоза, рулевое, подушки, перегрев) — «к мастеру»; без обещаний ремонта своими руками"
# 1) OBD codes — page if Spanish "codigo pXXXX" ≥ 50/mo or bare code ≥ 1000/mo
codes = sorted(obd.items(), key=lambda kv: -(kv[1]["codigo"] * 10 + kv[1]["bare"]))
n = 0
for k, x in codes:
    if x["codigo"] >= 50 or x["bare"] >= 1000:
        n += 1; add(1 if n <= 60 else 2, "Коды OBD", "page", f"/codigos-obd/{k}/", f"codigo {k}", x["codigo"] + x["bare"], f"bare {x['bare']}, codigo {x['codigo']}", SAFE)
    elif x["bare"] + x["codigo"] >= 30:
        add(2, "Коды OBD", "faq-or-table", f"/codigos-obd/{k[:2]}xxx/", f"codigo {k}", x["codigo"] + x["bare"], "", SAFE)
# 2) Tire sizes — page if ≥ 1000/mo (top 50 in wave 1)
ts = sorted(tires.items(), key=lambda kv: -kv[1]["v"])
for i, (s, x) in enumerate(ts):
    w, r, rim = s.replace("r", "").split()
    if x["v"] >= 1000: add(1 if i < 50 else 2, "Размеры шин", "page", f"/llantas/{w}-{r}-r{rim}/", s, x["v"], "equivalencias, diámetro, presión, autos que la usan", "Цены — только ссылки на магазины-партнёры, без выдуманных цен")
    elif x["v"] >= 100: add(2, "Размеры шин", "faq-or-table", f"/llantas/rin-{rim}/", s, x["v"])
# 3) Car models — page per model ≥ 1000/mo total; sections = intents
for m, v in sorted(models.items(), key=lambda kv: -sum(i["v"] for i in kv[1].values())):
    tot = sum(i["v"] for i in v.values())
    if tot < 300: continue
    best = max(v.items(), key=lambda kv: kv[1]["v"])
    add(1 if tot >= 2000 else 2, "Модели авто", "page" if tot >= 1000 else "faq-or-table", f"/autos/{slug(m)}/", m, tot,
        "; ".join(f"{i} {x['v']}" for i, x in sorted(v.items(), key=lambda kv: -kv[1]["v"]) if x["v"]),
        "Данные (масло, давление, шины, предохранители) — только из руководства владельца/официальных спецификаций, указывать год и мотор")
    for i, x in v.items():
        if x["v"] >= 1000: add(2, "Модели авто", "page", f"/autos/{slug(m)}/{slug(i)}/", f"{i} {m}", x["v"])
# 4) Oils — grade pages + moto + guides + "qué aceite lleva mi auto" tool
NO = re.compile(r"oliva|coco|ricino|girasol|cocina|cabello|pelo|esencial|beb|piel|cara|canola|ma[ií]z|soya|aguacate|almendra|argan|romero|arbol|lavanda|masaje|rosa|freidora|pescado|omega|cbd|semilla|comestible|vegetal|palma|linaza|sesamo|mostaza|uñas|barba|labio|ojo|calendula")
seen, oil = set(), []
for x in oils:
    if NO.search(x["k"]): continue
    k = re.sub(r"\s+", "", unicodedata.normalize("NFKD", x["k"]).encode("ascii", "ignore").decode())
    if k in seen: continue
    seen.add(k); oil.append(x)
grades = C.Counter()
for x in oil:
    g = re.search(r"(\d{1,2})\s*w\s*-?\s*(\d{2})", x["k"])
    if g: grades[f"{g.group(1)}w{g.group(2)}"] += x["v"]
for g, v in grades.most_common():
    if v >= 2000: add(1, "Масла", "page", f"/aceite/{g}/", f"aceite {g}", v, "", "Без рекомендаций против спецификации производителя (SAE/API/ACEA из руководства)")
mot = sum(x["v"] for x in oil if "moto" in x["k"])
add(1, "Масла", "page", "/aceite/para-moto/", "aceite para moto", mot)
for q in ["aceite sintetico vs mineral", "cada cuanto cambiar el aceite", "que aceite lleva mi carro", "capacidad de aceite por modelo"]:
    v = sum(x["v"] for x in oil if all(w in x["k"] for w in q.split()[:2]))
    add(1, "Масла", "page", f"/aceite/{slug(q)}/", q, v)
# 5) Clusters from ideas (dashboard lights, pressure, maintenance, failures, calculators)
def bucket(topic, rules, wave, base, gate=""):
    for name, rx in rules:
        v = sum(x["v"] for x in cl[topic]["ALL"] if re.search(rx, x["k"]))
        if v >= 500: add(wave, base[0], "page", f"{base[1]}{slug(name)}/", name, v, "", gate)
bucket("testigos_tablero", [("check engine", r"check engine|motor"), ("testigo de aceite", r"aceite"), ("testigo de bateria", r"bater"), ("testigo de temperatura", r"temperatura|termometro|calient"), ("testigo abs", r"\babs\b"), ("testigo airbag", r"airbag|bolsa de aire"), ("testigo de frenos", r"freno"), ("testigo presion de llantas", r"presi[oó]n|llanta|neum"), ("testigo de la tortuga", r"tortuga"), ("testigo epc", r"\bepc\b"), ("testigo de precalentamiento", r"precalent|bujia|resistencia|espiral"), ("testigo esp control de traccion", r"\besp\b|tracci"), ("luz amarilla tablero", r"amarill"), ("luz roja tablero", r"roj")], 1, ("Лампочки панели", "/testigos/"), SAFE)
add(1, "Лампочки панели", "page", "/testigos/", "testigos del tablero", sum(x["v"] for x in cl["testigos_tablero"]["ALL"]), "хаб с поиском по символу", SAFE)
bucket("presion_llantas", [("presion de llantas", r".")], 1, ("Шины", "/llantas/"))
bucket("aceite_mantenimiento", [("liquido de frenos", r"liquido de frenos|liquido para frenos"), ("anticongelante refrigerante", r"anticongelante|refrigerante"), ("bujias", r"buj[ií]a"), ("bateria de auto", r"bater[ií]a"), ("filtro de aire", r"filtro de aire"), ("afinacion", r"afinaci"), ("mantenimiento por kilometraje", r"cada cu[aá]nt|kilometr|km")], 1, ("Обслуживание", "/mantenimiento/"))
bucket("ruidos_fallas", [("auto no arranca", r"no arranca"), ("ruido al frenar", r"ruido.*fren|fren.*ruido"), ("motor se calienta", r"calienta"), ("auto tiembla o vibra", r"tiembla|vibra"), ("sensor maf fallas", r"\bmaf\b"), ("sensor de oxigeno fallas", r"ox[ií]geno"), ("bomba de gasolina fallas", r"bomba de gasolina"), ("bobina de encendido fallas", r"bobina"), ("motor de arranque fallas", r"motor de arranque|marcha")], 2, ("Неисправности", "/fallas/"), SAFE)
bucket("fusibles_manuales", [("caja de fusibles", r"caja de fusibles"), ("diagrama de fusibles", r"diagrama"), ("fusible bomba de gasolina", r"bomba")], 2, ("Предохранители", "/fusibles/"))
# 6) Tools
for name, url, q in [("Калькулятор эквивалентов шин", "/herramientas/equivalencia-de-llantas/", "equivalencias neumaticos"), ("Калькулятор давления", "/herramientas/presion-de-llantas/", "presion de llantas"),
                     ("Расход и стоимость поездки", "/herramientas/consumo-y-costo-de-viaje/", "calcular gasto gasolina viaje"), ("Кредит на авто (по странам)", "/herramientas/credito-automotriz/", "simulador credito vehiculo"),
                     ("Расшифровка кода OBD (поиск)", "/herramientas/buscador-codigos-obd/", "codigos obd2"), ("Какое масло в мою машину", "/herramientas/que-aceite-lleva-mi-auto/", "que aceite lleva mi carro")]:
    v = sum(x["v"] for t in ("calculadoras", "medidas_llantas", "presion_llantas", "codigos_obd", "aceite_mantenimiento") for x in cl[t]["ALL"] if q.split()[0] in x["k"] and q.split()[-1] in x["k"])
    add(1, "Инструменты", "tool", url, q, v, name, "Логика покрыта тестами; формулы и источники на странице")
# 7) Country paperwork (gated)
for name, rx, url in [("verificacion vehicular (MX)", r"verificaci", "/tramites/mx/verificacion-vehicular/"), ("tenencia y refrendo (MX)", r"tenencia|refrendo", "/tramites/mx/tenencia/"), ("SOAT (CO/PE)", r"soat", "/tramites/co/soat/"),
                      ("revision tecnico mecanica (CO)", r"t[eé]cnico ?mec", "/tramites/co/revision-tecnico-mecanica/"), ("ITV (ES)", r"\bitv\b", "/tramites/es/itv/"), ("multas de transito", r"multa", "/tramites/multas/")]:
    v = sum(x["v"] for x in cl["multas_tramites"]["ALL"] if re.search(rx, x["k"]))
    add(3, "Документы и проверки", "page", url, name, v, "", "Только объяснение и ссылки на официальные порталы; дату и цены сверять с офиц. источником при каждой публикации")

with open(f"{D}/content_plan.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
S = C.defaultdict(lambda: [0, 0, 0])
for r in rows: s = S[(r["wave"], r["topic"])]; s[0 if r["format"] in ("page", "tool") else 1] += 1; s[2] += r["volume"]
lines = ["wave | topic | pages/tools | rows | volume/mo (sum of queries)"] + [f"{w} | {t} | {v[0]} | {v[1]} | {v[2]}" for (w, t), v in sorted(S.items())]
lines.append(f"TOTAL pages/tools {sum(v[0] for v in S.values())}, rows {sum(v[1] for v in S.values())}")
open(f"{D}/plan_summary.txt", "w").write("\n".join(lines) + "\n"); print("\n".join(lines))
