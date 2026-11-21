# Autos ES — испаноязычный справочник для автовладельцев

Отдельный проект: коды ошибок OBD, лампочки на панели, размеры шин и давление, масла, данные по моделям авто, обслуживание, неисправности, калькуляторы. Позже — документы и проверки по странам. Рекламные кабинеты (/opt/google-ads-mcp, /opt/apple-ads-mcp) и другие сайты (/opt/astro-es, /opt/pets-es, /opt/plantas-es, /opt/limpieza-es, /opt/klimin-site) не трогать — только читать как образец.

## Правила работы
- Все сообщения пользователю — на русском, включая промежуточные. Контент сайта — на нейтральном испанском, с ориентацией на Мексику и Латинскую Америку; региональные слова давать синонимами: llantas/neumáticos/cubiertas, rines/llantas (aro), carro/auto/coche, cajuela/maletero/baúl, tablero/salpicadero, refacciones/repuestos, afinación/puesta a punto.
- Ничего не публиковать в интернет (деплой на домен, DNS, покупка домена, снятие noindex) без явного «да». Сначала показывать превью на *.workers.dev.
- Секреты не выводить и не повторять; хранить в /opt/autos-es/.env (chmod 600).
- Решения и изменения кратко логировать в /opt/autos-es/CHANGELOG.md.
- На сервере 3,7 ГБ RAM + 4 ГБ swap: сборки запускать последовательно, тяжёлые задачи не распараллеливать. Неиспользуемые окна VS Code закрывать.
- Перед любым вопросом пользователю сначала проверить этот файл и соседние проекты (/opt/plantas-es, /opt/pets-es) — там уже решены типовые вопросы (деплой, GA4, юр. страницы, почта).

## Доступы (уже настроены, искать не нужно)
- **Keyword Planner (Google Ads API, только чтение):** клиент `googleAdsRequest(config, {method, path, body})` из /opt/google-ads-mcp/src/googleAdsClient.js и `readConfigFromEnv()` из /opt/google-ads-mcp/src/googleAuth.js. Запуск: `cd /opt/google-ads-mcp && set -a && . ./.env && set +a && node /opt/autos-es/research/<скрипт>.mjs`. Эндпоинты: `POST /customers/6962355647:generateKeywordIdeas` (`keywordSeed`, `pageSize` до 5000) и `:generateKeywordHistoricalMetrics` (точные объёмы по списку, до 700 слов за запрос, пауза ~1.3 с). Примеры: research/autos_kw.mjs, research/clusters_kw.mjs.
  - Язык es = `languageConstants/1003` (en 1000, pt 1014). Страны: ES 2724, MX 2484, US 2840, AR 2032, CO 2170, CL 2152, PE 2604, VE 2862, EC 2218.
  - Ставки в ответе в CLP (валюта аккаунта): делить на ~950 → USD. Апострофы в запросах дают ошибку.
  - В рекламных кабинетах ничего не менять — только чтение планера.
