from http import HTTPStatus

from django.shortcuts import get_object_or_404
from inventory.models import PartInstance
from inventory.schemas import PartInstanceOut
from ninja import Router, Status
from ninja.pagination import paginate

from appointments.models import Appointment, Invoice, Photo
from appointments.schemas import AppointmentIn, AppointmentOut, InvoiceIn, InvoiceOut

router = Router(tags=["Appointments"])


@router.get("/", response=list[AppointmentOut])
@paginate
def list_appointments(request):
    return Appointment.objects.all()


@router.get("/{appointment_id}", response=AppointmentOut)
def get_appointment(request, appointment_id: int):
    return get_object_or_404(Appointment, id=appointment_id)


@router.post("/", response={HTTPStatus.CREATED: AppointmentOut})
def create_appointment(request, payload: AppointmentIn):
    appointment = Appointment.objects.create(**payload.model_dump())
    return Status(HTTPStatus.CREATED, appointment)


@router.put("/{appointment_id}", response=AppointmentOut)
def update_appointment(request, appointment_id: int, payload: AppointmentIn):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(appointment, key, value)
    appointment.save()
    return appointment


@router.get("/{appointment_id}/invoices", response=list[InvoiceOut])
def list_appointment_invoices(request, appointment_id: int):
    get_object_or_404(Appointment, id=appointment_id)
    return Invoice.objects.filter(appointment_id=appointment_id)


@router.post("/invoices", response={HTTPStatus.CREATED: InvoiceOut})
def create_invoice(request, payload: InvoiceIn):
    invoice = Invoice.objects.create(**payload.model_dump())
    return Status(HTTPStatus.CREATED, invoice)


@router.put("/invoices/{invoice_id}", response=InvoiceOut)
def update_invoice(request, invoice_id: int, payload: InvoiceIn):
    invoice = get_object_or_404(Invoice, id=invoice_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(invoice, key, value)
    invoice.save()
    return invoice


@router.get("/invoices/{invoice_id}", response=InvoiceOut)
def get_invoice(request, invoice_id: int):
    return get_object_or_404(Invoice, id=invoice_id)


@router.get("/{appointment_id}/part_instances", response=list[PartInstanceOut])
def list_appointment_parts(request, appointment_id: int):
    get_object_or_404(Appointment, id=appointment_id)
    return PartInstance.objects.filter(appointment_id=appointment_id)
