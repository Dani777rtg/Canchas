# Requerimientos funcionales detallados (HU V2)

Convenciones: **Must/Should/Could** = prioridad MoSCoW. Los criterios GWT del comercial se amplían con **datos**, **errores** y **API** donde aplica.

---

## ÉPICA E1 — Identidad, acceso y seguridad

### HU-001 Registro de usuario (Must, SP 5)

**Actor:** Visitante.

**Datos mínimos sugeridos:** correo (único), contraseña, nombre completo, teléfono opcional.

**Comportamiento:**

1. POST registro crea usuario con rol `cliente`, estado `activo`, email verificado opcional en V1 (definir en Sprint 0: si no hay verificación, marcar `email_verified=false` y permitir reserva según política).
2. Email duplicado → HTTP 409, mensaje usuario: *correo ya registrado*.
3. Contraseña según política configurable: longitud mínima, mayúscula/número (parametrizar en `system_config` o env).

**Criterios de aceptación ampliados:**

- Contraseña almacenada solo como hash (bcrypt/argon2).
- Rate limit en registro recomendado (NFR-04).

---

### HU-002 Inicio de sesión seguro (Must, SP 3)

**Comportamiento:**

1. Login exitoso → JWT o sesión servidor + refresh según stack; respuesta incluye `rol`.
2. Contador de intentos fallidos por cuenta (o por IP+email); al 5.º fallo → bloqueo hasta `blocked_until = now + 15 min`.
3. Durante bloqueo, login devuelve mensaje genérico o específico (definir: OWASP recomienda mensaje genérico “credenciales inválidas” y mismo código).
4. Timeout de sesión inactiva configurable → invalidación de token/sesión.

**Auditoría:** intentos fallidos opcional en log estructurado (NFR-05).

---

### HU-003 Recuperación de contraseña (Should, SP 5)

**Comportamiento:**

1. Solicitud con email válido → generar token único, TTL corto (ej. 1 h), un solo uso; envío por SMTP.
2. Token usado o expirado → pantalla de error clara; permitir nueva solicitud.

**Dependencia:** SMTP del cliente o servicio transaccional (línea presupuestal propuesta §9).

---

### HU-004 Gestión de usuarios — admin (Must, SP 8)

**Funciones:**

- Listar con filtros: estado, correo, nombre; **paginación** cursor o offset.
- Ver detalle.
- Desactivar usuario: estado `inactivo` → login denegado (401/403 con mensaje coherente).
- Opcional V1: reactivar, resetear bloqueo login manual (admin).

**Permisos:** solo rol `administrador`.

---

### HU-005 Control de permisos por rol (Must, SP 8)

**Matriz mínima:**

| Recurso / acción | Cliente | Admin |
|------------------|---------|-------|
| Registro/login propio | Sí | Sí |
| CRUD reservas propias | Crear/leer/cancelar según reglas | Sí |
| Reservas globales / terceros | No | Sí |
| Canchas, horarios, precios | No | Sí |
| Pagos manuales, no-show, reportes | No | Sí |
| Auditoría | No | Lectura |

**Backend:** guard (`RoleGuard`) + políticas por ruta; nunca confiar en el front.

---

## ÉPICA E2 — Catálogo de canchas y parametrización

### HU-006 Crear cancha (Must, SP 5)

**Datos:** nombre, sede (texto o FK `venue` si multi-sede), tipo deporte, descripción opcional, estado operativo (`activa` / `inactiva`).

**Regla:** nombre **único por sede** (índice único compuesto).

---

### HU-007 Editar cancha y estado (Must, SP 5)

**Comportamiento:**

- Si el admin modifica horarios de apertura que **afectan** reservas futuras existentes, el sistema debe **previsualizar** conflictos (lista de reservas afectadas) y exigir confirmación explícita o rechazar según política acordada en Sprint 0.

---

### HU-008 Configurar horarios por cancha (Must, SP 8)

**Modelo:** por cada día de semana (L-D): intervalos `[apertura, cierre]`; posible excepción por fecha (cerrado festivo).

**Efecto:** motor de disponibilidad solo genera slots dentro de estos intervalos (RB-06).

---

### HU-009 Configurar precios por franja (Must, SP 8)

**Modelo:** para cada cancha, franjas con `hora_inicio`, `hora_fin`, día opcional, **precio por hora** (o precio fijo por bloque si negocio lo exige — cerrar en Sprint 0).

**Cálculo:** al reservar, cada hora calendario cae en una franja; sumar; aplicar recargos (RB-13) e IVA (RB-14).

---

### HU-010 Modo mantenimiento (Should, SP 3)

**Comportamiento:** flag o rango de fechas `mantenimiento` en cancha → slots **bloqueados** en consulta de disponibilidad; mensaje opcional “cancha en mantenimiento”.

