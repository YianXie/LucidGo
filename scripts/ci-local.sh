#!/bin/bash

# Local CI script to run the same checks as GitHub Actions
set -e

echo "🚀 Running local CI checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Backend checks
echo -e "\n${YELLOW}Backend Checks${NC}"
echo "=================="

# Install backend dev dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Run Django tests
echo "Running Django tests..."
if python manage.py test; then
    print_status "Django tests passed"
else
    print_error "Django tests failed"
    exit 1
fi

# Run Ruff formatting check
echo "Checking code formatting with Ruff..."
if ruff format --check .; then
    print_status "Ruff formatting check passed"
else
    print_error "Ruff formatting check failed. Run 'ruff format .' to fix."
    exit 1
fi

# Run isort import sorting check
echo "Checking import sorting with isort..."
if isort --check-only --diff .; then
    print_status "isort import sorting check passed"
else
    print_error "isort import sorting check failed. Run 'isort .' to fix."
    exit 1
fi

# Run security checks
echo "Running safety scan..."
if safety scan; then
    print_status "Safety scan passed"
else
    print_warning "Safety scan found issues"
fi

echo "Running bandit security check..."
if bandit -r . -x ./env,./__pycache__; then
    print_status "Bandit security check passed"
else
    print_warning "Bandit security check found issues"
fi

# Frontend checks
echo -e "\n${YELLOW}Frontend Checks${NC}"
echo "=================="

cd ../frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
if npm ci; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Run ESLint
echo "Running ESLint..."
if npm run lint; then
    print_status "ESLint passed"
else
    print_error "ESLint failed"
    exit 1
fi

# Check Prettier formatting
echo "Checking Prettier formatting..."
if npx prettier --check "src/**/*.{js,jsx,css,md}"; then
    print_status "Prettier formatting check passed"
else
    print_error "Prettier formatting check failed. Run 'npx prettier --write \"src/**/*.{js,jsx,css,md}\"' to fix."
    exit 1
fi

# Build frontend
echo "Building frontend..."
if npm run build; then
    print_status "Frontend build passed"
else
    print_error "Frontend build failed"
    exit 1
fi

# Run npm audit
echo "Running npm audit..."
if npm audit --audit-level=moderate; then
    print_status "npm audit passed"
else
    print_warning "npm audit found issues"
fi

cd ..

echo -e "\n${GREEN}🎉 All CI checks passed!${NC}"
echo "Your code is ready to be pushed to the repository."
