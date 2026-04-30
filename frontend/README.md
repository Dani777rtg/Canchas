# Frontend — React + Vite + TypeScript

- Puerto de desarrollo: **5173**
- Proxy: peticiones a **`/api`** → `http://localhost:8080` (Spring Boot)

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

La página inicial llama a `GET /api/v1/health` para comprobar que el backend está arriba.
