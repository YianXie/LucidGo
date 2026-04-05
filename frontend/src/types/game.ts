/** Board coordinates as a [row, col] pair, or null for a pass move. */
export type MoveCoords = [number, number] | null;

/** A single move: [color, coords]. Coords is null for pass/unknown moves. */
export type GameMove = [string, MoveCoords];

/** Type guard: returns true when the move has valid (non-null) coordinates. */
export function isValidMove(
    move: GameMove
): move is [string, [number, number]] {
    return move[1] !== null;
}

export interface GameData {
    size: number | null;
    moves: GameMove[];
    komi?: number;
    players?: { black: string; white: string };
    winner?: string;
}

export interface BoardState {
    name: string | null;
    file: File | null;
    gameData: GameData | null;
    analysisData: AnalysisResult[] | null;
    currentMove: number | null;
    loading: boolean;
    useSample: boolean | null;
    useAI: boolean;
    loadedValue: number;
    analysisConfig: AnalysisConfig;
}

export interface AnalysisConfig {
    general: {
        algorithm: string;
        rules: string;
        komi: number;
        max_time_ms: number;
        temperature: number;
        seed: number;
    };
    neural_network: {
        model: string;
        policy_softmax_temperature: number;
        use_value_head: boolean;
    };
    mcts: {
        num_simulations: number;
        c_puct: number;
        dirichlet_alpha: number;
        dirichlet_epsilon: number;
        value_weight: number;
        policy_weight: number;
        select_by: "visit_count" | "value";
    };
    minimax: {
        depth: number;
        use_alpha_beta: boolean;
    };
    output: {
        include_top_moves: number;
        include_policy: boolean;
        include_win_rate: boolean;
    };
}

/** One analyze API response entry (shape may grow with the backend). */
export interface AnalysisResult {
    best_move: string;
    [key: string]: unknown;
}
