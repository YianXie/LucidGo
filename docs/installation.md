# Installation

This guide walks you through setting up LucidGo on your local machine for development.

## Prerequisites

You need the following tools installed before starting:

| Tool                             | Version              | Notes                                       |
| -------------------------------- | -------------------- | ------------------------------------------- |
| Python                           | 3.12+                | Required by the backend                     |
| [uv](https://docs.astral.sh/uv/) | latest               | Python package manager used by this project |
| Node.js                          | 22.12+               | Required by the frontend                    |
| npm                              | bundled with Node.js |                                             |

Check your versions:

```bash
python --version
uv --version
node -v && npm -v
```

## Clone the repository

```bash
git clone https://github.com/YianXie/LucidGo
cd LucidGo
```

## Install dependencies

The top-level `Makefile` installs both backend and frontend dependencies in one step:

```bash
make install
```

Or install them separately:

```bash
# Backend
cd backend && uv sync --dev

# Frontend
cd frontend && npm install
```

## Configure environment variables

### Backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:

| Variable       | Description                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SECRET_KEY`   | Django secret key — generate one with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `API_ENDPOINT` | Base URL of your LucidTree API instance (e.g. `http://localhost:8001`)                                                                             |
| `API_TIMEOUT`  | HTTP timeout in seconds for requests to LucidTree (e.g. `30`)                                                                                      |
| `ENVIRONMENT`  | Set to `development`                                                                                                                               |

### Frontend

```bash
cd frontend
cp .env.example .env
```

Open `.env` and fill in:

| Variable           | Description                                     |
| ------------------ | ----------------------------------------------- |
| `VITE_API_URL`     | Backend base URL (e.g. `http://localhost:8000`) |
| `VITE_ENVIRONMENT` | Set to `development`                            |

## Run database migrations

```bash
cd backend
uv run python manage.py migrate
```

## Starting the application

Once installed, start both servers:

```bash
# Backend (http://localhost:8000)
cd backend
uv run python manage.py runserver
```

```bash
# Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Alternatively, you may also run the make command directly:

```bash
make run-all
```

> The frontend will be hosted on `http://localhost:5173`
> The backend will be hosted on `http://localhost:8000`
> The LucidTree will be hosted on `http://localhost:9000`

Then open `http://localhost:5173` in your browser and log in.

## LucidTree API

LucidGo's analysis features depend on a running [LucidTree](https://github.com/YianXie/LucidTree) API instance. Without it, you can still upload and navigate SGF files — analysis requests will just fail.

To run LucidTree locally, follow the setup instructions in its own repository. Once it's running, point `API_ENDPOINT` in your `.env` at it.

## Troubleshooting

**`uv` not found:**
Install it from [docs.astral.sh/uv](https://docs.astral.sh/uv/getting-started/installation/).

**`npm install` fails:**
Clear the cache and retry: `npm cache clean --force`, then delete `node_modules` and `package-lock.json`.

**Port already in use:**
Kill the process on that port or change it. For the backend: `python manage.py runserver 8001`. For the frontend, edit `vite.config.ts`.

**Analysis requests return 502:**
Your `API_ENDPOINT` is pointing at a LucidTree instance that isn't reachable. Check that LucidTree is running and the URL in `.env` is correct.
