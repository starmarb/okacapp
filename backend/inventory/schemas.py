from ninja import ModelSchema

from inventory.models import AppointmentPart, Part


class PartIn(ModelSchema):
    # `warranty` is NOT NULL in the database (blank=True, not null=True), so the API
    # must not accept null for it. A default keeps it omittable while pinning the
    # type to `str`.
    warranty: str = ""

    class Meta:
        model = Part
        exclude = ["id"]


class PartOut(ModelSchema):
    # ModelSchema marks a field optional when the model field is blank/null or has a
    # default. A response always contains every field, so redeclare them as required.
    id: int
    warranty: str

    class Meta:
        model = Part
        fields = "__all__"


class AppointmentPartIn(ModelSchema):
    quantity: int = 1
    serial_numbers: list[str] = []

    class Meta:
        model = AppointmentPart
        exclude = ["id"]


class AppointmentPartOut(ModelSchema):
    # One row per (part, appointment). `part` is embedded so a single request is
    # enough to render the "parts used" list; remember to `.select_related("part")`
    # the queryset or serializing dereferences the FK once per row (N+1).
    id: int
    part: PartOut
    quantity: int
    serial_numbers: list[str]
    appointment: int

    class Meta:
        model = AppointmentPart
        fields = "__all__"
