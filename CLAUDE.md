# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LucidGo is a Go game analysis web app. Users upload SGF files, navigate moves on an interactive board, and request AI-powered position analysis (win rates, top moves, policy heatmaps) backed by a LucidTree API.

## Common Commands

All top-level `make` targets coordinate both backend and frontend:

```bash
make install     # uv sync --dev (backend) + npm install (frontend)
make test        # Django test suite
make lint        # ruff check + eslint
make format      # ruff format + isort + prettier
make security    # pip-audit + bandit + npm audit
make ci-local    # Full CI pipeline locally
make clean       # Remove caches and build artifacts
make run-all     # Launch backend + frontend + LucidTree in separate iTerm2 windows (macOS only)
```

### Backend (Django)

```bash
cd backend
uv sync --dev                        # Install dependencies
source .venv/bin/activate            # Activate venv
python manage.py migrate             # Apply migrations
python manage.py runserver           # Dev server at http://localhost:8000

uv run python manage.py test                        # Run all tests
uv run python manage.py test auth                   # Run tests for a specific app
uv run python manage.py test api.tests.HealthTest   # Run a single test class
uv run ruff check .                                 # Lint
uv run ruff format .                                # Format
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev          # Dev server at http://localhost:5173
npm run build        # Type-check + production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Jest (no test files exist yet — Jest is configured but unused)
```

## Architecture

### Stack

- **Backend**: Python 3.12, Django 5.2, Django REST Framework, `sgfmill` (SGF parsing), JWT auth via `simplejwt`
- **Frontend**: React 18, TypeScript, Vite 7, MUI v7, Tailwind v4, `@sabaki/go-board`
- **Package managers**: `uv` (backend), `npm` (frontend)

### Request Flow

1. **Auth**: JWT tokens (30min access, 7day refresh) stored in localStorage. `frontend/src/api.ts` attaches `Authorization: Bearer` headers and auto-refreshes on 401.

2. **SGF Upload** → `POST /api/get-game-data/` → Django parses with `sgfmill` → returns `GameData` (moves, board size, komi, players, winner).

3. **Analysis** → `POST /api/analyze/` → Django proxies the request to the external LucidTree API via `httpx` → returns top moves with win rates, visit counts, policy values.

### Key API Endpoints

| Method  | Path                          | Purpose                        |
| ------- | ----------------------------- | ------------------------------ |
| POST    | `/auth/register/`             | Create account                 |
| POST    | `/auth/token/`                | Login (returns JWT pair)       |
| POST    | `/auth/token/refresh/`        | Refresh access token           |
| GET/PUT | `/auth/user/analysis-config/` | User's default analysis config |
| GET     | `/api/health/`                | Health check                   |
| POST    | `/api/get-game-data/`         | Parse SGF file                 |
| POST    | `/api/analyze/`               | Proxy analysis to LucidTree    |

### Frontend Routes

- `/demo/` — Main interactive board (protected); supports multiple simultaneous boards
- `/settings/:id/` — Per-board analysis config editor (protected)
- `/profile/` — Account management (protected)
- `/docs/:id/` — MDX-rendered documentation (public)

### State Architecture

- **`AuthContext.tsx`** — Global auth state (user info, tokens, login/logout); also fetches and holds the user's default `AnalysisConfig` on login
- **`Demo.tsx`** — Owns the `BoardState[]` array; each entry has its own game data, analysis results per move, and current move index
- **`UserSettings` model** — Persists `analysis_config` JSON per user on the backend
- **`Game` model** — UUID PK; stores parsed SGF data (moves, board size, komi, players, winner) per user
- **`AnalysisSession` model** — UUID PK linked to a `Game`; stores `analysis_config` and per-move results JSON

### Analysis Config

`AnalysisConfig` (defined in `frontend/src/types/game.ts`) has four sections: `general` (algorithm, rules, komi), `nn` (neural net params), `mcts` (simulations, c_puct, dirichlet), `output` (top_moves count, include_policy/winrate/visits). `frontend/src/utils/buildAnalysisRequest.ts` constructs the LucidTree request from this config and the current board state.

### GTP Coordinate System

Go moves are stored internally as `[row, col]` pairs but the LucidTree API uses GTP notation (e.g., `"D4"`). Conversion utilities are in `frontend/src/utils/utils.ts`: `toGTPFormat`, `toRowColFormat`, `parseGtpBoardPoint`.

## Environment Variables

**Backend** (copy `.env.example` → `.env`):

- `SECRET_KEY` — Django secret key
- `API_ENDPOINT` — LucidTree API base URL
- `API_TIME_OUT` — HTTP timeout in seconds
- `ENVIRONMENT` — `development` | `production`

**Frontend** (copy `.env.example` → `.env`):

- `VITE_API_URL` — Backend base URL, no trailing slash (e.g., `http://localhost:8000`)
