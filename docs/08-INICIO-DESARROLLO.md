# Cómo arrancar y qué tener claro antes de codificar

Stack fijado para este proyecto:

| Capa | Tecnología |
|------|------------|
| Backend | **Java 17**, **Spring Boot 3.4**, REST, **Spring Security** (JWT en fases siguientes), **JPA**, **Flyway** |
| Base de datos | **PostgreSQL 16** (local vía Docker recomendado) |
| Frontend | **React 18** + **TypeScript** + **Vite** (puerto 5173) |

Timezone de negocio: **America/Bogota** (ver `application.yml` y `docs/03-REGLAS-DE-NEGOCIO-Y-NFR.md`).

---

## Requisitos en tu máquina

1. **JDK 17+** (`java -version`).
2. **Maven 3.9+** (`mvn -version`) o usar el wrapper si lo añadimos después.
3. **Node.js 20 LTS** y npm (`node -v`, `npm -v`).
4. **Docker Desktop** (opcional pero recomendado) para `docker compose up -d` y levantar solo PostgreSQL.

---

## Orden típico de trabajo (desarrollo)

1. Levantar **PostgreSQL** (raíz del repo):

   ```bash
   docker compose up -d
   ```

2. Arrancar **backend** (`backend/`):

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   Comprobar: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) → JSON `status: ok`.

3. Arrancar **frontend** (`frontend/`):

   ```bash
   cd frontend
   npm run dev
   ```

   Abrir [http://localhost:5173](http://localhost:5173). El proxy de Vite envía `/api/*` al puerto **8080**.

---

## Requerimientos de producto que debes tener a la mano

Antes de implementar **auth**, **canchas** o **reservas**, revisa en orden:

1. **`docs/01-VISION-Y-ALCANCE.md`** — supuestos (pago online Should, comprobante no DIAN, etc.).
2. **`docs/02-REQUERIMIENTOS-FUNCIONALES.md`** — HUs por épica; ahí está el detalle de pantallas y reglas.
3. **`docs/03-REGLAS-DE-NEGOCIO-Y-NFR.md`** — RB-01…18 y NFR (bloqueos, anticipación, concurrencia, auditoría).
4. **`docs/04-MODELO-DATOS.md`** — tablas y estados; las migraciones Flyway deben alinearse con esto.
5. **`docs/05-API-Y-CONTRATOS.md`** — prefijos REST; el backend usa `server.servlet.context-path: /api` y controladores bajo `/v1/...`.
6. **`docs/07-CHECKLIST-SPRINT-0.md`** — cerrar dudas con el cliente (SMTP, pasarela, rama por defecto en Git).

Orden de implementación sugerido: **E1** (usuarios/login) → **E2** (canchas/horarios/precios) → **E3** (disponibilidad y reservas) → **E4–E7** según `docs/06-ESTRUCTURA-REPO-Y-SPRINTS.md`.

---

## Seguridad (recordatorio)

- Hoy el `SecurityConfig` deja **todo abierto** para poder desarrollar el health check; al añadir JWT, **restringir** rutas y validar roles en servidor (**RB-18**).
- No subir **`application-local.yml`** con contraseñas reales (usar ejemplo y variables de entorno en producción).

---

## Comandos útiles

| Acción | Comando |
|--------|---------|
| Tests backend | `cd backend && mvn test` |
| Build frontend | `cd frontend && npm run build` |
| Parar Postgres | `docker compose down` (en la raíz) |
