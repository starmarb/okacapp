from django.contrib import admin

from .models import AppointmentPart, Part


class AppointmentPartInline(admin.TabularInline):
    model = AppointmentPart
    extra = 0
    autocomplete_fields = ("appointment",)


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ("brand", "name", "model_number", "warranty")
    list_filter = ("brand",)
    search_fields = ("brand", "name", "model_number")
    inlines = (AppointmentPartInline,)


@admin.register(AppointmentPart)
class AppointmentPartAdmin(admin.ModelAdmin):
    list_display = ("id", "part", "appointment", "quantity", "serial_numbers")
    list_filter = ("part__brand",)
    search_fields = (
        "part__name",
        "part__model_number",
        "appointment__name",
    )
    autocomplete_fields = ("part", "appointment")
