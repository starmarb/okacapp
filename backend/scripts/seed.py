#!/usr/bin/env python3
"""Seed the development DB with a few coherent records.

Run from the backend/ directory:
    uv run python scripts/seed.py

Wipes appointments/parts/part_instances/invoices, then inserts a small,
consistent dataset. Dev-only (refuses when DEBUG is False).
"""

import os
import random
import sys
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

import django

# Make <backend>/ importable so `okac.settings` resolves, regardless of CWD.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "okac.settings")
django.setup()

from django.conf import settings  # noqa: E402
from django.db import transaction  # noqa: E402
from django.utils import timezone  # noqa: E402

from appointments.models import (  # noqa: E402
    Appointment,
    AppointmentStatus,
    Invoice,
    ServiceType,
)
from inventory.models import Part, PartInstance  # noqa: E402

# name, phone, email, address, status, service_type, day_offset, work_done
APPOINTMENTS = [
    (
        "Jane Doe",
        "010-1111-2222",
        "jane@example.com",
        "12 Maple St",
        AppointmentStatus.COMPLETED,
        ServiceType.REPAIR,
        -10,
        "Replaced compressor.",
    ),
    (
        "John Smith",
        "010-3333-4444",
        "john@example.com",
        "5 Oak Ave",
        AppointmentStatus.COMPLETED,
        ServiceType.INSTALL,
        -4,
        "Installed new unit.",
    ),
    (
        "Acme Corp",
        "010-5555-6666",
        "ops@acme.com",
        "88 Industrial Rd",
        AppointmentStatus.IN_PROGRESS,
        ServiceType.CONSTRUCTION,
        0,
        "",
    ),
    (
        "Maria Garcia",
        "010-7777-8888",
        "maria@example.com",
        "9 Pine Blvd",
        AppointmentStatus.SCHEDULED,
        ServiceType.REPAIR,
        2,
        "",
    ),
    (
        "David Lee",
        "010-9999-0000",
        "david@example.com",
        "301 Elm St",
        AppointmentStatus.SCHEDULED,
        ServiceType.OTHER,
        5,
        "",
    ),
    (
        "Sunny Kim",
        "010-2222-3333",
        "sunny@example.com",
        "14 Birch Ln",
        AppointmentStatus.CANCELLED,
        ServiceType.INSTALL,
        7,
        "",
    ),
]

# brand, name, model_number, warranty
PARTS = [
    ("Bosch", "Brake Pad", "BP-100", "12 months"),
    ("Samsung", "Compressor", "SC-220", "24 months"),
    ("LG", "Thermostat", "LT-310", ""),
    ("Daikin", "Fan Motor", "DM-405", "6 months"),
    ("Carrier", "Capacitor", "CC-512", ""),
    ("Mitsubishi", "Control Board", "MB-601", "18 months"),
    ("Panasonic", "Filter", "PF-700", ""),
    ("LG", "Compressor", "LC-880", "24 months"),
    ("Samsung", "Display Panel", "SD-910", "12 months"),
    ("General", "Valve", "GV-099", ""),
]

PART_INSTANCE_COUNT = 20
TAX_RATE = Decimal("0.10")


def main() -> None:
    if not settings.DEBUG:
        raise SystemExit("Refusing to seed: DEBUG is False (not a dev environment).")

    random.seed(0)  # deterministic distribution
    now = timezone.now()

    with transaction.atomic():
        # Wipe. PartInstance first: Part is PROTECTed while instances exist.
        PartInstance.objects.all().delete()
        Invoice.objects.all().delete()
        Part.objects.all().delete()
        Appointment.objects.all().delete()

        appointments = []
        for (
            name,
            phone,
            email,
            address,
            status,
            service_type,
            day_offset,
            work_done,
        ) in APPOINTMENTS:
            appt_date = now + timedelta(days=day_offset)
            completed = (
                appt_date + timedelta(hours=3)
                if status == AppointmentStatus.COMPLETED
                else None
            )
            appointments.append(
                Appointment.objects.create(
                    name=name,
                    phone=phone,
                    email=email,
                    address=address,
                    status=status,
                    service_type=service_type,
                    appointment_date=appt_date,
                    completed_date=completed,
                    work_done=work_done,
                )
            )

        parts = [
            Part.objects.create(
                brand=brand, name=name, model_number=model_number, warranty=warranty
            )
            for brand, name, model_number, warranty in PARTS
        ]

        for i in range(1, PART_INSTANCE_COUNT + 1):
            PartInstance.objects.create(
                part=random.choice(parts),
                appointment=random.choice(appointments),
                serial_number=f"SN-{i:04d}",
            )

        for appointment in appointments:
            total_service = Decimal(random.randrange(50, 500, 10))
            total_parts = Decimal(random.randrange(0, 400, 10))
            discount = Decimal(random.choice([0, 0, 10, 20]))
            subtotal = total_service + total_parts - discount
            tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
            Invoice.objects.create(
                appointment=appointment,
                total_service=total_service,
                total_parts=total_parts,
                discount=discount,
                subtotal=subtotal,
                tax=tax,
                total=subtotal + tax,
                warranty_extension=random.choice([True, False]),
            )

    print(
        f"Seeded {Appointment.objects.count()} appointments, "
        f"{Part.objects.count()} parts, "
        f"{PartInstance.objects.count()} part instances, "
        f"{Invoice.objects.count()} invoices."
    )


if __name__ == "__main__":
    main()
