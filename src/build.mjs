// Genera dist/ a partir de src/content.mjs. Uso: node src/build.mjs
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE, BRAND, HOURS, SERVICES, COUNTRIES, T, LEGAL, duration } from './content.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const out = (p, s) => { const f = join(DIST, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, s) }
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist'

/* ---------- Iconos (trazo con pathLength=1 para animarlo con GSAP) ---------- */
const P = (d) => `<path d="${d}" pathLength="1"/>`
const ICONS = {
  tooth: P('M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-3.5 2.5-5.5c.4-.9 1.6-.9 2 0 .9 2 1 5.5 2.5 5.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z'),
  search: P('M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-3.5 2.5-5.5') + P('M15.5 9.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z') + P('m18 16 3.5 3.5'),
  sparkle: P('M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-3.5 2.5-5.5c.4-.9 1.6-.9 2 0 .9 2 1 5.5 2.5 5.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z') + P('M16 6.5v3M14.5 8h3'),
  fill: P('M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-3.5 2.5-5.5c.4-.9 1.6-.9 2 0 .9 2 1 5.5 2.5 5.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z') + P('M9.5 8.5c1-.8 4-.8 5 0'),
  root: P('M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-3.5 2.5-5.5c.4-.9 1.6-.9 2 0 .9 2 1 5.5 2.5 5.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z') + P('M10 9v5.5M14 9v5.5'),
  extract: P('M8 9c-2 0-3 1.5-3 3.2 0 2 1 3 1.4 5 .3 1.8.7 3.8 1.7 3.8s1.1-2 1.7-3.4c.3-.6 1.1-.6 1.4 0 .6 1.4.7 3.4 1.7 3.4s1.4-2 1.7-3.8c.4-2 1.4-3 1.4-5C16 10.5 15 9 13 9c-1.4 0-2 .6-2.5.6S9.4 9 8 9Z') + P('M10.5 6V2M7.5 4l3-2 3 2'),
  wisdom: P('M4 6c0-1.7 1.3-3 3-3 1.6 0 2.4.8 5 .8s3.4-.8 5-.8c1.7 0 3 1.3 3 3 0 4-2 5-2.5 9-.3 2.6-.8 6-2.3 6-1.4 0-1.5-3.5-2.4-5.5-.3-.7-1.3-.7-1.6 0C9.3 17.5 9.2 21 7.8 21c-1.5 0-2-3.4-2.3-6C5 11 4 10 4 6Z') + P('M8 7.5h8'),
  shine: P('M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-3.5 2.5-5.5c.4-.9 1.6-.9 2 0 .9 2 1 5.5 2.5 5.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z') + P('M20 1v3M18.5 2.5h3M2 13l-1 1'),
  heart: P('M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z'),
  user: P('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z') + P('M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5'),
  shield: P('M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z') + P('m8.8 12.2 2.2 2.2 4.3-4.6'),
  family: P('M8 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z') + P('M3.5 20c.6-4 2.4-6.5 4.5-6.5s3.9 2.5 4.5 6.5M13 20c.4-3 1.8-5 3.5-5s3.1 2 3.5 5'),
  wa: P('M4 20.5 5.3 16A8.5 8.5 0 1 1 8.4 19Z') + P('M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.8-2.2-1-1 1c-1.2-.5-2.3-1.6-2.8-2.8l1-1-1-2.2Z'),
  phone: P('M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z'),
  mail: P('M3.5 6h17v12h-17Z') + P('m3.5 6.5 8.5 7 8.5-7'),
  pin: P('M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z') + P('M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'),
  clock: P('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z') + P('M12 7v5l3.5 2'),
  fb: P('M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6.5H14V14h2.5l.5-3.5h-3V8.5c0-.3.2-.5.5-.5Z'),
  ig: P('M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z') + P('M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z') + P('M17 6.8v.1'),
  arrow: P('M5 12h14M13 6l6 6-6 6'),
  up: P('M12 19V5M6 11l6-6 6 6'),
  chev: P('m6 9 6 6 6-6'),
  close: P('M6 6l12 12M18 6 6 18'),
  sun: P('M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z') + P('M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4'),
  moon: P('M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z'),
  cal: P('M4 6h16v14H4Z') + P('M4 10h16M8 3.5v4M16 3.5v4'),
  check: P('m5 12.5 4.5 4.5L19 7.5'),
  globe: P('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z') + P('M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z'),
}
const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`

/* ---------- Imágenes: usa la foto real si existe, si no un marcador SVG ---------- */
const IMG = join(DIST, 'assets/img')
function photo(base, label) {
  for (const ext of ['avif', 'webp', 'jpg', 'jpeg', 'png']) if (existsSync(join(IMG, `${base}.${ext}`))) return `/assets/img/${base}.${ext}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EDF4FC"/><stop offset="1" stop-color="#C9DDF6"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><g transform="translate(340 220) scale(5)" fill="none" stroke="#2974DE" stroke-width="1" opacity=".55"><path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-3.5 2.5-5.5c.4-.9 1.6-.9 2 0 .9 2 1 5.5 2.5 5.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z"/></g><text x="400" y="430" text-anchor="middle" font-family="Arial" font-size="22" fill="#1F5FBF" opacity=".7">TODO: foto ${esc(label)}</text></svg>`
  out(`assets/img/placeholder/${base.replace(/\//g, '-')}.svg`, svg)
  return `/assets/img/placeholder/${base.replace(/\//g, '-')}.svg`
}
const hasLogo = existsSync(join(IMG, 'logo-dental-gert.svg')) || existsSync(join(IMG, 'logo-dental-gert.png'))
const logoSrc = existsSync(join(IMG, 'logo-dental-gert.svg')) ? '/assets/img/logo-dental-gert.svg' : '/assets/img/logo-dental-gert.png'
const logoDark = existsSync(join(IMG, 'logo-dental-gert-blanco.svg')) ? '/assets/img/logo-dental-gert-blanco.svg' : existsSync(join(IMG, 'logo-dental-gert-blanco.png')) ? '/assets/img/logo-dental-gert-blanco.png' : logoSrc
const brandMark = (big = false) => hasLogo
  ? `<img class="logo logo-l" src="${logoSrc}" alt="Dental Gert" width="${big ? 121 : 101}" height="${big ? 48 : 40}"><img class="logo logo-d" src="${logoDark}" alt="" aria-hidden="true" width="${big ? 121 : 101}" height="${big ? 48 : 40}">`
  : `<span class="wordmark">${icon('tooth')}<span>Dental <b>Gert</b></span></span>` // TODO: reemplazar por el logo (assets/img/logo-dental-gert.svg)

