# Reglas de negocio y requerimientos no funcionales

Todas las validaciones críticas deben ejecutarse en **backend** (RB-18 / NFR-04).

## 2.1 Reservas

| ID | Regla | Implementación (notas) |
|----|--------|-------------------------|
| RB-01 | No reservar horario ya ocupado para la misma cancha | Constraint DB + transacción con bloqueo o serialización en slot |
| RB-02 | Anticipación mínima: **30 min** antes del inicio | `now >= start - 30min` en zona Bogotá |
| RB-03 | Anticipación máxima: **30 días** | `start <= today + 30 días` (calendario local) |
| RB-04 | Duración mínima: **1 h** | `end - start >= 1h` |
| RB-05 | Duración máxima: **3 h** por transacción | `end - start <= 3h` |
| RB-06 | Solo dentro del horario habilitado de la cancha | Cruzar con calendario operativo por día |
| RB-07 | Cancelada libera cupo **inmediatamente** | Estado `cancelada` / `cancelada_tardia` excluidos de ocupación |
| RB-08 | Reserva **finalizada** no editable | Estado terminal; solo lectura |

## 2.2 Cancelación y no-show

| ID | Regla | Implementación (notas) |
|----|--------|-------------------------|
| RB-09 | Sin penalidad si cancela **≥ 6 h** antes del inicio | Estado `cancelada` |
| RB-10 | Si **< 6 h** antes del inicio | Estado `cancelada_tardia`; visible en reportes |
| RB-11 | No-show marcado por **admin** | Flag o estado; afecta reportes operativos |

## 2.3 Precios y pago

| ID | Regla | Implementación (notas) |
|----|--------|-------------------------|
| RB-12 | Precio base por cancha y **franja horaria** | Tabla tarifas: cancha + rango hora + día opcional |
| RB-13 | Precio final = **horas × tarifa franja** + recargos | Recargos como tabla configurable (tipo monto % o fijo) |
| RB-14 | IVA según **configuración comercial activa** | Param global o vigencia por fechas |
| RB-15 | Estados pago: `pendiente`, `pagado`, `fallido`, `reversado`, `exonerado` | Transiciones solo vía reglas + admin |

## 2.4 Seguridad

| ID | Regla |
|----|--------|
| RB-16 | 5 intentos fallidos de login → bloqueo **15 minutos** |
| RB-17 | Acciones admin críticas **auditadas** (antes/después) |
| RB-18 | Permisos validados en **backend** en todo endpoint |

## NFR medibles

| ID | Métrica | Objetivo |
|----|---------|----------|
| NFR-01 | p95 API disponibilidad | **< 1,2 s** con 100 usuarios concurrentes |
| NFR-02 | p95 creación reserva | **< 1,8 s** carga nominal |
| NFR-03 | Disponibilidad mensual | **99,5 %** (depende infra cliente) |
| NFR-04 | Seguridad | Hash bcrypt/argon2, TLS, OWASP básico |
| NFR-05 | Retención logs operativos | **≥ 90 días** |
| NFR-06 | Backups | RPO **24 h**, RTO **4 h** si infra lo permite |
| NFR-07 | Capacidad | **≥ 20 canchas**, **≥ 5.000 reservas/mes** sin rediseño |
| NFR-08 | Usabilidad | Flujos críticos **≤ 3 min** usuario entrenado |

## Matriz trazabilidad rápida (HU → RB/NFR)

- Motor reservas (HU-011…015): RB-01…08, RB-15 (estado inicial), NFR-01/02/07.
- Cancelación (HU-014): RB-07, RB-09, RB-10.
- Pagos (HU-016…019): RB-12…15.
- Admin crítico (HU-004,026): RB-17, RB-18, NFR-05.
- Login (HU-002): RB-16, NFR-04.
