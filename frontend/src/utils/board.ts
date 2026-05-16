import { AnalysisConfig, GameState } from "@/types/game";

export function defaultBoard(analysisConfig: AnalysisConfig): GameState {
    return {
        name: null,
        file: null,
        gameID: null,
        sgfContent: "",
        gameData: null,
        analysisData: null,
        winrate: [],
        currentMoveIndex: null,
        loading: false,
        source: "none",
        live: false,
        loadedValue: null,
        analysisConfig: analysisConfig,
        draftAnalysisConfig: analysisConfig,
    };
}
