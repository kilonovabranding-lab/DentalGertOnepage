# PRD · Dental Gert — one page de agendamiento

> Documento de requisitos. Fecha: 2026-10-26. Elaborado por REM Agency.

## Contexto
REM Agency necesita una one page sobria para **Dental Gert** (clínica dental, Colonia Médica, San Salvador) cuyo objetivo principal es **conseguir más solicitudes de cita**: que el paciente agende dentro de la misma página, sin salir a WhatsApp ni llamar, y que cada reserva quede automáticamente en Google Calendar, Gmail y Google Sheets de la clínica, con respaldo para REM Agency.

Entregables: (1) `docs/PRD.md` en un repo nuevo hermano `dental-gert-website/`, con el contenido de la sección PRD de este plan; (2) el sitio construido y desplegable en Cloudflare.

### Decisiones confirmadas con el usuario
- PRD y luego yo lo construyo, en un repo nuevo. El usuario sube el logo y las fotos; mientras tanto se usan marcadores con `TODO`.
- Integraciones con Google mediante **Composio** (el usuario ya tiene la key). Hosting en **Cloudflare**.
- Cita **confirmada al instante**.
- Extranjero: se oculta el DUI y pasa a ser obligatorio el **pasaporte**, con país y prefijo internacional.
- Reglas estándar: mínimo 2 h de anticipación, máximo 60 días hacia adelante, inicios cada 15 min, sin cruzar el almuerzo ni la hora de cierre.
- La disponibilidad **lee Google Calendar**, así que los eventos manuales de la clínica también bloquean horarios.
- **Una cita a la vez** (un sillón).
- Sheets agrupados **por mes de la cita**.
- Nacional o residente: **campos obligatorios** (Nombres, Apellidos, Género, Fecha de nacimiento, Teléfono, DUI) + casilla de consentimiento obligatoria.
- Correo opcional; sin correo, la confirmación ofrece "Añadir a Google Calendar" y ".ics".
- Barra móvil fija "Agenda tu cita | WhatsApp" activada.
- Tipografía: solo **Manrope**.
- Hosting: **Cloudflare Pages** en `dental-gert.pages.dev` (sin dominio propio por ahora; `SITE_URL` configurable). Un Worker aparte, pequeño, solo para las tareas programadas.
- Composio: un único usuario `pg-test-8dbf7e88-4793-4c73-80f7-ba474b8ff67d` (proyecto "Dental") con 8 conexiones activas: Calendar ×1, Drive ×2, Sheets ×2 y Gmail ×3. Cada llamada usa un `connected_account_id` explícito.
- Explicar cada paso de despliegue en español sencillo (el usuario no es programador avanzado).
- Analítica: **GA4** (solo con consentimiento) + **Cloudflare Web Analytics** (sin cookies). Sin Meta Pixel.
- Cambios y cancelaciones **por WhatsApp**: la clínica edita el evento en Calendar y la web libera el horario.

---


### Objetivo y métricas
- **North star:** citas confirmadas por semana desde la web.
- KPIs: visitas → apertura del formulario → envío → éxito (embudo por paso: servicio, fecha, hora, datos); clics a WhatsApp y teléfono; tasa de error 409 (hora tomada); LCP < 2,5 s en móvil.
- Público: familias y adultos de San Salvador (principalmente móvil, por Instagram y Facebook) y pacientes extranjeros (visión de la marca).

### Principios de diseño (que no parezca hecho por IA)
- Sobrio clínico-editorial: fotografía real, mucho aire, layout asimétrico, sin gradientes morados, sin emojis, sin cuadrículas genéricas de 3 tarjetas con íconos ni brillos "glass" en todas partes (el blur solo va en la barra de menú).
- **Sin numeración** visible (nada de 01/02, ni "Paso 1"). El progreso del formulario usa etiquetas: *Servicio · Fecha · Hora · Tus datos*.
- Paleta: `--dg-blue #2974DE` (primario, CTA), `--dg-ice #EDF4FC` (fondo claro y superficies), `--dg-teal #40E0D0` **solo en detalles mínimos** (punto de "abierto ahora", check de éxito, anillo del back to top). Texto pequeño sobre `#EDF4FC` en `#1F5FBF` para cumplir AA (con `#2974DE` el contraste es de ~4,1:1). Blanco sobre `#2974DE` = 4,5:1, válido.
- Modo oscuro: fondo `#0A1424`, superficies `#111E33`, texto `#EDF4FC`, primario aclarado a `#5B95E8`. El tema se guarda en `localStorage` y se aplica con un script inline en `<head>` para evitar parpadeo (mismo patrón que REM).
- Tipografía: **Manrope** para todo (pesos 300/500/700; títulos grandes en 300 con tracking negativo para el aire premium).
- Íconos SVG en línea con `pathLength=1` y trazo dibujado con GSAP al entrar al viewport y en hover. Respetar `prefers-reduced-motion`.

