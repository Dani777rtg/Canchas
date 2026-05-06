# Guía: probar backend y frontend en local

Esta guía describe cómo levantar **PostgreSQL**, la **API Spring Boot** y la **web React (Vite)** en tu máquina, y cómo comprobar el flujo completo (cliente y administrador).

**Zona horaria de negocio:** `America/Bogota` (ver `backend/src/main/resources/application.yml`).

---

## 1. Requisitos

| Herramienta | Uso |
|-------------|-----|
| **Docker Desktop** (o compatible) | Levantar PostgreSQL con `docker compose` |
| **JDK 17+** | Compilar y ejecutar el backend |
| **Apache Maven 3.9+** | `mvn spring-boot:run` en `backend/` |
| **Node.js 20 LTS** (recomendado) y **npm** | Instalar dependencias y `npm run dev` en `frontend/` |

Comprobaciones rápidas:

```bash
java -version
mvn -version
node -v
npm -v
docker compose version
```

---

## 2. Orden recomendado de arranque

Siempre en este orden: **base de datos → backend → frontend**.

### 2.1 PostgreSQL (Docker)

Desde la **raíz del repositorio** (donde está `docker-compose.yml`):

```bash
docker compose up -d
```

Esperá unos segundos a que el contenedor esté listo (healthcheck en `docker-compose.yml`). Credenciales por defecto alineadas con `backend/.env.example`:

| Variable | Valor por defecto |
|----------|-------------------|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `canchas` |
| Usuario | `canchas` |
| Contraseña | `canchas_dev` |

Para detener el contenedor (sin borrar el volumen de datos):

```bash
docker compose down
```

### 2.2 Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

La API queda con:

- **Puerto:** `8080`
- **Context path:** `/api` (todas las rutas del controlador son relativas a eso)

**Comprobación directa en el navegador o con curl:**

- [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) → debe responder JSON con el estado del servicio.

La primera vez que arranca, **Flyway** aplica las migraciones (`backend/src/main/resources/db/migration/`).

#### Variables de entorno (opcional)

Podés copiar `backend/.env.example` y cargar las variables en tu entorno si usás herramientas que las lean; para una ejecución típica con Docker Compose **no suele hacer falta** cambiar nada si usás los valores por defecto del compose.

Importante para el front:

- `CORS_ALLOWED_ORIGINS` debe incluir el origen del front en desarrollo: **`http://localhost:5173`** (ya está en `.env.example`).

### 2.3 Frontend (Vite + React)

En **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

- **URL:** [http://localhost:5173](http://localhost:5173)
- El proxy de Vite redirige las peticiones que empiezan por **`/api`** a **`http://localhost:8080`**, así el navegador no mezcla puertos ni CORS en desarrollo.

En la página de inicio deberías ver el estado de la API (health). Si dice que no está disponible, el backend no está corriendo o no responde en el puerto 8080.

---

## 3. Cuentas de prueba

Tras las migraciones (incluida la semilla del dominio), existe un usuario administrador de ejemplo (documentado también en `backend/README.md`):

| Campo | Valor |
|-------|--------|
| Correo | `admin@canchas.local` |
| Contraseña | `Admin123A` |

**Recordatorio:** es solo para desarrollo; cambiar en producción.

Además podés **registrar un usuario cliente** desde la web: **Registro** → correo, nombre, contraseña (debe cumplir las reglas del backend: mayúscula, minúscula y número, mínimo 8 caracteres).

---

## 4. Qué probar en la web (flujo manual)

Con **backend** y **frontend** en marcha:

### 4.1 Cliente (`CLIENTE`)

1. **Inicio** → comprobar que el health de la API responde.
2. **Crear cuenta** o **Iniciar sesión** con un usuario cliente.
3. **Mi panel** (`/panel`):
   - **Nueva reserva** (`/panel/reservar`): elegir fecha, duración (1–3 h) y un horario libre; confirmar la reserva.
   - **Mis reservas** (`/panel/reservas`): ver listado, abrir **Comprobante**, **Cancelar** si el estado y la hora lo permiten.

### 4.2 Administrador (`ADMINISTRADOR`)

1. Cerrar sesión del cliente (si aplica) e **iniciar sesión** con `admin@canchas.local` / `Admin123A`.
2. Menú **Administración** (`/admin`):
   - **Canchas:** listado de canchas.
   - **Usuarios:** búsqueda por correo y paginación.
   - **Informes:** rango de fechas, métricas y descarga CSV de resumen.

Si entrás a `/admin` con un usuario que no es administrador, la aplicación te redirige al inicio.

---

## 5. Probar solo la API (sin navegador)

Podés usar **Postman** o **curl** contra `http://localhost:8080/api/...`. Hay una colección y guía en:

- [docs/09-GUIA-POSTMAN-BACKEND.md](09-GUIA-POSTMAN-BACKEND.md)

Los endpoints autenticados requieren cabecera `Authorization: Bearer <JWT>` (obtenido tras `POST /api/v1/auth/login`).

---

## 6. Comandos útiles

| Objetivo | Comando |
|----------|---------|
| Tests backend | `cd backend` → `mvn test` |
| Build frontend | `cd frontend` → `npm run build` |
| Lint frontend | `cd frontend` → `npm run lint` |
| Ver logs Postgres | `docker compose logs -f postgres` (en la raíz del repo) |

---

## 7. Problemas frecuentes

| Síntoma | Qué revisar |
|---------|-------------|
| El front dice que la API no está disponible | ¿Está corriendo `mvn spring-boot:run`? ¿Responde [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)? |
| Error de conexión a la base de datos | ¿`docker compose up -d` está activo? ¿Puerto **5432** libre u ocupado por otra instancia de Postgres? |
| CORS en el navegador al llamar la API desde otro origen | En desarrollo usá siempre `npm run dev` (proxy `/api`). Si abrís el front desde otro puerto u host, añadilo a `app.cors.allowed-origins` / variable `CORS_ALLOWED_ORIGINS`. |
| Puerto 8080 ocupado | Cambiá el puerto del servidor en `application.yml` o liberá el proceso que usa 8080. |
| Migraciones Flyway fallan | Revisá que la BD sea la esperada y que no haya conflictos con datos antiguos en el volumen Docker; en el peor caso, desarrollo local: `docker compose down -v` **borra el volumen** y reinicia desde cero (solo si podés perder datos locales). |

---

## 8. Documentación relacionada

- Arranque genérico del repo: [docs/08-INICIO-DESARROLLO.md](08-INICIO-DESARROLLO.md)
- Endpoints y contratos: [docs/05-API-Y-CONTRATOS.md](05-API-Y-CONTRATOS.md)
- README del backend (lista de rutas): [backend/README.md](../backend/README.md)
