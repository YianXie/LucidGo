# Welcome to LucidGo

## What is LucidGo?

LucidGo is a web app for reviewing, analyzing, and playing Go (Weiqi) games in real-time with AI assistance. You upload an SGF file, step through the moves on an interactive board, and request analysis at any position — getting back win rates, top candidate moves, and policy probabilities from a neural network trained specifically on Go.

The AI backend is powered by [LucidTree](https://github.com/YianXie/LucidTree), a custom Go engine that supports three analysis algorithms: a neural network, Monte Carlo Tree Search (MCTS), and MiniMax. LucidGo gives you a visual interface to drive that engine.

## What it can do

- **SGF upload**: Load any SGF file and navigate through the game move by move.
- **Real-time play**: Play against a trained Go AI in real-time.
- **Win rate tracking**: See how the winning probability shifts across the game, making it easier to spot where things went wrong (or right).
- **Top move suggestions**: At any position, request the AI's ranked list of candidate moves with win rate estimates.
- **Policy heatmap**: Visualize where the neural network places probability mass across the board.
- **Multiple boards**: Open several games side by side for comparison.
- **Configurable analysis**: Swap between algorithms, tune simulation depth, adjust komi and rules — all from the sidebar.

## Who is it for?

- Players who want to review their games or play Go without setting up KataGo or other engines locally.
- Teachers who need a visual tool to discuss positions with students.
- Anyone curious about how a Go AI actually evaluates a position.

## How it works

The request flow is straightforward:

1. You upload an SGF file → the backend parses it with `sgfmill` and returns move data.
2. At any move, you click "Analyze" → the backend proxies the request to the LucidTree API.
3. LucidTree runs the selected algorithm and returns top moves, win rates, and policy values.
4. The frontend renders those results on the board.

## Technology stack

- **Frontend**: React 18, TypeScript, Vite 7, MUI v7, Tailwind v4
- **Backend**: Python 3.12, Django 5.2, Django REST Framework
- **AI engine**: [LucidTree](https://github.com/YianXie/LucidTree) (custom Go AI with neural network, MCTS, and MiniMax)
- **SGF parsing**: `sgfmill`

## Getting started

1. [Install LucidGo](/docs/installation) — set up the backend and frontend on your machine.
2. [Learn how to use it](/docs/how-to-use) — understand the interface and what each setting does.
3. Upload a game and start analyzing.

## Open source

LucidGo is open source and lives on [GitHub](https://github.com/YianXie/LucidGo). Bug reports, feature requests, and pull requests are welcome.
