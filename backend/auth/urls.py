# fmt: off

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (CustomTokenObtainPairView, DeleteAccountView, RegisterView,
                    UpdateEmailView, UpdatePasswordView, UserSettingsView)

# fmt: on

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("user/email/", UpdateEmailView.as_view(), name="update-email"),
    path("user/password/", UpdatePasswordView.as_view(), name="update-password"),
    path("user/delete/", DeleteAccountView.as_view(), name="delete-account"),
    path("user/settings/", UserSettingsView.as_view(), name="user-settings"),
]
