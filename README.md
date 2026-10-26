# Dental Gert · sitio web con agenda en línea

Una sola página (ES/EN) donde el paciente elige servicio, fecha y hora y su cita queda confirmada al instante: se crea en el Google Calendar de dentalgert@gmail.com (con invitación al paciente si deja correo), se avisa por Gmail a la clínica y se registra en el Google Sheet del mes.

## Probar en tu computadora

```bash
npm test          # pruebas del motor de horarios y validaciones
npm run dev       # compila, prepara la base local y abre http://localhost:8788
```

Necesitas un archivo `.dev.vars` (no se sube a git) con:

```
COMPOSIO_API_KEY=...
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```

⚠️ En local las reservas son **reales**: crean eventos, correos y filas en Google.

## Publicar en Cloudflare (paso a paso)

1. **Inicia sesión:** `npx wrangler login` (se abre el navegador; acepta).
2. **Crea la base de datos:** `npx wrangler d1 create dental-gert`. Copia el `database_id` que aparece y pégalo en `wrangler.toml` y en `cron/wrangler.toml`.
3. **Crea las tablas:** `npm run db:migrate`.
4. **Crea el proyecto de Pages:** `npx wrangler pages project create dental-gert --production-branch main`.
5. **Antispam (Turnstile):** en el panel de Cloudflare → Turnstile → *Add widget* para `dental-gert.pages.dev`. Pon la *Site key* en `TURNSTILE_SITE_KEY` (`wrangler.toml`) y guarda la *Secret key* en el paso 6.
6. **Secretos** (te los pide por la terminal, no quedan en archivos):
   ```bash
   npx wrangler pages secret put COMPOSIO_API_KEY --project-name dental-gert
   npx wrangler pages secret put TURNSTILE_SECRET --project-name dental-gert
   cd cron && npx wrangler secret put COMPOSIO_API_KEY && cd ..
   ```
7. **Publica el sitio:** `TURNSTILE_SITE_KEY=<site key> npm run deploy` → queda en https://dental-gert.pages.dev
8. **Publica el cron:** `npm run deploy:cron`.
9. **Prueba:** agenda una cita de prueba y revisa Calendar, Gmail y Drive. Logs: `npx wrangler pages deployment tail --project-name dental-gert`.

## Checklist de lanzamiento

- [ ] **Rotar la key de Composio** (se compartió por chat): crea una nueva en Composio → Claves API, cárgala con los comandos del paso 6, actualiza `.dev.vars` y borra la anterior.
- [ ] **Reconectar remagencysv@gmail.com en Composio** (Drive y Sheets dan error 401). Luego añade `CA_SHEETS_REM` y `CA_DRIVE_REM` en ambos `wrangler.toml` y vuelve a publicar. Mientras tanto, cada Sheet mensual se comparte con remagencysv como editor y llega un respaldo por correo cada mes.
- [ ] Logo (`dist/assets/img/logo-dental-gert.svg` y `logo-dental-gert-blanco.svg`) y `og-dental-gert.png` (1200×630).
- [ ] Fotos: `dist/assets/img/hero.jpg` y `dist/assets/img/servicios/{diagnostico,limpieza,relleno,endodoncia,extraccion,cordales,blanqueamiento}.jpg` (luego `npm run deploy`).
- [ ] Dirección exacta, formas de pago, feriados (`CLOSED_DATES` en `lib/config.js`), nombre y JVPM del odontólogo.
- [ ] ID de GA4 en `src/content.mjs` (`BRAND.ga4`) y activar Cloudflare Web Analytics en el panel de Pages.
- [ ] Revisión legal de `/privacidad/` y `/cookies/`.
- [ ] Busca `TODO` en el código para el resto de pendientes.
