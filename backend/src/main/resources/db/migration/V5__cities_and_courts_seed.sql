-- =============================================================
-- V5: Modela "ciudades" como Venues y siembra 15 ciudades x 5 canchas.
-- También elimina la cancha demo ("Cancha 1") y su sede ("Sede Central")
-- junto con sus reservas, pagos y horarios.
-- Idempotente: usa DELETE WHERE id IN (...) y ON CONFLICT DO NOTHING.
-- =============================================================

-- ----- 1) Limpieza de la cancha demo y la sede vacía -----
DELETE FROM payments
WHERE reservation_id IN (
    SELECT id FROM reservations
    WHERE court_id = 'c0000000-0000-0000-0000-000000000001'
);

DELETE FROM reservations
WHERE court_id = 'c0000000-0000-0000-0000-000000000001';

-- court_opening_hours y pricing_tiers tienen ON DELETE CASCADE
DELETE FROM courts WHERE id = 'c0000000-0000-0000-0000-000000000001';

DELETE FROM venues WHERE id = 'b0000000-0000-0000-0000-000000000001';


-- ----- 2) Insertar 15 ciudades (venues) con UUID fijo -----
INSERT INTO venues (id, name, address, created_at, updated_at) VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Medellín',      'Antioquia, Colombia',         now(), now()),
    ('b1000000-0000-0000-0000-000000000002', 'Manizales',     'Caldas, Colombia',            now(), now()),
    ('b1000000-0000-0000-0000-000000000003', 'Armenia',       'Quindío, Colombia',           now(), now()),
    ('b1000000-0000-0000-0000-000000000004', 'Pereira',       'Risaralda, Colombia',         now(), now()),
    ('b1000000-0000-0000-0000-000000000005', 'Bogotá',        'Cundinamarca, Colombia',      now(), now()),
    ('b1000000-0000-0000-0000-000000000006', 'Ibagué',        'Tolima, Colombia',            now(), now()),
    ('b1000000-0000-0000-0000-000000000007', 'Barranquilla',  'Atlántico, Colombia',         now(), now()),
    ('b1000000-0000-0000-0000-000000000008', 'Cartagena',     'Bolívar, Colombia',           now(), now()),
    ('b1000000-0000-0000-0000-000000000009', 'Montería',      'Córdoba, Colombia',           now(), now()),
    ('b1000000-0000-0000-0000-000000000010', 'Pasto',         'Nariño, Colombia',            now(), now()),
    ('b1000000-0000-0000-0000-000000000011', 'Bucaramanga',   'Santander, Colombia',         now(), now()),
    ('b1000000-0000-0000-0000-000000000012', 'Cali',          'Valle del Cauca, Colombia',   now(), now()),
    ('b1000000-0000-0000-0000-000000000013', 'Neiva',         'Huila, Colombia',             now(), now()),
    ('b1000000-0000-0000-0000-000000000014', 'Villavicencio', 'Meta, Colombia',              now(), now()),
    ('b1000000-0000-0000-0000-000000000015', 'Cúcuta',        'Norte de Santander, Colombia',now(), now())
ON CONFLICT (id) DO NOTHING;


