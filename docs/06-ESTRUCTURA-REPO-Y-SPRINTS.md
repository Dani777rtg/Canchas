# Estructura del repositorio y plan por fases

## Propuesta de carpetas (monorepo)

Cuando inicie el desarrollo:

```text
Canchas/
├── docs/                    # ya existente: requerimientos
├── backend/                 # API + dominio + migraciones
│   ├── src/
│   ├── migrations/ o prisma/
│   └── test/
├── frontend/                # SPA responsive
│   ├── src/
│   └── public/
├── docker-compose.yml       # opcional: Postgres + app
└── README.md
```

Alternativa: dos repos `canchas-api` y `canchas-web` si el cliente separa despliegues.

## Stack recomendado (alineado a propuesta D777)

| Capa | Opción A | Notas |
|------|-----------|--------|
| Frontend | React + UI kit (MUI / Chakra) o Vue 3 | HU-024 responsive |
| Backend | Node.js + NestJS **o** .NET 8 | Guards RB-18, transacciones |
| BD | PostgreSQL | exclusion constraints, transacciones |
| Infra | Docker + VPS/cloud cliente | NFR-03/06 dependen del cliente |

_Si el cliente impone otro stack, documentar en ADR y ajustar estimación._

## Orden de implementación (dependencias técnicas)

1. **Fundaciones:** repo, BD, auth (HU-001, 002, 005), usuarios admin (HU-004).
2. **Catálogo:** sedes/canchas (HU-006, 007), horarios (HU-008), precios (HU-009), mantenimiento (HU-010).
3. **Core negocio:** disponibilidad (HU-011), crear reserva con idempotencia (HU-012, 015), cancelar (HU-014).
4. **Pagos y documentos:** manual (HU-016), comprobante (HU-018); luego Should pasarela (HU-017).
5. **Reportes:** HU-020, 021, 022, export (HU-023).
6. **Calidad producto:** auditoría (HU-026), responsive (HU-024), accesibilidad (HU-025).
7. **Entrega:** UAT (HU-027, 028), despliegue (HU-029), soporte (HU-030).

## Alineación con cronograma 12 semanas (propuesta comercial)

| Semanas | Foco | HUs principales |
|---------|------|------------------|
| 1 (Sprint 0) | Acta alcance, modelo datos, wireframes, arquitectura | — |
| 2–4 | Auth + catálogo + primeras reservas | E1, E2 inicio, E3 parcial |
| 5–7 | Motor reservas completo, cancelación, precios | E3, E4 parcial |
| 8–10 | Pagos Should, reportes, integraciones | E4, E5 |
| 11–12 | Endurecimiento, UAT, go-live | E6, E7 |

## Límite de cambio (propuesta §6.5)

Parametrizar **10–20 %** del backlog reordenable sin impacto; nuevos módulos → adenda o Fase 2.

## Próximo paso inmediato (poco a poco)

1. Completar **contexto cliente** en `docs/01-VISION-Y-ALCANCE.md` (taller).
2. Decidir **Must estricto vs Should** para el primer entregable (ej. pasarela en Fase 1.1 o 2).
3. Inicializar **backend** con migraciones vacías + modelo `users` + login.
4. Inicializar **frontend** con shell y rutas públicas/privadas.
