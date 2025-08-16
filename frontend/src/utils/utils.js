/**
 * Convert a [row, col] formatted  coords to a GTP-formatted coords (e.g. B14)
 * @param {number} row - The row of the coords, should start from the bottom left
 * @param {number} col - The column of the coords, should start from the bottom left
 */
export function toGTPFormat(row, col) {
    if (row > 19 || row < 1 || col > 19 || col < 1) {
        throw new RangeError("row or col not in valid range (1-19)");
    }

    const letter = GTPLetters[row - 1]; // indexOf returns a 0-based value
    return `${letter}${col}`;
}

/**
 * Convert a GTP-formatted coords to a [row, col] formatted coords
 * @param {string} coords - The GTP-formatted coords (e.g. B14)
 */
export function toRowColFormat(coords) {
    const row = GTPLetters.indexOf(coords[0]) + 1;
    const col = coords.substring(1);
    return { row: row, col: col };
}
