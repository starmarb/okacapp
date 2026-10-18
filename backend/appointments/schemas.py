from ninja import ModelSchema

from appointments.models import Appointment, AppointmentStatus, Invoice, ServiceType


class AppointmentIn(ModelSchema):
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    service_type: ServiceType = ServiceType.OTHER

    class Meta:
        model = Appointment
        exclude = ["id"]


class AppointmentOut(ModelSchema):
    status: AppointmentStatus
    service_type: ServiceType

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