### Arquitectura de la página (orden)
1. **Header:** píldora de navegación **centrada** y fija con `backdrop-filter: blur`, con solo *Servicios · Quiénes somos · Contáctanos · Agenda tu cita* (este último como botón primario). Logo a la izquierda; selector **ES/EN** y botón de tema a la derecha. En móvil: logo + hamburguesa; el panel muestra los 4 enlaces, el idioma y el tema, con animación escalonada de GSAP.
2. **Hero (premium) + formulario de agenda (al principio de la página).**
   - Izquierda: etiqueta "Clínica dental · Colonia Médica, San Salvador", `<h1>` con la palabra clave ("Tu clínica dental en Colonia Médica, San Salvador"), el lema *El mejor aliado de tu sonrisa*, CTA **Agenda tu cita** y CTA secundario WhatsApp. Indicador vivo "Abierto ahora · cierra 12:00 md" (calculado con el horario y la zona `America/El_Salvador`) y "Más de 6 años cuidando sonrisas".
   - Derecha: foto principal. Al hacer clic en *Agenda tu cita* (en el hero, el menú o una tarjeta de servicio), la foto se desplaza y el **panel del formulario aparece a la derecha** con una revelación elegante (GSAP: `clip-path` inset de derecha a izquierda, luego campos escalonados y el foco al primer control). En móvil, el panel se despliega bajo el CTA a ancho completo.
   - `/#agendar` abre el panel directamente (enlace para la bio de Instagram). Sin JS, el formulario se ve abierto (mejora progresiva).
3. **Servicios (`#servicios`):** 7 tarjetas con foto, nombre, descripción breve, chip de duración y el enlace "Agendar este servicio", que abre el formulario con el servicio preseleccionado. Grid editorial (una tarjeta destacada y el resto en mosaico); en móvil, carrusel con scroll-snap. Hover: zoom suave de la foto y trazo del ícono.
4. **Quiénes somos (`#quienes-somos`):** el texto provisto, con *Misión / Visión / Compromiso* como pestañas interactivas (sin números) y los distintivos (trato amable, atención individualizada, materiales de calidad, para toda la familia) con íconos animados. `TODO`: foto del equipo y nombre y credenciales del odontólogo (refuerza E-E-A-T y GEO).
5. **Preguntas frecuentes (`#preguntas`):** acordeón accesible con GSAP y esquema `FAQPage`. Preguntas: cómo agendo, cómo cambio o cancelo (por WhatsApp), si atienden dolor o urgencias, qué llevar a la primera cita, si atienden niños, si atienden extranjeros, formas de pago (`TODO`), parqueo (`TODO`) y cuánto dura cada servicio.
6. **Contáctanos (`#contacto`):** botón WhatsApp → `https://wa.me/50377390440?text=Hola%20Dental%20Gert%2C%20quisiera%20Agendar%20mi%20cita%20por%20whatsapp`, teléfono `tel:+50377390440` (7739 0440), correo dentalgert@gmail.com, dirección con enlace a https://maps.app.goo.gl/cWwQeTvxu6N4whk6A (el mapa embebido carga solo tras un clic o consentimiento), tabla de horarios y redes (Facebook e Instagram).
7. **Footer:** logo, lema, enlaces legales (Privacidad, Cookies, "Configurar cookies"), © y "Sitio por REM Agency".
- **Flotantes:** botón **Back to Top** abajo a la derecha (aparece tras el primer viewport, con anillo de progreso de scroll). En móvil, barra fija inferior "Agenda tu cita | WhatsApp" que aparece al salir del hero; el back to top se apila encima.
- **Cookies:** banner con categorías necesarias y analítica. GA4 (ID `TODO`) se carga solo tras el consentimiento; Cloudflare Web Analytics no usa cookies y carga siempre. Se reutiliza el patrón `gate()` de REM.

