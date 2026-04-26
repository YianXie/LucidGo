import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Game(models.Model):
    class Source(models.TextChoices):
        UPLOAD = "upload", "Upload"
        LIVE = "live", "Live"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # type: ignore
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games")  # type: ignore
    name = models.CharField(max_length=255, blank=True, default="")  # type: ignore
    source = models.CharField(max_length=10, choices=Source.choices)  # type: ignore
    board_size = models.IntegerField()  # type: ignore
    komi = models.FloatField(null=True, blank=True)  # type: ignore
    black_player = models.CharField(max_length=255, blank=True, default="Unknown")  # type: ignore
    white_player = models.CharField(max_length=255, blank=True, default="Unknown")  # type: ignore
    winner = models.CharField(max_length=50, blank=True, default="Unknown")  # type: ignore
    moves = models.JSONField(default=list)  # type: ignore
    sgf_data = models.TextField(blank=True, default="")  # type: ignore
    created_at = models.DateTimeField(auto_now_add=True)  # type: ignore
    updated_at = models.DateTimeField(auto_now=True)  # type: ignore

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"{self.name or 'Untitled'} ({self.source})"


class AnalysisSession(models.Model):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )  # type: ignore
    game = models.ForeignKey(
        Game, on_delete=models.CASCADE, related_name="analysis_sessions"
    )  # type: ignore
    analysis_config = models.JSONField()  # type: ignore
    results = models.JSONField(default=list)  # type: ignore
    created_at = models.DateTimeField(auto_now_add=True)  # type: ignore

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Analysis for {self.game} at {self.created_at}"
