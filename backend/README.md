# canchas-api (Spring Boot)

- **Java 17**, Spring Boot **3.4.x**
- Puerto **8080**, contexto **`/api`** ? health: `GET /api/v1/health`
- **PostgreSQL** en local: credenciales por defecto alineadas con `docker-compose.yml` de la raíz del monorepo
- **Flyway**: `src/main/resources/db/migration/`

## Endpoints base (E1)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/health`

## Variables de entorno

Usa `backend/.env.example` como plantilla.

## Ejecutar

```bash
# Desde la raíz del repo: levantar Postgres
docker compose up -d

cd backend
mvn spring-boot:run
```

Perfil local opcional: copiar `application-local.yml.example` a `application-local.yml` y ejecutar con `SPRING_PROFILES_ACTIVE=local` si ajustas credenciales.

## Tests

```bash
mvn test
```

Los tests usan **H2** en memoria (perfil `test`), sin Docker.
