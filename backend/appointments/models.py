from django.db import models

# Create your models here.
#


class AppointmentStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "예약"  # type: ignore[Assignment]
    IN_PROGRESS = "IN_PROGRESS", "진행중"  # type: ignore[Assignment]
    COMPLETED = "COMPLETED", "완료"  # type: ignore[Assignment]
    CANCELLED = "CANCELLED", "취소"  # type: ignore[Assignment]


class ServiceType(models.TextChoices):
    REPAIR = "REPAIR", "수리"  # type: ignore[Assignment]
    INSTALL = "INSTALL", "설치"  # type: ignore[Assignment]
    CONSTRUCTION = "CONSTRUCTION", "공사"  # type: ignore[Assignment]
    OTHER = "Other", "기타"  # type: ignore[Assignment]


class Appointment(models.Model):
    name = models.CharField(max_length=150)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
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
    work_done = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} — {self.appointment_date}"

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

    def __str__(self):
        return f"Invoice #{self.pk} — {self.appointment}"


class Photo(models.Model):
    appointment = models.ForeignKey(to=Appointment, on_delete=models.CASCADE)
    storage_key = models.CharField(max_length=1024, unique=True)
    # later on we can store metadata as well if needed...?

    def __str__(self):
        return f"Photo #{self.pk} — {self.appointment}"
