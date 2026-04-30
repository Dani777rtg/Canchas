# Visión y alcance (V1)

## Problema de negocio

Gestionar de forma centralizada la **disponibilidad**, **reserva**, **precio por franja**, **pago operativo** (comprobante no DIAN) y **reportes** de canchas deportivas, reemplazando procesos manuales o dispersos y garantizando reglas de negocio uniformes y trazabilidad.

## Resultado esperado (medible en V1)

- Usuarios con roles **Administrador** y **Cliente** operan sobre la misma base de datos de reservas.
- **Cero solapamiento** de reservas por cancha (concurrencia controlada).
- **Comprobantes** descargables con código único, cancha, fecha/hora, valor y estado de pago.
- **Reportes** exportables por fecha, estado, ocupación e ingresos operativos.

## Supuestos cerrados (producto)

| ID | Supuesto |
|----|----------|
| P-01 | Solo aplicación **web responsive** (no apps nativas iOS/Android en V1). |
| P-02 | Roles iniciales: **Administrador**, **Usuario/Cliente**. |
| P-03 | “Facturación” = **comprobante operativo** de reserva/pago; **no** factura electrónica DIAN en esta fase. |
| P-04 | Pago en línea = **Should**; si no se implementa, flujo con **pago manual** y estados coherentes. |
| P-05 | Zona horaria oficial: **America/Bogota** (UTC-5). Todas las fechas/horas persistidas y reglas RB se interpretan en este huso. |

## Alcance funcional V1 (resumen MoSCoW)

- **Must:** identidad, catálogo de canchas, horarios y precios por franja, motor de reservas (crear/cancelar, disponibilidad, concurrencia), pagos manuales, comprobantes, reportes Must, auditoría admin, UAT y despliegue.
- **Should:** recuperación de contraseña, mantenimiento de cancha, modificar reserva, exportación CSV/PDF, pasarela de pago, accesibilidad AA parcial.
- **Could:** reverso/anulación operativa de pago (HU-019).

## Fuera de alcance V1 (sin adenda)

- Facturación electrónica ante DIAN.
- App móvil nativa.
- Garantía legal de cumplimiento normativo sectorial (solo orientación técnica básica).
- Pentest formal, WAF administrado, SOC (salvo contratación explícita).

## Contexto del cliente (completar en Sprint 0)

_Pendiente de taller: describir procesos actuales, volumen de canchas/sedes, integraciones deseadas y datos maestros._
