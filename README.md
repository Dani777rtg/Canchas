# Sistema de Gestión de Reservas para Canchas Deportivas

**Cliente:** Jenny Xiomara Valencia Marín · **Proveedor:** D777 · **Timezone:** `America/Bogota`

Monorepo: documentación de producto, API **Spring Boot**, web **React (Vite)** y **PostgreSQL**.

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Java 17, Spring Boot 3.4, Spring Security, JPA, Flyway |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui (Radix), lucide-react, sonner |
| BD | PostgreSQL 16 (recomendado vía Docker) |

## Arranque rápido

1. **PostgreSQL:** en la raíz del repo: `docker compose up -d`
2. **API:** `cd backend && mvn spring-boot:run` → [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)
3. **Web:** `cd frontend && npm install && npm run dev` → [http://localhost:5173](http://localhost:5173)

Guía detallada y requisitos previos: **[docs/08-INICIO-DESARROLLO.md](docs/08-INICIO-DESARROLLO.md)**.  
**Probar todo en local (Postgres + API + web):** **[docs/10-GUIA-PRUEBAS-LOCALES.md](docs/10-GUIA-PRUEBAS-LOCALES.md)**.

## Documentación de requerimientos

| Documento | Contenido |
|-----------|-------------|
| [docs/01-VISION-Y-ALCANCE.md](docs/01-VISION-Y-ALCANCE.md) | Objetivos, supuestos, fuera de alcance V1 |
| [docs/02-REQUERIMIENTOS-FUNCIONALES.md](docs/02-REQUERIMIENTOS-FUNCIONALES.md) | Épicas, HUs, criterios |
| [docs/03-REGLAS-DE-NEGOCIO-Y-NFR.md](docs/03-REGLAS-DE-NEGOCIO-Y-NFR.md) | RB y NFR |
| [docs/04-MODELO-DATOS.md](docs/04-MODELO-DATOS.md) | Entidades y estados |
| [docs/05-API-Y-CONTRATOS.md](docs/05-API-Y-CONTRATOS.md) | REST de referencia |
| [docs/06-ESTRUCTURA-REPO-Y-SPRINTS.md](docs/06-ESTRUCTURA-REPO-Y-SPRINTS.md) | Plan por fases |
| [docs/07-CHECKLIST-SPRINT-0.md](docs/07-CHECKLIST-SPRINT-0.md) | Acta de alcance |
| [docs/08-INICIO-DESARROLLO.md](docs/08-INICIO-DESARROLLO.md) | Cómo empezar a codificar |
| [docs/10-GUIA-PRUEBAS-LOCALES.md](docs/10-GUIA-PRUEBAS-LOCALES.md) | Probar backend y frontend en local (paso a paso) |

## Estructura de carpetas

```text
Canchas/
├── backend/          # Spring Boot (canchas-api)
├── frontend/         # React + Vite
├── docs/             # Requerimientos y guías
├── docker-compose.yml
└── README.md
```

## Estado

- Requerimientos HU V2: definidos en `docs/`.
- Backend: API REST + JWT + dominio (canchas, reservas, pagos, auditoría) + reportes + Flyway con seed de **15 ciudades × 5 canchas**.
- Frontend: tema claro/oscuro, selección de **ciudad** persistente, flujos cliente y admin migrados a Tailwind + shadcn/ui.
