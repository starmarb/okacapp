from ninja import ModelSchema

from inventory.models import Part, PartInstance


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


class PartInstanceIn(ModelSchema):
    serial_number: str = ""

    class Meta:
        model = PartInstance
        exclude = ["id"]


class PartInstanceOut(ModelSchema):
    id: int
    serial_number: str

    class Meta:
        model = PartInstance
        fields = "__all__"


class PartInstanceWithPartOut(ModelSchema):
    # Embeds the full Part so a single request is enough to group instances by
    # part. Remember to `.select_related("part")` the queryset, or serializing
    # will dereference the FK once per row (N+1).
    id: int
    serial_number: str
    part: PartOut

    class Meta:
        model = PartInstance
        fields = "__all__"
