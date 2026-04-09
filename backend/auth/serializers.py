from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers  # type: ignore
from rest_framework.exceptions import AuthenticationFailed  # type: ignore
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserSettings

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                _("A user with that username already exists.")
            )
        return value

    def validate_email(self, value: str) -> str:
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError(
                _("A user with that email already exists.")
            )
        return normalized

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data: dict[str, Any]) -> Any:
        user = User.objects.create_user(  # type: ignore
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        UserSettings.objects.create(user=user)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: dict[str, Any]) -> dict[str, str]:
        identifier = attrs.get(self.username_field)
        if not identifier:
            raise AuthenticationFailed(
                self.error_messages["no_active_account"],
                "no_active_account",
            )

        user = User.objects.filter(username=identifier).first()
        if user is None:
            user = User.objects.filter(email__iexact=identifier).first()

        if user is None:
            raise AuthenticationFailed(
                self.error_messages["no_active_account"],
                "no_active_account",
            )

        attrs[self.username_field] = user.get_username()
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user: Any) -> Any:
        token = super().get_token(user)
        settings, _ = UserSettings.objects.get_or_create(user=user)
        token["user"] = {
            "id": user.pk,
            "username": user.get_username(),
            "email": getattr(user, "email", "") or "",
            "analysis_config": settings.analysis_config,
        }
        return token


class UpdateUsernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)

    def validate_username(self, value: str) -> str:
        user = self.context["request"].user
        if User.objects.filter(username__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                _("A user with that username already exists.")
            )
        return value


class UpdateEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        normalized = value.strip().lower()
        user = self.context["request"].user
        if User.objects.filter(email__iexact=normalized).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                _("A user with that email already exists.")
            )
        return normalized


class UpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value: str) -> str:
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Old password is incorrect."))
        return value

    def validate_new_password(self, value: str) -> str:
        validate_password(value)
        return value


class AnalysisConfigSerializer(serializers.Serializer):
    analysis_config = serializers.JSONField()

    def validate_analysis_config(self, value: Any) -> dict:
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                _("analysis_config must be a JSON object.")
            )
        required_sections = {"general", "nn", "mcts", "minimax", "output"}
        missing = required_sections - set(value.keys())
        if missing:
            raise serializers.ValidationError(
                _("Missing required sections: %(missing)s")
                % {"missing": ", ".join(sorted(missing))}
            )
        return value
