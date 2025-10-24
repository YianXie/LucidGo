from django.urls import path

from . import views

urlpatterns = [
    path("analyze/", views.AnalyzeView.as_view(), name="analyze-move"),
    path("get-game-data/", views.GetGameDataView.as_view(), name="get-game-data"),
]
