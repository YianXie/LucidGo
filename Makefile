# Makefile for LucidGo project

.PHONY: help install test lint format security ci-local run-all clean

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install all dependencies"
	@echo "  test         - Run all tests"
	@echo "  lint         - Run linting checks"
	@echo "  format       - Format code"
	@echo "  security     - Run security checks"
	@echo "  ci-local     - Run all CI checks locally"
	@echo "  run-all      - Run all servers (separate iTerm2 windows)"
	@echo "  clean        - Clean up generated files"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && uv sync --dev
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Run tests
test:
	@echo "Running Django tests..."
	cd backend && uv run python manage.py test

# Run linting
lint:
	@echo "Running backend linting..."
	cd backend && uv run ruff check .
	@echo "Running frontend linting..."
	cd frontend && npm run lint

# Format code
format:
	@echo "Formatting backend code..."
	cd backend && uv run ruff format . && uv run isort .
	@echo "Formatting frontend code..."
	cd frontend && npx prettier . --write --ignore-path .prettierignore

# Run security checks
security:
	@echo "Running backend security checks..."
	cd backend && uv run pip-audit --ignore-vuln CVE-2026-4539 && uv run bandit -r . -x ./env,./__pycache__
	@echo "Running frontend security checks..."
	cd frontend && npm audit

# Run all CI checks locally
ci-local:
	@./scripts/ci-local.sh

# Run all servers in separate iTerm2 windows (macOS)
run-all:
	@osascript \
		-e 'tell application "iTerm"' \
		-e 'activate' \
		-e 'create window with default profile' \
		-e 'tell current session of current window' \
		-e 'write text "cd \"$(CURDIR)/backend\" && uv run python manage.py runserver"' \
		-e 'end tell' \
		-e 'create window with default profile' \
		-e 'tell current session of current window' \
		-e 'write text "cd \"$(CURDIR)/frontend\" && npm run dev"' \
		-e 'end tell' \
		-e 'create window with default profile' \
		-e 'tell current session of current window' \
		-e 'write text "cd \"$(HOME)/Desktop/projects/LucidTree\" && make runserver"' \
		-e 'end tell' \
		-e 'end tell'

# Clean up generated files
clean:
	@echo "Cleaning up generated files..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	cd frontend && rm -rf dist node_modules/.vite