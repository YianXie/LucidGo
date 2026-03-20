# Makefile for LucidGo project

.PHONY: help install test lint format security ci-local clean

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install all dependencies"
	@echo "  test         - Run all tests"
	@echo "  lint         - Run linting checks"
	@echo "  format       - Format code"
	@echo "  security     - Run security checks"
	@echo "  ci-local     - Run all CI checks locally"
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
	cd backend && uv run safety scan --no-prompt && uv run bandit -r . -x ./env,./__pycache__
	@echo "Running frontend security checks..."
	cd frontend && npm audit

# Run all CI checks locally
ci-local:
	@./scripts/ci-local.sh

# Clean up generated files
clean:
	@echo "Cleaning up generated files..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	cd frontend && rm -rf dist node_modules/.vite