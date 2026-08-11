import sqlite3
from contextlib import contextmanager

DB_PATH = "business.db"

STATUS_VALUES = ("scheduled", "in_progress", "completed", "cancelled")


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS parts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                model_number TEXT,
                warranty TEXT,
                UNIQUE (brand, name, model_number)
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS part_instances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                part_id INTEGER NOT NULL,
                serial_number TEXT NOT NULL,
                FOREIGN KEY (part_id) REFERENCES parts(id)
            )
        """)

        conn.execute(f"""
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT,
                phone TEXT,
                email TEXT,
                status TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN {STATUS_VALUES}),
                service_type TEXT,
                appointment_date TEXT,
                completed_date TEXT,
                work_done TEXT
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS appointment_parts (
                appointment_id INTEGER NOT NULL,
                part_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                PRIMARY KEY (appointment_id, part_id),
                FOREIGN KEY (appointment_id) REFERENCES appointments(id),
                FOREIGN KEY (part_id) REFERENCES parts(id)
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS photos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                appointment_id INTEGER NOT NULL,
                storage_key TEXT NOT NULL,
                FOREIGN KEY (appointment_id) REFERENCES appointments(id)
            )
        """)


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()