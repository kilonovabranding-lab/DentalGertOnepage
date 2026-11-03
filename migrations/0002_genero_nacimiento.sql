-- Datos obligatorios nuevos del formulario: género y fecha de nacimiento (YYYY-MM-DD).
ALTER TABLE bookings ADD COLUMN genero TEXT;
ALTER TABLE bookings ADD COLUMN fecha_nacimiento TEXT;
