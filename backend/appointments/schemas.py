from datetime import datetime
from decimal import Decimal

from ninja import ModelSchema

from appointments.models import (
    Appointment,
    AppointmentStatus,
    Invoice,
    Photo,
    ServiceType,
)


class AppointmentIn(ModelSchema):
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    service_type: ServiceType = ServiceType.OTHER
    # These columns are NOT NULL in the database (blank=True, not null=True), so the
    # API must not accept null for them. Declaring a default keeps them omittable
    # while pinning the type to `str`.
    address: str = ""
    phone: str = ""
    email: str = ""
    work_done: str = ""

    class Meta:
        model = Appointment
        exclude = ["id"]


class AppointmentOut(ModelSchema):
    # ModelSchema marks a field optional when the model field is blank/null or has a
    # default. That is meaningful for input, but a response always contains every
    # field, so redeclare them as required. Only `completed_date` is genuinely
    # nullable (null=True on the model).
    status: AppointmentStatus
    service_type: ServiceType
    id: int
    address: str
    phone: str
    email: str
    work_done: str
    completed_date: datetime | None

    class Meta:
        model = Appointment
        fields = "__all__"


class InvoiceIn(ModelSchema):
    class Meta:
        model = Invoice
        exclude = ["id"]


class InvoiceOut(ModelSchema):
    # Same reasoning as AppointmentOut: every field is present in a response.
    id: int
    total_service: Decimal
    total_parts: Decimal
    discount: Decimal
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    warranty_extension: bool

    class Meta:
        model = Invoice
        fields = "__all__"


class PhotoOut(ModelSchema):
    # Only what a caller actually renders: identity, intrinsic size for layout,
    # and URLs. Storage keys and bookkeeping stay server-side.
    id: int
    width: int
    height: int
    url: str
    thumbnail_url: str

    class Meta:
        model = Photo
        exclude = [
            "storage_key",
            "thumbnail_key",
            "appointment",
            "content_type",
            "created_at",
        ]

    @staticmethod
    def resolve_url(obj: Photo) -> str:
        return f"/api/appointments/photos/{obj.pk}/content"

    @staticmethod
    def resolve_thumbnail_url(obj: Photo) -> str:
        return f"/api/appointments/photos/{obj.pk}/content?thumb=1"
