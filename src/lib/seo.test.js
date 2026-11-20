import test from 'node:test';
import assert from 'node:assert/strict';
import { article, absolute, publisher, faqPage } from './seo.js';

test('article has author, publisher logo and sane dates', () => {
  const a = article({ headline: 'H', description: 'D', url: absolute('/codigos-obd/p0420/'), reviewed: '2026-12-01' });
  assert.equal(a.datePublished, '2026-11-20');
  assert.equal(a.dateModified, '2026-12-01');
  assert.equal(a.publisher.logo.url, 'https://tallerpedia.com/logo.png');
  assert.equal(publisher().name, 'Tallerpedia');
});

test('faq page', () => {
  assert.equal(faqPage([]), undefined);
  const f = faqPage([{ q: '¿Q?', a: 'A.' }]);
  assert.equal(f.mainEntity[0].acceptedAnswer.text, 'A.');
});
