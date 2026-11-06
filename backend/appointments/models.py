import logging

from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver

# Create your models here.
#


class AppointmentStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "예약"
    IN_PROGRESS = "IN_PROGRESS", "진행중"
    COMPLETED = "COMPLETED", "완료"
    CANCELLED = "CANCELLED", "취소"


class ServiceType(models.TextChoices):
    REPAIR = "REPAIR", "수리"
    INSTALL = "INSTALL", "설치"
    CONSTRUCTION = "CONSTRUCTION", "공사"
    OTHER = "OTHER", "기타"


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
    appointment_date = models.DateTimeField()
    completed_date = models.DateTimeField(null=True, blank=True)
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
    warranty_extension = models.BooleanField(default=False)

    def __str__(self):
        return f"Invoice #{self.pk} — {self.appointment}"


class Photo(models.Model):
    appointment = models.ForeignKey(
        to=Appointment, on_delete=models.CASCADE, related_name="photos"
    )
    storage_key = models.CharField(max_length=1024, unique=True)
    thumbnail_key = models.CharField(max_length=1024, blank=True)
    content_type = models.CharField(max_length=100, default="image/webp")
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"Photo #{self.pk} — {self.appointment}"


logger = logging.getLogger(__name__)


@receiver(post_delete, sender=Photo)
def _delete_photo_blobs(sender, instance, **kwargs):
    """Remove the stored objects whenever a Photo row disappears.

    Connected here rather than in the delete endpoint so that admin deletes and
    appointment cascades clean up too. Django disables fast-delete for models
    with delete listeners, so this also fires on cascade.
    """
    from appointments import photos

    for key in (instance.storage_key, instance.thumbnail_key):
        if not key:
            continue
        try:
            photos.delete_bytes(key)
        except Exception:
            logger.exception("Failed to delete photo blob %s", key)
