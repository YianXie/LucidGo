import type { AnalysisConfig, GameData } from "@/types/game";

export function resolveKomi(
    gameData: GameData | null,
    config: AnalysisConfig
): number {
    if (!gameData) return config.general.komi;
    const k = gameData.komi;
    if (typeof k === "number" && !Number.isNaN(k)) return k;
    return config.general.komi;
}

export function buildAnalysisApiPayload(
    config: AnalysisConfig,
    options: {
        moves: [string, string][];
        toPlay: string;
        gameData: GameData | null;
    }
) {
    return {
        rules: config.general.rules,
        komi: resolveKomi(options.gameData, config),
        to_play: options.toPlay,
        moves: options.moves,
        algo: config.general.algorithm,
        analysis_config: config,
    };
}
