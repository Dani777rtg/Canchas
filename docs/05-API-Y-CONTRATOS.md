# API REST (referencia V1)

Prefijo sugerido: `/api/v1`. Autenticación: Bearer JWT (o sesión) salvo `POST /auth/register`, `POST /auth/login`.

## Convenciones

- Errores: JSON `{ "code": "STRING", "message": "humano", "details": {} }`.
- Paginación: `?page=1&limit=20` o `cursor`.
- Zona horaria: query params de fecha en formato ISO 8601 con offset o fecha local `YYYY-MM-DD` + interpretación Bogotá.

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | HU-001 |
| POST | `/auth/login` | HU-002 |
| POST | `/auth/logout` | invalidar refresh |
| POST | `/auth/forgot-password` | HU-003 |
| POST | `/auth/reset-password` | token + nueva clave |

## Usuarios (admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/users` | filtros, paginación HU-004 |
| PATCH | `/admin/users/:id` | desactivar, etc. |

## Canchas y configuración (admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/admin/courts` | HU-006 |
| PATCH | `/admin/courts/:id` | HU-007 |
| GET | `/admin/courts/:id/conflicts` | preview si cambia horarios |
| PUT | `/admin/courts/:id/opening-hours` | HU-008 |
| PUT | `/admin/courts/:id/pricing` | HU-009 |
| PATCH | `/admin/courts/:id/maintenance` | HU-010 |

## Disponibilidad y reservas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/availability` | query: date, court_id?, venue_id? — HU-011 |
| POST | `/reservations` | Header `Idempotency-Key` — HU-012, HU-015 |
| GET | `/reservations/mine` | lista cliente |
| GET | `/reservations/:id` | detalle + permiso |
| PATCH | `/reservations/:id` | HU-013 (Should) |
| POST | `/reservations/:id/cancel` | HU-014 |
| GET | `/reservations/:id/receipt` | PDF/HTML HU-018 |

## Pagos (admin / webhook)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/admin/reservations/:id/payments/manual` | HU-016 |
| POST | `/webhooks/payment-provider` | HU-017 (seguridad firma) |
| POST | `/admin/payments/:id/reverse` | HU-019 Could |

## Reportes (admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/reports/reservations` | HU-020 |
| GET | `/admin/reports/occupancy` | HU-021 |
| GET | `/admin/reports/revenue` | HU-022 |
| GET | `.../export?format=csv|pdf` | HU-023 |

## Auditoría (admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/audit-logs` | filtros por entidad/fecha HU-026 |

---

## Idempotencia (HU-015)

- Cliente envía `Idempotency-Key: <uuid>` en `POST /reservations`.
- Servidor persiste `(user_id, idempotency_key) → response_body + status` hasta 24 h.
- Reintentos con misma key devuelven **misma** respuesta sin segunda reserva.

## Concurrencia

- `POST /reservations` dentro de transacción: bloqueo advisory por `court_id` + rango temporal, o `SELECT ... FOR UPDATE` sobre filas de reserva solapadas.

## Códigos HTTP frecuentes

| Código | Uso |
|--------|-----|
| 409 | Slot ocupado, duplicado negocio |
| 422 | RB-02…06, validación precio |
| 403 | RB-18 rol insuficiente |
| 429 | Rate limit login |