-- ----- 3) Insertar 5 canchas por ciudad (75 en total).
-- Cada cancha tiene el nombre de un barrio típico de la ciudad.
-- UUID determinista: 'c1000000-0000-0000-0000-{cityNN}{slotNN}{0000}'
-- ej. Medellín cancha 1 -> '...0101', cancha 2 -> '...0102', etc.
INSERT INTO courts (id, venue_id, name, sport_type, description, status, created_at, updated_at)
VALUES
    -- Medellín (city 01)
    ('c1000000-0000-0000-0000-010100000000', 'b1000000-0000-0000-0000-000000000001', 'El Poblado',     'Fútbol 5', 'Cancha en El Poblado, Medellín', 'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-010200000000', 'b1000000-0000-0000-0000-000000000001', 'Laureles',       'Fútbol 5', 'Cancha en Laureles, Medellín',   'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-010300000000', 'b1000000-0000-0000-0000-000000000001', 'Envigado',       'Fútbol 5', 'Cancha en Envigado, Medellín',   'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-010400000000', 'b1000000-0000-0000-0000-000000000001', 'Belén',          'Fútbol 5', 'Cancha en Belén, Medellín',      'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-010500000000', 'b1000000-0000-0000-0000-000000000001', 'Robledo',        'Fútbol 5', 'Cancha en Robledo, Medellín',    'ACTIVA', now(), now()),

    -- Manizales (city 02)
    ('c1000000-0000-0000-0000-020100000000', 'b1000000-0000-0000-0000-000000000002', 'Chipre',         'Fútbol 5', 'Cancha en Chipre, Manizales',    'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-020200000000', 'b1000000-0000-0000-0000-000000000002', 'La Estrella',    'Fútbol 5', 'Cancha en La Estrella, Manizales','ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-020300000000', 'b1000000-0000-0000-0000-000000000002', 'Palermo',        'Fútbol 5', 'Cancha en Palermo, Manizales',   'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-020400000000', 'b1000000-0000-0000-0000-000000000002', 'Milán',          'Fútbol 5', 'Cancha en Milán, Manizales',     'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-020500000000', 'b1000000-0000-0000-0000-000000000002', 'Versalles',      'Fútbol 5', 'Cancha en Versalles, Manizales', 'ACTIVA', now(), now()),

    -- Armenia (city 03)
    ('c1000000-0000-0000-0000-030100000000', 'b1000000-0000-0000-0000-000000000003', 'La Patria',      'Fútbol 5', 'Cancha en La Patria, Armenia',       'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-030200000000', 'b1000000-0000-0000-0000-000000000003', 'Granada',        'Fútbol 5', 'Cancha en Granada, Armenia',         'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-030300000000', 'b1000000-0000-0000-0000-000000000003', 'El Bosque',      'Fútbol 5', 'Cancha en El Bosque, Armenia',       'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-030400000000', 'b1000000-0000-0000-0000-000000000003', 'Las Colinas',    'Fútbol 5', 'Cancha en Las Colinas, Armenia',     'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-030500000000', 'b1000000-0000-0000-0000-000000000003', 'La Castellana',  'Fútbol 5', 'Cancha en La Castellana, Armenia',   'ACTIVA', now(), now()),

    -- Pereira (city 04)
    ('c1000000-0000-0000-0000-040100000000', 'b1000000-0000-0000-0000-000000000004', 'Pinares',        'Fútbol 5', 'Cancha en Pinares, Pereira',         'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-040200000000', 'b1000000-0000-0000-0000-000000000004', 'Cuba',           'Fútbol 5', 'Cancha en Cuba, Pereira',            'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-040300000000', 'b1000000-0000-0000-0000-000000000004', 'Belmonte',       'Fútbol 5', 'Cancha en Belmonte, Pereira',        'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-040400000000', 'b1000000-0000-0000-0000-000000000004', 'Álamos',         'Fútbol 5', 'Cancha en Álamos, Pereira',          'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-040500000000', 'b1000000-0000-0000-0000-000000000004', 'San Joaquín',    'Fútbol 5', 'Cancha en San Joaquín, Pereira',     'ACTIVA', now(), now()),

    -- Bogotá (city 05)
    ('c1000000-0000-0000-0000-050100000000', 'b1000000-0000-0000-0000-000000000005', 'Chapinero',      'Fútbol 5', 'Cancha en Chapinero, Bogotá',        'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-050200000000', 'b1000000-0000-0000-0000-000000000005', 'Usaquén',        'Fútbol 5', 'Cancha en Usaquén, Bogotá',          'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-050300000000', 'b1000000-0000-0000-0000-000000000005', 'Suba',           'Fútbol 5', 'Cancha en Suba, Bogotá',             'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-050400000000', 'b1000000-0000-0000-0000-000000000005', 'Teusaquillo',    'Fútbol 5', 'Cancha en Teusaquillo, Bogotá',      'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-050500000000', 'b1000000-0000-0000-0000-000000000005', 'La Candelaria',  'Fútbol 5', 'Cancha en La Candelaria, Bogotá',    'ACTIVA', now(), now()),

    -- Ibagué (city 06)
    ('c1000000-0000-0000-0000-060100000000', 'b1000000-0000-0000-0000-000000000006', 'La Pola',        'Fútbol 5', 'Cancha en La Pola, Ibagué',          'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-060200000000', 'b1000000-0000-0000-0000-000000000006', 'Calambeo',       'Fútbol 5', 'Cancha en Calambeo, Ibagué',         'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-060300000000', 'b1000000-0000-0000-0000-000000000006', 'Belén',          'Fútbol 5', 'Cancha en Belén, Ibagué',            'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-060400000000', 'b1000000-0000-0000-0000-000000000006', 'Modelia',        'Fútbol 5', 'Cancha en Modelia, Ibagué',          'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-060500000000', 'b1000000-0000-0000-0000-000000000006', 'Picaleña',       'Fútbol 5', 'Cancha en Picaleña, Ibagué',         'ACTIVA', now(), now()),

    -- Barranquilla (city 07)
    ('c1000000-0000-0000-0000-070100000000', 'b1000000-0000-0000-0000-000000000007', 'El Prado',       'Fútbol 5', 'Cancha en El Prado, Barranquilla',   'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-070200000000', 'b1000000-0000-0000-0000-000000000007', 'Riomar',         'Fútbol 5', 'Cancha en Riomar, Barranquilla',     'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-070300000000', 'b1000000-0000-0000-0000-000000000007', 'Boston',         'Fútbol 5', 'Cancha en Boston, Barranquilla',     'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-070400000000', 'b1000000-0000-0000-0000-000000000007', 'La Concepción',  'Fútbol 5', 'Cancha en La Concepción, Barranquilla','ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-070500000000', 'b1000000-0000-0000-0000-000000000007', 'Granadillo',     'Fútbol 5', 'Cancha en Granadillo, Barranquilla', 'ACTIVA', now(), now()),

    -- Cartagena (city 08)
    ('c1000000-0000-0000-0000-080100000000', 'b1000000-0000-0000-0000-000000000008', 'Bocagrande',     'Fútbol 5', 'Cancha en Bocagrande, Cartagena',    'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-080200000000', 'b1000000-0000-0000-0000-000000000008', 'Getsemaní',      'Fútbol 5', 'Cancha en Getsemaní, Cartagena',     'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-080300000000', 'b1000000-0000-0000-0000-000000000008', 'Manga',          'Fútbol 5', 'Cancha en Manga, Cartagena',         'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-080400000000', 'b1000000-0000-0000-0000-000000000008', 'Crespo',         'Fútbol 5', 'Cancha en Crespo, Cartagena',        'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-080500000000', 'b1000000-0000-0000-0000-000000000008', 'El Laguito',     'Fútbol 5', 'Cancha en El Laguito, Cartagena',    'ACTIVA', now(), now()),

    -- Montería (city 09)
    ('c1000000-0000-0000-0000-090100000000', 'b1000000-0000-0000-0000-000000000009', 'La Castellana',  'Fútbol 5', 'Cancha en La Castellana, Montería',  'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-090200000000', 'b1000000-0000-0000-0000-000000000009', 'El Recreo',      'Fútbol 5', 'Cancha en El Recreo, Montería',      'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-090300000000', 'b1000000-0000-0000-0000-000000000009', 'Sucre',          'Fútbol 5', 'Cancha en Sucre, Montería',          'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-090400000000', 'b1000000-0000-0000-0000-000000000009', 'Los Pinos',      'Fútbol 5', 'Cancha en Los Pinos, Montería',      'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-090500000000', 'b1000000-0000-0000-0000-000000000009', 'Buenavista',     'Fútbol 5', 'Cancha en Buenavista, Montería',     'ACTIVA', now(), now()),

    -- Pasto (city 10)
    ('c1000000-0000-0000-0000-100100000000', 'b1000000-0000-0000-0000-000000000010', 'La Aurora',      'Fútbol 5', 'Cancha en La Aurora, Pasto',         'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-100200000000', 'b1000000-0000-0000-0000-000000000010', 'Mariluz',        'Fútbol 5', 'Cancha en Mariluz, Pasto',           'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-100300000000', 'b1000000-0000-0000-0000-000000000010', 'Tamasagra',      'Fútbol 5', 'Cancha en Tamasagra, Pasto',         'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-100400000000', 'b1000000-0000-0000-0000-000000000010', 'San Lorenzo',    'Fútbol 5', 'Cancha en San Lorenzo, Pasto',       'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-100500000000', 'b1000000-0000-0000-0000-000000000010', 'El Centro',      'Fútbol 5', 'Cancha en El Centro, Pasto',         'ACTIVA', now(), now()),

    -- Bucaramanga (city 11)
    ('c1000000-0000-0000-0000-110100000000', 'b1000000-0000-0000-0000-000000000011', 'Cabecera',       'Fútbol 5', 'Cancha en Cabecera, Bucaramanga',    'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-110200000000', 'b1000000-0000-0000-0000-000000000011', 'Provenza',       'Fútbol 5', 'Cancha en Provenza, Bucaramanga',    'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-110300000000', 'b1000000-0000-0000-0000-000000000011', 'Lagos',          'Fútbol 5', 'Cancha en Lagos, Bucaramanga',       'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-110400000000', 'b1000000-0000-0000-0000-000000000011', 'García Rovira',  'Fútbol 5', 'Cancha en García Rovira, Bucaramanga','ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-110500000000', 'b1000000-0000-0000-0000-000000000011', 'Real de Minas',  'Fútbol 5', 'Cancha en Real de Minas, Bucaramanga','ACTIVA', now(), now()),

    -- Cali (city 12)
    ('c1000000-0000-0000-0000-120100000000', 'b1000000-0000-0000-0000-000000000012', 'Granada',        'Fútbol 5', 'Cancha en Granada, Cali',            'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-120200000000', 'b1000000-0000-0000-0000-000000000012', 'San Antonio',    'Fútbol 5', 'Cancha en San Antonio, Cali',        'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-120300000000', 'b1000000-0000-0000-0000-000000000012', 'El Peñón',       'Fútbol 5', 'Cancha en El Peñón, Cali',           'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-120400000000', 'b1000000-0000-0000-0000-000000000012', 'Ciudad Jardín',  'Fútbol 5', 'Cancha en Ciudad Jardín, Cali',      'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-120500000000', 'b1000000-0000-0000-0000-000000000012', 'Pance',          'Fútbol 5', 'Cancha en Pance, Cali',              'ACTIVA', now(), now()),

    -- Neiva (city 13)
    ('c1000000-0000-0000-0000-130100000000', 'b1000000-0000-0000-0000-000000000013', 'Las Granjas',    'Fútbol 5', 'Cancha en Las Granjas, Neiva',       'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-130200000000', 'b1000000-0000-0000-0000-000000000013', 'Altico',         'Fútbol 5', 'Cancha en Altico, Neiva',            'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-130300000000', 'b1000000-0000-0000-0000-000000000013', 'Quirinal',       'Fútbol 5', 'Cancha en Quirinal, Neiva',          'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-130400000000', 'b1000000-0000-0000-0000-000000000013', 'Cándido',        'Fútbol 5', 'Cancha en Cándido, Neiva',           'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-130500000000', 'b1000000-0000-0000-0000-000000000013', 'San José',       'Fútbol 5', 'Cancha en San José, Neiva',          'ACTIVA', now(), now()),

    -- Villavicencio (city 14)
    ('c1000000-0000-0000-0000-140100000000', 'b1000000-0000-0000-0000-000000000014', 'Barzal',         'Fútbol 5', 'Cancha en Barzal, Villavicencio',    'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-140200000000', 'b1000000-0000-0000-0000-000000000014', 'La Esperanza',   'Fútbol 5', 'Cancha en La Esperanza, Villavicencio','ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-140300000000', 'b1000000-0000-0000-0000-000000000014', 'Caudal',         'Fútbol 5', 'Cancha en Caudal, Villavicencio',    'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-140400000000', 'b1000000-0000-0000-0000-000000000014', 'Bonanza',        'Fútbol 5', 'Cancha en Bonanza, Villavicencio',   'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-140500000000', 'b1000000-0000-0000-0000-000000000014', 'Santa Helena',   'Fútbol 5', 'Cancha en Santa Helena, Villavicencio','ACTIVA', now(), now()),

    -- Cúcuta (city 15)
    ('c1000000-0000-0000-0000-150100000000', 'b1000000-0000-0000-0000-000000000015', 'Caobos',                'Fútbol 5', 'Cancha en Caobos, Cúcuta',           'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-150200000000', 'b1000000-0000-0000-0000-000000000015', 'La Riviera',            'Fútbol 5', 'Cancha en La Riviera, Cúcuta',       'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-150300000000', 'b1000000-0000-0000-0000-000000000015', 'Quinta Oriental',       'Fútbol 5', 'Cancha en Quinta Oriental, Cúcuta',  'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-150400000000', 'b1000000-0000-0000-0000-000000000015', 'Latino',                'Fútbol 5', 'Cancha en Latino, Cúcuta',           'ACTIVA', now(), now()),
    ('c1000000-0000-0000-0000-150500000000', 'b1000000-0000-0000-0000-000000000015', 'Trigal del Norte',      'Fútbol 5', 'Cancha en Trigal del Norte, Cúcuta', 'ACTIVA', now(), now())