### Formulario de agendamiento
Orden y comportamiento:
- **Servicio** (obligatorio), lista **plegable**: Diagnóstico 25 min · Limpieza dental 25 min · Relleno dental 40 min · Endodoncia 1 h · Extracción dental 30 min · Cirugía de cordales 1 h 15 min · Blanqueamiento dental 1 h 15 min.
- **Fecha** (obligatoria): **calendario mensual siempre visible** dentro del panel. Los domingos, los días sin cupo y los que quedan fuera de la ventana de 60 días aparecen deshabilitados; cada día con cupo lleva un punto discreto.
- **Hora** (obligatoria): lista **plegable** agrupada en *Mañana / Tarde*, con rango inicio–fin según la duración del servicio ("8:15 – 8:40"). Se recalcula al cambiar el servicio y solo muestra horas libres.
- **Residencia:** selector segmentado *Salvadoreño o residente* / *Extranjero*.
  - Nacional o residente: **Nombres\*, Apellidos\*, Teléfono\*** (+503 fijo, 8 dígitos que empiezan con 2, 6 o 7, con máscara `7739-0440`) y **DUI\*** (máscara `00000000-0`, validando el dígito verificador).
  - Extranjero: se oculta el DUI; **Nombres\*, Apellidos\*, País\*, Teléfono\*** internacional (prefijo según país, E.164) y **Pasaporte\*** (alfanumérico, 5 a 20 caracteres).
- **Correo** (opcional), con la ayuda "Recibe tu confirmación y la invitación a tu Google Calendar".
- **Motivo de la cita** (opcional, `maxlength=100`, con contador visible).
- Casilla de **consentimiento de datos** (obligatoria por ley, ya que se recoge el DUI) y **Cloudflare Turnstile** invisible como antispam.
- Botón **Confirmar mi cita**. Validación en vivo con mensajes humanos en ES/EN; el borrador se guarda en `sessionStorage`.
- **Éxito:** check animado (en teal), resumen de la cita, botones "Añadir a Google Calendar" (enlace `calendar.google.com/calendar/render?action=TEMPLATE…`), "Descargar .ics" y "Escribir por WhatsApp", más un texto sobre cambios o cancelaciones por WhatsApp.
- **Error 409 (hora tomada):** se conservan los datos, se reabre el selector de hora con los cupos actualizados y se muestra el mensaje "Esa hora acaba de reservarse, elige otra".

### Reglas de disponibilidad
- Horario: lunes a viernes de 8:00 a 12:00 y de 13:30 a 16:30; sábado de 8:00 a 13:00; domingo cerrado. Zona `America/El_Salvador` (UTC−6, sin horario de verano).
- Un slot es válido si `inicio ≥ ahora + 2 h`, la fecha está dentro de los 60 días, `[inicio, inicio + duración]` cabe completo dentro de un bloque laboral y no se cruza con ningún evento ocupado de Google Calendar ni con reservas web.
- Inicios cada 15 min; `BUFFER_MIN = 0` configurable. **Una cita a la vez** (un sillón, confirmado).
- Feriados y vacaciones: la clínica los marca como eventos de día completo "ocupado" en su Calendar, y además existe la lista `CLOSED_DATES` en la configuración.

### Automatizaciones (Composio)
- Las cuentas se conectan en Composio por OAuth: la entidad **dentalgert** (Gmail, Google Calendar, Google Sheets, Google Drive) y la entidad **remagency** (Google Sheets, Google Drive). La key vive solo como secreto del Worker.
- En cada reserva confirmada:
  1. Evento en el Calendar de dentalgert@gmail.com con el título "Limpieza dental: Nombre Apellido", la descripción con teléfono, documento, motivo e ID, y el **paciente como invitado** (`sendUpdates=all`) cuando dejó correo, para que la cita aparezca en su Google Calendar. Sin correo, el paciente usa el botón "Añadir a Google Calendar" o el .ics.
  2. Correo de aviso a **dentalgert@gmail.com** con todos los datos y botones de WhatsApp y llamada al paciente.
  3. Correo de confirmación al paciente (si dejó correo), en su idioma.
  4. Fila añadida al **Sheet del mes** en el Drive de dentalgert **y** en el de remagencysv, en tiempo real.
