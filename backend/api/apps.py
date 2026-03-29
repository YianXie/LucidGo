from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self) -> None:
        import atexit

        from api.views import close_http_client

        atexit.register(close_http_client)
