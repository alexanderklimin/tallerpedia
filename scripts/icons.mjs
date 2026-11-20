// Builds src/data/icons.json from lucide-static (ISC) so pages inline only the icons they use.
import fs from 'node:fs';
const names = ['car', 'gauge', 'wrench', 'circle-dot', 'droplet', 'triangle-alert', 'search', 'calculator', 'fuel', 'info', 'circle-check', 'circle-x', 'chevron-right', 'arrow-right', 'book-open', 'thermometer', 'battery', 'disc', 'shield-alert', 'shopping-cart', 'list-checks', 'scan-line', 'engine', 'octagon-alert', 'ruler', 'cog'];
const out = {};
for (const name of names) {
  const file = `node_modules/lucide-static/icons/${name}.svg`;
  if (!fs.existsSync(file)) { console.warn('missing', name); continue; }
  const svg = fs.readFileSync(file, 'utf8');
  out[name] = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s+/g, ' ').trim();
}
fs.writeFileSync('src/data/icons.json', JSON.stringify(out, null, 1) + '\n');
console.log(Object.keys(out).length, 'icons');