- **Sheets mensuales:** archivo "Dental Gert · Citas · Noviembre 2026" dentro de la carpeta "Dental Gert / Citas" de cada Drive, agrupado **por mes de la cita**. Como se reserva hasta 60 días adelante, el archivo de un mes futuro se crea con su primera reserva. Si la clínica cancela una cita en Calendar, la reconciliación actualiza la columna Estado. Columnas: Registro, ID, Fecha cita, Inicio, Fin, Servicio, Duración, Nombres, Apellidos, Teléfono, Residencia, DUI, Pasaporte, País, Correo, Motivo, Idioma, Estado, ID evento, Género, Fecha de nacimiento (al final para no mover la columna Estado).
- **Cierre mensual** (cron el día 1 a las 00:05 hora de El Salvador): exporta el Sheet del mes anterior a .xlsx y lo envía por correo a **remagencysv@gmail.com** como adjunto y enlace, y deja creados los archivos del nuevo mes.

### SEO y GEO
- URL inicial `dental-gert.pages.dev` (todas las URL absolutas salen de `SITE_URL`, así un dominio propio futuro es un cambio de una línea).
- Rutas `/` (es-SV) y `/en/` con `hreflang` (es-SV, en, x-default). El selector de idioma enlaza entre ambas y recuerda la preferencia, sin redirección automática.
- JSON-LD: `Dentist` (nombre, dirección en Colonia Médica, `geo`, teléfono +503 7739 0440, `openingHoursSpecification`, `sameAs` de Facebook e Instagram, `availableService` con un `MedicalProcedure` por servicio, logo), `WebSite` y `FAQPage`.
- Un `<h1>` por página, HTML semántico, todo el contenido en el HTML inicial (el JS solo anima). Títulos ≤ 60 y descripciones ≤ 155 caracteres. Imágenes AVIF/WebP con `width/height`, la imagen LCP precargada y GSAP diferido.
- `sitemap.xml` con alternates, `robots.txt`, `llms.txt` con un resumen factual de la clínica (servicios, duraciones, horario, ubicación, contacto) y Open Graph por idioma.

### Privacidad y seguridad
- El DUI y el pasaporte son datos sensibles: se transmiten solo por HTTPS, no se envían a GA ni al Pixel, y en D1 se **purgan los datos personales** a los 30 días de la cita (se conserva solo la ocupación). El registro permanente queda en los Sheets.
- Páginas `/privacidad/` y `/cookies/` (ES y EN), con noindex en lo que corresponda. Encabezados CSP y de seguridad en `_headers`. Rate limiting en `/api/*` y Turnstile en el POST.

### Analítica (solo con consentimiento)
Eventos de GA4 `booking_open`, `service_select`, `date_select`, `slot_select`, `booking_submit`, `booking_success` (conversión), `booking_conflict`, `whatsapp_click` y `phone_click`. Cloudflare Web Analytics cubre las visitas y Core Web Vitals sin consentimiento.

### Fuera de alcance (v1)
Cancelación o reprogramación autoservicio (se hace por WhatsApp), pagos en línea, varios dentistas o sillones, Meta Pixel, dominio propio y recordatorios por SMS o WhatsApp. Google Calendar ya envía recordatorios a los invitados.

---

## Arquitectura técnica (Cloudflare Pages + Worker de cron)
**Cloudflare Pages** sirve `dist/` y atiende `/api/*` con **Pages Functions**, enlazadas a **D1**. Como Pages no tiene cron, un **Worker aparte (`dental-gert-cron`)** con Cron Triggers usa la misma base D1 y el mismo código de `lib/`.

