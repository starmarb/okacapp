from django.contrib import admin

from .models import Appointment, Invoice, Photo


class InvoiceInline(admin.TabularInline):
    model = Invoice
    extra = 0


class PhotoInline(admin.TabularInline):
    model = Photo
    extra = 0


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "service_type",
        "status",
        "appointment_date",
        "completed_date",
    )
    list_editable = ("status",)
    list_filter = ("status", "service_type")
    search_fields = ("name", "phone", "email", "address")
    date_hierarchy = "appointment_date"
    ordering = ("-appointment_date",)
    inlines = (InvoiceInline, PhotoInline)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "appointment",
        "subtotal",
        "tax",
        "total",
        "warranty_extension",
    )
    list_filter = ("warranty_extension",)
    search_fields = ("appointment__name",)
    autocomplete_fields = ("appointment",)


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ("id", "appointment", "storage_key")
    search_fields = ("storage_key", "appointment__name")
    autocomplete_fields = ("appointment",)
