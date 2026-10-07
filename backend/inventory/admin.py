from django.contrib import admin

from .models import Part, PartInstance


class PartInstanceInline(admin.TabularInline):
    model = PartInstance
    extra = 0
    autocomplete_fields = ("assignment",)


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ("brand", "name", "model_number", "warranty")
    list_filter = ("brand",)
    search_fields = ("brand", "name", "model_number")
    inlines = (PartInstanceInline,)


@admin.register(PartInstance)
class PartInstanceAdmin(admin.ModelAdmin):
    list_display = ("id", "part", "assignment", "serial_number")
    list_filter = ("part__brand",)
    search_fields = (
        "serial_number",
        "part__name",
        "part__model_number",
        "assignment__name",
    )
    autocomplete_fields = ("part", "assignment")
