# CHANGELOG — Autos ES

## 2026-11-20 — Исследование и план
- Проект создан. Исследование Keyword Planner (испанский; ES MX US AR CO CL PE): research/clusters_kw.mjs → clusters_es.json (10 тем с разбивкой по странам), research/autos_kw.mjs → models_es.json (66 моделей × 9 тем), obd_es.json (1025 кодов), tires_es.json (575 размеров), oils_es.json.
- План: research/build_plan.py → content_plan.csv (560 страниц/инструментов + 851 строка), plan_summary.txt.
- CLAUDE.md: правила, доступы (Keyword Planner, Search Console, GA4, PageSpeed API, YouTube API), деплой как hojapedia/ladrimiau (GitHub deploy key + Cloudflare Workers Builds + превью workers.dev с noindex), спрос, безопасность, структура, первые шаги. Бренд и домен не выбраны. Ничего не опубликовано.

## 2026-11-20 — Бренд и деплой
- Бренд: **Tallerpedia**, домен tallerpedia.com (RDAP Verisign 2026-11-20: свободен; .net/.org/.io тоже свободны; поиск: одноимённых сайтов и брендов нет). Отклонены: Tuercapedia (созвучие с La Tuerka), Mecanipedia (поиск исправляет на Mechapedia), Carroclaro (путаница с Claro). Домен НЕ куплен.
- Деплой как hojapedia (подтвердил пользователь): приватный репозиторий alexanderklimin/tallerpedia, deploy key /root/.ssh/tallerpedia_deploy, алиас github-tallerpedia, Cloudflare Workers Builds, превью tallerpedia.alexander-klimin.workers.dev с noindex.

## 2026-11-20 — Каркас и первая партия (локально, не опубликовано)
- Astro 7.4.12 + @astrojs/sitemap, шрифт Archivo (OFL, раздаётся с сайта), иконки Lucide (scripts/icons.mjs → src/data/icons.json), логотип и OG-картинка (scripts/brand-images.mjs). Цвета: тёмно-синий + янтарный. wrangler.jsonc (workers_dev=true, без routes), public/_headers с X-Robots-Tag noindex до запуска. GA4 пока пуст (GA_ID='').
- Владелец в правовых страницах: Aleksandr Klimin, Chile (как на hojapedia, подтверждено там) — проверить с пользователем.
- Шины: src/lib/tires.js (разбор размера, размеры, сравнение, эквиваленты ±3 % из ~400 ходовых размеров research/tires_es.json ≥100/мес, до 8 на диаметр диска), тесты. 20 страниц /llantas/<размер>/ (топ по спросу), индекс /llantas/, калькулятор /herramientas/equivalencia-de-llantas/ (JS только здесь и в поиске). Давление — без цифр, только «табличка на двери / руководство». Блок «где ставится» и «купить» отложены (нужны источники и решение по партнёркам).
- Коды OBD: коллекция codes (схема требует описание SAE, вердикт «можно ли ехать», ≥3 причин с относительной стоимостью $/$$/$$$, ≥3 шагов диагностики, блок «Cuándo no conducir», FAQ, ≥2 источника). 20 кодов: P0420 P0430 P0171 P0172 P0174 P0300–P0304 P0442 P0455 P0456 P0128 P0113 P0340 P0335 P0011 P0016 P0135. Источники: SAE J2012 (без ссылки — страница SAE не открывается без JS), CARB OBD II fact sheet. Цены не указываются.
- Итого 50 страниц, тесты 11/11, битых внутренних ссылок нет. Разделы «Testigos» и «Aceite» убраны из меню до появления страниц.
