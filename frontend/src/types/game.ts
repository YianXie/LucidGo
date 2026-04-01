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
    size: number;
    moves: GameMove[];
    komi?: number;
    players?: { black: string; white: string };
    winner?: string;
}

/** One analyze API response entry (shape may grow with the backend). */
export interface AnalysisResult {
    best_move: string;
    [key: string]: unknown;
}
