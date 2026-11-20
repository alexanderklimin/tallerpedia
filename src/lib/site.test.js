import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_EMAIL, OWNER_NAME, OWNER_COUNTRY } from '../data/site.js';

test('contact email is set', () => {
  assert.match(CONTACT_EMAIL, /^[^@\s]+@tallerpedia\.com$/);
});

test('owner data for legal pages', () => {
  assert.ok(OWNER_NAME.trim().length > 2, 'Falta OWNER_NAME');
  assert.equal(typeof OWNER_COUNTRY, 'string');
});
