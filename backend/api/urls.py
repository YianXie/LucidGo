from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.HealthView.as_view(), name="health"),
    path("analyze/", views.AnalyzeView.as_view(), name="analyze"),
    path("get-game-data/", views.GetGameDataView.as_view(), name="get-game-data"),
    path("games/", views.GameListCreateView.as_view(), name="game-list-create"),
    path("games/<uuid:game_id>/", views.GameDetailView.as_view(), name="game-detail"),
    path(
        "games/<uuid:game_id>/analyses/",
        views.AnalysisSessionCreateView.as_view(),
        name="analysis-session-create",
    ),
    path(
        "games/<uuid:game_id>/analyses/<uuid:session_id>/",
        views.AnalysisSessionDetailView.as_view(),
        name="analysis-session-detail",
    ),
]
