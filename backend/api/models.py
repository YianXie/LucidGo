import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Game(models.Model):
    class Source(models.TextChoices):
        UPLOAD = "upload", "Upload"
        LIVE = "live", "Live"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games")
    name = models.CharField(max_length=255, blank=True, default="")
    source = models.CharField(max_length=10, choices=Source.choices)
    board_size = models.IntegerField()
    komi = models.FloatField(null=True, blank=True)
    black_player = models.CharField(max_length=255, blank=True, default="Unknown")
    white_player = models.CharField(max_length=255, blank=True, default="Unknown")
    winner = models.CharField(max_length=50, blank=True, default="Unknown")
    moves = models.JSONField(default=list)
    sgf_data = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"{self.name or 'Untitled'} ({self.source})"


class AnalysisSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(
        Game, on_delete=models.CASCADE, related_name="analysis_sessions"
    )
    analysis_config = models.JSONField()
    results = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Analysis for {self.game} at {self.created_at}"
