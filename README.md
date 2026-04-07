# LucidGo

LucidGo is a visual Go analysis tool that allows you to see AI-powered move analysis in real-time, with vary configurations that the users can adjust freely.

## Overview

Using Go AI such as KataGo is simple, but understanding the factors that affect its performance can be abstract. LucidGo aims to solve this issue by allowing users to adjust their own analysis configurations, such as the number of simulations in Monte Carlo Tree Search and the depth in MiniMax.

**Key Features:**

- **Customizable config**: Users can set their own configuration when analyzing moves.
- **Visual analysis**: Interactive Go board with real-time move analysis
- **SGF file support**: Upload and analyze games from SGF (Smart Game Format) files
- **AI-powered insights**: Leverage [LucidTree](https://github.com/YianXie/LucidTree) for move analysis and position evaluation
- **Intuitive design**: Modern, responsive UI built with React, Material-UI, and TailwindCSS

## Tech Stack

### Backend

- Python 3.12, Django 5.2+, Django REST Framework 3.16+
- HTTP client via `httpx` for KataGo API communication
- SGF parsing with `sgfmill` library
- JWT authentication with `djangorestframework-simplejwt`

### Frontend

- React 18 with Vite 7 for fast development experience
- React Router 7 for navigation
- Material-UI 7 and Tailwind CSS 4 for styling
- `@sabaki/go-board` for Go board rendering

### Tooling & DevOps

- Ruff (formatter and linter), isort, Bandit, Safety for Python quality and security
- ESLint, Prettier, and Tailwind plugins for the frontend
- Makefile helpers and `scripts/ci-local.sh` to mirror CI locally
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites

- Python 3.12
- Node.js 18+ (Node 20 recommended) and npm

To verify your installation:

```bash
# Check Node.js and npm versions
node -v && npm -v

# Check Python and pip versions
python --version && pip --version
```

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/YianXie/LucidGo
cd LucidGo

# Install backend dependencies
cd backend
uv sync --dev

# Activate virtual environment
source .venv/bin/activate

# Run database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

The API listens on `http://localhost:8000` and `http://127.0.0.1:8000`.

Create `backend/.env` following the values listed in [Environment Variables](#environment-variables) before running the server.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The SPA is served from `http://localhost:5173`.

Create `frontend/.env.local` (or `.env`) with the keys in [Environment Variables](#environment-variables) before starting Vite.

## Environment Variables

Create a `.env` file in `backend/`:

```bash
ENVIRONMENT=""          # the environment where your backend is running, use 'development' for local dev
SECRET_KEY=""           # your Django secret_key, can be regenerated if needed

# LucidTree API Configuration
API_ENDPOINT=""        # URL of your KataGo API server (e.g., http://your-ec2-instance:8080)
API_TIMEOUT=300        # Timeout in seconds for API requests (default: 300)
```

Create a `.env` file in `frontend/`:

```bash
VITE_ENVIRONMENT=""    # the environment (default is 'development')
VITE_API_URL=""        # the URL where your backend (Django REST Framework) runs
```

> The backend falls back to SQLite when `ENVIRONMENT=development`. Provide `DB_URL` for production or local PostgreSQL.

## Developer Tooling

### Makefile Commands

- `make install` – install backend and frontend dependencies
- `make lint` – run Ruff and frontend ESLint checks
- `make format` – apply Ruff format, isort, and Prettier
- `make security` – run Safety and Bandit plus `npm audit`
- `make test` – execute Django test suite
- `make ci-local` – replicate CI pipeline locally (`scripts/ci-local.sh`)
- `make run-all` — run all apps, including frontend, backend, and the AI
- `make clean` – prune caches and build artifacts

## API Surface

### Analysis

- `POST /api/analyze/` – submit a move analysis request to KataGo (public)
    - Sample Request:

        ```json
        {
            {
                "rules": "japanese",
                "komi": 6.5,
                "to_play": "B",
                "moves": [
                    [
                        "B",
                        "Q16"
                    ],
                    [
                        "W",
                        "Q4"
                    ],
                    [
                        "B",
                        "D4"
                    ],
                    [
                        "W",
                        "D16"
                    ]
                ],
                "algo": "nn",
                "analysis_config": {
                    "general": {
                        "algorithm": "minimax",
                        "rules": "japanese",
                        "komi": 6.5,
                        "max_time_ms": 0,
                        "temperature": 0,
                        "seed": 123
                    },
                    "neural_network": {
                        "model": "checkpoint_19x19",
                        "policy_softmax_temperature": 0.5,
                        "use_value_head": true
                    },
                    "mcts": {
                        "num_simulations": 250
                    },
                    "minimax": {
                        "depth": 2,
                        "use_alpha_beta": false
                    },
                    "output": {
                        "include_top_moves": 5,
                        "include_policy": false,
                        "include_win_rate": false
                    }
                }
            }
        }
        ```

    - Sample Response:

        ```json
        {
            "best_move": "O3",
            "algorithm": "nn",
            "stats": {
                "model": "checkpoint_19x19",
                "policy_softmax_temperature": 0.5,
                "selected_move_probability": 0.31284284591674805,
                "use_value_head": true,
                "value": 0.024744708091020584,
                "elapsed_ms": 920.17
            }
        }
        ```

### Game Data

- `POST /api/get-game-data/` – parse SGF file data and extract game information (public)
    - Sample Request:

        ```txt
        "(;RU[korean]RE[W+R]KM[6.5]PW[Player_1]PB[Player_2]SZ[19];B[pd];W[pp];B[cd];W[dp];B[qf];W[ed];B[hc];W[df];B[cf];W[cg];B[bg];W[ch];B[bf];W[qk])"
        ```

    - Sample Response:

        ```json
        {
            "moves": [
                ["b", [15, 15]],
                ["w", [3, 15]],
                ["b", [15, 2]],
                ["w", [3, 3]],
                ["b", [13, 16]],
                ["w", [15, 4]],
                ["b", [16, 7]],
                ["w", [13, 3]],
                ["b", [13, 2]],
                ["w", [12, 2]],
                ["b", [12, 1]],
                ["w", [11, 2]],
                ["b", [13, 1]],
                ["w", [8, 16]]
            ],
            "size": 19,
            "komi": 6.5,
            "players": {
                "black": "Player_2",
                "white": "Player_1"
            },
            "winner": "w"
        }
        ```

## Support

Questions or issues? Email [yianxie52@gmail.com](mailto:yianxie52@gmail.com) or open a GitHub Issue on this repository.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
