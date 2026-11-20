// Number formatting for Spanish text: decimal comma (most Spanish-speaking countries), no grouping for 4 digits.
const cache = new Map();
function formatter(digits) {
  if (!cache.has(digits)) cache.set(digits, new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits, minimumFractionDigits: 0 }));
  return cache.get(digits);
}

export const fmt = (value, digits = 1) => formatter(digits).format(value);
export const signed = (value, digits = 2) => (value > 0 ? '+' : value < 0 ? '−' : '±') + fmt(Math.abs(value), digits);
