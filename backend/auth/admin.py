from django.contrib import admin

from .models import UserSettings


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = [
        field.name
        for field in UserSettings._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]
    search_fields = ["user__email"]
    ordering = ["user__email"]
