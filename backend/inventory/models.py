from appointments.models import Appointment
from django.db import models
from django.db.models.fields.related import ForeignKey

# Create your models here.

# to review:
# 1. should warranty to be a date?


class Part(models.Model):
    brand = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    model_number = models.CharField(max_length=100)
    warranty = models.DateField()

    def __str__(self):
        return f"{self.brand} {self.name} ({self.model_number})"


class PartInstance(models.Model):
    part = ForeignKey(to=Part, on_delete=models.PROTECT)
    appointment = ForeignKey(to=Appointment, on_delete=models.CASCADE)
    serial_number = models.CharField(max_length=200, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["serial_number"],
                condition=~models.Q(serial_number=""),
                name="unique_serial_when_present",
            )
        ]

    def __str__(self):
        return f"{self.part} — {self.serial_number or '(no serial)'}"
