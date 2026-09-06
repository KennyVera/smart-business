# Smart Business

ERP, POS y CRM multi-sucursal. Stack: Django, React (Vite + Bootstrap), PostgreSQL y Docker.

## Estructura

- `.specify/` — constitución Spec Kit
- `specs/` — especificaciones por módulo (001–007)
- `backend/` — API Django
- `frontend/` — SPA React + Vite + Bootstrap

## Base de datos (PostgreSQL existente)

No se crea una base nueva. El backend se conecta a la instancia local con:

| Parámetro | Valor |
|-----------|--------|
| Host | `localhost` (Django local) / `host.docker.internal` (backend en Docker) |
| Puerto | `5432` |
| Usuario | `postgres` |
| Contraseña | `postgreAdmin19` |
| Base de datos | `requeson_erp_db` |

El servicio `db` de Compose queda definido por si más adelante se necesita un Postgres en contenedor (`docker compose --profile bundled-db up`). Por defecto no se inicia, para no chocar con el PostgreSQL que ya corre en el host.

## Arranque

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health: http://localhost:8000/api/health/

El `package.json` del frontend ya incluye `bootstrap` y `react-bootstrap`. `npm install` se ejecuta al construir la imagen Docker; no es necesario instalar dependencias en el host para levantar Compose.
