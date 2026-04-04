import json

from django.contrib import admin
from django.utils.html import format_html

from .models import UserSettings


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ["user", "formatted_json"]
    search_fields = ["user__username", "user__email"]
    list_filter = ["user__is_active", "user__is_staff"]
    readonly_fields = ["user", "formatted_json"]
    ordering = ["user__username"]

    def formatted_json(self, obj):
        formatted_data = json.dumps(obj.analysis_config, indent=4)
        return format_html("<pre>{}</pre>", formatted_data)
