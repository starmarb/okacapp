# Development

Onboarding guide for running okacapp locally and keeping the frontend API client in sync with the backend.

## Prerequisites

| Tool   | Version                                                     | Notes                                           |
| ------ | ----------------------------------------------------------- | ----------------------------------------------- |
| Python | 3.12+                                                       | managed with [`uv`](https://docs.astral.sh/uv/) |
| Node   | Angular 22 requires `>=22.22.3`, `>=24.15.0`, or `>=26.0.0` | `npm` comes with it                             |
| Docker | only if you switch photo storage to an S3-compatible server | not needed for the default setup                |

No environment variables are required for local development — the defaults in `backend/okac/settings.py` point at local disk and SQLite.

## First-time setup

```bash
git clone <repo> okacapp
cd okacapp

# Backend: create .venv + install deps, create the SQLite schema
cd backend
uv sync
uv run manage.py migrate

# Optional: sample data (wipes appointments/parts/appointment_parts/invoices; dev only)
uv run python scripts/seed.py

# Optional: Django admin login at http://localhost:8000/admin
uv run manage.py createsuperuser

# Frontend
cd ../frontend
npm ci

# Make the dev script executable (once)
cd ..
chmod +x dev.sh
```

## Running everything

```bash
./dev.sh
```

- Frontend: <http://localhost:4200> ← **use this for the app**
- Backend: <http://localhost:8000>
- API docs (Swagger): <http://localhost:8000/api/docs>
- Django admin: <http://localhost:8000/admin>

Ctrl-C stops both servers.

`dev.sh` does three things:

1. Runs `npm ci` in `frontend/` **only if** `node_modules/.bin/ng` is missing.
2. Starts Django via `uv run manage.py runserver` (which also syncs the Python env).
3. Starts Angular via `npm start` (hot reload).

The Angular dev server proxies `/api` to `localhost:8000` (see `frontend/proxy.conf.json`), which is why everything goes through `:4200`. It also keeps the app and API same-origin, so cookies/CSRF behave the same as in production.

### Running the servers separately

```bash
# terminal 1
cd backend && uv run manage.py runserver

# terminal 2
cd frontend && npm start
```

## After pulling changes

```bash
cd backend && uv run manage.py migrate
```

Migrations are committed; `dev.sh` does **not** run them for you. If the sample dataset changed, re-run the seed script (it wipes data).

Also:

- If `pyproject.toml` / `uv.lock` changed, `uv run` installs the new packages automatically on the next start (or run `uv sync` up front).
- If `package.json` / `package-lock.json` changed, run `npm ci` in `frontend/` — `dev.sh` only installs when `ng` is missing, not when the lockfile moves.
- If any schema or endpoint changed, regenerate the API client (next section).

## Regenerating the API client

The frontend talks to the backend through a generated Angular client in `frontend/src/app/api/`. It is checked in, but it must be **regenerated** whenever a backend schema, endpoint, path, or operation id changes.

1. Make sure the backend is running (`./dev.sh`, or `uv run manage.py runserver`).
2. From the frontend directory:

```bash
cd frontend
python3 scripts/generate_api.py
```

The script:

- fetches `http://localhost:8000/api/openapi.json`,
- saves it to `frontend/openapi/openapi.json`,
- runs `ng-openapi-gen` to rewrite `frontend/src/app/api/**`.

Useful variations:

```bash
# different backend URL
OPENAPI_URL=http://localhost:8001/api/openapi.json python3 scripts/generate_api.py

# or pass it as an argument
python3 scripts/generate_api.py http://localhost:8001/api/openapi.json
```

It requires `node_modules` to be installed (it uses `node_modules/.bin/ng-openapi-gen`).

> Never hand-edit `frontend/openapi/openapi.json` or anything under `frontend/src/app/api/`. Changes there are overwritten on the next run.

## Definition of done

Before calling a change finished (or opening a PR):

- [ ] **Model changed?** Create and commit a migration, then apply it locally:

    ```bash
    cd backend
    uv run manage.py makemigrations <app_label>
    uv run manage.py migrate
    ```

- [ ] **Schema, endpoint, path, or `operation_id` changed?** Regenerate and commit the client:

    ```bash
    cd frontend && python3 scripts/generate_api.py
    ```

    (this updates `openapi/openapi.json` and `src/app/api/**`)

- [ ] **Backend clean:** `cd backend && uv run manage.py check`
- [ ] **Frontend type-checks:** `cd frontend && npx ngc -p tsconfig.app.json --noEmit`
- [ ] **No generated files hand-edited** — `src/app/api/**` and `openapi/openapi.json` are outputs.
- [ ] **New dependency?** `uv add` (backend) or `npm install` (frontend), and commit the lockfile.
- [ ] **Nothing ignored committed:** no `db.sqlite3`, no `media/`, no `.env`, no secrets.

## Project layout

```
backend/
  appointments/     appointments, invoices, photos (models, schemas, api, photos.py, images.py)
  inventory/        parts and appointment-part usages
  okac/             settings, urls, API registration
  scripts/seed.py   dev seed data
  db.sqlite3        local DB (gitignored)
  media/            uploaded photos (gitignored)

frontend/
  src/app/api/          generated client — do not edit
  src/app/features/     pages and forms
  src/app/shared/       shared presentational components
  openapi/openapi.json  fetched spec — do not edit
  scripts/generate_api.py

dev.sh
```

## Adding dependencies

```bash
# Python
cd backend && uv add <package>

# JavaScript
cd frontend && npm install <package>
```

`uv run` installs anything added to `pyproject.toml` on the next start, so you don't normally need a separate `uv sync`.

## Database

- SQLite at `backend/db.sqlite3` (gitignored).
- Migrations live in each app's `migrations/` and are committed.
- Create one after a model change:

```bash
cd backend
uv run manage.py makemigrations <app_label>
uv run manage.py migrate
```

## Photo storage

Photos are stored behind a named Django storage alias, `STORAGES["photos"]`, and only ever accessed through `backend/appointments/photos.py`.

- Default: local filesystem under `backend/media/photos/`.
- The database stores opaque **keys**, never URLs.
- Serving is proxied through `GET /api/appointments/photos/{id}/content` (`PHOTO_SERVE_MODE=proxy`).
- Uploads are re-encoded to WebP with a 400 px thumbnail (`appointments/images.py`).

To move to an S3-compatible server later, no application code changes — only env vars:

```bash
PHOTO_STORAGE_BACKEND=storages.backends.s3.S3Storage
PHOTO_BUCKET=okac-photos
PHOTO_ENDPOINT_URL=http://rustfs:9000
PHOTO_ACCESS_KEY=...
PHOTO_SECRET_KEY=...
PHOTO_REGION=us-east-1
```

(requires `django-storages[s3]` and `boto3`). Existing objects keep the same keys, so migration is a file copy.

## Tests and checks

```bash
cd backend && uv run manage.py check
cd backend && uv run manage.py test

cd frontend && npm test -- --watch=false
```

Type-check the frontend without a full build:

```bash
cd frontend && npx ngc -p tsconfig.app.json --noEmit
```

## Conventions

- Backend: schemas are named `<Model>In` / `<Model>Out`, and every endpoint declares an explicit `operation_id` (it becomes the frontend method name, e.g. `listPartsUsed`).
- Backend: key/list operations are exposed per resource; compound writes live on the appointment (e.g. `POST /api/appointments/{id}/parts_used`).
- Frontend: standalone components, signals, `input()`/`output()`, Signal Forms. See [`frontend/best_practices.md`](frontend/best_practices.md).
- Never redeclare API types by hand — import them from `@app/api/models` and regenerate the client when they change.
- Photo access always goes through `backend/appointments/photos.py`; part usages through the `AppointmentPart` model.

## Troubleshooting

| Symptom                                    | Fix                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `ng: not found` when starting              | `npm ci` (or re-run `dev.sh`, which installs if missing)                              |
| `no such table: ...`                       | `uv run manage.py migrate`                                                            |
| 404 on `/api/...` from the app             | Use `http://localhost:4200`; check the backend is up (`:8000`)                        |
| Type errors on generated API types         | Regenerate the client (see above)                                                     |
| `ng build` aborts with a Node malloc error | This has been observed on Node 26.11; try Node 24 LTS                                 |
| Port already in use                        | Stop the old process, or run the backend on another port and update `proxy.conf.json` |
| Uploads fail with 413 in production        | nginx `client_max_body_size` (default 1 MB) is too low                                |

## Notes

- Authentication is not implemented yet; the API and photo endpoints are open.
- `backend/db.sqlite3` and `backend/media/` are gitignored — don't commit them.
- Seed data is dev-only; `scripts/seed.py` refuses to run when `DEBUG` is false.
