import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One JSON file per OBD code in src/data/codes/. The build fails if a page misses what CLAUDE.md
// requires: standard description, causes, check order, "can I drive" verdict, safety notes, FAQ, sources.

const source = z.object({ name: z.string().min(3), url: z.url().optional() });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const codeId = z.string().regex(/^[PBCU][0-9A-F]{4}$/);

export const SYSTEMS = ['catalizador', 'mezcla', 'encendido', 'evap', 'sensores', 'distribucion', 'enfriamiento', 'transmision', 'red'] as const;

const codes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/codes' }),
  schema: z.object({
    code: codeId,
    sae: z.string().min(10), // standard English description (SAE J2012 / ISO 15031-6)
    title: z.string().min(10), // Spanish translation of the standard description
    system: z.enum(SYSTEMS),
    severity: z.enum(['low', 'medium', 'high']),
    drive: z.string().min(40), // "¿Puedo seguir manejando?"
    summary: z.string().min(80),
    meaning: z.array(z.string()).min(1),
    symptoms: z.array(z.string()).min(2),
    causes: z.array(z.object({
      name: z.string(),
      detail: z.string(),
      cost: z.enum(['bajo', 'medio', 'alto']),
    })).min(3),
    checks: z.array(z.string()).min(3),
    stop: z.array(z.string()).min(1), // "Cuándo no conducir / acudir al taller"
    brandNotes: z.array(z.string()).default([]),
    related: z.array(codeId).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
    sources: z.array(source).min(2),
    reviewed: isoDate,
  }),
});

// Dashboard warning lights (hub + guide pages) in src/data/lights/. Each needs a "can I drive" verdict,
// safety block, FAQ and at least two sources.
const section = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()).default([]),
  list: z.array(z.string()).optional(),
  ordered: z.boolean().default(false),
});
const lights = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/lights' }),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    h1: z.string(),
    title: z.string().max(65),
    aka: z.array(z.string()).default([]),
    short: z.string().max(90),
    color: z.enum(['rojo', 'amarillo', 'mixto']),
    symbol: z.enum(['engine', 'oil', 'tpms', 'battery', 'temp', 'brake', 'amber', 'red']),
    severity: z.enum(['low', 'medium', 'high']),
    summary: z.string().min(80),
    drive: z.string().min(40),
    sections: z.array(section).min(2),
    table: z.array(z.object({ light: z.string(), symbol: z.string().optional(), meaning: z.string(), action: z.string(), level: z.enum(['low', 'medium', 'high']) })).default([]),
    stop: z.array(z.string()).min(1),
    relatedCodes: z.array(codeId).default([]),
    relatedLights: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
    sources: z.array(source).min(2),
    reviewed: isoDate,
  }),
});

// Engine oil pages in src/data/oils/: SAE grade pages (computed J300 table added by the template) and guides.
const oils = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/oils' }),
  schema: z.object({
    kind: z.enum(['grade', 'guide']),
    order: z.number(),
    grade: z.string().regex(/^\d{1,2}W-\d{2}$/).optional(),
    name: z.string(),
    h1: z.string(),
    title: z.string().max(65),
    short: z.string().max(90),
    summary: z.string().min(80),
    sections: z.array(section).min(2),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
    sources: z.array(source).min(2),
    reviewed: isoDate,
  }),
});

export const collections = { codes, lights, oils };