```
dental-gert-website/
  AGENTS.md  README.md  docs/PRD.md  package.json  .gitignore (.dev.vars, node_modules, .wrangler)
  wrangler.toml          # Pages: pages_build_output_dir = "dist", binding D1 "DB", vars
  .dev.vars              # SOLO local, ignorado por git: COMPOSIO_API_KEY, TURNSTILE_SECRET
  src/content.mjs        # textos ES/EN, servicios, horarios, FAQ, marca (fuente de verdad)
  src/build.mjs          # genera dist/index.html, dist/en/index.html, legales, sitemap, robots, llms.txt
  dist/assets/{css/main.css, js/main.js, js/booking.js, img/}  # se editan directo
  dist/_headers
  functions/api/availability.js  # GET
  functions/api/bookings.js      # POST
  functions/api/_middleware.js   # rate limit, JSON, errores
  lib/config.js          # SERVICES (slug, min), HOURS, CLOSED_DATES, TZ, reglas
  lib/slots.js           # motor de disponibilidad PURO (sin I/O) → testeable
  lib/validate.js        # esquema del POST, DUI (dígito verificador), teléfonos
  lib/composio.js        # fetch a POST https://backend.composio.dev/api/v3/tools/execute/{slug} con user_id + connected_account_id
  lib/google.js          # freeBusy, createEvent, appendRow, ensureMonthSheet, exportXlsx, sendMail
  lib/outbox.js          # tareas pendientes y reintentos
  cron/index.js  cron/wrangler.toml  # Worker "dental-gert-cron": scheduled() → cierre mensual, reintentos, reconciliación, purga
  scripts/composio-discover.mjs      # SOLO LECTURA: identifica el correo de cada connected_account
  migrations/0001_init.sql
  test/slots.test.mjs  test/validate.test.mjs  test/booking-race.test.mjs
```

**API**
- `GET /api/availability?service=limpieza&month=2026-11` → `{ days: { "2026-11-03": ["08:00","08:15",…] } }`. Calcula horario laboral − freeBusy de Google (una llamada a Composio por mes) − bloques en D1, con caché de 60 s (Cache API). El calendario se pinta con un solo request y cambiar de día es instantáneo.
- `POST /api/bookings` → verifica Turnstile → valida → recalcula el slot → en un **batch transaccional de D1** inserta `bookings` + `booking_blocks` (bloques de 5 min con `UNIQUE(date, block)`). Si viola la restricción, responde **409** con los cupos frescos. Si inserta, responde **201** de inmediato y las tareas de Google corren en `ctx.waitUntil`, registradas en la tabla `outbox`.
- **Anti-duplicados:** la restricción `UNIQUE` de D1 garantiza que dos envíos simultáneos al mismo horario no puedan ganar ambos, y el freeBusy evita choques con citas tomadas por otros canales.
- **Cron** (Worker `dental-gert-cron`): `*/15 * * * *` reintenta las tareas fallidas del `outbox` y reconcilia (si la clínica borró o canceló el evento en Calendar, marca la reserva como cancelada, libera los bloques y actualiza el Estado en los Sheets). `5 6 1 * *` (00:05 en El Salvador del día 1) hace el cierre mensual. `0 9 * * *` purga los datos personales vencidos.
- **Secretos** (`wrangler pages secret put` y `wrangler secret put` en el Worker de cron): `COMPOSIO_API_KEY` y `TURNSTILE_SECRET`. La key **nunca** va en el código, en el plan ni en git; en local vive en `.dev.vars`.
- **Variables** (no secretas): `COMPOSIO_USER_ID=pg-test-8dbf7e88-4793-4c73-80f7-ba474b8ff67d`, `CA_GMAIL_DENTAL`, `CA_CALENDAR_DENTAL`, `CA_SHEETS_DENTAL`, `CA_DRIVE_DENTAL`, `CA_SHEETS_REM`, `CA_DRIVE_REM`, `CALENDAR_ID=primary`, `TZ=America/El_Salvador` y `SITE_URL`.
- Los slugs de Composio (`GOOGLECALENDAR_CREATE_EVENT`, `GOOGLECALENDAR_FREE_BUSY_QUERY`, `GOOGLECALENDAR_EVENTS_LIST`, `GMAIL_SEND_EMAIL`, `GOOGLESHEETS_CREATE_GOOGLE_SHEET1`, `GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND`, exportación de Drive) se **verifican contra el catálogo** antes de codificar. Si `GMAIL_SEND_EMAIL` no admite adjuntos, el cierre mensual envía el enlace al Sheet ya compartido y el .xlsx queda en el Drive de REM.

