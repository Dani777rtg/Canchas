# Estructura del repositorio y plan por fases

## Monorepo actual

```text
Canchas/
├── docs/                    # Requerimientos y guías (incl. 08-INICIO-DESARROLLO)
├── backend/                 # Spring Boot — paquete com.canchas
│   ├── pom.xml
│   └── src/main/java/com/canchas/
│   └── src/main/resources/db/migration/   # Flyway
├── frontend/                # React + Vite + TypeScript
├── docker-compose.yml       # PostgreSQL 16
└── README.md
```

## Stack adoptado (proyecto Canchas)

| Capa | Tecnología |
|------|------------|
| Frontend | **React 18** + **TypeScript** + **Vite** |
| Backend | **Java 17** + **Spring Boot 3.4** (Web, Security, JPA, Validation, Flyway) |
| Base de datos | **PostgreSQL** |

Infra: Docker para Postgres en desarrollo; producción según cliente (NFR-03/06).

## Orden de implementación (dependencias técnicas)

1. **Fundaciones:** BD, auth (HU-001, 002, 005), usuarios admin (HU-004).
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

## Próximo paso inmediato

1. Completar **contexto cliente** en `docs/01-VISION-Y-ALCANCE.md`.
2. Seguir **`docs/08-INICIO-DESARROLLO.md`** para arrancar entorno.
3. Implementar **E1**: entidad `User`, registro/login, JWT, endurecer `SecurityConfig`.
