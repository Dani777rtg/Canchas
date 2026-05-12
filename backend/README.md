# canchas-api (Spring Boot)

- **Java 17**, Spring Boot **3.4.x**
- Puerto **8080**, contexto **`/api`** ? health: `GET /api/v1/health`
- **PostgreSQL** en local: credenciales por defecto alineadas con `docker-compose.yml` de la ra�z del monorepo
- **Flyway**: `src/main/resources/db/migration/`

## Usuario administrador semilla (Flyway V3)

Tras migrar, existe `admin@canchas.local` con contrase�a **`Admin123A`**. Cambiar en producci�n.

Tambi�n se crean sede demo, cancha `Cancha 1`, horario 08:00�22:00 y tarifa de ejemplo.

## Endpoints (prefijo `/api`)

### P�blicos

- `GET /api/v1/health`
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/logout` (204; JWT stateless)
- `POST /api/v1/webhooks/payment-provider` (stub)

### Autenticados (Bearer JWT)

- `GET /api/v1/users/me`
- `GET /api/v1/availability?date=YYYY-MM-DD&courtId=&venueId=`
- `POST /api/v1/reservations` (header opcional `Idempotency-Key`)
- `GET /api/v1/reservations/mine?page=&limit=`
- `GET /api/v1/reservations/{id}`, `PATCH /api/v1/reservations/{id}`
- `POST /api/v1/reservations/{id}/cancel`
- `GET /api/v1/reservations/{id}/receipt`

### Administrador (`ROLE_ADMINISTRADOR`)

- `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}`
- `GET /api/v1/admin/courts`, `POST /api/v1/admin/courts`, `PATCH /api/v1/admin/courts/{id}`
- `GET /api/v1/admin/courts/{id}/conflicts`
- `PUT /api/v1/admin/courts/{id}/opening-hours`, `PUT /api/v1/admin/courts/{id}/pricing`
- `PATCH /api/v1/admin/courts/{id}/maintenance`
- `POST /api/v1/admin/reservations/{id}/payments/manual`
- `POST /api/v1/admin/payments/{id}/reverse`
- `GET /api/v1/admin/reports/reservations|occupancy|revenue?from=&to=` (fecha ISO)
- `GET /api/v1/admin/reports/export?format=csv&from=&to=`
- `GET /api/v1/admin/audit-logs?entityType=&entityId=&page=&limit=`

## Variables de entorno

Usa `backend/.env.example` como plantilla.

## Ejecutar

```bash
# Desde la ra�z del repo: levantar Postgres
docker compose up -d

cd backend
mvn spring-boot:run
```

Perfil local opcional: copiar `application-local.yml.example` a `application-local.yml` y ejecutar con `SPRING_PROFILES_ACTIVE=local` si ajustas credenciales. Con perfil **`local`**, `POST /auth/forgot-password` incluye el campo `resetToken` en la respuesta solo para desarrollo (no usar en producci�n).

## Tests

```bash
mvn test
```

Los tests usan **H2** en memoria (perfil `test`), sin Docker.

Guía de pruebas **unitarias** vs integración, comandos y cómo presentarlas: [docs/11-PRUEBAS-UNITARIAS.md](../docs/11-PRUEBAS-UNITARIAS.md).
