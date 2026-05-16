/**
 * Fixed 5-color high-contrast palette used to identify lanes in the Compare
 * view. Lanes are assigned a color by their index. The palette caps the
 * Compare feature at 5 lanes (matching the 5-game maximum enforced upstream
 * in the Analyze page comparison checkboxes).
 */
export const COMPARE_COLORS: readonly string[] = [
    "#E53935", // red
    "#1E88E5", // blue
    "#43A047", // green
    "#FB8C00", // orange
    "#8E24AA", // purple
];

export const MAX_COMPARE_LANES = COMPARE_COLORS.length;

export function compareColorAt(index: number): string {
    return COMPARE_COLORS[index % COMPARE_COLORS.length];
}
