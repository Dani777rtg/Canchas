# Modelo de datos (referencia V1)

Convención temporal: `timestamptz` almacenado en UTC, presentación en **America/Bogota**.

## Entidades principales

### `users`

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID PK | |
| email | VARCHAR único | normalizado minúsculas |
| password_hash | VARCHAR | |
| full_name | VARCHAR | |
| phone | VARCHAR nullable | |
| role | ENUM | `administrador`, `cliente` |
| status | ENUM | `activo`, `inactivo` |
| failed_login_count | INT | reset en login OK |
| locked_until | TIMESTAMPTZ nullable | RB-16 |
| created_at / updated_at | TIMESTAMPTZ | |

### `venues` (si multi-sede)

id, name, address optional, timezone default America/Bogota.

### `courts`

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID PK | |
| venue_id | FK | nullable si una sola sede ficticia |
| name | VARCHAR | único con venue_id |
| sport_type | VARCHAR | |
| description | TEXT nullable | |
| status | ENUM | `activa`, `inactiva`, `mantenimiento` |
| maintenance_note | TEXT nullable | HU-010 |

**Índice único:** `(venue_id, name)`.

### `court_opening_hours`

court_id, day_of_week (0-6), open_time, close_time; opcional `valid_from` / `valid_to` para cambios.

### `court_closures` (excepciones)

court_id, date, reason optional — día cerrado completo o usar rango si se requiere.

### `pricing_tiers`

court_id, day_of_week optional (null = todos), start_time, end_time, price_per_hour DECIMAL, currency COP.

### `surcharge_rules` (recargos RB-13)

id, name, type (`fixed` | `percent`), value, active_from, active_to optional, court_id optional.

### `commercial_settings`

IVA percent vigente, default reservation initial status (`confirmada` | `pendiente_pago`), política contraseña JSON.

### `reservations`

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID PK | |
| public_code | VARCHAR único | comprobante |
| court_id | FK | |
| user_id | FK | cliente |
| start_at | TIMESTAMPTZ | |
| end_at | TIMESTAMPTZ | RB-04/05 |
| status | ENUM | ver diagrama estados |
| cancellation_type | ENUM nullable | `temprana`, `tardia` |
| no_show | BOOLEAN | RB-11, admin |
| subtotal | DECIMAL | |
| tax_amount | DECIMAL | |
| total | DECIMAL | |
| idempotency_key | VARCHAR nullable | único por usuario en ventana |
| created_at / updated_at | TIMESTAMPTZ | |

**Índice crítico concurrencia:** `(court_id, start_at, end_at)` + exclusión solapamiento en aplicación/constraint exclusion PostgreSQL si se usa.

### `payments`

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID PK | |
| reservation_id | FK | |
| status | ENUM | RB-15 |
| method | ENUM | `manual`, `online`, `exonerado`, … |
| external_ref | VARCHAR nullable | pasarega |
| amount | DECIMAL | |
| recorded_by | FK users nullable | admin en manual |
| created_at | TIMESTAMPTZ | |

### `reservation_history`

reservation_id, changed_by, change_type, payload JSON, created_at.

### `audit_logs` (HU-026)

actor_id, action, entity_type, entity_id, before JSON, after JSON, created_at.

---

## Estados de reserva (máquina sugerida)

```
                    ┌── pendiente_pago ──(pago OK)──► confirmada / pagada (unificar según negocio)
                    │
nueva ──► confirmada ──┬──(cancelación temprana)──► cancelada
                       ├──(cancelación tardía)──► cancelada_tardia
                       ├──(no-show admin)──► finalizada + no_show
                       └──(tiempo pasó, check-out)──► finalizada
```

_Cerrar en Sprint 0 si `confirmada` y `pagado` son el mismo estado o dos estados distintos._

## Estados de pago (RB-15)

Transiciones válidas solo por servicios dedicados; `reversado` desde `pagado` con auditoría (HU-019).

## Relaciones (texto)

- Un usuario (cliente) tiene muchas reservas.
- Una cancha tiene muchas reservas y muchas franjas de precio/horario.
- Una reserva tiene 0..n pagos (típicamente 1 en V1; múltiples si reintentos online).
