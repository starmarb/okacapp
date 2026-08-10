from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel

from db import init_db, get_db, STATUS_VALUES
from storage import upload_photo, get_photo_url


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


# ---------- Pydantic models ----------

class PartIn(BaseModel):
    brand: str
    name: str
    model_number: Optional[str] = None
    warranty: Optional[str] = None


class PartInstanceIn(BaseModel):
    serial_number: str


class AppointmentIn(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: str = "scheduled"
    appointment_date: Optional[str] = None
    completed_date: Optional[str] = None
    work_done: Optional[str] = None


class AppointmentPartIn(BaseModel):
    part_id: int
    quantity: int = 1


# ---------- Parts ----------

@app.post("/parts")
async def create_part(part: PartIn):
    with get_db() as conn:
        existing = conn.execute(
            "SELECT * FROM parts WHERE brand = ? AND name = ? AND model_number IS ?",
            (part.brand, part.name, part.model_number),
        ).fetchone()
        if existing:
            return dict(existing)

        cur = conn.execute(
            "INSERT INTO parts (brand, name, model_number, warranty) VALUES (?, ?, ?, ?)",
            (part.brand, part.name, part.model_number, part.warranty),
        )
        return {"id": cur.lastrowid, **part.model_dump()}


@app.get("/parts")
async def list_parts():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM parts").fetchall()
        return [dict(r) for r in rows]


@app.get("/parts/{part_id}")
async def get_part(part_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Part not found")
        instances = conn.execute(
            "SELECT id, serial_number FROM part_instances WHERE part_id = ?", (part_id,)
        ).fetchall()
        result = dict(row)
        result["instances"] = [dict(i) for i in instances]
        return result


@app.post("/parts/{part_id}/instances")
async def add_part_instance(part_id: int, instance: PartInstanceIn):
    with get_db() as conn:
        part = conn.execute("SELECT id FROM parts WHERE id = ?", (part_id,)).fetchone()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        cur = conn.execute(
            "INSERT INTO part_instances (part_id, serial_number) VALUES (?, ?)",
            (part_id, instance.serial_number),
        )
        return {"id": cur.lastrowid, "part_id": part_id, "serial_number": instance.serial_number}


# ---------- Appointments ----------

@app.post("/appointments")
async def create_appointment(appt: AppointmentIn):
    if appt.status not in STATUS_VALUES:
        raise HTTPException(status_code=400, detail=f"status must be one of {STATUS_VALUES}")
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO appointments
               (name, address, phone, email, status, appointment_date, completed_date, work_done)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (appt.name, appt.address, appt.phone, appt.email, appt.status,
             appt.appointment_date, appt.completed_date, appt.work_done),
        )
        return {"id": cur.lastrowid, **appt.model_dump()}


@app.get("/appointments")
async def list_appointments():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM appointments").fetchall()
        return [dict(r) for r in rows]


@app.get("/appointments/{appointment_id}")
async def get_appointment(appointment_id: int):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM appointments WHERE id = ?", (appointment_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Appointment not found")

        parts = conn.execute(
            """SELECT p.id, p.brand, p.name, p.model_number, p.warranty, ap.quantity
               FROM appointment_parts ap
               JOIN parts p ON p.id = ap.part_id
               WHERE ap.appointment_id = ?""",
            (appointment_id,),
        ).fetchall()

        photos = conn.execute(
            "SELECT id, storage_key FROM photos WHERE appointment_id = ?",
            (appointment_id,),
        ).fetchall()

        result = dict(row)
        result["parts"] = [dict(p) for p in parts]
        result["photos"] = [dict(p) for p in photos]
        return result


@app.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: int):
    """Deletes an appointment and its linked appointment_parts/photos rows.
    The dashboard decides WHEN to call this (e.g. 3 months after completion) —
    this endpoint just performs the deletion on request."""
    with get_db() as conn:
        appt = conn.execute(
            "SELECT id FROM appointments WHERE id = ?", (appointment_id,)
        ).fetchone()
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")

        conn.execute("DELETE FROM appointment_parts WHERE appointment_id = ?", (appointment_id,))
        conn.execute("DELETE FROM photos WHERE appointment_id = ?", (appointment_id,))
        conn.execute("DELETE FROM appointments WHERE id = ?", (appointment_id,))
        return {"deleted": appointment_id}


@app.post("/appointments/{appointment_id}/parts")
async def add_part_to_appointment(appointment_id: int, ap: AppointmentPartIn):
    with get_db() as conn:
        appt = conn.execute(
            "SELECT id FROM appointments WHERE id = ?", (appointment_id,)
        ).fetchone()
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        part = conn.execute("SELECT id FROM parts WHERE id = ?", (ap.part_id,)).fetchone()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")

        conn.execute(
            """INSERT INTO appointment_parts (appointment_id, part_id, quantity)
               VALUES (?, ?, ?)
               ON CONFLICT(appointment_id, part_id) DO UPDATE SET quantity = quantity + excluded.quantity""",
            (appointment_id, ap.part_id, ap.quantity),
        )
        return {"appointment_id": appointment_id, "part_id": ap.part_id, "quantity": ap.quantity}


@app.post("/appointments/{appointment_id}/photos")
async def add_photo(appointment_id: int, file: UploadFile = File(...)):
    with get_db() as conn:
        appt = conn.execute(
            "SELECT id FROM appointments WHERE id = ?", (appointment_id,)
        ).fetchone()
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")

        file_bytes = await file.read()
        storage_key = upload_photo(file_bytes, file.filename, file.content_type)

        cur = conn.execute(
            "INSERT INTO photos (appointment_id, storage_key) VALUES (?, ?)",
            (appointment_id, storage_key),
        )
        return {"id": cur.lastrowid, "appointment_id": appointment_id, "storage_key": storage_key}


@app.get("/photos/{photo_id}/url")
async def get_photo_signed_url(photo_id: int):
    """Returns a temporary URL the dashboard/website can use to display the photo."""
    with get_db() as conn:
        row = conn.execute("SELECT storage_key FROM photos WHERE id = ?", (photo_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Photo not found")
        return {"url": get_photo_url(row["storage_key"])}


@app.get("/")
async def root():
    return {"message": "Hello World"}