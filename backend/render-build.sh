#!/bin/bash
set -e

echo "Installing dependencies..."

mkdir -p .uvbin

# Install uv locally
curl -LsSf https://astral.sh/uv/install.sh | UV_INSTALL_DIR=".uvbin" sh

# Put uv on PATH
export PATH="$PWD/.uvbin:$PATH"

echo "Syncing dependencies and creating venv..."
uv sync  # this will create .venv if needed and install everything

echo "Collecting static files..."
uv run python manage.py collectstatic --no-input

echo "Migrating database..."
uv run python manage.py makemigrations --no-input || true
uv run python manage.py migrate --no-input