/* ---------- Datos estructurados ---------- */
const DAY = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday' }
function schema(t) {
  const dentist = {
    '@context': 'https://schema.org', '@type': 'Dentist', '@id': SITE + '/#clinic', name: BRAND.name, slogan: BRAND.tagline[t.lang],
    url: SITE + t.path, telephone: BRAND.phone, email: BRAND.email, image: SITE + photo('hero', 'hero'), logo: SITE + (hasLogo ? logoSrc : '/assets/img/isotipo-dental-gert.png'),
    address: { '@type': 'PostalAddress', streetAddress: BRAND.address.street, addressLocality: BRAND.address.city, addressRegion: BRAND.address.region, addressCountry: BRAND.address.country },
    hasMap: BRAND.maps, areaServed: 'San Salvador', priceRange: '$$', // TODO: confirmar rango de precios
    sameAs: [BRAND.fb, BRAND.ig], knowsLanguage: ['es', 'en'], paymentAccepted: 'Cash, Credit Card, Debit Card', currenciesAccepted: 'USD',
    employee: { '@type': 'Person', name: 'Dr. ' + BRAND.dentist.name, jobTitle: t.about.doctor.role, identifier: { '@type': 'PropertyValue', propertyID: 'JVPM', value: BRAND.dentist.jvpm } },
    openingHoursSpecification: HOURS.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => 'https://schema.org/' + DAY[d]), opens: h.open, closes: h.close })),
    availableService: SERVICES.map((s) => ({ '@type': 'MedicalProcedure', name: s[t.lang].name, description: s[t.lang].desc })),
    potentialAction: { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: SITE + t.path + '#agendar', inLanguage: t.hreflang }, result: { '@type': 'Reservation', name: t.cta } },
  }
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  const site = { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND.name, url: SITE + '/', inLanguage: t.hreflang, publisher: { '@id': SITE + '/#clinic' } }
  return [dentist, faq, site]
}

