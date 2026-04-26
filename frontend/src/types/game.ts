/** Board coordinates as a [row, col] pair, or null for a pass move. */
export type MoveCoords = [number, number] | null;

/** A single move: [color, coords]. Coords is null for pass/unknown moves. */
export type GameMove = [string, MoveCoords];

/** How a board got its game: loaded from a file, the built-in sample, or not yet chosen. */
export type GameSource = "file" | "sample" | "none";

/** Type guard: returns true when the move has valid (non-null) coordinates. */
export function isValidMove(
    move: GameMove
): move is [string, [number, number]] {
    return move[1] !== null;
}

export interface HistoryAnalysisSession {
    id: string;
    analysis_config: AnalysisConfig;
    results: AnalysisResult[];
    created_at: string;
}

export interface HistoryEntry {
    analysis_sessions: HistoryAnalysisSession[];
    black_player: string;
    board_size: number;
    created_at: string;
    id: string;
    komi: number | null;
    moves: GameMove[];
    name: string;
    sgf_data: string;
    source: "upload" | "live";
    updated_at: string;
    winner: string;
    white_player: string;
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
    gameID: string | null;
    gameData: GameData | null;
    analysisData: (AnalysisResult | null)[] | null;
    winrate: { black: number; white: number }[];
    currentMoveIndex: number | null;
    loading: boolean;
    gameSource: GameSource;
    live: boolean;
    loadedValue: number | null;
    analysisConfig: AnalysisConfig;
}

export interface UserSettings {
    general_settings: GeneralSettings;
    analysis_config: AnalysisConfig;
}

export interface GeneralSettings {
    auto_save_games: boolean;
}

export interface AnalysisConfig {
    general: {
        algorithm: string;
        rules: string;
        komi: number;
        max_time_ms: number;
        temperature: number;
        seed: string;
    };
    nn: {
        model: string;
        policy_softmax_temperature: number;
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
        include_winrate: boolean;
        include_visits: boolean;
    };
}

export interface AnalysisResult {
    algo: string;
    stats: {
        elapsed_ms: number;
        winrate: { black: number; white: number };
        policy: number[];
        [key: string]: unknown;
    };
    top_moves: {
        move: string;
        policy?: number;
        winrate?: { black: number; white: number };
        visits?: number;
    }[];
    [key: string]: unknown;
}

export interface WinrateResult {
    winrate: { black: number; white: number }[];
}

export interface GameSummary {
    id: string;
    name: string;
    source: "upload" | "live";
    board_size: number;
    komi: number | null;
    black_player: string;
    white_player: string;
    winner: string;
    analysis_count: number;
    last_analyzed_at: string | null;
    created_at: string;
    updated_at: string;
}
