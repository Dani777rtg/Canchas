# Guia Postman - Backend Canchas

Esta guia prueba los endpoints principales del backend:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me` (JWT)

Tras migrar Flyway existe usuario admin semilla: `admin@canchas.local` / `Admin123A` (ver `backend/README.md`).

## 1) Levantar backend y base de datos

Desde la raiz del proyecto:

```bash
docker compose up -d
cd backend
mvn spring-boot:run
```

Base URL local: `http://localhost:8080/api`

## 2) Importar archivos en Postman

Importa estos dos archivos:

- `docs/postman/Canchas-Backend.postman_collection.json`
- `docs/postman/Canchas-Local.postman_environment.json`

Luego selecciona el environment **Canchas Local**.

## 3) Orden de pruebas recomendado

1. **Health**
   - Request: `Health`
   - Esperado: `200` con `status: ok`

2. **Register**
   - Request: `Auth - Register`
   - Esperado: `201`, token y datos de usuario
   - Nota: si repites el mismo correo, devuelve `409`

3. **Login**
   - Request: `Auth - Login`
   - Esperado: `200`, token nuevo
   - El script del request guarda automaticamente `accessToken` en variable de entorno.

4. **Me**
   - Request: `Users - Me`
   - Esperado: `200` con perfil del usuario autenticado

## 4) Prueba de bloqueo por intentos (RB-16)

Haz 5 intentos con password incorrecto en `Auth - Login`.

Resultado esperado:

- En intentos invalidos: `401`
- Despues de acumular 5 fallos: `423 ACCOUNT_LOCKED`

## 5) Errores comunes

- `401 UNAUTHORIZED`: token vacio, invalido o expirado
- `423 ACCOUNT_LOCKED`: cuenta bloqueada 15 minutos por intentos fallidos
- `409 CONFLICT`: correo ya registrado en register
- `400 VALIDATION_ERROR`: payload incompleto o password sin politica minima
