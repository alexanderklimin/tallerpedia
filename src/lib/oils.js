// SAE J300 engine oil viscosity grades (values as published in J300 tables; see sources on the pages).
// Winter grade: max cranking viscosity test temperature and max pumping viscosity test temperature (°C).
export const WINTER = {
  0: { crank: -35, pump: -40 },
  5: { crank: -30, pump: -35 },
  10: { crank: -25, pump: -30 },
  15: { crank: -20, pump: -25 },
  20: { crank: -15, pump: -20 },
  25: { crank: -10, pump: -15 },
};
// Hot grade: kinematic viscosity at 100 °C (mm²/s, min inclusive, max exclusive) and min HTHS at 150 °C (mPa·s).
export const HOT = {
  20: { kvMin: 6.9, kvMax: 9.3, hths: 2.6 },
  30: { kvMin: 9.3, kvMax: 12.5, hths: 2.9 },
  40: { kvMin: 12.5, kvMax: 16.3, hths: 3.7 },
  50: { kvMin: 16.3, kvMax: 21.9, hths: 3.7 },
  60: { kvMin: 21.9, kvMax: 26.1, hths: 3.7 },
};

export function parseGrade(text) {
  const m = /^\s*(\d{1,2})\s*w\s*-?\s*(\d{2})\s*$/i.exec(String(text ?? ''));
  if (!m) return null;
  const winter = Number(m[1]);
  const hot = Number(m[2]);
  if (!(winter in WINTER) || !(hot in HOT)) return null;
  return { winter, hot };
}

export const gradeLabel = ({ winter, hot }) => `${winter}W-${hot}`;
export const gradeSlug = ({ winter, hot }) => `${winter}w${hot}`;

export function gradeSpecs(grade) {
  const w = WINTER[grade.winter];
  const h = HOT[grade.hot];
  // J300: SAE 40 multigrades 0W-40, 5W-40 and 10W-40 have a lower HTHS minimum (3.5) than 15W-40 and up (3.7).
  const hths = grade.hot === 40 && grade.winter <= 10 ? 3.5 : h.hths;
  return { crankC: w.crank, pumpC: w.pump, kvMin: h.kvMin, kvMax: h.kvMax, hths };
}

// Compare two grades: which flows better cold, which is thicker hot.
export function compareGrades(a, b) {
  return {
    colder: a.winter === b.winter ? null : a.winter < b.winter ? gradeLabel(a) : gradeLabel(b),
    thicker: a.hot === b.hot ? null : a.hot > b.hot ? gradeLabel(a) : gradeLabel(b),
  };
}
