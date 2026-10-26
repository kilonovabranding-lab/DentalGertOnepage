# AGENTS.md

One page de Dental Gert con agenda en línea. Cloudflare Pages + Pages Functions + D1; Google (Calendar, Gmail, Sheets, Drive) vía Composio. Requisitos en `docs/PRD.md`.

- **Contenido:** `src/content.mjs` (ES/EN) → `node src/build.mjs` genera los HTML de `dist/`. Nunca edites los HTML de `dist/` a mano; CSS/JS en `dist/assets/` sí se editan directo.
- **Reglas de agenda:** `lib/config.js` (duraciones, horario, 2 h de anticipación, 60 días, inicios cada 15 min). El motor `lib/slots.js` es puro y tiene tests (`npm test`).
- **API:** `functions/api/availability.js` (GET) y `functions/api/bookings.js` (POST). La tabla `booking_blocks` con PRIMARY KEY (date, block) impide reservas duplicadas. Las tareas de Google van por `outbox` con reintentos.
- **Cron:** Pages no tiene cron; `cron/` es un Worker aparte (reintentos + reconciliación cada 15 min, cierre mensual, purga de datos personales). Comparte `lib/` y la D1.
- **Composio:** un solo `user_id`; cada llamada usa un `connected_account_id` explícito (`CA_*` en `wrangler.toml`). Verifica conexiones con `npm run composio:discover`. La key solo vive en `.dev.vars` (ignorado) y en los secretos de Cloudflare.
- **Convenciones:** español (El Salvador); `TODO` para datos pendientes; un `<h1>` por página; contenido en el HTML inicial (GEO), JS solo anima; iconos SVG con `pathLength=1`; sin numerar secciones; `#40E0D0` solo en detalles mínimos; tema con `html[data-theme]` aplicado por script inline en `<head>`.
- **Fotos:** si existe `dist/assets/img/hero.(jpg|webp|avif)` o `dist/assets/img/servicios/<slug>.jpg`, el build la usa; si no, genera un marcador SVG. Logo: `dist/assets/img/logo-dental-gert.svg` (+ `-blanco` para modo oscuro).
