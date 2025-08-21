import { GTPLetters } from "./constants";

/**
 * Convert a [row, col] (0-based) formatted  coords to a GTP-formatted coords (e.g. B14)
 * @param {number} row - The row of the coords, should start from the bottom left
 * @param {number} col - The column of the coords, should start from the bottom left
 */
export function toGTPFormat(row, col) {
    if (row > 18 || row < 0 || col > 18 || col < 0) {
        throw new RangeError("row or col not in valid range (1-19)");
    }

    const letter = GTPLetters[col]; // indexOf returns a 0-based value

    // The GTP-formatted coords and the row-col formatted coords have opposite row and column
    return `${letter}${row + 1}`;
}

/**
 * Convert a GTP-formatted coords to a [row, col] formatted coords
 * @param {string} coords - The GTP-formatted coords (e.g. B14)
 * @returns {object} - The [row, col] formatted coords (0-based)
 */
export function toRowColFormat(coords) {
    // Row-col coords are 0-based
    const row = GTPLetters.indexOf(coords[0]);
    const col = coords.substring(1) - 1;

    // The GTP-formatted coords and the row-col formatted coords have opposite row and column
    return [col, row];
}
