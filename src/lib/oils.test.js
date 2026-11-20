import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGrade, gradeLabel, gradeSlug, gradeSpecs, compareGrades } from './oils.js';

test('parses grades as people write them', () => {
  for (const t of ['5w30', '5W-30', '5w-30', '5 w 30', ' 5W30 ']) assert.deepEqual(parseGrade(t), { winter: 5, hot: 30 }, t);
  assert.equal(parseGrade('7w30'), null);
  assert.equal(parseGrade('5w35'), null);
  assert.equal(parseGrade('sae 30'), null);
});

test('labels', () => {
  assert.equal(gradeLabel({ winter: 10, hot: 40 }), '10W-40');
  assert.equal(gradeSlug({ winter: 10, hot: 40 }), '10w40');
});

test('specs follow SAE J300', () => {
  assert.deepEqual(gradeSpecs({ winter: 5, hot: 30 }), { crankC: -30, pumpC: -35, kvMin: 9.3, kvMax: 12.5, hths: 2.9 });
  assert.equal(gradeSpecs({ winter: 10, hot: 40 }).hths, 3.5);
  assert.equal(gradeSpecs({ winter: 15, hot: 40 }).hths, 3.7);
  assert.equal(gradeSpecs({ winter: 20, hot: 50 }).crankC, -15);
});

test('compare', () => {
  assert.deepEqual(compareGrades({ winter: 5, hot: 30 }, { winter: 10, hot: 40 }), { colder: '5W-30', thicker: '10W-40' });
  assert.deepEqual(compareGrades({ winter: 5, hot: 30 }, { winter: 5, hot: 30 }), { colder: null, thicker: null });
});
