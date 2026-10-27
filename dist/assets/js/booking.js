/* Dental Gert — agenda en línea: servicio → fecha → hora → datos → confirmación. */
(() => {
  const $ = (s, c = document) => c.querySelector(s)
  const $$ = (s, c = document) => [...c.querySelectorAll(s)]
  const I = JSON.parse($('#i18n').textContent)
  const B = I.bk
  const L = I.lang === 'es' ? 'es-SV' : 'en-US'
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches
  const anim = () => window.gsap && motion
  const track = (n, p) => window.dgTrack?.(n, p)

  const hero = $('.hero'), panel = $('#agendar'), form = $('#bk-form'), done = $('.bk-done')
  const state = { service: '', date: '', time: '', month: '', slots: {}, cache: new Map(), ts: null }
  const pad = (n) => String(n).padStart(2, '0')
  const todaySV = () => new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10)
  const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10) }
  const addMonth = (m, n) => { const x = new Date(m + '-01T00:00:00Z'); x.setUTCMonth(x.getUTCMonth() + n); return x.toISOString().slice(0, 7) }
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const hhmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
  const nice = (t) => { const [h, m] = t.split(':').map(Number); const ap = h < 12 ? 'am' : 'pm'; return `${h % 12 || 12}:${pad(m)} ${ap}` }
  const dur = () => I.services[state.service || 'diagnostico'].min
  const endOf = (t) => hhmm(toMin(t) + dur())
  const longDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString(L, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  const FIRST = todaySV().slice(0, 7), LAST = addDays(todaySV(), 60).slice(0, 7)

  /* ---------- Abrir / cerrar el panel con revelación elegante ---------- */
  let opened = false
  function open(service) {
    if (service) pickService(service, true)
    if (!opened) {
      opened = true
      hero.dataset.booking = 'open'
      panel.dataset.state = 'open'
      renderCal()
      mountTurnstile()
      track('booking_open')
      if (anim()) {
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .fromTo(panel, { clipPath: 'inset(0 0 0 100% round 28px)', x: 40 }, { clipPath: 'inset(0 0 0 0% round 28px)', x: 0, duration: 1.1, clearProps: 'clipPath,transform' })
          .from($$('.bk-head, .bk-progress, #bk-form > *', panel), { y: 18, opacity: 0, stagger: .04, duration: .8, clearProps: 'all' }, '<.25')
        gsap.fromTo($$('.ico path', panel), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: .01, delay: .3, ease: 'power2.inOut' })
      }
    }
    const y = hero.getBoundingClientRect().top + scrollY
    if (innerWidth < 900) panel.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' })
    else if (Math.abs(scrollY - y) > 10) scrollTo({ top: y, behavior: motion ? 'smooth' : 'auto' })
    setTimeout(() => (state.service ? $('.cal-days button:not(:disabled)') : $('input[name="service"]'))?.focus({ preventScroll: true }), 500)
  }
  function close() {
    const finish = () => { opened = false; panel.dataset.state = 'closed'; delete hero.dataset.booking; $('[data-open-booking]', hero)?.focus() }
    if (anim()) gsap.to(panel, { clipPath: 'inset(0 0 0 100% round 28px)', duration: .6, ease: 'expo.in', onComplete: () => { gsap.set(panel, { clearProps: 'all' }); finish(); gsap.from('.hero-photo', { opacity: 0, scale: .97, duration: .8, ease: 'expo.out' }) } })
    else finish()
    if (location.hash === '#agendar') history.replaceState(null, '', location.pathname)
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-open-booking]')
    if (!a) return
    e.preventDefault()
    if (location.hash !== '#agendar') history.replaceState(null, '', '#agendar')
    open(a.dataset.service)
  })
  $('.bk-close').addEventListener('click', close)
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && opened && panel.contains(document.activeElement)) close() })
  if (location.hash === '#agendar') open()

  /* ---------- Progreso (etiquetas, sin números) ---------- */
  const progress = () => {
    const f = new FormData(form)
    const who = f.get('nombres') && f.get('apellidos') && f.get('telefono')
    ;[state.service, state.date, state.time, who].forEach((ok, i) => $(`.bk-progress [data-step="${i}"]`).classList.toggle('done', !!ok))
  }
  const setVal = (k, txt) => { const el = $(`[data-val="${k}"]`); el.textContent = txt || { service: B.servicePh, date: B.datePh, time: B.timePh }[k]; el.classList.toggle('set', !!txt) }
  const fold = (name, openIt) => { const d = $(`[data-fold="${name}"]`); if (d.open !== openIt) d.open = openIt }

  /* ---------- Servicio ---------- */
  function pickService(slug, fromCard) {
    const r = $(`input[name="service"][value="${slug}"]`)
    if (!r) return
    r.checked = true
    state.service = slug
    setVal('service', `${I.services[slug].name} · ${I.services[slug].min < 60 ? I.services[slug].min + ' min' : Math.floor(I.services[slug].min / 60) + ' h' + (I.services[slug].min % 60 ? ' ' + (I.services[slug].min % 60) + ' min' : '')}`)
    clearErr('service')
    fold('service', false)
    track('service_select', { service: slug })
    loadMonth(state.month || FIRST).then(() => {
      if (state.date && !(state.slots[state.date] || []).length) { state.date = ''; state.time = ''; setVal('date'); setVal('time') }
      renderCal()
      if (state.date) renderSlots()
    })
    progress()
  }
  form.addEventListener('change', (e) => { if (e.target.name === 'service') pickService(e.target.value) })

  /* ---------- Calendario ---------- */
  async function loadMonth(month) {
    const svc = state.service || 'diagnostico'
    const key = svc + '|' + month
    if (!state.cache.has(key)) {
      state.cache.set(key, fetch(`/api/availability?service=${svc}&month=${month}`).then((r) => (r.ok ? r.json() : Promise.reject(r))).then((j) => j.days).catch(() => { state.cache.delete(key); return null }))
    }
    const days = await state.cache.get(key)
    if (days) Object.assign(state.slots, days)
    return days
  }
  async function renderCal(month = state.month || FIRST) {
    state.month = month
    const grid = $('.cal-days'), hint = $('.cal-hint')
    $('.cal-month').textContent = new Date(month + '-15T12:00:00Z').toLocaleDateString(L, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    $('.cal-prev').disabled = month <= FIRST
    $('.cal-next').disabled = month >= LAST
    hint.textContent = B.loading
    const first = new Date(month + '-01T00:00:00Z'), offset = (first.getUTCDay() + 6) % 7
    const daysIn = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
    const paint = () => {
      let html = '<span></span>'.repeat(offset)
      for (let d = 1; d <= daysIn; d++) {
        const iso = `${month}-${pad(d)}`, ok = (state.slots[iso] || []).length > 0
        html += `<button type="button" data-date="${iso}" ${ok ? '' : 'disabled'} aria-pressed="${iso === state.date}" class="${iso === todaySV() ? 'today' : ''}" aria-label="${longDate(iso)}">${d}</button>`
      }
      grid.innerHTML = html
    }
    paint()
    const days = await loadMonth(month)
    if (state.month !== month) return
    paint()
    hint.textContent = days ? (state.service ? '' : (I.lang === 'es' ? 'Los puntos marcan días con horarios libres.' : 'Dots mark days with open times.')) : B.err.network
    if (anim()) gsap.from($$('button', grid), { opacity: 0, y: 6, duration: .4, stagger: .008, ease: 'power2.out' })
    if (month < LAST) loadMonth(addMonth(month, 1)) // precarga
  }
  $('.cal-prev').addEventListener('click', () => renderCal(addMonth(state.month, -1)))
  $('.cal-next').addEventListener('click', () => renderCal(addMonth(state.month, 1)))
  $('.cal-days').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-date]')
    if (!b || b.disabled) return
    state.date = b.dataset.date
    state.time = ''
    $$('.cal-days button').forEach((x) => x.setAttribute('aria-pressed', x === b))
    setVal('date', longDate(state.date))
    setVal('time')
    clearErr('date')
    track('date_select')
    renderSlots()
    fold('time', true)
    if (anim()) gsap.fromTo(b, { scale: .85 }, { scale: 1, duration: .5, ease: 'back.out(3)' })
    progress()
  })
  // Navegación con flechas en el calendario
  $('.cal-days').addEventListener('keydown', (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key]
    if (!k) return
    const all = $$('.cal-days button'), i = all.indexOf(document.activeElement)
    for (let j = i + k; j >= 0 && j < all.length; j += k) if (!all[j].disabled) { e.preventDefault(); all[j].focus(); break }
  })

  /* ---------- Horarios ---------- */
  function renderSlots() {
    const box = $('.slots')
    if (!state.date) { box.innerHTML = `<p class="muted">${B.pickDateFirst}</p>`; return }
    const list = state.slots[state.date] || []
    if (!list.length) { box.innerHTML = `<p class="muted">${B.noSlots}</p>`; return }
    const group = (name, items) => (items.length ? `<div class="slot-group"><p>${name}</p><div class="slot-list">${items.map((t) => `<button type="button" class="slot" data-time="${t}" aria-pressed="${t === state.time}">${nice(t)} – ${nice(endOf(t))}</button>`).join('')}</div></div>` : '')
    box.innerHTML = group(B.morning, list.filter((t) => t < '12:00')) + group(B.afternoon, list.filter((t) => t >= '12:00'))
    if (anim()) gsap.from($$('.slot', box), { opacity: 0, y: 8, duration: .35, stagger: .015, ease: 'power2.out' })
  }
  $('.slots').addEventListener('click', (e) => {
    const b = e.target.closest('.slot')
    if (!b) return
    state.time = b.dataset.time
    $$('.slot').forEach((x) => x.setAttribute('aria-pressed', x === b))
    setVal('time', `${nice(state.time)} – ${nice(endOf(state.time))}`)
    clearErr('time')
    track('slot_select')
    setTimeout(() => { fold('time', false); $('input[name="nombres"]').focus({ preventScroll: false }) }, 250)
    progress()
  })

  /* ---------- Residencia: nacional (DUI) / extranjero (pasaporte) ---------- */
  const tel = form.telefono, prefix = $('[data-prefix]')
  function residence() {
    const foreign = form.residencia.value === 'extranjero'
    $$('.only-foreign').forEach((el) => { el.hidden = !foreign; $$('input, select', el).forEach((i) => (i.disabled = !foreign)) })
    $$('.only-national').forEach((el) => { el.hidden = foreign; $$('input', el).forEach((i) => (i.disabled = foreign)) })
    tel.placeholder = foreign ? '555 123 4567' : '0000 0000'
    tel.autocomplete = foreign ? 'tel' : 'tel-national'
    prefix.textContent = foreign ? (form.pais.selectedOptions[0]?.dataset.dial || '+') : '+503'
    if (anim()) gsap.from($$('.only-foreign:not([hidden]), .only-national:not([hidden])'), { opacity: 0, y: 8, duration: .4, ease: 'power2.out' })
  }
  $$('input[name="residencia"]').forEach((r) => r.addEventListener('change', residence))
  form.pais.addEventListener('change', () => { prefix.textContent = form.pais.selectedOptions[0]?.dataset.dial || '+'; clearErr('pais') })

  /* ---------- Máscaras y contador ---------- */
  form.dui.addEventListener('input', () => { const d = form.dui.value.replace(/\D/g, '').slice(0, 9); form.dui.value = d.length > 8 ? `${d.slice(0, 8)}-${d.slice(8)}` : d })
  tel.addEventListener('input', () => { if (form.residencia.value !== 'extranjero') { const d = tel.value.replace(/\D/g, '').slice(0, 8); tel.value = d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d } })
  form.motivo.addEventListener('input', () => { $('.count').textContent = `${form.motivo.value.length}/100` })
  form.addEventListener('input', (e) => { if (e.target.name) clearErr(e.target.name); progress(); saveDraft() })

  /* ---------- Validación (espejo de lib/validate.js) ---------- */
  const validDUI = (v) => { const m = /^(\d{8})-?(\d)$/.exec(v.trim()); if (!m) return false; const s = [...m[1]].reduce((a, d, i) => a + d * (9 - i), 0); return (10 - (s % 10)) % 10 === +m[2] }
  function setErr(name, msg) {
    const el = $(`[data-err="${name}"]`)
    if (el) el.textContent = msg
    const input = form.elements[name]
    if (input && input.setAttribute) input.setAttribute('aria-invalid', 'true')
  }
  function clearErr(name) { const el = $(`[data-err="${name}"]`); if (el) el.textContent = ''; const i = form.elements[name]; if (i && i.removeAttribute) i.removeAttribute('aria-invalid') }
  function payload() {
    const foreign = form.residencia.value === 'extranjero'
    const dial = form.pais.selectedOptions[0]?.dataset.dial || ''
    const raw = tel.value.trim()
    return {
      service: state.service, date: state.date, time: state.time, residencia: form.residencia.value,
      nombres: form.nombres.value, apellidos: form.apellidos.value,
      telefono: foreign ? (raw.startsWith('+') ? raw : dial + raw.replace(/^0+/, '')) : raw,
      dui: foreign ? '' : form.dui.value, pasaporte: foreign ? form.pasaporte.value : '', pais: foreign ? form.pais.value : '',
      correo: form.correo.value, motivo: form.motivo.value, consentimiento: form.consentimiento.checked, lang: I.lang,
    }
  }
  function validate(p) {
    const e = {}
    if (!p.service) e.service = B.err.service
    if (!p.date) e.date = B.err.date
    if (!p.time) e.time = B.err.time
    if (p.nombres.trim().length < 2) e.nombres = B.err.nombres
    if (p.apellidos.trim().length < 2) e.apellidos = B.err.apellidos
    if (p.residencia === 'extranjero') {
      if (!p.pais) e.pais = B.err.pais
      if (!/^\+[1-9]\d{6,14}$/.test(p.telefono.replace(/[\s()-]/g, ''))) e.telefono = B.err.telefonoIntl
      if (!/^[A-Za-z0-9]{5,20}$/.test(p.pasaporte.trim())) e.pasaporte = B.err.pasaporte
    } else {
      if (!/^[267]\d{7}$/.test(p.telefono.replace(/\D/g, ''))) e.telefono = B.err.telefono
      if (!validDUI(p.dui)) e.dui = B.err.dui
    }
    if (p.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.correo.trim())) e.correo = B.err.correo
    if (!p.consentimiento) e.consentimiento = B.err.consentimiento
    return e
  }
  function showErrors(e) {
    Object.entries(e).forEach(([k, v]) => setErr(k, v))
    const first = Object.keys(e)[0]
    if (first === 'service') fold('service', true)
    if (first === 'time') fold('time', true)
    const target = first === 'date' ? $('.cal') : first === 'service' ? $('[data-fold="service"]') : first === 'time' ? $('[data-fold="time"]') : form.elements[first]
    target?.scrollIntoView?.({ behavior: motion ? 'smooth' : 'auto', block: 'center' })
    if (target?.focus && form.elements[first]) setTimeout(() => form.elements[first].focus?.({ preventScroll: true }), 300)
    if (anim()) gsap.fromTo('.bk-submit', { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' })
  }

  /* ---------- Turnstile (antispam invisible) ---------- */
  function mountTurnstile() {
    const go = () => { if (state.ts === null && window.turnstile) state.ts = turnstile.render('#ts', { sitekey: I.turnstile, size: 'flexible', appearance: 'interaction-only', language: I.lang, 'error-callback': () => true }) } // sin token el servidor responde 403 y se muestra B.err.captcha
    if (window.turnstile) go(); else { const iv = setInterval(() => { if (window.turnstile) { clearInterval(iv); go() } }, 300); setTimeout(() => clearInterval(iv), 15000) }
  }
  const tsToken = () => (window.turnstile && state.ts !== null ? turnstile.getResponse(state.ts) : '')

  /* ---------- Envío ---------- */
  const msg = $('.bk-msg'), btn = $('.bk-submit')
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    msg.textContent = ''
    const p = payload()
    const e = validate(p)
    if (Object.keys(e).length) return showErrors(e)
    btn.setAttribute('aria-busy', 'true')
    $('span', btn).textContent = B.sending
    track('booking_submit', { service: p.service })
    try {
      const r = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...p, turnstile: tsToken() }) })
      const j = await r.json().catch(() => ({}))
      if (r.status === 201) return success(j.booking, p)
      if (r.status === 409) {
        state.slots[state.date] = j.slots || []
        state.cache.clear()
        state.time = ''
        setVal('time')
        renderSlots()
        fold('time', true)
        msg.textContent = B.err.slot_taken
        track('booking_conflict')
        $('[data-fold="time"]').scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'center' })
      } else if (r.status === 400 && j.errors) {
        showErrors(Object.fromEntries(Object.keys(j.errors).map((k) => [k, B.err[k] || B.err.server])))
      } else msg.textContent = j.error === 'captcha' ? B.err.captcha : B.err.server
    } catch (err) {
      msg.textContent = B.err.network
    } finally {
      btn.removeAttribute('aria-busy')
      $('span', btn).textContent = B.submit
      if (window.turnstile && state.ts !== null) turnstile.reset(state.ts)
    }
  })

  /* ---------- Confirmación ---------- */
  function success(b, p) {
    track('booking_success', { service: b.service })
    clearDraft()
    const svc = I.services[b.service].name
    $('.done-summary').innerHTML = `<b>${svc}</b><br>${longDate(b.date)} · ${nice(b.time)} – ${nice(b.end)}`
    $('.done-code').textContent = `${B.done.code}: ${b.id}`
    $('.done-mail').hidden = !b.correo
    const stamp = (d, t) => d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00'
    const details = `${svc} — Dental Gert\nColonia Médica, San Salvador\nWhatsApp: +503 7739 0440\n${B.done.code}: ${b.id}`
    $('[data-gcal]').href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(svc + ' · Dental Gert')}&dates=${stamp(b.date, b.time)}/${stamp(b.date, b.end)}&ctz=America/El_Salvador&details=${encodeURIComponent(details)}&location=${encodeURIComponent('Dental Gert, Colonia Médica, San Salvador')}`
    $('[data-ics]').onclick = () => {
      const utc = (d, t) => new Date(`${d}T${t}:00-06:00`).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dental Gert//Agenda//ES', 'BEGIN:VEVENT', `UID:${b.id}@dentalgert`, `DTSTAMP:${utc(todaySV(), '00:00')}`, `DTSTART:${utc(b.date, b.time)}`, `DTEND:${utc(b.date, b.end)}`, `SUMMARY:${svc} · Dental Gert`, 'LOCATION:Dental Gert\\, Colonia Médica\\, San Salvador', `DESCRIPTION:${details.replace(/\n/g, '\\n')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: `dental-gert-${b.date}.ics` })
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    }
    const show = () => { form.hidden = true; $('.bk-progress').hidden = true; done.hidden = false; done.focus() }
    if (anim()) {
      gsap.to(form, { opacity: 0, y: -10, duration: .35, onComplete: () => {
        show()
        gsap.set(form, { clearProps: 'all' })
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .from('.done-mark', { scale: 0, duration: .8, ease: 'back.out(2)' })
          .fromTo('.done-mark path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .7, ease: 'power2.out' }, '<.2')
          .from('.bk-done > *:not(.done-mark)', { y: 14, opacity: 0, stagger: .06, duration: .7 }, '<.1')
      } })
    } else show()
    state.cache.clear()
  }
  $('[data-again]').addEventListener('click', () => {
    done.hidden = true; form.hidden = false; $('.bk-progress').hidden = false
    state.date = ''; state.time = ''; setVal('date'); setVal('time'); state.slots = {}
    renderCal(); renderSlots(); progress()
    form.motivo.value = ''; $('.count').textContent = '0/100'
  })

  /* ---------- Borrador en sessionStorage (no se pierde al recargar) ---------- */
  const DRAFT = 'dg-draft', KEEP = ['residencia', 'nombres', 'apellidos', 'telefono', 'pais', 'correo', 'motivo']
  function saveDraft() { try { sessionStorage.setItem(DRAFT, JSON.stringify(Object.fromEntries(KEEP.map((k) => [k, form.elements[k].value])))) } catch (e) {} }
  function clearDraft() { try { sessionStorage.removeItem(DRAFT) } catch (e) {} }
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT) || 'null')
    if (d) {
      if (d.residencia === 'extranjero') $('input[name="residencia"][value="extranjero"]').checked = true
      KEEP.filter((k) => k !== 'residencia').forEach((k) => { if (d[k]) form.elements[k].value = d[k] })
      $('.count').textContent = `${form.motivo.value.length}/100`
    }
  } catch (e) {}
  residence()
  progress()
})()
