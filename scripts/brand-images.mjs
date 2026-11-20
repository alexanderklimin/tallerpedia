// Renders public/logo.png (512×512) and public/og-default.png (1200×630) from inline SVG with sharp.
import sharp from 'sharp';
const mark = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 32})"><rect width="32" height="32" rx="8" fill="#f5a524"/><circle cx="16" cy="16" r="9" fill="none" stroke="#16304f" stroke-width="2.6"/><circle cx="16" cy="16" r="3" fill="#16304f"/><path d="M16 7v6M16 19v6M7 16h6M19 16h6" stroke="#16304f" stroke-width="2.2" stroke-linecap="round"/></g>`;
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="96" fill="#16304f"/>${mark(96, 96, 320)}</svg>`;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#16304f"/>${mark(90, 205, 220)}
<text x="360" y="310" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="104" fill="#ffffff">Taller<tspan fill="#f5a524">pedia</tspan></text>
<text x="364" y="385" font-family="DejaVu Sans, Arial, sans-serif" font-size="38" fill="#d6dfeb">Códigos OBD, llantas y guía para tu auto</text></svg>`;
await sharp(Buffer.from(logo)).png().toFile('public/logo.png');
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');
console.log('ok');
