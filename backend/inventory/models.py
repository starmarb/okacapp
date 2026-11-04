from django.db import models
from django.db.models.fields.related import ForeignKey

from appointments.models import Appointment

# Create your models here.


class Part(models.Model):
    brand = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    model_number = models.CharField(max_length=100)
    warranty = models.TextField(blank=True)

    def __str__(self):
        return f"{self.brand} {self.name} ({self.model_number})"


class AppointmentPart(models.Model):
    part = ForeignKey(to=Part, on_delete=models.PROTECT)
    appointment = ForeignKey(to=Appointment, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    serial_numbers = models.JSONField(default=list, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["part", "appointment"],
                name="unique_part_per_appointment",
            )
        ]

    def __str__(self):
        return f"{self.part} ×{self.quantity} — {self.appointment}"
