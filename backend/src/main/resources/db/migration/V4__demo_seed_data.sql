-- Datos semilla adicionales para pruebas locales.
-- Usa la misma clave de demo que el admin: Admin123A
-- Hash bcrypt: $2b$10$4gBf5KefZmIw9PNnCz5a5OqjC51yOmaQnpqGhZDIbxCNQTKNFe9MK

INSERT INTO users (id, email, password_hash, full_name, phone, role, status, failed_login_count, locked_until, created_at, updated_at)
VALUES
    (
        'a0000000-0000-0000-0000-000000000101',
        'cliente1@canchas.local',
        '$2b$10$4gBf5KefZmIw9PNnCz5a5OqjC51yOmaQnpqGhZDIbxCNQTKNFe9MK',
        'Cliente Demo Uno',
        '3000000001',
        'CLIENTE',
        'ACTIVO',
        0,
        NULL,
        now(),
        now()
    ),
    (
        'a0000000-0000-0000-0000-000000000102',
        'cliente2@canchas.local',
        '$2b$10$4gBf5KefZmIw9PNnCz5a5OqjC51yOmaQnpqGhZDIbxCNQTKNFe9MK',
        'Cliente Demo Dos',
        '3000000002',
        'CLIENTE',
        'ACTIVO',
        0,
        NULL,
        now(),
        now()
    ),
    (
        'a0000000-0000-0000-0000-000000000103',
        'cliente3@canchas.local',
        '$2b$10$4gBf5KefZmIw9PNnCz5a5OqjC51yOmaQnpqGhZDIbxCNQTKNFe9MK',
        'Cliente Demo Inactivo',
        '3000000003',
        'CLIENTE',
        'INACTIVO',
        0,
        NULL,
        now(),
        now()
    )
ON CONFLICT (email) DO NOTHING;

-- Reserva pagada y ya finalizada (para reportes).
INSERT INTO reservations (
    id,
    public_code,
    court_id,
    user_id,
    start_at,
    end_at,
    status,
    cancellation_type,
    no_show,
    subtotal,
    tax_amount,
    total,
    idempotency_key,
    created_at,
    updated_at
)
VALUES (
    'b0000000-0000-0000-0000-000000000201',
    'RSV-DEMO-001',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000101',
    date_trunc('hour', now() - INTERVAL '1 day') + TIME '18:00',
    date_trunc('hour', now() - INTERVAL '1 day') + TIME '19:00',
    'FINALIZADA',
    NULL,
    FALSE,
    80000.00,
    15200.00,
    95200.00,
    NULL,
    now(),
    now()
)
ON CONFLICT (public_code) DO NOTHING;

INSERT INTO payments (
    id,
    reservation_id,
    status,
    method,
    external_ref,
    amount,
    recorded_by,
    created_at,
    updated_at
)
VALUES (
    'd0000000-0000-0000-0000-000000000301',
    'b0000000-0000-0000-0000-000000000201',
    'PAGADO',
    'MANUAL',
    'PAY-DEMO-001',
    95200.00,
    'a0000000-0000-0000-0000-000000000001',
    now(),
    now()
)
ON CONFLICT DO NOTHING;

-- Reserva futura pendiente de pago.
INSERT INTO reservations (
    id,
    public_code,
    court_id,
    user_id,
    start_at,
    end_at,
    status,
    cancellation_type,
    no_show,
    subtotal,
    tax_amount,
    total,
    idempotency_key,
    created_at,
    updated_at
)
VALUES (
    'b0000000-0000-0000-0000-000000000202',
    'RSV-DEMO-002',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000102',
    date_trunc('hour', now() + INTERVAL '1 day') + TIME '10:00',
    date_trunc('hour', now() + INTERVAL '1 day') + TIME '12:00',
    'PENDIENTE_PAGO',
    NULL,
    FALSE,
    160000.00,
    30400.00,
    190400.00,
    NULL,
    now(),
    now()
)
ON CONFLICT (public_code) DO NOTHING;

INSERT INTO payments (
    id,
    reservation_id,
    status,
    method,
    external_ref,
    amount,
    recorded_by,
    created_at,
    updated_at
)
VALUES (
    'd0000000-0000-0000-0000-000000000302',
    'b0000000-0000-0000-0000-000000000202',
    'PENDIENTE',
    'ONLINE',
    'PAY-DEMO-002',
    190400.00,
    'a0000000-0000-0000-0000-000000000001',
    now(),
    now()
)
ON CONFLICT DO NOTHING;

-- Reserva cancelada (para probar historial y estados).
INSERT INTO reservations (
    id,
    public_code,
    court_id,
    user_id,
    start_at,
    end_at,
    status,
    cancellation_type,
    no_show,
    subtotal,
    tax_amount,
    total,
    idempotency_key,
    created_at,
    updated_at
)
VALUES (
    'b0000000-0000-0000-0000-000000000203',
    'RSV-DEMO-003',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000101',
    date_trunc('hour', now() + INTERVAL '2 day') + TIME '20:00',
    date_trunc('hour', now() + INTERVAL '2 day') + TIME '21:00',
    'CANCELADA',
    'TEMPRANA',
    FALSE,
    80000.00,
    15200.00,
    95200.00,
    NULL,
    now(),
    now()
)
ON CONFLICT (public_code) DO NOTHING;
