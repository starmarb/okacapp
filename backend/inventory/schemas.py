from ninja import ModelSchema, Schema
from pydantic import model_validator

from inventory.models import AppointmentPart, Part


def _validate_identifier(name: str, model_number: str) -> None:
    if not name.strip() and not model_number.strip():
        raise ValueError("Provide a name or a model number")


class PartIn(ModelSchema):
    # `warranty`, `name` and `model_number` are NOT NULL in the database
    # (blank=True, not null=True), so the API must not accept null for them. A
    # default keeps them omittable while pinning the type to `str`.
    warranty: str = ""
    name: str = ""
    model_number: str = ""

    class Meta:
        model = Part
        exclude = ["id"]

    @model_validator(mode="after")
    def _require_identifier(self):
        _validate_identifier(self.name, self.model_number)
        return self


class PartOut(ModelSchema):
    # ModelSchema marks a field optional when the model field is blank/null or has a
    # default. A response always contains every field, so redeclare them as required.
    id: int
    name: str
    model_number: str
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
    id: int
    part: PartOut
    quantity: int
    serial_numbers: list[str]

    class Meta:
        model = AppointmentPart
        fields = "__all__"


class PartUsedIn(Schema):
    """Payload for adding or editing a part used on an appointment."""

    brand: str
    name: str = ""
    model_number: str = ""
    quantity: int = 1
    serial_numbers: list[str] = []

    @model_validator(mode="after")
    def _normalize(self):
        self.brand = self.brand.strip()
        self.name = self.name.strip()
        self.model_number = self.model_number.strip()

        if not self.brand:
            raise ValueError("Brand is required")
        _validate_identifier(self.name, self.model_number)
        if self.quantity < 1:
            raise ValueError("Quantity must be at least 1")

        serials: list[str] = []
        seen: set[str] = set()
        for serial in self.serial_numbers:
            cleaned = serial.strip()
            if not cleaned:
                continue
            key = cleaned.casefold()
            if key in seen:
                continue
            seen.add(key)
            serials.append(cleaned)

        if len(serials) > self.quantity:
            raise ValueError("Serial numbers cannot exceed quantity")

        self.serial_numbers = serials
        return self
