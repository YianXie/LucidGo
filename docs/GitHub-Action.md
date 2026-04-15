# GitHub Actions Workflows

This page describes the automated workflows configured for LucidGo. They live in `.github/workflows/` and run on every push and pull request to `main`.

## Table of Contents

- [CI Workflow](#ci-workflow)
- [Deployment Workflow](#deployment-workflow)
- [Required Secrets](#required-secrets)
- [Troubleshooting](#troubleshooting)

---

## CI Workflow

**File:** `.github/workflows/ci.yml`

Runs on every push and pull request targeting `main`. It consists of four parallel jobs.

### Triggers

- Push to `main`
- Pull request targeting `main`

---

### 1. Backend Tests (`backend-tests`)

Runs the Django test suite against a real PostgreSQL database.

**Environment:**

- Runner: `ubuntu-latest`
- Python: 3.12+ (resolved from `pyproject.toml` via `uv`)
- Database: PostgreSQL 15 (containerized, port 5432)

**Steps:**

1. Checkout code
2. Install `uv` (`astral-sh/setup-uv@v6`)
3. Install backend dependencies: `uv sync --dev`
4. Run migrations and tests:
    ```bash
    uv run python manage.py makemigrations && uv run python manage.py migrate
    uv run python manage.py test
    ```

**Environment variables:**

| Variable        | Value                      |
| --------------- | -------------------------- |
| `SECRET_KEY`    | Test secret key            |
| `ENVIRONMENT`   | `development`              |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1`      |
| `API_ENDPOINT`  | From `API_ENDPOINT` secret |
| `API_TIMEOUT`   | `30`                       |

---

### 2. Frontend Checks (`frontend-checks`)

Validates code quality and confirms the frontend builds successfully.

**Environment:**

- Runner: `ubuntu-latest`
- Node.js: 22.12+
- npm cache enabled

**Steps:**

1. Checkout code
2. Set up Node.js with npm cache
3. Install dependencies: `npm ci`
4. Run ESLint: `npm run lint`
5. Check Prettier formatting: `npx prettier --check "src/**/*.{ts, tsx, js,jsx,css,md}"`
6. Build: `npm run build`

---

### 3. Backend Code Quality (`backend-linting`)

Checks Python formatting and import ordering.

**Environment:**

- Runner: `ubuntu-latest`
- Python: 3.12+ (via `uv`)

**Steps:**

1. Checkout code
2. Install `uv` and run `uv sync --dev`
3. Run Ruff: `uv run ruff check .`
4. Run isort: `uv run isort --check-only --diff .`

**To fix locally:**

```bash
cd backend
uv run ruff format .
uv run isort .
```

---

### 4. Security Checks (`security-checks`)

Scans for known vulnerabilities in both backend and frontend dependencies.

**Environment:**

- Runner: `ubuntu-latest`
- Python: 3.12+ (via `uv`)
- Node.js: 22.12+

**Backend security steps:**

1. Install dependencies via `uv sync --dev`
2. Run `pip-audit`: scans Python packages for known CVEs
3. Run Bandit: static analysis for common security issues in Python code (configured in `pyproject.toml`)

**Frontend security steps:**

1. Install dependencies via `npm ci`
2. Run `npm audit --audit-level=moderate`

**Tools:**

- **pip-audit** — checks Python packages against vulnerability databases
- **Bandit** — flags common Python security issues (SQL injection, shell injection, etc.)
- **npm audit** — checks npm packages for known vulnerabilities

## Required Secrets

| Secret         | Description                              | Used by         |
| -------------- | ---------------------------------------- | --------------- |
| `API_ENDPOINT` | LucidTree API base URL for backend tests | `backend-tests` |

### Adding secrets

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret listed above

## Troubleshooting

### Backend tests failing

- **Database connection errors**: The PostgreSQL container uses health checks — check the Actions log to see if it started cleanly.
- **Migration errors**: If `makemigrations` fails, there may be a model inconsistency. Run it locally first.
- **Test failures**: Check the test output in the job log for the specific assertion that failed.

### Frontend checks failing

- **ESLint errors**: Run `npm run lint` locally and fix the flagged issues.
- **Prettier errors**: Run `npx prettier --write "src/**/*.{js,jsx,css,md}"` to auto-fix.
- **Build failures**: Run `npm run build` locally to see the TypeScript or bundler error.

### Backend linting failing

- **Ruff errors**: Run `uv run ruff format .` locally.
- **isort errors**: Run `uv run isort .` locally.

### Security check failures

- **pip-audit**: Update the vulnerable package or add a `--ignore-vuln` flag with justification if it's a false positive.
- **Bandit**: Review the flagged line. If it's a legitimate issue, fix it. If it's a known false positive, add the appropriate `# nosec` comment with a reason.
- **npm audit**: Run `npm audit fix` locally and review the changes before committing.

---

## Best practices

- Never commit secrets directly. Use GitHub Secrets for anything sensitive.
- Address security findings promptly rather than ignoring them.
- Run `make ci-local` before pushing to catch lint, formatting, and test failures early.
- After a deployment, verify the app is healthy by hitting the `/api/health/` endpoint.
