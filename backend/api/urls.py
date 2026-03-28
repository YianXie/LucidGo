from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.HealthView.as_view(), name="health"),
    path("analyze/", views.AnalyzeView.as_view(), name="analyze"),
    path("get-game-data/", views.GetGameDataView.as_view(), name="get-game-data"),
]
