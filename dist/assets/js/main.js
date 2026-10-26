/* Dental Gert — interacciones generales. El contenido ya está en el HTML; esto solo anima y mejora. */
(() => {
  const $ = (s, c = document) => c.querySelector(s)
  const $$ = (s, c = document) => [...c.querySelectorAll(s)]
  const root = document.documentElement
  const I = JSON.parse($('#i18n').textContent)
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!motion) root.classList.add('no-motion')
  const store = { get: (k) => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} } }

  /* ---------- Analítica (solo si hay consentimiento) ---------- */
  window.dgTrack = (name, params = {}) => { if (window.gtag) window.gtag('event', name, params) }
  document.addEventListener('click', (e) => { const a = e.target.closest('[data-track]'); if (a) dgTrack(a.dataset.track) })
  $$('a[href^="https://wa.me"]').forEach((a) => a.addEventListener('click', () => { if (!a.dataset.track) dgTrack('whatsapp_click') }))

  /* ---------- Tema ---------- */
  $('.theme')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    store.set('dg-theme', next)
    if (window.gsap && motion) gsap.fromTo('.theme .ico:not([style*="none"])', { rotate: -90, scale: .6 }, { rotate: 0, scale: 1, duration: .6, ease: 'back.out(2)' })
  })

  /* ---------- Idioma (recuerda la elección, sin redirección automática) ---------- */
  $('.lang')?.addEventListener('click', (e) => { store.set('dg-lang', e.currentTarget.dataset.lang); if (location.hash) e.currentTarget.href += location.hash })

  /* ---------- Menú móvil ---------- */
  const burger = $('.burger'), mnav = $('#mnav')
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open)
    burger.setAttribute('aria-label', open ? burger.dataset.closeLabel : I.lang === 'es' ? 'Abrir menú' : 'Open menu')
    document.body.classList.toggle('menu-open', open)
    if (open) {
      mnav.hidden = false
      if (window.gsap && motion) gsap.from('#mnav li, #mnav .btn, #mnav .mnav-foot', { y: 30, opacity: 0, stagger: .06, duration: .7, ease: 'expo.out' })
      $('#mnav a')?.focus()
    } else mnav.hidden = true
  }
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'))
  mnav?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false) })
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus() } })

  /* ---------- Abierto ahora (horario de El Salvador, UTC-6) ---------- */
  const status = $('[data-open-status]')
  if (status) {
    const t = new Date(Date.now() - 6 * 3600e3), d = t.getUTCDay(), m = t.getUTCHours() * 60 + t.getUTCMinutes()
    const W = { 1: [[480, 720], [810, 990]], 2: [[480, 720], [810, 990]], 3: [[480, 720], [810, 990]], 4: [[480, 720], [810, 990]], 5: [[480, 720], [810, 990]], 6: [[480, 780]] }
    const fmt = (x) => { const h = Math.floor(x / 60), mm = String(x % 60).padStart(2, '0'); return `${h > 12 ? h - 12 : h}:${mm} ${h < 12 ? 'am' : h === 12 ? 'md' : 'pm'}` }
    const cur = (W[d] || []).find(([a, b]) => m >= a && m < b)
    const txt = $('[data-status-text]')
    if (cur) { status.classList.add('is-open'); txt.textContent = `${I.hero.open} · ${I.hero.closes} ${fmt(cur[1]).replace('md', I.lang === 'es' ? 'm. d.' : 'pm')}` }
    else {
      const next = (W[d] || []).find(([a]) => a > m)
      txt.textContent = next ? `${I.hero.closed} · ${I.hero.opens} ${fmt(next[0])}` : `${I.hero.closed} · ${txt.textContent.split('·').pop().trim()}`
    }
  }

  /* ---------- Pestañas (Misión / Visión / Compromiso) ---------- */
  const tabs = $$('[role="tab"]')
  const selectTab = (tab) => {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; $('#' + t.getAttribute('aria-controls')).hidden = !on })
    const p = $('#' + tab.getAttribute('aria-controls'))
    if (window.gsap && motion) gsap.fromTo(p, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' })
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t))
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
      if (k) { const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); selectTab(n) }
    })
  })

  /* ---------- Acordeones <details> animados (FAQ y pliegues del formulario) ---------- */
  window.dgFold = (det) => {
    const sum = $('summary', det), body = det.querySelector('.acc-body, .fold-body')
    sum.addEventListener('click', (e) => {
      if (!window.gsap || !motion || !body) return
      e.preventDefault()
      if (det.open) gsap.to(body, { height: 0, opacity: 0, duration: .4, ease: 'power3.inOut', onComplete: () => { det.open = false; gsap.set(body, { clearProps: 'all' }) } })
      else { det.open = true; gsap.from(body, { height: 0, opacity: 0, duration: .55, ease: 'expo.out', clearProps: 'all' }) }
    })
  }
  $$('details.acc-item, details.fold').forEach(dgFold)

  /* ---------- Mapa bajo demanda ---------- */
  $('.map-btn')?.addEventListener('click', (e) => {
    const box = e.currentTarget.parentElement
    box.innerHTML = '<iframe title="Mapa Dental Gert" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Dental%20Gert%20Colonia%20M%C3%A9dica%20San%20Salvador&output=embed"></iframe>'
  })

  /* ---------- Back to top + barra móvil ---------- */
  const top = $('.totop'), mbar = $('.mbar'), hero = $('.hero')
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight
    top.hidden = y < innerHeight * .8
    top.style.setProperty('--p', 1 - Math.min(1, y / Math.max(1, max)))
    if (mbar && hero) {
      const show = hero.getBoundingClientRect().bottom < 80 && !$('#contacto')?.contains(document.elementFromPoint(innerWidth / 2, innerHeight - 40))
      mbar.classList.toggle('show', show)
      mbar.setAttribute('aria-hidden', !show)
      $$('a', mbar).forEach((a) => (a.tabIndex = show ? 0 : -1))
      document.body.classList.toggle('mbar-on', show)
    }
  }
  addEventListener('scroll', () => { onScroll(); $('#hdr').classList.toggle('scrolled', scrollY > 40) }, { passive: true })
  onScroll()
  top.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' })
    $('.skip')?.focus({ preventScroll: true })
  })

  /* ---------- Cookies con consentimiento ---------- */
  const KEY = 'dg-consent'
  const banner = $('.cookie'), panel = $('.cookie-panel', banner)
  let loaded = false
  const gate = (c) => {
    if (c.analytics && I.ga4 && !loaded) {
      loaded = true
      const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + I.ga4; document.head.append(s)
      window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments) }
      gtag('js', new Date()); gtag('config', I.ga4, { anonymize_ip: true })
    }
  }
  const save = (analytics) => { const c = { v: 1, date: new Date().toISOString(), necessary: true, analytics }; store.set(KEY, JSON.stringify(c)); banner.hidden = true; gate(c) }
  let stored = null
  try { stored = JSON.parse(store.get(KEY)) } catch (e) {}
  if (stored) gate(stored); else banner.hidden = false
  banner.addEventListener('click', (e) => {
    const a = e.target.closest('[data-cookie]')?.dataset.cookie
    if (a === 'accept') save(true)
    if (a === 'reject') save(false)
    if (a === 'save') save($('[data-consent="analytics"]', banner).checked)
    if (a === 'config') { panel.hidden = false; $('[data-cookie="save"]').hidden = false; e.target.hidden = true }
  })
  $('[data-cookie-settings]')?.addEventListener('click', () => {
    banner.hidden = false; panel.hidden = false; $('[data-cookie="save"]').hidden = false; $('[data-cookie="config"]').hidden = true
    $('[data-consent="analytics"]', banner).checked = !!stored?.analytics
  })

  /* ---------- GSAP: entradas, iconos con trazo y botones magnéticos ---------- */
  const start = () => {
    if (!window.gsap || !window.ScrollTrigger) { root.classList.add('gsap-off'); return }
    gsap.registerPlugin(ScrollTrigger)
    if (!motion) { root.classList.add('gsap-off'); return }
    const draw = (els, vars = {}) => gsap.fromTo(els, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .05, ...vars })
    // Hero
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.from('.hero .eyebrow', { y: 20, opacity: 0, duration: .9 })
      .from('.hero h1', { y: 40, opacity: 0, duration: 1.2 }, '<.1')
      .from('.hero .tagline, .hero .lead, .hero .cta-row, .hero .trust', { y: 24, opacity: 0, duration: 1, stagger: .08 }, '<.2')
      .from('.hero-photo', { clipPath: 'inset(12% 0 12% 0 round 30px)', scale: 1.06, duration: 1.6 }, 0)
    draw('.hero .ico path', { delay: .4 })
    // Secciones
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      const paths = $$('.ico path, .ico circle', el)
      if (paths.length) ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => draw(paths, { delay: .2 }) })
    })
    gsap.from('.sec-head h2', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.sec-head', start: 'top 85%' } })
    // Hover: el icono se redibuja
    $$('.svc, .values li, .ct-list a, .opt, .btn, .icon-btn').forEach((el) => {
      el.addEventListener('mouseenter', () => { const p = $$('.ico path', el); if (p.length) draw(p, { duration: .7, stagger: .03 }) })
    })
    // Botones magnéticos (solo puntero fino)
    if (matchMedia('(pointer: fine)').matches) $$('.btn-lg, .pill-cta').forEach((b) => {
      const x = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' }), y = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' })
      b.addEventListener('mousemove', (e) => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .2); y((e.clientY - r.top - r.height / 2) * .3) })
      b.addEventListener('mouseleave', () => { x(0); y(0) })
    })
    // Header se compacta al bajar
    ScrollTrigger.create({ start: 80, onToggle: (s) => $('#hdr').style.setProperty('padding-top', s.isActive ? 'calc(8px + env(safe-area-inset-top))' : '') })
  }
  if (document.readyState === 'complete') start(); else addEventListener('load', start)
  setTimeout(() => { if (!window.gsap) root.classList.add('gsap-off') }, 4000)
})()
