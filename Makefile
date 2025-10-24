# Makefile for CI/CD automation
# This Makefile provides commands for code formatting, linting, testing, and security checks

.PHONY: help install install-dev format format-check lint lint-python lint-frontend test test-python test-frontend security security-python security-frontend clean all-checks

# Default target
help:
	@echo "Available commands:"
	@echo "  install          - Install production dependencies"
	@echo "  install-dev      - Install development dependencies"
	@echo "  format           - Format all code (Python + Frontend)"
	@echo "  format-check     - Check if code is formatted correctly"
	@echo "  lint             - Lint all code (Python + Frontend)"
	@echo "  lint-python      - Lint Python code with flake8"
	@echo "  lint-frontend    - Lint frontend code with ESLint"
	@echo "  test             - Run all tests"
	@echo "  test-python      - Run Python tests"
	@echo "  test-frontend    - Run frontend tests"
	@echo "  security         - Run security checks on all code"
	@echo "  security-python  - Run Python security checks with bandit"
	@echo "  security-frontend- Run frontend security checks with npm audit"
	@echo "  clean            - Clean up temporary files"
	@echo "  all-checks       - Run all checks (format, lint, test, security)"

# Installation targets
install:
	@echo "Installing production dependencies..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm ci --only=production

install-dev:
	@echo "Installing development dependencies..."
	cd backend && pip install -r requirements-dev.txt
	cd frontend && npm ci

# Formatting targets
format: format-python format-frontend
	@echo "All code formatted successfully!"

format-python:
	@echo "Formatting Python code with black..."
	cd backend && black . --line-length 88
	@echo "Sorting Python imports with isort..."
	cd backend && isort . --profile black

format-frontend:
	@echo "Formatting frontend code with prettier..."
	cd frontend && npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"

format-check: format-check-python format-check-frontend
	@echo "All code formatting checks passed!"

format-check-python:
	@echo "Checking Python code formatting..."
	cd backend && black . --check --line-length 88
	cd backend && isort . --check-only --profile black

format-check-frontend:
	@echo "Checking frontend code formatting..."
	cd frontend && npx prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,md}"

# Linting targets
lint: lint-python lint-frontend
	@echo "All linting checks passed!"

lint-python:
	@echo "Linting Python code with flake8..."
	cd backend && flake8 . --config=.flake8
	@echo "Type checking Python code with mypy..."
	cd backend && mypy . --config-file=mypy.ini

lint-frontend:
	@echo "Linting frontend code with ESLint..."
	cd frontend && npm run lint

# Testing targets
test: test-python test-frontend
	@echo "All tests passed!"

test-python:
	@echo "Running Python tests..."
	cd backend && python manage.py test --verbosity=2

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test -- --watchAll=false

# Security targets
security: security-python security-frontend
	@echo "All security checks passed!"

security-python:
	@echo "Running Python security checks with bandit..."
	cd backend && bandit -r . -f json -o bandit-report.json
	@echo "Running safety check for known vulnerabilities..."
	cd backend && safety check --json --output safety-report.json

security-frontend:
	@echo "Running frontend security audit..."
	cd frontend && npm audit --audit-level=moderate

# Cleanup target
clean:
	@echo "Cleaning up temporary files..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name ".coverage" -delete
	find . -type d -name "htmlcov" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name "node_modules" -exec rm -rf {} +
	find . -type f -name "*.log" -delete
	rm -f backend/bandit-report.json
	rm -f backend/safety-report.json

# Comprehensive check target
all-checks: format-check lint test security
	@echo "All checks completed successfully! 🎉"

# CI-specific targets
ci-install:
	@echo "Installing dependencies for CI..."
	cd backend && pip install -r requirements-dev.txt
	cd frontend && npm ci

ci-checks: ci-install format-check lint test security
	@echo "CI checks completed successfully! 🚀"
