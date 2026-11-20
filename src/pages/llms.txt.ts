// /llms.txt: a short, plain-text map of the site for AI assistants (llmstxt.org format).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import published from '../data/tires/published.json';
import { parseSize, sizeLabel, sizePath } from '../lib/tires.js';

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;
  const lights = (await getCollection('lights')).sort((a, b) => a.data.order - b.data.order);
  const codes = (await getCollection('codes')).sort((a, b) => a.data.code.localeCompare(b.data.code));
  const lines = [
    '# Tallerpedia',
    '',
    '> Guía práctica en español para entender el auto: qué significa cada código OBD-II (definición SAE J2012, síntomas, causas, orden de diagnóstico y si se puede seguir manejando) y medidas de llantas con dimensiones y equivalencias calculadas con fórmulas visibles.',
    '',
    `Metodología: ${abs('/sobre-tallerpedia/')}`,
    '',
    '## Códigos OBD-II',
    ...codes.map((c) => `- [${c.data.code}: ${c.data.title}](${abs(`/codigos-obd/${c.id}/`)})`),
    '',
    '## Testigos del tablero',
    `- [Testigos del tablero: qué significa cada color](${abs('/testigos/')})`,
    ...lights.map((l) => `- [${l.data.h1}](${abs(`/testigos/${l.id}/`)}): ${l.data.short}`),
    '',
    '## Medidas de llantas',
    ...published.map((s) => { const size = parseSize(s.replace(/-/g, ' '))!; return `- [${sizeLabel(size)}](${abs(sizePath(size))})`; }),
    '',
    '## Herramientas',
    `- [Calculadora de equivalencias de llantas](${abs('/herramientas/equivalencia-de-llantas/')})`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
