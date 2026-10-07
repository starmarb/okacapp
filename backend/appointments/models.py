from django.db import models

# Create your models here.
#

# to review / reconsider
# 1. which fields in Appointments are allowed to be empty
# 2. if multiple invoices are allowed per appointment, and if so, we need a way to tell them apart
# 3. on deletion of an appointment, should all invoices be deleted too? or no
# 4. waranty extension, is it a boolean?


class AppointmentStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Scheduled"  # type: ignore[Assignment]
    IN_PROGRESS = "IN_PROGRESS", "In_Progress"  # type: ignore[Assignment]
    COMPLETED = "COMPLETED", "Completed"  # type: ignore[Assignment]
    CANCELLED = "CANCELLED", "Cancelled"  # type: ignore[Assignment]
    RESCHEDULED = "RESCHEDULED", "Rescheduled"  # type: ignore[Assignment]


class ServiceType(models.TextChoices):
    REPAIR = "REPAIR", "수리"  # type: ignore[Assignment]
    INSTALL = "INSTALL", "설치"  # type: ignore[Assignment]
    CONSTRUCTION = "CONSTRUCTION", "공사"  # type: ignore[Assignment]
    OTHER = "Other", "기타"  # type: ignore[Assignment]


class Appointment(models.Model):
    name = models.CharField(max_length=150)
    address = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    status = models.CharField(
        max_length=30,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.SCHEDULED,
    )
    service_type = models.CharField(
        max_length=30,
        choices=ServiceType.choices,
        default=ServiceType.OTHER,
    )
    appointment_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    work_done = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["appointment_date"]


class Invoice(models.Model):
    appointment = models.ForeignKey(to=Appointment, on_delete=models.CASCADE)
    total_service = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_parts = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    warranty_extension = models.BooleanField()


class Photo(models.Model):
    appointment = models.ForeignKey(to=Appointment, on_delete=models.CASCADE)
    storage_key = models.CharField(max_length=1024, unique=True)
    # later on we can store metadata as well if needed...?
