from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        """Called when Django starts."""
        # Register cleanup handler for HTTP client
        import atexit

        from api.views import close_http_client

        atexit.register(close_http_client)
