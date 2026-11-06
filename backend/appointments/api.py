from http import HTTPStatus

from django.conf import settings
from django.db import transaction
from django.http import FileResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from ninja import File, Router, Status, UploadedFile
from ninja.errors import HttpError
from ninja.pagination import paginate
from ninja.patch_dict import PatchDict

from appointments import photos
from appointments.images import UnsupportedImage, process_upload
from appointments.models import Appointment, Invoice, Photo
from appointments.schemas import (
    AppointmentIn,
    AppointmentOut,
    InvoiceIn,
    InvoiceOut,
    PhotoOut,
)
from inventory.models import AppointmentPart, Part
from inventory.schemas import AppointmentPartOut, PartUsedIn

router = Router(tags=["Appointments"])


@router.get("/", response=list[AppointmentOut], operation_id="listAppointments")
@paginate
def list_appointments(request):
    return Appointment.objects.all()


@router.get("/{appointment_id}", response=AppointmentOut, operation_id="getAppointment")
def get_appointment(request, appointment_id: int):
    return get_object_or_404(Appointment, id=appointment_id)


@router.post(
    "/", response={HTTPStatus.CREATED: AppointmentOut}, operation_id="createAppointment"
)
def create_appointment(request, payload: AppointmentIn):
    appointment = Appointment.objects.create(**payload.model_dump())
    return Status(HTTPStatus.CREATED, appointment)


@router.put(
    "/{appointment_id}", response=AppointmentOut, operation_id="updateAppointment"
)
def update_appointment(request, appointment_id: int, payload: AppointmentIn):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(appointment, key, value)
    appointment.save()
    return appointment


@router.patch(
    "/{appointment_id}", response=AppointmentOut, operation_id="patchAppointment"
)
def patch_appointment(request, appointment_id: int, payload: PatchDict[AppointmentIn]):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    for key, value in payload.items():
        setattr(appointment, key, value)
    appointment.save()
    return appointment


@router.get(
    "/{appointment_id}/invoices",
    response=list[InvoiceOut],
    operation_id="listAppointmentInvoices",
)
def list_appointment_invoices(request, appointment_id: int):
    get_object_or_404(Appointment, id=appointment_id)
    return Invoice.objects.filter(appointment_id=appointment_id)


@router.post(
    "/invoices", response={HTTPStatus.CREATED: InvoiceOut}, operation_id="createInvoice"
)
def create_invoice(request, payload: InvoiceIn):
    invoice = Invoice.objects.create(**payload.model_dump())
    return Status(HTTPStatus.CREATED, invoice)


