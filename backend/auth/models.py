from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

DEFAULT_ANALYSIS_CONFIG = {
    "general": {
        "algorithm": "nn",
        "rules": "japanese",
        "komi": 6.5,
        "max_time_ms": 0,
        "temperature": 0,
        "seed": 0,
    },
    "neural_network": {
        "model": "checkpoint_19x19",
        "policy_softmax_temperature": 0.2,
        "use_value_head": True,
    },
    "mcts": {
        "num_simulations": 500,
        "c_puct": 1.5,
        "dirichlet_alpha": 0.3,
        "dirichlet_epsilon": 0.25,
        "value_weight": 1.0,
        "policy_weight": 1.0,
        "select_by": "visit_count",
    },
    "minimax": {
        "depth": 3,
        "use_alpha_beta": True,
    },
    "output": {
        "include_top_moves": 5,
        "include_policy": False,
        "include_win_rate": False,
    },
}


def get_default_analysis_config() -> dict:
    import copy

    return copy.deepcopy(DEFAULT_ANALYSIS_CONFIG)


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")  # type: ignore
    analysis_config = models.JSONField(default=get_default_analysis_config)

    class Meta:
        verbose_name = "user settings"
        verbose_name_plural = "user settings"

    def __str__(self) -> str:
        return f"Settings for {self.user.get_username()}"
