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

## 3. Cuentas y datos semilla para pruebas

Tras las migraciones (`V3` + `V4` + `V5`) quedan cargados usuarios, ciudades, canchas y reservas de ejemplo para validar flujos sin tener que crear datos manualmente.

> **Importante:** la migración **V5** elimina la cancha demo original (`Cancha 1`) y reemplaza el catálogo por **15 ciudades** con **5 canchas cada una** (75 en total). Si al abrir la web no ves canchas, asegurate de que Flyway haya aplicado V5 (queda en el log de arranque del backend).

### 3.1 Usuarios precreados

| Tipo | Correo | Contraseña | Estado |
|------|--------|------------|--------|
| Administrador | `admin@canchas.local` | `Admin123A` | `ACTIVO` |
| Cliente demo 1 | `cliente1@canchas.local` | `Admin123A` | `ACTIVO` |
| Cliente demo 2 | `cliente2@canchas.local` | `Admin123A` | `ACTIVO` |
| Cliente demo 3 | `cliente3@canchas.local` | `Admin123A` | `INACTIVO` |

**Recordatorio:** credenciales solo para desarrollo local; cambiar en producción.

### 3.2 Ciudades y canchas

La migración V5 crea 15 sedes (ciudades de Colombia) y 5 canchas por ciudad con el nombre de un barrio típico. Todas operan **08:00–22:00** los 7 días y cobran **$80.000 COP/h**.

Ciudades sembradas: **Medellín, Manizales, Armenia, Pereira, Bogotá, Ibagué, Barranquilla, Cartagena, Montería, Pasto, Bucaramanga, Cali, Neiva, Villavicencio, Cúcuta**.

> El front pide elegir ciudad al entrar; mientras no la elijas, no se muestran canchas. La selección queda guardada en el navegador (`localStorage`) y se puede cambiar desde el botón del encabezado.

### 3.3 Reservas y pagos de ejemplo

> Las reservas semilla de V4 estaban atadas a la `Cancha 1` original y se eliminan junto con ella en V5. Para validar listados de reservas/comprobantes en una instalación nueva, **crear al menos una reserva manualmente** con un cliente demo desde `/panel/reservar`.

Si necesitás más casos, además podés **registrar un cliente nuevo** desde la web: **Crear cuenta** → correo, nombre y contraseña (reglas: mínimo 8 caracteres, con mayúscula, minúscula y número).

---

## 4. Qué probar en la web (flujo manual)

Con **backend** y **frontend** en marcha:

### 4.1 Cliente (`CLIENTE`)

1. **Inicio** → elegir **ciudad** desde el botón con ícono de ubicación (header o tarjeta del hero).
2. **Crear cuenta** o **Iniciar sesión** con un usuario cliente.
3. **Mi panel** (`/panel`):
   - **Nueva reserva** (`/panel/reservar`): elegir fecha, duración (1–3 h) y un horario libre; confirmar la reserva en el diálogo.
   - **Mis reservas** (`/panel/reservas`): pestañas **Próximas / Pasadas / Canceladas**, abrir **Comprobante**, **Cancelar** si el estado y la hora lo permiten.

### 4.2 Administrador (`ADMINISTRADOR`)

1. Cerrar sesión del cliente (si aplica) e **iniciar sesión** con `admin@canchas.local` / `Admin123A`.
2. Menú **Administración** (`/admin`):
   - **Canchas:** listado **agrupado por ciudad**, con buscador y filtro por ciudad.
   - **Usuarios:** búsqueda por correo y paginación.
   - **Informes:** rango de fechas, métricas (reservas / ocupación / ingresos) y descarga CSV de resumen.

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

### 6.1 Pruebas automáticas (unitarias e integración)

Resumen: `mvn test` en `backend/` ejecuta **unitarias** (Mockito, sin Spring completo) e **integración** (Spring + H2). Guía detallada — qué falta cubrir, cómo escribir tests, comandos, reportes y cómo presentarlas a distintas audiencias: [docs/11-PRUEBAS-UNITARIAS.md](11-PRUEBAS-UNITARIAS.md).

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
- Pruebas unitarias y cómo mostrarlas: [docs/11-PRUEBAS-UNITARIAS.md](11-PRUEBAS-UNITARIAS.md)
- Endpoints y contratos: [docs/05-API-Y-CONTRATOS.md](05-API-Y-CONTRATOS.md)
- README del backend (lista de rutas): [backend/README.md](../backend/README.md)
