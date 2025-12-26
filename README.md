# LucidGo

LucidGo is a visual Go (Weiqi) analysis tool that allows you to see AI-powered move analysis in real-time. Built with [KataGo](https://github.com/lightvector/KataGo) as the Go engine, LucidGo provides an intuitive interface for studying and understanding Go games through AI-assisted analysis.

_The new [Mini-KataGo](https://github.com/YianXie/Mini-KataGo) project is in work in progress!_

## Table of Contents

-   [Overview](#overview)
-   [Tech Stack](#tech-stack)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Backend Setup](#backend-setup)
    -   [Frontend Setup](#frontend-setup)
    -   [Run Both Apps](#run-both-apps)
-   [Environment Variables](#environment-variables)
-   [Developer Tooling](#developer-tooling)
    -   [Makefile Commands](#makefile-commands)
-   [AWS Setup](#aws-setup)
    -   [EC2 Instance Setup](#ec2-instance-setup)
    -   [Install KataGo on your EC2 instance](#install-katago-on-your-ec2-instance)
-   [API Surface](#api-surface)
-   [Current Features](#current-features)
-   [Support](#support)
-   [License](#license)

## Overview

Go (Weiqi) is often referred to as abstract and difficult to understand. However, with the advancement of AI technology, such as KataGo, it has become much easier to study and play.

Most people enjoy the assistance from AI but have no idea how it works and what factors affect its performance. LucidGo allows you to visually see AI, such as KataGo, make its decisions in real-time and is highly customizable to fit your needs.

**Key Features:**

-   **Visual analysis**: Interactive Go board with real-time move analysis and win rate visualization
-   **SGF file support**: Upload and analyze games from SGF (Smart Game Format) files
-   **AI-powered insights**: Leverage KataGo for deep move analysis and position evaluation
-   **Customizable interface**: Modern, responsive UI built with React and Material-UI
-   **Cloud-ready**: Optional AWS EC2 integration for GPU-accelerated analysis

## Tech Stack

**Backend**

-   Python 3.11, Django 5.2+, Django REST Framework 3.16+
-   PostgreSQL (production) and SQLite (local development)
-   HTTP client via `httpx` for KataGo API communication
-   SGF parsing with `sgfmill` library
-   JWT authentication with `djangorestframework-simplejwt`

**Frontend**

-   React 19 with Vite 7 for fast development experience
-   React Router 7 for navigation
-   Material-UI 7 and Tailwind CSS 4 for styling
-   `@sabaki/go-board` for Go board rendering
-   Chart.js for win rate visualization
-   Three.js and GSAP for advanced animations

**Tooling & DevOps**

-   Ruff (formatter and linter), isort, Bandit, Safety for Python quality and security
-   ESLint, Prettier, and Tailwind plugins for the frontend
-   Makefile helpers and `scripts/ci-local.sh` to mirror CI locally
-   GitHub Actions for CI/CD

## Project Structure

```
LucidGo/
├── backend/                     # Django project
│   ├── api/                     # API endpoints for analysis and game data
│   │   ├── views.py             # AnalyzeView, GetGameDataView
│   │   └── urls.py              # API route definitions
│   ├── backend/                 # Django settings, URLs, WSGI/ASGI config
│   │   ├── settings.py          # Django configuration
│   │   └── urls.py               # Root URL configuration
│   ├── manage.py
│   ├── pyproject.toml           # Python tooling configuration
│   └── requirements.txt         # Python dependencies
├── frontend/                    # React single-page app
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── board/           # Go board components (GameBoard, Controls, WinRate)
│   │   │   ├── global/          # Layout components (Header, Container, Layout)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Route-level screens (Home, Demo, Docs)
│   │   ├── api.js               # API client configuration
│   │   └── utils.js             # Utility functions
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── scripts/                     # Local CI helper scripts
├── .github/
│   └── workflows/               # GitHub Actions CI/CD
├── Makefile                     # Common dev commands
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

-   Python 3.11
-   Node.js 18+ (Node 20 recommended) and npm
-   (Optional) AWS EC2 instance with GPU support for KataGo analysis

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

# Create and activate a Python virtual environment
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

The API listens on `http://localhost:8000`.

Create `backend/.env` following the values listed in [Environment Variables](#environment-variables) before running the server.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The SPA is served from `http://localhost:5173`.

Create `frontend/.env.local` (or `.env`) with the keys in [Environment Variables](#environment-variables) before starting Vite.

### Run Both Apps

Use separate terminals for backend and frontend, or rely on the Makefile:

```bash
cd LucidGo
make install        # installs backend + frontend deps
```

For routine development, run `python manage.py runserver` (from `backend/`) and `npm run dev` (from `frontend/`) concurrently.

## Environment Variables

Create a `.env` file in `backend/`:

```bash
ENVIRONMENT=""          # the environment where your backend is running, use 'development' for local dev
SECRET_KEY=""           # your Django secret_key, can be regenerated if needed
ALLOWED_HOSTS=""        # your domain (without https:// or http://)
CORS_ALLOWED_ORIGINS="" # your domain (with https:// or http://)
CSRF_TRUSTED_ORIGINS="" # your domain (with https:// or http://)

# Database (only required for production)
DB_URL=""               # PostgreSQL database URL (e.g., postgresql://user:pass@host:port/dbname)

# KataGo API Configuration
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

-   `make install` – install backend and frontend dependencies
-   `make lint` – run Ruff and frontend ESLint checks
-   `make format` – apply Ruff format, isort, and Prettier
-   `make security` – run Safety and Bandit plus `npm audit`
-   `make test` – execute Django test suite
-   `make ci-local` – replicate CI pipeline locally (`scripts/ci-local.sh`)
-   `make clean` – prune caches and build artifacts

## AWS Setup

### EC2 Instance Setup

Since LucidGo uses KataGo as its Go engine, you can use an AWS server to run LucidGo's analysis more efficiently. To set it up, first create an EC2 Instance on AWS, and choose a Linux-based system (such as Ubuntu) with Nvidia Driver pre-installed.

**DO NOT GO FOR NEURAL NETWORK INSTANCES**

_Recommended instance: Deep Learning Base OSS Nvidia Driver GPU AMI (Ubuntu 24.04)_

Choose a reasonably good setup (e.g., g4dn.xlarge), and then start your server.

> If you encounter any quota issues, you may need to request a quota increase

Then, copy your instance's **public IPv4 address** (e.g., 12.345.678.999), and paste it in the `.env` file in your `backend` directory as the `API_ENDPOINT` value.

Do note that the auto-assigned IPv4 address is not fixed. To get a stable address, consider adding an **elastic IP address**.

### Install KataGo on your EC2 instance

<!-- Do not edit here -->

WIP

## API Surface

### Analysis

-   `POST /api/analyze/` – submit a move analysis request to KataGo (public)
    -   Request body: `{ "analysis_request": {...} }`
    -   Returns: KataGo analysis response with win rates and move evaluations

### Game Data

-   `POST /api/get-game-data/` – parse SGF file data and extract game information (public)
    -   Request body: `{ "sgf_file_data": "..." }`
    -   Returns: Parsed game data including moves, board size, komi, players, and winner

## Current Features

-   Interactive Go board with move-by-move navigation
-   Real-time AI analysis visualization with win rate charts
-   SGF file upload and parsing
-   Move-by-move game replay with analysis
-   Responsive design with light/dark theme support
-   GPU-accelerated analysis via AWS EC2 integration

## Support

Questions or issues? Email [yianxie52@gmail.com](mailto:yianxie52@gmail.com) or open a GitHub Issue on this repository.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
