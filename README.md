# Blue Collar Business Suite (okacapp)

A field service management platform built for a Texas-based HVAC business. 

The goal: replace paper job sheets and phone-tag scheduling with a simple mobile-friendly tool a technician can use on-site, backed by a dashboard the office can use to manage the bigger picture.

Currently, we have been approaching this project in a modular approach, beginning with a more intuitive beta for select technicians before building up into the fully fleshed platform.

---

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Python, FastAPI, SQLite |
| Frontend | React (Vite), plain CSS |
| Object storage (planned) | AWS S3, `us-east-2` (Ohio) — closest region to Texas |
| Design reference | [Figma — HVAC](https://www.figma.com/design/gNBD1QoUgaHAyzJuX4v92L/HVAC) |

---

## Project structure

```
okacapp/                     # backend
├── main.py                  # FastAPI app
├── db.py                    # SQLite schema + connection handling
├── storage.py                # AWS S3 upload logic (photos) 
└── business.db               # SQLite database file

okacapp-frontend/            # technician-facing mobile web app
└── src/
    ├── api/client.js         # every backend call, in one place
    ├── pages/
    │   ├── SchedulePage.jsx          # 오늘의 스케줄 (today's appointment list)
    │   └── AppointmentDetailPage.jsx # job detail: notes, parts used, photos, complete
    ├── components/
    │   ├── AppointmentCard.jsx       # one row on the schedule list
    │   ├── AddAppointmentModal.jsx   # "새 일정" form
    │   └── AddPartForm.jsx           # inline add/edit form for parts used on a job
    └── assets/
        ├── brands/            # Carrier / Lennox / Trane logos (quick-select chips)
        └── icons/camera.svg
```

---

## Data model

Five tables, all in `db.py`:

- **`parts`** — the catalog of distinct part *types* (e.g. "Trane Coil"). Deduplicated on `(brand, name, model_number)` — creating the same part twice returns the existing row instead of a duplicate.
- **`part_instances`** — individual physical units, identified by serial number. Each instance is linked to **both** a `part_id` *and* an `appointment_id` — this second link matters: it's what lets the same part type be used across multiple appointments without their serial numbers bleeding into each other on the dashboard.
- **`appointments`** — one row per job. `service_type` (수리/설치/공사/기타) drives the color coding on the schedule list and detail page badge. `status` (`scheduled`/`in_progress`/`completed`/`cancelled`) is separate from `service_type` — one is *what kind* of job it is, the other is *where it stands*.
- **`appointment_parts`** — join table linking an appointment to the part types used on it, with a `quantity`.
- **`photos`** — stores a `storage_key` (a reference into S3), not the image bytes themselves.

---

## Backend API

All routes are in `main.py`. Interactive docs are available at `/docs` once the server is running.

**Parts**
- `POST /parts` — create (or return existing, if brand+name+model_number matches)
- `GET /parts`, `GET /parts/{id}`
- `POST /parts/{id}/instances` — register a serial number, optionally scoped to an `appointment_id`

**Appointments**
- `POST /appointments` — `service_type` and `appointment_date` are required; everything else is optional
- `GET /appointments`, `GET /appointments/{id}` (returns nested `parts` — each with its `serial_numbers` scoped to *this* appointment — and `photos`)
- `PATCH /appointments/{id}` — partial update; only send the fields you're changing (e.g. `{"status": "completed"}` doesn't require resending the date)
- `DELETE /appointments/{id}` — cascades to remove linked `appointment_parts` and `photos` rows first

**Appointment ↔ Parts**
- `POST /appointments/{id}/parts` — links a part, or increments quantity if already linked
- `PATCH /appointments/{id}/parts/{part_id}` — *sets* quantity directly (used when editing, as opposed to the `POST` above which adds to the existing count)
- `DELETE /appointments/{id}/parts/{part_id}/instances` — clears all serial numbers for that part on that appointment (used during editing: wipe, then re-add whatever's in the edit form)

**Photos**
- `POST /appointments/{id}/photos` — uploads to S3, saves the key. **Currently non-functional** until AWS credentials are configured (see below).
- `GET /photos/{id}/url` — generates a temporary signed URL for viewing

---

## Running it locally

**Backend:**
```bash
cd okacapp
uv add fastapi uvicorn python-multipart "boto3"
uv run uvicorn main:app --reload
```
Runs on `http://127.0.0.1:8000`. `business.db` is created automatically on first run.

**Frontend:**
```bash
cd okacapp-frontend
npm install
npm run dev
```
Runs on `http://127.0.0.1:5173`. Both servers need to be running simultaneously for the app to work — the frontend calls the backend directly over HTTP.

---

## What's not built yet

- **Object storage.** `storage.py` expects `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, and `S3_BUCKET` as environment variables. Until these are set, the app works fully except for photo upload, which will fail loudly rather than silently. AWS setup is intentionally deferred until the frontend is closer to deploy-ready.
- **Authentication.** None yet. Planned approach: a long-lived device token for the technician's single device (no login screen, since field access needs to be immediate), and Google Auth for the office dashboard, which will have multiple users.
- **The office dashboard.** Everything above is the technician-facing mobile site only.
- **Editing a part's brand/name.** Deliberately not allowed — `parts` is a shared catalog table, and letting one appointment's edit silently rewrite another appointment's historical part record would be a correctness bug, not a feature. Editing only touches quantity and serial numbers, both of which are specific to that one appointment's usage.
- **CORS is wide open** (`allow_origins=["*"]`) for local development convenience. This needs to be locked down to the actual frontend domain before any real deployment.

---

## Design notes

Service type colors are defined once, in `AppointmentDetailPage.jsx` (`SERVICE_COLORS`), and imported by `AppointmentCard.jsx` — intentionally a single source of truth after the two drifted out of sync once already.

| Type | Hex |
|---|---|
| 수리 (repair) | `#99B6C9` |
| 설치 (installation) | `#A5C0A1` |
| 공사 (construction) | `#C999AC` |
| 기타 (other) | `#C9A799` |
