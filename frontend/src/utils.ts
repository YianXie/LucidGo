import { GTPLetters } from "./constants";

/**
 * Convert a [row, col] (0-based) formatted  coords to a GTP-formatted coords (e.g. B14)
 */
export function toGTPFormat(row: number, col: number): string {
    if (row > 18 || row < 0 || col > 18 || col < 0) {
        throw new RangeError("row or col not in valid range (1-19)");
    }

    const letter = GTPLetters[col].toUpperCase();

    return `${letter}${row + 1}`;
}

/**
 * Convert a GTP-formatted coords to a [row, col] formatted coords
 */
export function toRowColFormat(coords: string): [number, number] {
    const col = GTPLetters.indexOf(coords[0].toUpperCase());
    const row = Number(coords.substring(1)) - 1;

    return [row, col];
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}
