from django.contrib import admin

from .models import AnalysisSession, Game


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):  # type: ignore
    list_display = ("name", "user", "source", "board_size", "winner", "created_at")
    list_filter = ("source", "board_size")
    search_fields = ("name", "user__email")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(AnalysisSession)
class AnalysisSessionAdmin(admin.ModelAdmin):  # type: ignore
    list_display = ("id", "game", "created_at")
    readonly_fields = ("id", "created_at")
