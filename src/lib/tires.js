// Tire size math (ISO metric sizes, e.g. 205/55 R16). Framework-free: used by pages and the browser calculator.
// Formulas: sidewall = width × aspect / 100; diameter = rim × 25.4 + 2 × sidewall; circumference = π × diameter.

export const MM_PER_INCH = 25.4;
// Common practical margin for an equivalent size: overall diameter within ±3 % of the original.
export const DEFAULT_TOLERANCE = 3;

const SIZE_RE = /^\s*(\d{3})\s*[\/\s-]\s*(\d{2})\s*[\s-]*z?r?\s*[\s-]*(\d{2})\s*$/i;

export function parseSize(text) {
  const match = SIZE_RE.exec(String(text ?? ''));
  if (!match) return null;
  const [width, aspect, rim] = match.slice(1).map(Number);
  if (width < 105 || width > 395 || aspect < 20 || aspect > 95 || rim < 10 || rim > 26) return null;
  return { width, aspect, rim };
}

export const sizeLabel = ({ width, aspect, rim }) => `${width}/${aspect} R${rim}`;
export const sizeSlug = ({ width, aspect, rim }) => `${width}-${aspect}-r${rim}`;
export const sizePath = (size) => `/llantas/${sizeSlug(size)}/`;

const round = (value, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

export function dimensions(size) {
  const sidewall = (size.width * size.aspect) / 100;
  const rimMm = size.rim * MM_PER_INCH;
  const diameter = rimMm + 2 * sidewall;
  const circumference = Math.PI * diameter;
  return {
    width: size.width,
    sidewall: round(sidewall),
    rimMm: round(rimMm),
    diameter: round(diameter),
    diameterIn: round(diameter / MM_PER_INCH, 2),
    widthIn: round(size.width / MM_PER_INCH, 2),
    circumference: round(circumference),
    revsPerKm: Math.round(1e6 / circumference),
  };
}

// Difference of `candidate` relative to `original`, and what the speedometer shows.
export function compare(original, candidate) {
  const a = (original.rim * MM_PER_INCH) + (2 * original.width * original.aspect) / 100;
  const b = (candidate.rim * MM_PER_INCH) + (2 * candidate.width * candidate.aspect) / 100;
  const diffPct = ((b - a) / a) * 100;
  return {
    diffMm: round(b - a),
    diffPct: round(diffPct, 2),
    // The speedometer is calibrated for the original size: at an indicated 100 km/h the car really goes:
    realAt100: round((100 * b) / a),
    sidewallDiff: round((candidate.width * candidate.aspect - original.width * original.aspect) / 100),
  };
}

const sameSize = (a, b) => a.width === b.width && a.aspect === b.aspect && a.rim === b.rim;

// Equivalent sizes from a list of sizes that actually exist on the market (`catalog`: [width, aspect, rim]).
export function equivalents(size, catalog, { tolerance = DEFAULT_TOLERANCE, rims, perRim = Infinity } = {}) {
  const allowedRims = rims ?? [size.rim - 1, size.rim, size.rim + 1, size.rim + 2];
  return catalog
    .map(([width, aspect, rim]) => ({ width, aspect, rim }))
    .filter((c) => allowedRims.includes(c.rim) && !sameSize(c, size))
    .map((c) => ({ size: c, ...compare(size, c) }))
    .filter((c) => Math.abs(c.diffPct) <= tolerance)
    .sort((x, y) => x.size.rim - y.size.rim || Math.abs(x.diffPct) - Math.abs(y.diffPct))
    .filter((c, i, list) => list.slice(0, i).filter((o) => o.size.rim === c.size.rim).length < perRim);
}

// Sizes with the same rim diameter, for "/llantas/rin-16/" style tables.
export const byRim = (catalog, rim) => catalog.filter((s) => s[2] === rim).map(([width, aspect, r]) => ({ width, aspect, rim: r }));
