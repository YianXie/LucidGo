import { GTP_LETTERS, PASS_MOVE_ROW_COL } from "@/constants";

/**
 * Convert a [row, col] (0-based) formatted  coords to a GTP-formatted coords (e.g. B14)
 */
export function toGTPFormat(row: number, col: number): string {
    if (row > 18 || row < 0 || col > 18 || col < 0) {
        throw new RangeError("row or col not in valid range (1-19)");
    }

    const letter = GTP_LETTERS[col].toUpperCase();

    return `${letter}${row + 1}`;
}

/**
 * Convert a GTP-formatted coords to a [row, col] formatted coords
 */
export function toRowColFormat(coords: string): [number, number] {
    const col = GTP_LETTERS.indexOf(coords[0].toUpperCase());
    const row = Number(coords.substring(1)) - 1;

    return [row, col];
}

/**
 * Parse a GTP board point (e.g. "Q16") to [row, col], or null for pass / invalid.
 */
export function parseGtpBoardPoint(move: string): [number, number] | null {
    const m = move.trim().toUpperCase();
    if (m.length < 2 || m.length > 3) return null;
    if (m === "PASS") return PASS_MOVE_ROW_COL;

    const col = GTP_LETTERS.indexOf(m[0]);
    const row = Number(m.substring(1)) - 1;
    return [row, col];
}
