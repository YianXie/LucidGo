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

### Backend Apps

Two Django apps under `backend/`:

- **`api/`** — Game/session persistence and LucidTree proxying. `AnalyzeView` and `WinrateView` forward requests to LucidTree via a module-level `httpx.Client` singleton (see `get_http_client()` / `close_http_client()`). `AnalysisSessionCreateView` deduplicates: if the latest session for a game has the same `analysis_config`, it overwrites results in-place rather than inserting a new row.
- **`auth/`** — Email-based registration, JWT login, and user preferences. `CustomTokenObtainPairSerializer` embeds `user` metadata and `analysis_config` into the JWT payload so `AuthContext` can hydrate state without an extra DB round-trip on load.

### Key API Endpoints

| Method      | Path                              | Purpose                                      |
| ----------- | --------------------------------- | -------------------------------------------- |
| POST        | `/auth/register/`                 | Create account                               |
| POST        | `/auth/token/`                    | Login (returns JWT pair)                     |
| POST        | `/auth/token/refresh/`            | Refresh access token                         |
| GET/PUT     | `/auth/user/settings/`            | User's `UserSettings` (analysis config + general settings) |
| GET         | `/api/health/`                    | Health check                                 |
| POST        | `/api/get-game-data/`             | Parse SGF file (no auth required)            |
| POST        | `/api/analyze/`                   | Proxy analysis to LucidTree (no auth)        |
| POST        | `/api/winrate/`                   | Proxy winrate computation to LucidTree (no auth) |
| GET/POST    | `/api/games/`                     | List / create `Game` objects                 |
| GET/DELETE  | `/api/games/<uuid>/`              | Retrieve or delete a `Game`                  |
| POST        | `/api/games/<uuid>/analyses/`     | Create or overwrite an `AnalysisSession`     |
| GET/DELETE  | `/api/games/<uuid>/analyses/<uuid>/` | Retrieve or delete an `AnalysisSession`   |

### Frontend Routes

- `/demo/` — Ephemeral multi-board sandbox (protected); no game persistence unless manually saved
- `/analyze/` — Full game management: upload, navigate, analyze, select boards for comparison (protected); loads game via `?gameID=<uuid>` query param
- `/compare?gameIDs=id1,id2,...` — Side-by-side multi-lane overlay board for 2–5 games (protected)
- `/settings/` and `/settings/:id/` — Per-board analysis config editor (protected)
- `/profile/` — Account management (protected)
- `/docs/:id/` — MDX-rendered documentation (public)

### State Architecture

- **`AuthContext.tsx`** — Global auth state (user info, tokens, login/logout). On load it decodes the JWT payload (no DB call) to populate `user` + `analysisConfig`, then fetches `UserSettings` for the full `userSettings` state.
- **`GameState`** (owned by `Demo.tsx`, `Analyze.tsx`, and each lane in `Compare.tsx`) — holds `gameData`, `analysisData`, `analysisConfig`, and `draftAnalysisConfig`. The split config pattern: `analysisConfig` is the active config used for API calls; `draftAnalysisConfig` is the working copy in the settings sidebar. Changes only take effect when the user clicks Save.
- **`Game.tsx`** — Stateless card component; owns no state of its own. All board display, interaction callbacks, and settings UI are passed as props by the parent page. The parent provides an `updateGame` callback to mutate `GameState`.
- **`analysisData`** — Sparse `(AnalysisResult | null)[]` array indexed by move number (0 = game start, N = after move N). A `null` entry means that position has not been analyzed yet.
- **`UserSettings` model** — Persists `analysis_config` and `general_settings` (e.g. `auto_save_games`) JSON per user on the backend.
- **`Game` model** — UUID PK; stores parsed SGF data plus raw `sgf_data` per user.
- **`AnalysisSession` model** — UUID PK linked to `Game`; stores `analysis_config` and per-move results JSON.

### Compare Page Lane Model

`Compare.tsx` reads `?gameIDs=` from the URL and builds a `CompareLane[]` array. Each lane has its own `analysisConfig`, `analysisData`, `winrate`, and a color from `frontend/src/utils/compareColors.ts` (5-color high-contrast palette). `GameBoard` receives an `overlays[]` prop instead of a single `analysisData`; top-1 markers per lane are fan-offset on colliding positions and color-coded. A **Run for All** toggle parallelizes actions across lanes via `Promise.all`.

### Analysis Config

`AnalysisConfig` (defined in `frontend/src/types/game.ts`) has five sections: `general` (algorithm, rules, komi), `nn` (neural net params), `mcts` (simulations, c_puct, dirichlet), `minimax` (depth, use_alpha_beta), `output` (top_moves count, include_policy/winrate/visits). `frontend/src/utils/buildAnalysisRequest.ts` constructs the LucidTree request from this config and the current board state.

### GTP Coordinate System

Go moves are stored internally as `[row, col]` pairs but the LucidTree API uses GTP notation (e.g., `"D4"`). Conversion utilities are in `frontend/src/utils/coordinates.ts`: `toGTPFormat`, `toRowColFormat`, `parseGtpBoardPoint`.

### Non-Obvious Constraints

- **Board size is hardcoded to 19×19.** SGF files with a different board size are rejected at upload time. There is no 9×9 or 13×13 support.
- **`analysisData` index semantics.** Index `i` in `analysisData` represents the board state *after* move `i` has been played (0 = empty board). Off-by-one errors here cause the wrong position to be sent to LucidTree.
- **`AnalysisConfig` is not auto-propagated.** When a user updates their default config in Settings, it applies to newly created boards only. Existing `GameState` entries in the current session keep their old config.

## Environment Variables

**Backend** (copy `.env.example` → `.env`):

- `SECRET_KEY` — Django secret key
- `API_ENDPOINT` — LucidTree API base URL
- `API_TIME_OUT` — HTTP timeout in seconds
- `ENVIRONMENT` — `development` | `production`

**Frontend** (copy `.env.example` → `.env` or `.env.local`):

- `VITE_API_URL` — Backend base URL, no trailing slash (e.g., `http://localhost:8000`)
