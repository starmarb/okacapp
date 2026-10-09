from http import HTTPStatus

from django.shortcuts import get_object_or_404
from ninja import Router, Status
from ninja.pagination import paginate

from inventory.models import Part, PartInstance
from inventory.schemas import PartIn, PartInstanceIn, PartInstanceOut, PartOut

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
    "/instances/{instance_id}", response=PartInstanceOut, operation_id="getPartInstance"
)
def get_part_instance(request, instance_id: int):
    return get_object_or_404(PartInstance, id=instance_id)


@router.get(
    "/instances", response=list[PartInstanceOut], operation_id="listPartInstances"
)
@paginate
def list_part_instances(request):
    return PartInstance.objects.all()


@router.post(
    "/instances",
    response={HTTPStatus.CREATED: PartInstanceOut},
    operation_id="createPartInstance",
)
def create_part_instance(request, payload: PartInstanceIn):
    part_instance = PartInstance.objects.create(**payload.model_dump())
    return Status(HTTPStatus.CREATED, part_instance)


@router.put(
    "/instances/{instance_id}",
    response=PartInstanceOut,
    operation_id="updatePartInstance",
)
def update_part_instance(request, instance_id: int, payload: PartInstanceIn):
    part_instance = get_object_or_404(PartInstance, id=instance_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(part_instance, key, value)
    part_instance.save()
    return part_instance
