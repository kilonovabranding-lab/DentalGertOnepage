// Worker "dental-gert-cron": tareas programadas que Pages no puede ejecutar.
import { processOutbox, reconcile, monthlyClose, purgePII } from '../lib/bookings.js'

export default {
  async scheduled(event, env) {
    if (event.cron === '*/15 * * * *') {
      await processOutbox(env)
      await reconcile(env)
    } else if (event.cron === '5 6 1 * *') {
      await monthlyClose(env)
    } else if (event.cron === '0 9 * * *') {
      await purgePII(env)
      await monthlyClose(env) // reintento diario por si el día 1 falló (es idempotente)
    }
  },
}