---

## ÉPICA E3 — Disponibilidad y motor de reservas

### HU-011 Consultar disponibilidad en tiempo real (Must, SP 8)

**Entrada:** fecha, opcional filtro tipo/cancha/sede.

**Salida:** lista de slots (inicio, fin) por cancha con estado `libre` / `ocupado` / `bloqueado` (mantenimiento).

**Rendimiento:** NFR-01; considerar índices por `court_id`, rango `start_at/end_at`, caché corta opcional.

---

### HU-012 Crear reserva (Must, SP 13)

**Flujo:**

1. Validar RB-01…06, precio (RB-12…14).
2. Estado inicial: `confirmada` o `pendiente_pago` según configuración global.
3. Generar **código único** legible (ej. prefijo + nanoid) para comprobante.
4. Transacción serializada en el rango [start, end) para esa cancha.

**Errores:** conflicto → 409; regla de anticipación → 422 con código `BOOKING_TOO_LATE` / `BOOKING_TOO_FAR`.

---

### HU-013 Modificar reserva (Should, SP 8)

**Alcance:** cambio de fecha/hora/cancha dentro de ventana (definir: misma lógica que RB-02 y 6 h para “penalidad” si aplica).

**Historial:** tabla `reservation_history` o eventos con usuario y timestamp.

---

### HU-014 Cancelar reserva (Must, SP 5)

**Lógica:** comparar `now` con `start - 6h` → `cancelada` vs `cancelada_tardia` (RB-09, RB-10). RB-07 libera cupo.

**Restricción:** no cancelar si estado `finalizada` (RB-08).

---

### HU-015 Concurrencia e idempotencia (Must, SP 8)

**Idempotencia:** header `Idempotency-Key` en POST crear reserva; servidor guarda respuesta por usuario+key TTL 24h.

**Concurrencia:** una sola confirmación por slot; segunda transacción aborta con 409.

---

## ÉPICA E4 — Pagos y comprobantes

### HU-016 Pago manual — admin (Must, SP 5)

Reserva `pendiente_pago` → admin registra monto, método (efectivo, transferencia…), referencia opcional → `pagado`.

---

### HU-017 Pasarela (Should, SP 13)

Webhook + estado intermedio; fallo → `fallido` o permanece `pendiente` según tabla de transiciones acordada.

---

### HU-018 Comprobante (Must, SP 5)

**Contenido mínimo:** código reserva, cancha, sede, fecha/hora inicio-fin, valor subtotal, IVA, total, estado pago, nombre cliente.

**Formato:** HTML imprimible o PDF generado servidor; descarga desde detalle reserva.

---

### HU-019 Reverso (Could, SP 8)

Admin: `pagado` → `reversado` con motivo obligatorio; línea en auditoría (RB-17).

---

## ÉPICA E5 — Reportes

### HU-020 Reporte por fecha/estado (Must, SP 5)

Agregados y detalle filtrable; columnas: fechas, cancha, cliente, estado reserva, estado pago.

---

### HU-021 Ocupación por cancha (Must, SP 8)

Por periodo: % ocupación = horas reservadas / horas operativas ofrecidas (definir fórmula con calendario de apertura).

---

### HU-022 Ingresos operativos (Must, SP 8)

Subtotal, IVA, total; desglose por cancha/tipo si existe tipología.

---

### HU-023 Exportación (Should, SP 3)

CSV + PDF; XLSX opcional.

---

## ÉPICA E6 — UX y accesibilidad

### HU-024 Responsive (Must, SP 8)

Breakpoints móvil/tablet/desktop; flujos login → disponibilidad → reserva sin zoom forzado.

---

### HU-025 Accesibilidad (Should, SP 5)

Teclado, foco visible, labels; objetivo AA parcial en formulario de reserva.

---

## ÉPICA E7 — Operación y entrega

### HU-026 Auditoría (Must, SP 5)

Eventos: modificación reserva/cancha/usuario/pago crítico. Campos: `actor_id`, `action`, `entity`, `before` JSON, `after` JSON, `created_at`.

---

### HU-027 / HU-028 UAT (Must)

Ciclo 1: bugs vs mejoras. Ciclo 2: checklist aceptación firmable.

---

### HU-029 Despliegue (Must, SP 5)

Smoke: login, disponibilidad, crear reserva, cancelar, reporte, comprobante. Acta go-live.

---

### HU-030 Soporte post go-live (Must, SP 5)

Canal oficial, ticket trazable, SLA según contrato de garantía (ej. 30–60 días correctivos).

---

## Resumen story points (referencia comercial)

Total aproximado épicas E1–E7 (HUs de producto): suma de SP en documento comercial ≈ **200+** puntos; usar solo para orden relativo, no para compromiso de fecha sin velocidad del equipo.