ON CONFLICT (id) DO NOTHING;


-- ----- 4) Horarios de atención: 08:00 a 22:00, todos los días (0=domingo … 6=sábado)
--         para todas las canchas recién insertadas (las 75).
INSERT INTO court_opening_hours (id, court_id, day_of_week, open_time, close_time, created_at, updated_at)
SELECT
    uuid_generate_v4(),
    c.id,
    dow,
    TIME '08:00',
    TIME '22:00',
    now(),
    now()
FROM courts c
CROSS JOIN unnest(ARRAY[0,1,2,3,4,5,6]) AS dow
WHERE c.venue_id IN (
    'b1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000007',
    'b1000000-0000-0000-0000-000000000008',
    'b1000000-0000-0000-0000-000000000009',
    'b1000000-0000-0000-0000-000000000010',
    'b1000000-0000-0000-0000-000000000011',
    'b1000000-0000-0000-0000-000000000012',
    'b1000000-0000-0000-0000-000000000013',
    'b1000000-0000-0000-0000-000000000014',
    'b1000000-0000-0000-0000-000000000015'
)
ON CONFLICT (court_id, day_of_week) DO NOTHING;


-- ----- 5) Tarifa única por cancha: $80.000 COP/hora todo el día.
INSERT INTO pricing_tiers (id, court_id, day_of_week, start_time, end_time, price_per_hour, currency, created_at, updated_at)
SELECT
    uuid_generate_v4(),
    c.id,
    NULL,
    TIME '06:00',
    TIME '23:59',
    80000.00,
    'COP',
    now(),
    now()
FROM courts c
WHERE c.venue_id IN (
    'b1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000007',
    'b1000000-0000-0000-0000-000000000008',
    'b1000000-0000-0000-0000-000000000009',
    'b1000000-0000-0000-0000-000000000010',
    'b1000000-0000-0000-0000-000000000011',
    'b1000000-0000-0000-0000-000000000012',
    'b1000000-0000-0000-0000-000000000013',
    'b1000000-0000-0000-0000-000000000014',
    'b1000000-0000-0000-0000-000000000015'
)
AND NOT EXISTS (
    SELECT 1 FROM pricing_tiers t WHERE t.court_id = c.id
);