/* ---------- Layout ---------- */
function layout(t, { path, title, desc, body, schemas = [], alt, noindex = false, home = false }) {
  if (title.length > 60) console.warn('title>60', path, title.length)
  if (desc.length > 155) console.warn('desc>155', path, desc.length)
  const canon = SITE + path
  const i18n = { lang: t.lang, bk: t.bk, hero: t.hero, cookies: t.cookies, services: Object.fromEntries(SERVICES.map((s) => [s.slug, { name: s[t.lang].name, min: s.min }])), wa: BRAND.wa, ga4: BRAND.ga4, turnstile: BRAND.turnstileSiteKey }
  const navLinks = t.nav.map(([h, l]) => `<li><a href="${home ? '' : t.path}${h}">${l}</a></li>`).join('')
  return `<!doctype html>
<html lang="${t.lang === 'es' ? 'es-SV' : 'en'}" data-theme="light" translate="no">
<head>
<meta charset="utf-8">
<meta name="google" content="notranslate">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>(function(){try{var t=localStorage.getItem('dg-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.classList.add('js')}catch(e){}})()</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
${alt ? `<link rel="alternate" hreflang="es-SV" href="${SITE + alt.es}"><link rel="alternate" hreflang="en" href="${SITE + alt.en}"><link rel="alternate" hreflang="x-default" href="${SITE + alt.es}">` : ''}
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta name="theme-color" content="#EDF4FC" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0A1424" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website"><meta property="og:site_name" content="${BRAND.name}"><meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canon}">
<meta property="og:image" content="${SITE}/assets/img/og-dental-gert.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/main.css">
${home ? `<link rel="preload" as="image" href="${photo('hero', 'hero')}">` : ''}
${[...schemas].map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
<script id="i18n" type="application/json">${JSON.stringify(i18n).replace(/</g, '\\u003c')}</script>
</head>
<body class="${home ? 'is-home' : 'is-page'}">
<a class="skip" href="#main">${t.skip}</a>
<header class="hdr" id="hdr">
  <a class="brand" href="${t.path}" aria-label="Dental Gert">${brandMark()}</a>
  <nav class="pill" aria-label="${t.lang === 'es' ? 'Principal' : 'Main'}">
    <ul>${navLinks}<li><a class="pill-cta" href="${home ? '' : t.path}#agendar" data-open-booking>${t.cta}</a></li></ul>
  </nav>
  <div class="tools">
    <a class="lang" href="${t.other}" hreflang="${t.lang === 'es' ? 'en' : 'es'}" lang="${t.lang === 'es' ? 'en' : 'es'}" aria-label="${t.langSwitch}" data-lang="${t.lang === 'es' ? 'en' : 'es'}">${icon('globe')}<span>${t.otherLabel}</span></a>
    <button class="icon-btn theme" type="button" aria-label="${t.theme}">${icon('sun', 'i-sun')}${icon('moon', 'i-moon')}</button>
    <button class="icon-btn burger" type="button" aria-label="${t.menuOpen}" data-close-label="${t.menuClose}" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
</header>
<div class="mnav" id="mnav" hidden>
  <ul>${navLinks}</ul>
  <a class="btn btn-primary" href="${home ? '' : t.path}#agendar" data-open-booking>${t.cta}${icon('arrow')}</a>
  <div class="mnav-foot"><a href="${BRAND.wa}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a><a href="tel:${BRAND.phone}">${icon('phone')} ${BRAND.phoneDisplay}</a></div>
</div>
<main id="main">
${body}
</main>
<footer class="ftr">
  <div class="wrap ftr-grid">
    <div class="ftr-brand"><a class="brand" href="${t.path}" aria-label="Dental Gert">${brandMark(true)}</a><p>${BRAND.tagline[t.lang]}.</p></div>
    <ul class="ftr-links">${t.nav.map(([h, l]) => `<li><a href="${home ? '' : t.path}${h}">${l}</a></li>`).join('')}<li><a href="${home ? '' : t.path}#preguntas">${t.faq.label}</a></li></ul>
    <ul class="ftr-links"><li><a href="${t.legalPaths.privacy}">${t.footer.privacy}</a></li><li><a href="${t.legalPaths.cookies}">${t.footer.cookies}</a></li><li><button type="button" class="linklike" data-cookie-settings>${t.footer.cookieSettings}</button></li></ul>
    <div class="ftr-social"><a href="${BRAND.fb}" target="_blank" rel="noopener" aria-label="Facebook">${icon('fb')}</a><a href="${BRAND.ig}" target="_blank" rel="noopener" aria-label="Instagram">${icon('ig')}</a><a href="${BRAND.wa}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa')}</a></div>
  </div>
  <div class="wrap ftr-base"><small>© ${new Date().getFullYear()} Dental Gert. ${t.footer.rights}</small><small><a href="https://rem-agency-website.netlify.app" rel="noopener" target="_blank">${t.footer.by}</a></small></div>
</footer>
${home ? `<div class="mbar" aria-hidden="true"><a class="btn btn-primary" href="#agendar" data-open-booking tabindex="-1">${icon('cal')}${t.cta}</a><a class="btn btn-wa" href="${BRAND.wa}" target="_blank" rel="noopener" tabindex="-1" data-track="whatsapp_click">${icon('wa')}<span class="sr-only">WhatsApp</span></a></div>` : ''}
<button class="totop" type="button" aria-label="${t.totop}" hidden><svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" pathLength="1"/></svg>${icon('up')}</button>
<div class="cookie" role="dialog" aria-live="polite" aria-label="Cookies" hidden>
  <p>${t.cookies.text} <a href="${t.legalPaths.cookies}">${t.cookies.policy}</a></p>
  <div class="cookie-panel" hidden>
    <label class="switch"><input type="checkbox" checked disabled><span><b>${t.cookies.necessary}</b><small>${t.cookies.necessaryD}</small></span></label>
    <label class="switch"><input type="checkbox" data-consent="analytics"><span><b>${t.cookies.analytics}</b><small>${t.cookies.analyticsD}</small></span></label>
  </div>
  <div class="cookie-actions"><button class="btn btn-ghost btn-sm" type="button" data-cookie="config">${t.cookies.config}</button><button class="btn btn-ghost btn-sm" type="button" data-cookie="reject">${t.cookies.reject}</button><button class="btn btn-ghost btn-sm" type="button" data-cookie="save" hidden>${t.cookies.save}</button><button class="btn btn-primary btn-sm" type="button" data-cookie="accept">${t.cookies.accept}</button></div>
</div>
${BRAND.cfBeacon ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${BRAND.cfBeacon}"}'></script>` : ''}
<script defer src="${GSAP}/gsap.min.js"></script>
<script defer src="${GSAP}/ScrollTrigger.min.js"></script>
<script defer src="/assets/js/main.js"></script>
${home ? '<script defer src="/assets/js/booking.js"></script><script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>' : ''}
</body>
</html>
`
}

/* ---------- Formulario de agenda ---------- */
function bookingForm(t) {
  const b = t.bk
  const svc = SERVICES.map((s) => `<label class="opt"><input type="radio" name="service" value="${s.slug}" required><span class="opt-ico">${icon(s.icon)}</span><span class="opt-name">${s[t.lang].name}</span><span class="opt-dur">${duration(s.min)}</span></label>`).join('')
  const countries = COUNTRIES.map(([c, d, es, en]) => `<option value="${c}" data-dial="${d}">${t.lang === 'es' ? es : en} (${d})</option>`).join('')
  return `<section class="booking" id="agendar" aria-labelledby="bk-title" data-state="closed">
  <div class="bk-inner">
  <div class="bk-head">
    <h2 id="bk-title" class="bk-title">${b.title}</h2>
    <button type="button" class="icon-btn bk-close" aria-label="${b.close}">${icon('close')}</button>
  </div>
  <ol class="bk-progress" aria-hidden="true">${b.steps.map((s, i) => `<li data-step="${i}">${s}</li>`).join('')}</ol>
  <noscript><p class="bk-noscript">${b.noscript} <a href="${BRAND.wa}">WhatsApp</a></p></noscript>
  <form id="bk-form" novalidate>
    <details class="fold" data-fold="service" open>
      <summary><span class="fold-label">${icon('tooth')}${b.service}</span><span class="fold-val" data-val="service">${b.servicePh}</span>${icon('chev', 'fold-chev')}</summary>
      <div class="fold-body"><div class="opts" role="radiogroup" aria-label="${b.service}">${svc}</div></div>
    </details>
    <p class="field-err" data-err="service"></p>
    <fieldset class="cal" aria-describedby="cal-hint">
      <legend class="fold-label">${icon('cal')}${b.date} <span class="fold-val" data-val="date">${b.datePh}</span></legend>
      <div class="cal-head"><button type="button" class="icon-btn cal-prev" aria-label="${b.prev}">${icon('arrow')}</button><p class="cal-month" aria-live="polite"></p><button type="button" class="icon-btn cal-next" aria-label="${b.next}">${icon('arrow')}</button></div>
      <div class="cal-grid" role="grid"><div class="cal-wd" role="row">${b.weekdays.map((d) => `<span role="columnheader">${d}</span>`).join('')}</div><div class="cal-days"></div></div>
      <p class="cal-hint" id="cal-hint"></p>
    </fieldset>
    <p class="field-err" data-err="date"></p>
    <details class="fold" data-fold="time">
      <summary><span class="fold-label">${icon('clock')}${b.time}</span><span class="fold-val" data-val="time">${b.timePh}</span>${icon('chev', 'fold-chev')}</summary>
      <div class="fold-body"><div class="slots" aria-live="polite"><p class="muted">${b.pickDateFirst}</p></div></div>
    </details>
    <p class="field-err" data-err="time"></p>
    <fieldset class="who">
      <legend class="fold-label">${icon('user')}${b.steps[3]}</legend>
      <div class="seg" role="radiogroup" aria-label="${b.residence}">
        <label><input type="radio" name="residencia" value="nacional" checked><span>${b.national}</span></label>
        <label><input type="radio" name="residencia" value="extranjero"><span>${b.foreign}</span></label>
      </div>
      <div class="grid2">
        <label class="fld"><span>${b.nombres}</span><input name="nombres" autocomplete="given-name" required maxlength="60"><em class="field-err" data-err="nombres"></em></label>
        <label class="fld"><span>${b.apellidos}</span><input name="apellidos" autocomplete="family-name" required maxlength="60"><em class="field-err" data-err="apellidos"></em></label>
        <label class="fld only-foreign" hidden><span>${b.pais}</span><select name="pais" disabled required><option value="">${b.paisPh}</option>${countries}</select><em class="field-err" data-err="pais"></em></label>
        <label class="fld"><span>${b.telefono}</span><span class="tel"><span class="tel-prefix" data-prefix>+503</span><input name="telefono" type="tel" inputmode="tel" autocomplete="tel-national" required placeholder="0000 0000" maxlength="20"></span><em class="field-err" data-err="telefono"></em></label>
        <label class="fld only-national"><span translate="no">${b.dui}</span><input name="dui" inputmode="numeric" required placeholder="${b.duiPh}" maxlength="10"><em class="field-err" data-err="dui"></em></label>
        <label class="fld only-foreign" hidden><span>${b.pasaporte}</span><input name="pasaporte" required disabled maxlength="20" autocapitalize="characters"><em class="field-err" data-err="pasaporte"></em></label>
        <label class="fld span2"><span>${b.correo} <small>(${b.optional})</small></span><input name="correo" type="email" autocomplete="email" maxlength="120"><small class="hint">${b.correoHint}</small><em class="field-err" data-err="correo"></em></label>
        <label class="fld span2"><span>${b.motivo} <small>(${b.optional})</small></span><textarea name="motivo" rows="2" maxlength="100"></textarea><small class="hint"><span>${b.motivoHint}</span><span class="count" aria-live="polite">0/100</span></small></label>
      </div>
      <label class="check"><input type="checkbox" name="consentimiento" required><span>${b.consent}</span></label>
      <em class="field-err" data-err="consentimiento"></em>
    </fieldset>
    <div class="ts" id="ts"></div>
    <button class="btn btn-primary btn-block bk-submit" type="submit"><span>${b.submit}</span>${icon('arrow')}</button>
    <p class="bk-msg" role="alert"></p>
  </form>
  <div class="bk-done" hidden tabindex="-1">
    <span class="done-mark">${icon('check')}</span>
    <h3>${b.done.title}</h3>
    <p class="done-summary"></p>
    <p class="done-code"></p>
    <p class="done-mail muted" hidden>${b.done.mailNote}</p>
    <div class="done-actions"><a class="btn btn-primary btn-sm" data-gcal target="_blank" rel="noopener">${icon('cal')}${b.done.gcal}</a><button class="btn btn-ghost btn-sm" type="button" data-ics>${b.done.ics}</button><a class="btn btn-ghost btn-sm" href="${BRAND.wa}" target="_blank" rel="noopener">${icon('wa')}${b.done.wa}</a></div>
    <p class="muted small">${b.done.change}</p>
    <button type="button" class="linklike" data-again>${b.done.again}</button>
  </div>
  </div>
