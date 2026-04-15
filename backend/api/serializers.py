from rest_framework import serializers  # type: ignore

from .models import AnalysisSession, Game


class GameCreateSerializer(serializers.ModelSerializer):  # type: ignore
    class Meta:
        model = Game
        fields = [
            "name",
            "source",
            "board_size",
            "komi",
            "black_player",
            "white_player",
            "winner",
            "moves",
            "sgf_data",
        ]

    def create(self, validated_data: dict) -> Game:
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class AnalysisSessionCreateSerializer(serializers.ModelSerializer):  # type: ignore
    class Meta:
        model = AnalysisSession
        fields = ["analysis_config", "results"]


class AnalysisSessionListSerializer(serializers.ModelSerializer):  # type: ignore
    class Meta:
        model = AnalysisSession
        fields = ["id", "analysis_config", "created_at"]


class AnalysisSessionDetailSerializer(serializers.ModelSerializer):  # type: ignore
    class Meta:
        model = AnalysisSession
        fields = ["id", "analysis_config", "results", "created_at"]


class GameListSerializer(serializers.ModelSerializer):  # type: ignore
    analysis_count = serializers.IntegerField(read_only=True)
    last_analyzed_at = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "name",
            "source",
            "board_size",
            "komi",
            "black_player",
            "white_player",
            "winner",
            "analysis_count",
            "last_analyzed_at",
            "created_at",
            "updated_at",
        ]


class GameDetailSerializer(serializers.ModelSerializer):  # type: ignore
    analysis_sessions = AnalysisSessionListSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "name",
            "source",
            "board_size",
            "komi",
            "black_player",
            "white_player",
            "winner",
            "moves",
            "sgf_data",
            "analysis_sessions",
            "created_at",
            "updated_at",
        ]
