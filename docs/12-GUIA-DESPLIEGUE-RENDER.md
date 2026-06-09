# Guía: desplegar Canchas en Render

Esta guía explica cómo publicar el proyecto en [Render](https://render.com) con:

1. **PostgreSQL** (base de datos)
2. **Web Service** (API Spring Boot)
3. **Static Site** (frontend React/Vite)

El archivo `render.yaml` en la raíz del repo define los tres servicios como **Blueprint**.

---

## 1. Requisitos previos

| Requisito | Detalle |
|-----------|---------|
| Cuenta en Render | [https://dashboard.render.com](https://dashboard.render.com) (plan gratuito sirve para pruebas) |
| Repositorio en GitHub | El código debe estar en GitHub (por ejemplo `Dani777rtg/Canchas`) |
| Rama actualizada | Haz `git push` con `render.yaml` y los cambios de despliegue |

---

## 2. Arquitectura en Render

```text
Usuario (navegador)
       │
       ▼
https://canchas-web.onrender.com   ← Static Site (React)
       │
       ├── /api/*  ──rewrite──►  https://canchas-api.onrender.com/api/*
       └── /*      ──rewrite──►  /index.html (SPA)
                                        │
                                        ▼
                               https://canchas-api.onrender.com   ← Web Service (Spring Boot)
                                        │
                                        ▼
                               PostgreSQL (canchas-db)
```

- El frontend llama rutas relativas como `/api/v1/health`.
- Render reenvía `/api/*` al backend sin cambiar código del front.
- Flyway crea tablas y datos semilla al arrancar la API por primera vez.

---

## 3. Despliegue automático (Blueprint)

### Paso 1: Subir cambios a GitHub

```bash
git add render.yaml backend/src/main/resources/application.yml docs/12-GUIA-DESPLIEGUE-RENDER.md
git commit -m "Agregar configuración de despliegue en Render"
git push origin main
```

### Paso 2: Crear el Blueprint en Render

1. Entra a [Render Dashboard](https://dashboard.render.com)
2. **New +** → **Blueprint**
3. Conecta tu cuenta de GitHub si aún no lo hiciste
4. Selecciona el repositorio **Canchas**
5. Render detectará `render.yaml` y mostrará 3 recursos:
   - `canchas-db` (PostgreSQL)
   - `canchas-api` (Web Service Java)
   - `canchas-web` (Static Site)
6. Revisa los nombres y pulsa **Apply**

Render creará los servicios y empezará el primer deploy.

### Paso 3: Esperar el primer deploy

| Servicio | Tiempo estimado | Notas |
|----------|-----------------|-------|
| PostgreSQL | ~1 min | Queda en estado *Available* |
| canchas-api | 5–15 min | Docker compila con Maven; Flyway aplica migraciones |
| canchas-web | 2–5 min | `npm install && npm run build` |

**Importante:** el primer arranque de la API puede tardar más porque Flyway ejecuta V5 (75 canchas).

### Paso 4: Verificar que funciona

1. **API directa:** [https://canchas-api.onrender.com/api/v1/health](https://canchas-api.onrender.com/api/v1/health)  
   Debe responder JSON con estado OK.

2. **Web (entrada principal):** [https://canchas-web.onrender.com](https://canchas-web.onrender.com)  
   La página de inicio debe mostrar el estado de la API.

3. **Login admin:** `admin@canchas.local` / `Admin123A` (solo desarrollo/demo).

---

## 4. Variables de entorno (automáticas)

El Blueprint configura esto por ti:

| Variable | Servicio | Origen |
|----------|----------|--------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | canchas-api | Base de datos `canchas-db` |
| `JWT_SECRET` | canchas-api | Generado por Render (≥ 32 caracteres) |
| `JWT_EXPIRATION_MINUTES` | canchas-api | `120` |
| `CORS_ALLOWED_ORIGINS` | canchas-api | URL del static site |
| `PORT` | canchas-api | Inyectado por Render |

No necesitas crear un `.env` en producción si usas el Blueprint.

---

## 5. Ver la base de datos en pgAdmin (producción)

Render expone la base solo en red interna por defecto. Para conectar **pgAdmin desde tu PC**:

1. En Render → **canchas-db** → pestaña **Info**
2. Copia:
   - **Hostname** (interno; para acceso externo usa **External Database URL** si está disponible en tu plan)
   - **Port**, **Database**, **Username**, **Password**

En el **plan gratuito** de PostgreSQL en Render, la conexión externa suele requerir habilitar acceso o usar la URL externa que muestra el panel.

3. En pgAdmin → **Register Server** con esos datos.

> Para la universidad, suele bastar con mostrar la BD **local** con Docker mientras la app en Render es la demo en vivo. Si la profesora pide ver la BD de producción, usa la **External Connection** del panel de Render.

---

## 6. Plan gratuito: limitaciones

| Recurso | Comportamiento |
|---------|----------------|
| Web Service (API) | Se **apaga** tras ~15 min sin tráfico; el primer request puede tardar **30–60 s** (cold start) |
| Static Site | Siempre disponible, sin cold start |
| PostgreSQL free | Datos se **borran** si no actualizas a plan de pago antes de 90 días (política Render) |

Para una demo en clase: abre la web un minuto antes para “despertar” la API.

---

## 7. Despliegue manual (sin Blueprint)

Si prefieres crear cada servicio a mano:

### 7.1 PostgreSQL

- **New +** → **PostgreSQL**
- Name: `canchas-db`
- Database: `canchas`, User: `canchas`
- Plan: Free

### 7.2 Web Service (API)

- **New +** → **Web Service**
- Repo: Canchas, Branch: `main`
- Root Directory: `backend`
- Runtime: **Docker** (Render no soporta Java nativo; usa `backend/Dockerfile`)
- Health Check Path: `/api/v1/health`
- Variables de entorno: vincula la BD (`DB_HOST`, etc.) + `JWT_SECRET` (string aleatorio largo)

### 7.3 Static Site (Frontend)

- **New +** → **Static Site**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- **Redirects/Rewrites:**
  - `/api/*` → `https://<tu-api>.onrender.com/api/*`
  - `/*` → `/index.html`

---

## 8. Seguridad en producción

- Cambia la contraseña del admin `admin@canchas.local` después del primer deploy.
- No compartas `JWT_SECRET` ni credenciales de la BD.
- Las cuentas demo (`cliente1@canchas.local`, etc.) son para pruebas; en producción real conviene desactivarlas o cambiar contraseñas.

---

## 9. Problemas frecuentes

| Síntoma | Qué revisar |
|---------|-------------|
| API no arranca | Logs de `canchas-api` en Render; suele ser error de BD o `JWT_SECRET` corto |
| Front sin datos / API no disponible | ¿`canchas-api` está *Live*? ¿Pasó el cold start? |
| 404 en rutas del front (`/panel`, `/admin`) | Falta rewrite `/*` → `/index.html` en el static site |
| 404 en `/api/...` desde la web | Falta rewrite `/api/*` al backend en el static site |
| Flyway falla | BD vacía o migración ya aplicada con datos distintos; revisar logs del backend |

---

## 10. Documentación relacionada

- Pruebas locales: [10-GUIA-PRUEBAS-LOCALES.md](10-GUIA-PRUEBAS-LOCALES.md)
- API y contratos: [05-API-Y-CONTRATOS.md](05-API-Y-CONTRATOS.md)
- Render Blueprint spec: [https://render.com/docs/blueprint-spec](https://render.com/docs/blueprint-spec)
