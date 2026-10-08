from ninja import ModelSchema

from inventory.models import Part, PartInstance


class PartIn(ModelSchema):
    class Meta:
        model = Part
        exclude = ["id"]


class PartOut(ModelSchema):
    class Meta:
        model = Part
        fields = "__all__"


class PartInstanceIn(ModelSchema):
    class Meta:
        model = PartInstance
        exclude = ["id"]


class PartInstanceOut(ModelSchema):
    class Meta:
        model = PartInstance
        fields = "__all__"
