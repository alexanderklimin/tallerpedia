import test from 'node:test';
import assert from 'node:assert/strict';
import { fmt, signed } from './format.js';

test('decimal comma, no grouping for 4 digits', () => {
  assert.equal(fmt(631.9, 0), '632');
  assert.equal(fmt(24.88, 2), '24,88');
  assert.equal(fmt(1985.2, 0), '1985');
  assert.equal(fmt(3, 1), '3');
});

test('signed', () => {
  assert.equal(signed(0.41), '+0,41');
  assert.equal(signed(-1.04), '−1,04');
  assert.equal(signed(0), '±0');
});
