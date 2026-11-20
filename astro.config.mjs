import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Real last-modified dates for the sitemap: code pages use their own "reviewed" date, other pages a fixed date.
const SITE_UPDATED = '2026-11-20';
const reviewed = {};
for (const file of fs.readdirSync('src/data/codes').filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(`src/data/codes/${file}`, 'utf8'));
  reviewed[`/codigos-obd/${file.replace('.json', '')}/`] = data.reviewed;
}

export default defineConfig({
  site: 'https://tallerpedia.com',
  trailingSlash: 'always',
  integrations: [sitemap({
    serialize(item) {
      const path = new URL(item.url).pathname;
      return { ...item, lastmod: reviewed[path] ?? SITE_UPDATED };
    },
  })],
  build: { inlineStylesheets: 'always' },
});
