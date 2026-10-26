-- Reservas web de Dental Gert
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  service TEXT NOT NULL,
  duration INTEGER NOT NULL,
  nombres TEXT, apellidos TEXT, telefono TEXT,
  residencia TEXT, dui TEXT, pasaporte TEXT, pais TEXT,
  correo TEXT, motivo TEXT, lang TEXT,
  status TEXT NOT NULL DEFAULT 'confirmada',
  event_id TEXT,
  sheet_rows TEXT,
  pii_purged INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS bookings_date ON bookings (date);

-- Bloques de 5 min ocupados: la PRIMARY KEY impide reservas duplicadas aunque lleguen al mismo tiempo.
CREATE TABLE IF NOT EXISTS booking_blocks (
  date TEXT NOT NULL,
  block INTEGER NOT NULL,
  booking_id TEXT NOT NULL,
  PRIMARY KEY (date, block)
);
CREATE INDEX IF NOT EXISTS booking_blocks_booking ON booking_blocks (booking_id);

-- Tareas pendientes hacia Google (evento, sheets, correos) con reintentos.
CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT NOT NULL,
  task TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  done INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS sheets (
  month TEXT NOT NULL,
  owner TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  tab TEXT NOT NULL,
  PRIMARY KEY (month, owner)
);

CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT);
