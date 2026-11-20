import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_EMAIL, OWNER_LABEL, OWNER_COUNTRY } from '../data/site.js';

test('contact email is set', () => {
  assert.match(CONTACT_EMAIL, /^[^@\s]+@tallerpedia\.com$/);
});

test('owner data for legal pages', () => {
  assert.ok(OWNER_LABEL.trim().length > 2, 'Falta OWNER_LABEL');
  assert.equal(typeof OWNER_COUNTRY, 'string');
});
