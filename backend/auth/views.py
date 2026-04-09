from typing import Any

from rest_framework import status  # type: ignore
from rest_framework.permissions import AllowAny  # type: ignore
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.views import APIView  # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import UserSettings
from .serializers import (AnalysisConfigSerializer,
                          CustomTokenObtainPairSerializer, RegisterSerializer,
                          UpdateEmailSerializer, UpdatePasswordSerializer,
                          UpdateUsernameSerializer)


def _generate_token_pair(user: Any) -> dict[str, str]:
    token = CustomTokenObtainPairSerializer.get_token(user)
    return {
        "access": str(token.access_token),  # type: ignore[attr-defined]
        "refresh": str(token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.pk,
                "username": user.get_username(),
                "email": user.email or "",
            },
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UpdateUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request) -> Response:
        serializer = UpdateUsernameSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.username = serializer.validated_data["username"]
        request.user.save(update_fields=["username"])
        return Response(_generate_token_pair(request.user), status=status.HTTP_200_OK)


class UpdateEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request) -> Response:
        serializer = UpdateEmailSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.email = serializer.validated_data["email"]
        request.user.save(update_fields=["email"])
        return Response(_generate_token_pair(request.user), status=status.HTTP_200_OK)


class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: Request) -> Response:
        serializer = UpdatePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response(_generate_token_pair(request.user), status=status.HTTP_200_OK)


class AnalysisConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        return Response(
            {"analysis_config": settings.analysis_config},
            status=status.HTTP_200_OK,
        )

    def put(self, request: Request) -> Response:
        serializer = AnalysisConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        settings.analysis_config = serializer.validated_data["analysis_config"]
        settings.save(update_fields=["analysis_config"])
        return Response(
            {"analysis_config": settings.analysis_config},
            status=status.HTTP_200_OK,
        )


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request: Request) -> Response:
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
