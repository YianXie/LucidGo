# How to Use

## Uploading a game

1. Navigate to the **Demo** page.
2. Click the upload area and select an SGF file, or click **View a Sample** to try a built-in game.
3. The board will appear with the game loaded at move 0.

## Play live-game against a trained AI

1. Navigate to the **Demo** page.
2. Click play against AI
3. The board will appear with hover for each move

## Navigating moves

Use the slider below the board to jump to any move. The move counter and board state update as you drag.

The fast-forward buttons step through the game 5 moves at a time.

## Requesting analysis

Click **Analyze** to send the current position to LucidTree. The result shows:

- **Top moves**: The AI's ranked candidate moves, overlaid on the board.
- **Win rate**: The estimated probability of winning from the current position.
- **Policy**: The raw probability distribution across the board (how likely the AI considers each intersection as a candidate move).

What's included in the result depends on your output settings — see the [Output](#output) section below.

## Multiple boards

You can open several games at the same time. Click **Add Board** to create a new one. Each board has its own analysis config, game data, and current position.

To remove a board, click the delete icon next to it.

## Analysis settings

The sidebar on the Demo page (and the default config under **Settings → Default Analysis Configuration**) controls how LucidTree runs its analysis.

Settings are grouped into four sections: General, algorithm-specific, and Output.

---

### General

These settings apply regardless of which algorithm you choose.

**Algorithm**
Selects which analysis algorithm to use:

- **Neural Network** — Runs a single forward pass through LucidTree's trained neural network. It's the fastest option and gives you win rate estimates and policy probabilities directly. Good for most game reviews.
- **Monte Carlo Tree Search (MCTS)** — Builds a search tree by running many simulated game continuations, guided by the neural network. Stronger than a bare network pass but takes longer. Simulation count is tunable.
- **MiniMax** — A classic depth-limited tree search with optional alpha-beta pruning. Much weaker than the neural network on a 19x19 board, but included for educational purposes.

**Rules**
Determines how territory and scoring are calculated. Match this to the ruleset your game was actually played under.

- **Japanese** — Territory scoring. Dead stones inside territory are counted, dame are not.
- **Chinese** — Area scoring. Counts living stones and enclosed territory together.

**Komi**
The point compensation given to White at the start of the game. 6.5 is standard for 19x19 under most rulesets. If your SGF file includes a komi value, you may want to set this to match.

**Max Time (ms)**
Sets a time limit (in milliseconds) on how long the engine can spend per analysis request. `0` means no time limit — the engine runs until it finishes all planned simulations. Set a value like `500` or `1000` if you want faster responses at the cost of some accuracy.

**Temperature**
Controls how much randomness is applied when selecting moves. `0` means the AI always picks the highest-scoring option deterministically. Values above 0 introduce stochasticity — useful if you want to see varied candidate moves rather than always the same top choice.

**Seed**
Random seed for the analysis. Leave it empty to get a different result each run. Set a fixed integer to make results reproducible.

---

### Neural Network

These settings appear when **Algorithm** is set to Neural Network.

**Policy Softmax Temperature**
Adjusts the sharpness of the policy output before it's returned. Lower values (closer to 0) concentrate probability on the top moves; higher values spread it more evenly. `0.2` is the default — it makes the displayed policy easier to read without completely flattening it.

---

### Monte Carlo Tree Search

These settings appear when **Algorithm** is set to Monte Carlo Tree Search.

**Num Simulations**
How many MCTS simulations to run. Each simulation traverses the search tree, expands a node, and backs up the result. More simulations → stronger analysis, but it takes longer. Default is 500; range is 100–5000.

**C-PUCT**
The exploration constant in the PUCT formula. It balances how much MCTS prefers moves with high visit counts (exploitation) vs. moves with promising but underexplored priors (exploration). A higher value pushes the search to explore more broadly. Default is 1.5.

**Dirichlet Alpha**
Concentration parameter for the Dirichlet noise added to the root node's prior probabilities. Smaller values (e.g. 0.03) focus the noise on a few moves; larger values spread it across more. Set to `0` to disable root noise entirely. Noise is typically used during training to encourage exploration — during analysis you can leave it at `0`.

**Dirichlet Epsilon**
How much weight the Dirichlet noise contributes relative to the neural network's prior. `0` means no noise; `0.25` is common during training. For pure analysis, keep this at `0` unless you specifically want to inject randomness.

**Value Weight**
Scales the contribution of the neural network's value estimate to each node's score during backup. Default `1.0`. Lower values reduce how much the network's value head influences the search.

**Policy Weight**
Scales how much the neural network's policy prior influences which nodes MCTS selects for exploration. Default `1.0`. Lowering it makes the search less guided by the policy.

**Select By**
Determines how MCTS picks the final best move after all simulations are complete.

- **Visit Count** — Picks the move that was visited most often. More robust and less susceptible to outlier evaluations. Recommended.
- **Value** — Picks the move with the highest average Q-value (average backed-up value). Can prefer sharp tactical lines over solid positional moves.

---

### MiniMax

These settings appear when **Algorithm** is set to MiniMax.

**Depth**
How many half-moves (plies) the minimax search looks ahead. Each extra ply multiplies the search space, so keep this low (2–3) unless you're prepared to wait. On a 19x19 board, MiniMax without the neural network is quite weak — treat this as an educational comparison more than a practical analysis tool.

**Use Alpha Beta**
Enables alpha-beta pruning, which skips evaluating branches that can't possibly affect the final decision. This significantly reduces the number of nodes evaluated without changing the result. Leave this on.

---

### Output

These settings control what data gets included in the analysis response.

**Include Top Moves**
How many candidate moves to return, ranked by the algorithm's scoring. Default is 5. Set to 1 if you just want the best move; set higher (up to 10) if you want a broader view of the AI's options.

**Include Policy**
Whether to include the neural network's raw policy probability for each top move. Useful for understanding how the network's prior compares to the MCTS-refined ranking.

**Include Win Rate**
Whether to include the estimated win probability for each top move. Turn this off if you only care about move ordering and want a lighter response.

**Include Visits**
Whether to include the MCTS visit count for each top move. Only meaningful when using the MCTS algorithm — the visit count shows how much time MCTS spent investigating each candidate.

---

## Tips

- **Start from large win rate swings.** The win rate chart makes it easy to spot the critical moments in a game. Jump to the move just before a big swing and analyze there.
- **Compare policy vs. MCTS.** The neural network's policy shows its immediate intuition; MCTS refines that through simulation. If they disagree on the best move, that position is worth studying.
- **Use lower simulation counts for quick reviews.** 100–200 simulations is fast and often good enough to see whether your move was in the top candidates. Alternatively, you can also configure the max_time_ms variable.
- **MiniMax is weak on 19x19.** Its evaluation is heuristic and won't keep up with the neural network. Use it to compare algorithm behavior, not for serious game review.