</section>`
}

/* ---------- Página principal ---------- */
function home(t) {
  const h = t.hero
  const body = `
<section class="hero" id="inicio">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow"><span class="dot-live" data-open-status></span><span data-status-text>${h.eyebrow}</span></p>
      <h1>${h.h1}</h1>
      <p class="tagline">${BRAND.tagline[t.lang]}</p>
      <p class="lead">${h.lead}</p>
      <div class="cta-row">
        <a class="btn btn-primary btn-lg" href="#agendar" data-open-booking>${icon('cal')}<span>${t.cta}</span></a>
        <a class="btn btn-ghost btn-lg" href="${BRAND.wa}" target="_blank" rel="noopener" data-track="whatsapp_click">${icon('wa')}<span>${h.wa}</span></a>
      </div>
      <ul class="trust">${h.trust.map((x, i) => `<li>${icon(['clock', 'family', 'shield'][i])}${x}</li>`).join('')}</ul>
    </div>
    <div class="hero-stage">
      <figure class="hero-photo"><img src="${photo('hero', 'hero')}" alt="${h.photoAlt}" width="800" height="1000" fetchpriority="high"><figcaption><span>${icon('pin')}Colonia Médica</span><span>${icon('phone')}${BRAND.phoneDisplay}</span></figcaption></figure>
      ${bookingForm(t)}
    </div>
  </div>
