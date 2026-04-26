from typing import Any

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient  # type: ignore

from .models import UserSettings, get_default_analysis_config


class UserSettingsViewTests(TestCase):
    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(  # type: ignore
            username="player@example.com",
            email="player@example.com",
            password="correct-horse-battery-staple",
        )
        self.api_client = APIClient()
        self.api_client.force_authenticate(user=self.user)

    def test_get_returns_serialized_settings(self) -> None:
        response: Any = self.api_client.get("/auth/user/settings/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {
                "general_settings": {"auto_save_games": False},
                "analysis_config": get_default_analysis_config(),
            },
        )

    def test_put_updates_analysis_config_without_full_settings_payload(self) -> None:
        analysis_config = get_default_analysis_config()
        analysis_config["general"]["algorithm"] = "mcts"

        response: Any = self.api_client.put(
            "/auth/user/settings/",
            {"analysis_config": analysis_config},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["analysis_config"], analysis_config)
        settings = UserSettings.objects.get(user=self.user)
        self.assertEqual(settings.analysis_config, analysis_config)
        self.assertEqual(settings.general_settings, {"auto_save_games": False})
