# Checklist Sprint 0 (Acta de Alcance)

Usar esta lista para cerrar el documento contractual de alcance antes de codificar a escala.

## Negocio

- [ ] Nombre comercial de la solución y sede(s) reales (una vs varias).
- [ ] Lista cerrada de **canchas iniciales** y deportes.
- [ ] Política: reserva queda `confirmada` vs `pendiente_pago` por defecto.
- [ ] ¿Verificación de correo obligatoria antes de reservar? (Sí / No).
- [ ] Ventana para **modificar reserva** (HU-013): mismas reglas que nueva reserva + límite de horas antes del inicio.

## Should / Could en alcance del contrato

- [ ] HU-003 Recuperación contraseña: **incluida** (requiere SMTP).
- [ ] HU-010 Mantenimiento: **incluido**.
- [ ] HU-013 Modificar reserva: **incluido**.
- [ ] HU-017 Pasarela: **incluida en Fase 1** o **Fase 2** (proveedor y quien contrata la pasarela).
- [ ] HU-019 Reverso de pago: **incluido** o **fuera**.
- [ ] Exportación XLSX además de CSV/PDF: **sí / no**.

## Integraciones y costos

- [ ] SMTP para correos (datos del cliente).
- [ ] Dominio, SSL, hosting: responsable y presupuesto.
- [ ] Pasarela: nombre del proveedor si aplica.

## Legal y gobierno

- [ ] Ley y ciudad de jurisdicción (propuesta §16).
- [ ] Vigencia garantía correctiva: **30** o **60** días post go-live.
- [ ] Período estabilización post producción (bugs críticos): ej. **2 semanas**.

## Firmas

- [ ] Acta de Alcance anexa a propuesta con **mismos módulos** que esta documentación `docs/`.
