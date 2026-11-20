// Structured-data helpers shared by pages. Framework-free and tested.

export const SITE = 'https://tallerpedia.com';
export const LAUNCH_DATE = '2026-11-20';

export const absolute = (path) => new URL(path, SITE).href;

export const publisher = () => ({
  '@type': 'Organization',
  name: 'Tallerpedia',
  url: SITE + '/',
  logo: { '@type': 'ImageObject', url: absolute('/logo.png'), width: 512, height: 512 },
});

export function article({ headline, description, url, reviewed, published = LAUNCH_DATE, about, citation }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    inLanguage: 'es',
    datePublished: published < reviewed ? published : reviewed,
    dateModified: reviewed,
    mainEntityOfPage: url,
    url,
    ...(about ? { about } : {}),
    author: { '@type': 'Organization', name: 'Equipo de Tallerpedia', url: absolute('/sobre-tallerpedia/') },
    publisher: publisher(),
    ...(citation ? { citation } : {}),
  };
}

export function faqPage(faq) {
  if (!faq?.length) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}
