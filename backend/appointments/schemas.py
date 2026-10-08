from ninja import ModelSchema

from appointments.models import Appointment, Invoice


class AppointmentIn(ModelSchema):
    class Meta:
        model = Appointment
        exclude = ["id"]


class AppointmentOut(ModelSchema):
    class Meta:
        model = Appointment
        fields = "__all__"


class InvoiceIn(ModelSchema):
    class Meta:
        model = Invoice
        exclude = ["id"]


class InvoiceOut(ModelSchema):
    class Meta:
        model = Invoice
        fields = "__all__"
