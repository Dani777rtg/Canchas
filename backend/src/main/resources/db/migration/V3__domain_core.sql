-- Sedes, canchas, tarifas, reservas, pagos, auditoría y recuperación de clave.
-- IDs fijos solo para datos semilla (desarrollo / primera instalación).

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE commercial_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iva_percent NUMERIC(5, 2) NOT NULL DEFAULT 19.00,
    default_reservation_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMADA',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    name VARCHAR(120) NOT NULL,
    sport_type VARCHAR(80) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    maintenance_note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (venue_id, name)
);

CREATE TABLE court_opening_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (court_id, day_of_week)
);

CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    day_of_week INT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_per_hour NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_code VARCHAR(16) NOT NULL UNIQUE,
    court_id UUID NOT NULL REFERENCES courts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL,
    cancellation_type VARCHAR(20),
    no_show BOOLEAN NOT NULL DEFAULT FALSE,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    idempotency_key VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_reservations_user_idempotency ON reservations (user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_reservations_court_time ON reservations (court_id, start_at, end_at);
CREATE INDEX idx_reservations_user ON reservations (user_id);
CREATE INDEX idx_reservations_status ON reservations (status);

CREATE TABLE reservation_idempotency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    idempotency_key VARCHAR(80) NOT NULL,
    response_body TEXT NOT NULL,
    http_status INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, idempotency_key)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES reservations(id),
    status VARCHAR(20) NOT NULL,
    method VARCHAR(20) NOT NULL,
    external_ref VARCHAR(120),
    amount NUMERIC(12, 2) NOT NULL,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_reservation ON payments (reservation_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    before_json TEXT,
    after_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs (created_at);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    token_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_hash ON password_reset_tokens (token_hash);

-- Semilla: configuración comercial, sede, cancha demo, horarios y tarifa.
INSERT INTO commercial_settings (id, iva_percent, default_reservation_status, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000001', 19.00, 'CONFIRMADA', now());

INSERT INTO venues (id, name, address, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000001', 'Sede Central', NULL, now(), now());

INSERT INTO courts (id, venue_id, name, sport_type, description, status, maintenance_note, created_at, updated_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Cancha 1',
    'Fútbol 5',
    'Cancha semilla para desarrollo',
    'ACTIVA',
    NULL,
    now(),
    now()
);

-- 0=domingo … 6=sábado. Horario 08:00–22:00 todos los días.
INSERT INTO court_opening_hours (id, court_id, day_of_week, open_time, close_time, created_at, updated_at)
SELECT uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000001', dow, TIME '08:00', TIME '22:00', now(), now()
FROM unnest(ARRAY[0, 1, 2, 3, 4, 5, 6]) AS dow;

INSERT INTO pricing_tiers (id, court_id, day_of_week, start_time, end_time, price_per_hour, currency, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'c0000000-0000-0000-0000-000000000001',
    NULL,
    TIME '06:00',
    TIME '23:59',
    80000.00,
    'COP',
    now(),
    now()
);

-- Admin por defecto: admin@canchas.local / Admin123A (cambiar en producción).
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, failed_login_count, locked_until, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@canchas.local',
    '$2b$10$4gBf5KefZmIw9PNnCz5a5OqjC51yOmaQnpqGhZDIbxCNQTKNFe9MK',
    'Administrador',
    NULL,
    'ADMINISTRADOR',
    'ACTIVO',
    0,
    NULL,
    now(),
    now()
)
ON CONFLICT (email) DO NOTHING;
