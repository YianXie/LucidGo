"""
Mypy-specific Django settings that provide default values for environment variables.
This allows mypy to run without requiring actual environment variables.
"""

from datetime import timedelta
from pathlib import Path
from typing import Optional, List, Any


# Mock environ for mypy
class MockEnv:
    def __call__(self, key: str, default: Optional[str] = None) -> str:
        # Provide sensible defaults for mypy
        defaults = {
            "SECRET_KEY": "mypy-test-secret-key-not-for-production",
            "ENVIRONMENT": "development",
            "ALLOWED_HOSTS": "localhost,127.0.0.1",
            "DB_URL": "sqlite:///db.sqlite3",
            "API_ENDPOINT": "http://localhost:8000/api/",
            "API_TIMEOUT": "30",
        }
        result = defaults.get(key, default)
        return result if result is not None else ""

    def list(self, key: str, default: Optional[List[str]] = None) -> List[str]:
        if key == "ALLOWED_HOSTS":
            return ["localhost", "127.0.0.1"]
        return default or []

    def int(self, key: str, default: Optional[int] = None) -> int:
        if key == "API_TIMEOUT":
            return 30
        return default or 0


env = MockEnv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Use the same defaults as the main settings
SECRET_KEY = env("SECRET_KEY")
ENVIRONMENT = env("ENVIRONMENT", default="development")
DEBUG = ENVIRONMENT == "development"

if ENVIRONMENT == "development":
    ALLOWED_HOSTS = [
        "localhost",
        "127.0.0.1",
    ]
else:
    ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "api",
    "rest_framework",
    "corsheaders",
]

USE_X_FORWARDED_HOST = True

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
]

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# Use SQLite for mypy (simpler and doesn't require external dependencies)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Singapore"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://www.lucidgo.org",
    "https://api.lucidgo.org",
]

CSRF_TRUSTED_ORIGINS = [
    "https://api.lucidgo.org",
    "https://www.lucidgo.org",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_EXPOSE_HEADERS = [
    "content-type",
    "content-disposition",
]

# Production settings (simplified for mypy)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

CORS_ALLOW_CREDENTIALS = True
CORS_PREFLIGHT_MAX_AGE = 86400

FILE_UPLOAD_HANDLERS = [
    "django.core.files.uploadhandler.MemoryFileUploadHandler",
    "django.core.files.uploadhandler.TemporaryFileUploadHandler",
]

DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 10
FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 10

API_ENDPOINT = env("API_ENDPOINT")
API_TIMEOUT = env.int("API_TIMEOUT", default=30)