</section>

<section class="sec services" id="servicios" aria-labelledby="svc-h">
  <div class="wrap">
    <header class="sec-head"><p class="label">${t.services.label}</p><h2 id="svc-h">${t.services.h2}</h2><p class="lead">${t.services.lead}</p></header>
    <div class="svc-grid">
      ${SERVICES.map((s, i) => `<article class="svc${i === 0 ? ' svc-feature' : ''}" data-reveal>
        <figure class="svc-img"><img src="${photo('servicios/' + s.slug, s[t.lang].name)}" alt="${esc(s[t.lang].alt)}" loading="lazy" width="800" height="600"></figure>
        <div class="svc-body">
          <span class="svc-ico">${icon(s.icon)}</span>
          <h3>${s[t.lang].name}</h3>
          <p>${s[t.lang].desc}</p>
          <div class="svc-foot"><span class="chip" title="${t.services.duration}">${icon('clock')}${duration(s.min)}</span><a class="svc-link" href="#agendar" data-open-booking data-service="${s.slug}">${t.services.book}${icon('arrow')}</a></div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="sec about" id="quienes-somos" aria-labelledby="about-h">
  <div class="wrap about-grid">
    <div class="about-copy" data-reveal>
      <p class="label">${t.about.label}</p>
      <h2 id="about-h">${t.about.h2}</h2>
      ${t.about.body.map((p) => `<p>${p}</p>`).join('')}
      <div class="doctor"><span class="doctor-ico">${icon('user')}</span><div><b>Dr. ${BRAND.dentist.name}</b><span>${t.about.doctor.role} · <abbr translate="no" title="Junta de Vigilancia de la Profesión Médica">${t.about.doctor.jvpm}</abbr> ${BRAND.dentist.jvpm}</span></div></div>
      <p class="signature">Dental Gert — ${BRAND.tagline[t.lang]}.</p>
    </div>
    <div class="about-side" data-reveal>
      <div class="tabs" role="tablist" aria-label="${t.about.label}">${t.about.tabs.map(([n], i) => `<button role="tab" id="tab-${i}" aria-controls="tp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${n}</button>`).join('')}</div>
      ${t.about.tabs.map(([, txt], i) => `<div class="tabpanel" role="tabpanel" id="tp-${i}" aria-labelledby="tab-${i}"${i ? ' hidden' : ''}><p>${txt}</p></div>`).join('')}
      <ul class="values">${t.about.values.map(([ic, n, d]) => `<li>${icon(ic)}<div><b>${n}</b><span>${d}</span></div></li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="sec faq" id="preguntas" aria-labelledby="faq-h">
  <div class="wrap faq-grid">
    <header class="sec-head" data-reveal><p class="label">${t.faq.label}</p><h2 id="faq-h">${t.faq.h2}</h2><a class="btn btn-ghost" href="${BRAND.wa}" target="_blank" rel="noopener">${icon('wa')}${t.hero.wa}</a></header>
    <div class="acc">${t.faq.items.map(([q, a]) => `<details class="acc-item" data-reveal><summary><h3>${q}</h3><span class="acc-ico" aria-hidden="true"></span></summary><div class="acc-body"><p>${a}</p></div></details>`).join('')}</div>
  </div>
</section>

<section class="sec contact" id="contacto" aria-labelledby="ct-h">
  <div class="wrap contact-grid">
    <div data-reveal>
      <p class="label">${t.contact.label}</p>
      <h2 id="ct-h">${t.contact.h2}</h2>
      <p class="lead">${t.contact.lead}</p>
      <ul class="ct-list">
        <li><a href="${BRAND.wa}" target="_blank" rel="noopener" data-track="whatsapp_click">${icon('wa')}<span><small>${t.contact.wa}</small>${BRAND.phoneDisplay}</span></a></li>
        <li><a href="tel:${BRAND.phone}" data-track="phone_click">${icon('phone')}<span><small>${t.contact.phone}</small>+503 ${BRAND.phoneDisplay}</span></a></li>
        <li><a href="mailto:${BRAND.email}">${icon('mail')}<span><small>${t.contact.email}</small>${BRAND.email}</span></a></li>
        <li><a href="${BRAND.maps}" target="_blank" rel="noopener">${icon('pin')}<span><small>${t.contact.address}</small>${t.contact.addressText}</span></a></li>
      </ul>
      <p class="social-row"><span>${t.contact.social}</span><a href="${BRAND.fb}" target="_blank" rel="noopener" aria-label="Facebook">${icon('fb')}</a><a href="${BRAND.ig}" target="_blank" rel="noopener" aria-label="Instagram">${icon('ig')}</a></p>
    </div>
    <div class="ct-side" data-reveal>
      <div class="hours-card"><p class="fold-label">${icon('clock')}${t.contact.hours}</p><dl>${t.contact.hoursRows.map(([d, hh]) => `<div><dt>${d}</dt><dd>${hh}</dd></div>`).join('')}</dl></div>
      <div class="map" data-map>
        <button type="button" class="map-btn">${icon('pin')}<span>${t.contact.map}</span><small>${t.contact.mapNote}</small></button>
      </div>
      <a class="btn btn-primary btn-block" href="#agendar" data-open-booking>${icon('cal')}${t.cta}</a>
    </div>
  </div>
</section>`
  return layout(t, { path: t.path, title: t.title, desc: t.desc, body, schemas: schema(t), alt: { es: '/', en: '/en/' }, home: true })
}

function legalPage(t, kind) {
  const L = LEGAL[kind][t.lang]
  const other = LEGAL[kind][t.lang === 'es' ? 'en' : 'es']
  const tt = { ...t, other: other.path }
  const body = `<section class="sec legal"><div class="wrap narrow"><p class="label"><a href="${t.path}">← Dental Gert</a></p><h1>${L.h1}</h1>${L.html}<p class="muted small">${t.lang === 'es' ? 'Última actualización' : 'Last updated'}: 2026-10-26</p></div></section>`
  return layout(tt, { path: L.path, title: L.title, desc: `${L.h1} — Dental Gert, Colonia Médica, San Salvador.`, body, alt: { es: LEGAL[kind].es.path, en: LEGAL[kind].en.path } })
}

/* ---------- Salida ---------- */
for (const t of Object.values(T)) {
  out(t.path + 'index.html', home(t))
  for (const k of Object.keys(LEGAL)) out(LEGAL[k][t.lang].path + 'index.html', legalPage(t, k))
}

out('404.html', layout(T.es, { path: '/404', title: 'Página no encontrada | Dental Gert', desc: 'La página que buscas no existe.', noindex: true,
  body: `<section class="sec legal"><div class="wrap narrow"><h1>Esta página no existe</h1><p>Vuelve al inicio para agendar tu cita.</p><p><a class="btn btn-primary" href="/#agendar">${icon('cal')}${T.es.cta}</a></p></div></section>` }))

const urls = [['/', '/en/'], [LEGAL.privacy.es.path, LEGAL.privacy.en.path], [LEGAL.cookies.es.path, LEGAL.cookies.en.path]]
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.flatMap(([es, en]) => [es, en].map((u) => `<url><loc>${SITE + u}</loc><xhtml:link rel="alternate" hreflang="es-SV" href="${SITE + es}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE + en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE + es}"/></url>`)).join('\n')}
</urlset>
`)
out('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`)
out('llms.txt', `# Dental Gert

> Clínica dental en Colonia Médica, San Salvador, El Salvador. ${BRAND.tagline.es}. Entre 6 y 10 años de atención odontológica integral y personalizada para toda la familia. Atiende pacientes nacionales y extranjeros (español e inglés).

## Agendar
- Agenda en línea con confirmación inmediata: ${SITE}/#agendar
- WhatsApp: +503 ${BRAND.phoneDisplay} (${BRAND.wa})
- Correo: ${BRAND.email}

## Servicios y duración aproximada por cita
${SERVICES.map((s) => `- ${s.es.name} (${duration(s.min)}): ${s.es.desc}`).join('\n')}

## Odontólogo responsable
- Dr. ${BRAND.dentist.name} (JVPM ${BRAND.dentist.jvpm})

## Formas de pago
- Efectivo y tarjeta de crédito o débito (POS) en la clínica. Agendar en línea no tiene costo.

## Horario
- Lunes a viernes: 8:00 a. m. – 12:00 m. d. y 1:30 p. m. – 4:30 p. m.
- Sábados: 8:00 a. m. – 1:00 p. m.
- Domingos: cerrado

## Ubicación
- ${BRAND.address.street}, ${BRAND.address.city}, El Salvador
- Google Maps: ${BRAND.maps}

## Redes
- Facebook: ${BRAND.fb}
- Instagram: ${BRAND.ig}

## English
- ${SITE}/en/
`)
out('site.webmanifest', JSON.stringify({ name: 'Dental Gert', short_name: 'Dental Gert', start_url: '/', display: 'browser', background_color: '#EDF4FC', theme_color: '#2974DE', icons: [{ src: '/assets/img/favicon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2))
if (!existsSync(join(IMG, 'og-dental-gert.png'))) console.warn('TODO: falta assets/img/og-dental-gert.png (1200x630)')
out('_headers', `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://challenges.cloudflare.com https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com https://www.google.com; base-uri 'self'; form-action 'self'

/assets/*
  Cache-Control: public, max-age=86400
`)
console.log('Build OK →', DIST)
