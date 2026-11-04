from http import HTTPStatus

from django.shortcuts import get_object_or_404
from ninja import Router, Status
from ninja.pagination import paginate

from inventory.models import AppointmentPart, Part
from inventory.schemas import AppointmentPartIn, AppointmentPartOut, PartIn, PartOut

router = Router(tags=["Inventory"])


@router.get("/", response=list[PartOut], operation_id="listParts")
@paginate
def list_parts(request):
    return Part.objects.all()


@router.get("/{part_id}", response=PartOut, operation_id="getPart")
def get_part(request, part_id: int):
    return get_object_or_404(Part, id=part_id)


@router.post("/", response={HTTPStatus.CREATED: PartOut}, operation_id="createPart")
def create_part(request, payload: PartIn):
    part = Part.objects.create(**payload.model_dump())
    return Status(HTTPStatus.CREATED, part)


@router.put("/{part_id}", response=PartOut, operation_id="updatePart")
def update_part(request, part_id: int, payload: PartIn):
    part = get_object_or_404(Part, id=part_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(part, key, value)
    part.save()
    return part


@router.get(
    "/appointment_parts/{appointment_part_id}",
    response=AppointmentPartOut,
    operation_id="getAppointmentPart",
)
def get_appointment_part(request, appointment_part_id: int):
    return get_object_or_404(AppointmentPart, id=appointment_part_id)


@router.get(
    "/appointment_parts",
    response=list[AppointmentPartOut],
    operation_id="listAppointmentParts",
)
@paginate
def list_appointment_parts(request):
    return AppointmentPart.objects.select_related("part").all()


@router.post(
    "/appointment_parts",
    response={HTTPStatus.CREATED: AppointmentPartOut},
    operation_id="createAppointmentPart",
)
def create_appointment_part(request, payload: AppointmentPartIn):
    # `by_alias=True` maps the FK fields to `part_id` / `appointment_id`, which is
    # what `objects.create()` expects for relations.
    appointment_part = AppointmentPart.objects.create(
        **payload.model_dump(by_alias=True)
    )
    return Status(HTTPStatus.CREATED, appointment_part)


@router.put(
    "/appointment_parts/{appointment_part_id}",
    response=AppointmentPartOut,
    operation_id="updateAppointmentPart",
)
def update_appointment_part(
    request, appointment_part_id: int, payload: AppointmentPartIn
):
    appointment_part = get_object_or_404(AppointmentPart, id=appointment_part_id)
    for key, value in payload.model_dump(by_alias=True, exclude_unset=True).items():
        setattr(appointment_part, key, value)
    appointment_part.save()
    return appointment_part
