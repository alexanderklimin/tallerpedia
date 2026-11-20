import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSize, sizeLabel, sizeSlug, dimensions, compare, equivalents } from './tires.js';

test('parses the ways people write a size', () => {
  const expected = { width: 205, aspect: 55, rim: 16 };
  for (const text of ['205/55R16', '205/55 R16', '205 55 r16', '205-55-r16', '205/55ZR16', ' 205 / 55 R 16 ']) {
    assert.deepEqual(parseSize(text), expected, text);
  }
  assert.equal(parseSize('205/55'), null);
  assert.equal(parseSize('31x10.5R15'), null);
  assert.equal(parseSize('999/55R16'), null);
});

test('labels and slugs', () => {
  const s = { width: 185, aspect: 65, rim: 15 };
  assert.equal(sizeLabel(s), '185/65 R15');
  assert.equal(sizeSlug(s), '185-65-r15');
});

test('dimensions of 205/55 R16 (hand-checked)', () => {
  const d = dimensions({ width: 205, aspect: 55, rim: 16 });
  assert.equal(d.sidewall, 112.8); // 205 × 0.55 = 112.75
  assert.equal(d.rimMm, 406.4);
  assert.equal(d.diameter, 631.9); // 406.4 + 225.5
  assert.equal(d.diameterIn, 24.88);
  assert.equal(d.circumference, 1985.2); // π × 631.9
  assert.equal(d.revsPerKm, 504);
});

test('comparison and speedometer', () => {
  const a = { width: 205, aspect: 55, rim: 16 };
  const b = { width: 195, aspect: 65, rim: 15 }; // 634.5 mm
  const c = compare(a, b);
  assert.equal(c.diffMm, 2.6);
  assert.equal(c.diffPct, 0.41);
  assert.equal(c.realAt100, 100.4);
  assert.equal(compare(a, a).diffPct, 0);
});

test('equivalents stay within tolerance, exclude the original, sorted by rim then closeness', () => {
  const catalog = [[205, 55, 16], [195, 65, 15], [225, 45, 17], [215, 45, 17], [205, 60, 16], [175, 65, 14], [225, 40, 18]];
  const list = equivalents({ width: 205, aspect: 55, rim: 16 }, catalog);
  const labels = list.map((e) => sizeLabel(e.size));
  assert.ok(!labels.includes('205/55 R16'));
  assert.ok(labels.includes('195/65 R15'));
  assert.ok(labels.includes('225/45 R17')); // 634.3 mm, +0.38 %
  assert.ok(!labels.includes('205/60 R16')); // +3.24 %
  assert.ok(!labels.includes('175/65 R14')); // rim too far and -11 %
  assert.ok(list.every((e) => Math.abs(e.diffPct) <= 3));
  const rims = list.map((e) => e.size.rim);
  assert.deepEqual(rims, [...rims].sort((x, y) => x - y));
  assert.equal(equivalents({ width: 205, aspect: 55, rim: 16 }, catalog, { tolerance: 0.3 }).length, 0);
  const limited = equivalents({ width: 205, aspect: 55, rim: 16 }, catalog, { perRim: 1 });
  assert.deepEqual(limited.map((e) => sizeLabel(e.size)), ['195/65 R15', '225/45 R17', '225/40 R18']);
});