@router.put("/invoices/{invoice_id}", response=InvoiceOut, operation_id="updateInvoice")
def update_invoice(request, invoice_id: int, payload: InvoiceIn):
    invoice = get_object_or_404(Invoice, id=invoice_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(invoice, key, value)
    invoice.save()
    return invoice


@router.get("/invoices/{invoice_id}", response=InvoiceOut, operation_id="getInvoice")
def get_invoice(request, invoice_id: int):
    return get_object_or_404(Invoice, id=invoice_id)


@router.get(
    "/{appointment_id}/parts",
    response=list[AppointmentPartOut],
    operation_id="listPartsUsed",
)
def list_parts_used(request, appointment_id: int):
    get_object_or_404(Appointment, id=appointment_id)
    return AppointmentPart.objects.filter(appointment_id=appointment_id).select_related(
        "part"
    )


def _get_or_create_part(*, brand: str, name: str, model_number: str) -> Part:
    """Reuse an existing part when its identifier matches case-insensitively."""
    existing = (
        Part.objects.filter(
            brand__iexact=brand,
            name__iexact=name,
            model_number__iexact=model_number,
        )
        .order_by("id")
        .first()
    )
    if existing:
        return existing
    return Part.objects.create(brand=brand, name=name, model_number=model_number)


def _merge_serials(existing: list[str], incoming: list[str]) -> list[str]:
    merged = list(existing)
    seen = {serial.casefold() for serial in existing}
    for serial in incoming:
        key = serial.casefold()
        if key not in seen:
            seen.add(key)
            merged.append(serial)
    return merged


@router.post(
    "/{appointment_id}/parts_used",
    response=AppointmentPartOut,
    operation_id="addPartUsed",
)
def add_part_used(request, appointment_id: int, payload: PartUsedIn):
    """Add a part to an appointment, accumulating quantity and serials."""
    appointment = get_object_or_404(Appointment, id=appointment_id)

    with transaction.atomic():
        part = _get_or_create_part(
            brand=payload.brand,
            name=payload.name,
            model_number=payload.model_number,
        )
        row, created = AppointmentPart.objects.get_or_create(
            appointment=appointment,
            part=part,
            defaults={
                "quantity": payload.quantity,
                "serial_numbers": payload.serial_numbers,
            },
        )
        if not created:
            row.quantity += payload.quantity
            row.serial_numbers = _merge_serials(
                row.serial_numbers, payload.serial_numbers
            )
            row.save(update_fields=["quantity", "serial_numbers"])

    return row


@router.patch(
    "/{appointment_id}/parts_used/{appointment_part_id}",
    response=AppointmentPartOut,
    operation_id="updatePartUsed",
)
def update_part_used(
    request,
    appointment_id: int,
    appointment_part_id: int,
    payload: PartUsedIn,
):
    """Replace the quantity/serials of a part used, and optionally its identity.

    Part details are shared across appointments, so editing them affects every
    appointment that uses the same part.
    """
    get_object_or_404(Appointment, id=appointment_id)

    with transaction.atomic():
        row = get_object_or_404(
            AppointmentPart, id=appointment_part_id, appointment_id=appointment_id
        )
        part = row.part

        identity_changed = (
            part.brand != payload.brand
            or part.name != payload.name
            or part.model_number != payload.model_number
        )
        if identity_changed:
            conflict = (
                AppointmentPart.objects.filter(
                    appointment_id=appointment_id,
                    part__brand__iexact=payload.brand,
                    part__name__iexact=payload.name,
                    part__model_number__iexact=payload.model_number,
                )
                .exclude(pk=row.pk)
                .exists()
            )
            if conflict:
                raise HttpError(
                    409,
                    "Another part on this appointment already has these details",
                )

            part.brand = payload.brand
            part.name = payload.name
            part.model_number = payload.model_number
            part.save(update_fields=["brand", "name", "model_number"])

        row.quantity = payload.quantity
        row.serial_numbers = payload.serial_numbers
        row.save(update_fields=["quantity", "serial_numbers"])

    return row


@router.post(
    "/{appointment_id}/photos",
    response={HTTPStatus.CREATED: PhotoOut},
    operation_id="addPhoto",
)
def add_photo(request, appointment_id: int, file: File[UploadedFile]):
    appointment = get_object_or_404(Appointment, id=appointment_id)

    if file.size > settings.PHOTO_MAX_UPLOAD_BYTES:
        raise HttpError(413, "Photo is too large")

    try:
        processed = process_upload(file)
    except UnsupportedImage as exc:
        raise HttpError(400, str(exc)) from exc

    full_key = photos.new_key(appointment_id)
    thumb_key = photos.new_key(appointment_id, suffix="_thumb")
    saved_key = photos.save_bytes(full_key, processed.full)
    saved_thumb_key = photos.save_bytes(thumb_key, processed.thumbnail)

    try:
        photo = Photo.objects.create(
            appointment=appointment,
            storage_key=saved_key,
            thumbnail_key=saved_thumb_key,
            content_type=processed.content_type,
            width=processed.width,
            height=processed.height,
        )
    except Exception:
        photos.delete_bytes(saved_key)
        photos.delete_bytes(saved_thumb_key)
        raise

    return Status(HTTPStatus.CREATED, photo)


@router.get(
    "/{appointment_id}/photos",
    response=list[PhotoOut],
    operation_id="listPhotos",
)
def list_photos(request, appointment_id: int):
    get_object_or_404(Appointment, id=appointment_id)
    return Photo.objects.filter(appointment_id=appointment_id)


@router.delete(
    "/photos/{photo_id}",
    response={HTTPStatus.NO_CONTENT: None},
    operation_id="deletePhoto",
)
def delete_photo(request, photo_id: int):
    photo = get_object_or_404(Photo, id=photo_id)
    photo.delete()  # blobs removed by the post_delete receiver
    return HTTPStatus.NO_CONTENT, None


@router.get("/photos/{photo_id}/content", operation_id="getPhotoContent")
def get_photo_content(request, photo_id: int, thumb: bool = False):
    photo = get_object_or_404(Photo, id=photo_id)
    key = photo.thumbnail_key if thumb and photo.thumbnail_key else photo.storage_key

    if settings.PHOTO_SERVE_MODE == "redirect":
        return HttpResponseRedirect(photos.direct_url(key))

    try:
        handle = photos.open_bytes(key)
    except FileNotFoundError as exc:
        raise HttpError(404, "Photo file is missing") from exc

    return FileResponse(handle, content_type=photo.content_type)
