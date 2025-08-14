from django.urls import path
from . import views

urlpatterns = [
    path("analyze-move/", views.analyze_move, name="analyze-move"),
]