- **Search Console (только чтение):** `cd /opt/shopify-mcp && node scripts/gsc.mjs sites | sitemaps <site> | query <site> <start> <end> [page,query] [limit] | inspect <site> <url>…` (Node из /opt/astro-es/.tools/node/bin). Сайт как `sc-domain:домен`. Отчёта «Индексирование страниц» в API нет — проверять URL через inspect (≈2000/день на ресурс, по одному с повтором при 500). Новый домен пользователь добавляет в Search Console сам (как hojapedia.com).
- **GA4:** через коннектор GA4 (run_report) после создания ресурса; код счётчика — как в /opt/plantas-es (gtag.js + Consent Mode v2: в европейских часовых поясах не грузится до «Aceptar», вне Европы — без рекламных cookies).
- **PageSpeed Insights API:** ключ `PAGESPEED_API_KEY` в /opt/asa-dashboard/.env. Пример запроса: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=…&strategy=mobile&category=performance&category=seo&key=…` (скрипт-образец: см. проект google-ads-mcp, scratchpad psi.mjs — логика: perf score, LCP, TBT, CLS, полевые данные CrUX).
- **YouTube Data API v3:** ключ `YOUTUBE_API_KEY` в /opt/asa-dashboard/.env (квота 10 000 единиц/день, поиск = 100). Пригодится для поиска авто-блогеров и встраивания видео.
- **BigQuery** (проект fluid-shadow-508012-i9): есть, но для сайта не нужен.

## Стек и деплой (как hojapedia.com и ladrimiau.com — повторять один в один)
- Astro 7 (статическая генерация, JS только на страницах инструментов) + **Cloudflare Workers со static assets** (не Pages). Конфиг — wrangler.jsonc как в /opt/pets-es: `assets.directory ./dist`, `html_handling auto-trailing-slash`, `not_found_handling 404-page`; до запуска `workers_dev: true`, при запуске `routes: [{pattern: "<домен>", custom_domain: true}]` и `workers_dev: false`.
- **Node 22** лежит в /opt/astro-es/.tools/node (системный Node 20 не менять): `PATH=/opt/astro-es/.tools/node/bin:$PATH npm run build`.
- **Код — приватный репозиторий GitHub** `alexanderklimin/<проект>`. Отправка через отдельный deploy key: создать `ssh-keygen -t ed25519 -f /root/.ssh/<проект>_deploy -N ""`, добавить в ~/.ssh/config алиас `Host github-<проект>` (HostName github.com, User git, IdentityFile, IdentitiesOnly yes), публичный ключ пользователь добавляет в репозиторий (Settings → Deploy keys, «Allow write access»). Репозиторий создаёт пользователь (или даёт команду). `origin = github-<проект>:alexanderklimin/<проект>.git`.
- **Сборка и выкладка — Cloudflare Workers Builds** из GitHub (пользователь подключает репозиторий в панели Cloudflare): команда сборки `npm run build`, деплой `npx wrangler deploy`. Токен Cloudflare на сервере НЕ нужен.
- **Превью:** https://<проект>.alexander-klimin.workers.dev. До запуска в public/_headers `X-Robots-Tag: noindex` для `/*` — удалить только при запуске (явное «да»).
- **Запуск:** домен покупает пользователь; проверка свободности — RDAP (Verisign для .com); почта hola@<домен> — Cloudflare Email Routing (настраивает пользователь); Always Use HTTPS — пользователь; после запуска проверить все URL из sitemap (200), canonical, отсутствие noindex, 404.
- Юр. страницы /contacto/, /privacidad/, /aviso-legal/ — по образцу /opt/plantas-es.
- Лимиты Cloudflare Free: 20 000 файлов на сайт (план ниже укладывается); проверить актуальность перед стартом.

## Деньги
1. **Партнёрки шинных магазинов** — запросы размеров шин («205 55 r16» 76 тыс./мес вместе с вариантами) — это в основном покупка. На странице размера: эквиваленты, диаметр, давление, на какие авто ставится, блок «купить» со ссылками (Mercado Libre, местные магазины, Amazon). Цены не выдумывать — только ссылки.
2. **Масла и сканеры OBD** — Amazon / Mercado Libre affiliate («aceite 5w30» 40 тыс., «escáner automotriz» 18 тыс.).
3. **Реклама (AdSense/Ezoic)** — клики дороже, чем по растениям: медиана верхней ставки $0.3–0.6, калькуляторы кредита ~$1.1.
4. Позже — заявки на страховку (SOAT в CO/PE, seguro de auto) и кредиты; только с реальными партнёрами.
Партнёрские ссылки помечать.

## Спрос (Keyword Planner, 2026-11-20; испанский; ES MX US AR CO CL PE)
Данные: research/clusters_es.json (идеи по темам + разбивка по странам), models_es.json, obd_es.json, tires_es.json, oils_es.json. Цифры — запросы в месяц для сравнения тем, не прогноз трафика.
- **Размеры шин:** 575 размеров с объёмом, 194 ≥1000/мес, всего ≈1.6 млн (вместе с покупкой). Топ: 205 55 r16 76k, 185 65 r15 55k, 225 65 r17 52k, 265 70 r17 45k, 195 65 r15 42k. Информационные: «equivalencias neumáticos» 18k, «medidas de llantas» 15k. По странам: MX 126k, ES 88k, CL 69k.
- **Коды OBD:** «código pXXXX» (чистый испанский) ≈81k/мес, 175 кодов ≥100; голые коды («p0420») в сумме ≈1.5 млн, но туда входят и неиспанские запросы — доверять «código …». Топ: P0420, P0171, P0300, P0113, P0135, P0335, P0340, P0011. Плюс «escáner automotriz» 18k.
- **Лампочки панели:** ≈149k (MX 72k): «testigo de tablero» 12k, «luz amarilla en el tablero» 8k, «check engine que significa» 3.6k.
- **Масла:** сотни тысяч, но в выгрузке много вариантов одного запроса (5w30 / 5 w 30 / 5w-30) — суммы в плане завышены. Топ: 5w30 40k, 10w40 27k, «aceite para moto» 22k, 15w40 15k; много брендов (Castrol, Motul, Mobil) = покупка.
- **Давление в шинах** ≈84k (ES 41k), **обслуживание** ≈186k (líquido de frenos 27k), **калькуляторы** ≈113k (кредит на авто CO, расход и стоимость поездки), **неисправности** ≈61k, **предохранители** ≈480k (часть — бытовые предохранители, отфильтровать).
- **Модели авто:** 66 моделей × 9 тем ≈89k; 39 моделей ≥1000/мес. Больше всего: расход/rendimiento 16k, аккумулятор 16k, ficha técnica 16k, предохранители 11k, шины 10k. Топ: Mazda 3, Toyota Yaris, Peugeot 208/2008, Suzuki Swift, Renault Kwid, Mazda CX-5, Ford Fiesta, Corolla.
- **Документы и проверки** (ITV, SOAT, SIMIT, verificación) ≈4.6 млн, но это госпорталы и покупка полиса — только волна 3, объяснения + ссылки.
- **Выдача (грубая проверка):** коды — club.autodoc.es, sensorautomotriz.com и английские сайты; лампочки — колумбийские СМИ (Autocosmos, Carroya, Pulzo); калькуляторы шин в Испании — сильные бренды (Omni, RACE, Mapfre, TÜV SÜD, Muchoneumático), в LatAm слабее. Стратегия: Мексика и LatAm первыми.

## Контент и безопасность (обязательно)
- Тормоза, рулевое, подушки безопасности, перегрев, утечка топлива — всегда блок «Cuándo no conducir / acudir al taller». Без инструкций, которые могут навредить (отключение подушек, «удалить катализатор», обход датчиков).
- Коды OBD: общее описание по SAE J2012 + типичные причины и порядок проверки; специфику марки помечать. Не обещать «исправить своими руками».
- Данные моделей (масло, ёмкость, давление, размер шин, предохранители) — только из руководства владельца или официальных спецификаций, с годом и мотором; если данных нет — не писать.
- Масла: рекомендации только в рамках спецификации производителя (SAE, API/ACEA).
- Калькуляторы — формулы и источники на странице, логика с тестами.
- Политика Google scaled content abuse: не выкладывать сразу все сотни страниц кодов/размеров; партиями, следующая — когда предыдущая индексируется (Search Console). Каждая страница должна давать больше, чем ответ Google: таблицы, причины по частоте, стоимость ремонта (диапазон, с оговоркой), связанные коды, FAQ.

## Структура (черновик, согласовать с пользователем)
```
/                                  главная: поиск кода/размера/модели, лампочки, инструменты
/codigos-obd/p0420/                ★ страница кода
/codigos-obd/p0xxx/                таблица остальных кодов серии
/testigos/  /testigos/check-engine/  лампочки панели
/llantas/205-55-r16/               ★ размер шины: эквиваленты, давление, авто, купить
/llantas/rin-16/                   таблица размеров диска
/aceite/5w30/  /aceite/para-moto/  масла
/autos/mazda-3/                    ★ модель: масло, давление, шины, предохранители, расход, ГРМ, АКБ
/mantenimiento/... /fallas/... /fusibles/...
/herramientas/equivalencia-de-llantas/ … consumo-y-costo-de-viaje/ … credito-automotriz/ … buscador-codigos-obd/ … que-aceite-lleva-mi-auto/
/tramites/mx|co|es/...             волна 3
```

## План страниц
research/content_plan.csv (wave, topic, format, url, query, volume, variants, gate); пересборка `python3 -I research/build_plan.py`, сводка в research/plan_summary.txt. Итого **560 страниц/инструментов + 851 строка** таблиц. Черновик: группировка автоматическая, объёмы масел завышены вариантами — перед каждой партией проверить вручную.

| Волна | Тема | Страниц | Строк | Условие публикации |
|---|---|---|---|---|
| 1 | Коды OBD (топ-60) | 60 | 0 | Описание по SAE, блок безопасности |
| 1 | Размеры шин (топ-50) | 50 | 0 | Эквиваленты считаются калькулятором, цены только ссылками |
| 1 | Масла | 12 | 0 | По SAE/API/ACEA |
| 1 | Модели авто (≥2000/мес) | 16 | 0 | Данные из руководств, с годом и мотором |
| 1 | Лампочки панели (хаб + 5) | 6 | 0 | Блок безопасности |
| 1 | Давление шин, обслуживание | 3 | 0 | |
| 1 | Инструменты | 6 | 0 | Логика с тестами |
| 2 | Остальные коды / размеры / модели | 391 | 851 | Темп по индексации |
| 2 | Неисправности, предохранители | 10 | 0 | Блок безопасности |
| 3 | Документы и проверки по странам | 6 | 0 | Только объяснение + офиц. ссылки |

## Статус (2026-11-21)
- Бренд **Tallerpedia**, https://tallerpedia.com — ЗАПУЩЕН 2026-11-21 (62 страницы: 20 кодов, 20 размеров шин + калькулятор, хаб лампочек + 5, 4 масла + гид). Репозиторий alexanderklimin/tallerpedia (deploy key tallerpedia_deploy, алиас github-tallerpedia), Workers Builds, GA4 G-927Q0Q0PH6, Search Console sc-domain:tallerpedia.com (sitemap отправлен). Подробности — CHANGELOG.md.
- В правовых страницах владелец — «el equipo de Tallerpedia» (без личного имени, решение пользователя).
- Следующая партия (5 моделей, новые коды/размеры) — только после того, как первая начнёт индексироваться (проверять через gsc.mjs inspect).

## Первые шаги (выполнены 1–3)
1. Спросить пользователя: бренд и домен (короткое испанское имя, .com; проверить через RDAP); подтвердить, что деплой как у hojapedia (GitHub + Workers Builds).
2. Создать каркас Astro по образцу /opt/plantas-es (не копировать бренд и контент): шаблоны «код OBD», «размер шины», «модель», «масло», «лампочка»; schema.org (Article, FAQPage, HowTo, BreadcrumbList), sitemap, быстрые Core Web Vitals, перелинковка код ↔ лампочка ↔ модель ↔ размер.
3. Первая партия: 20 кодов, 20 размеров шин + калькулятор эквивалентов, хаб лампочек + 5, 5 масел, 5 моделей. Превью на workers.dev, публикация только после «да».
4. Search Console + GA4 при запуске; партнёрки (Mercado Libre, Amazon, шинные магазины) — отдельным решением пользователя.
