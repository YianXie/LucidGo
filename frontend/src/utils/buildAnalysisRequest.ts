import { FIELDS_TO_MERGE } from "@/constants";
import { AnalysisConfig } from "@/types/game";

export const buildAnalysisRequest = (
    analysisConfig: AnalysisConfig,
    moves: [string, string][],
    toPlay: string
) => {
    const request = {
        algo: analysisConfig.general.algorithm,
        rules: analysisConfig.general.rules,
        komi: analysisConfig.general.komi,
        to_play: toPlay,
        moves: moves,
        params: {
            ...analysisConfig[
                analysisConfig.general.algorithm as keyof typeof analysisConfig
            ],
            ...FIELDS_TO_MERGE.reduce(
                (acc, field) => {
                    acc[field] = analysisConfig.general[
                        field as keyof typeof analysisConfig.general
                    ] as number;
                    return acc;
                },
                {} as Record<string, number>
            ),
        },
        output: analysisConfig.output,
    };
    return request;
};

export const buildWinrateRequest = (
    moves: [string, string][],
    analysisConfig: AnalysisConfig
) => {
    const request = {
        moves: moves,
        params: {
            temperature: analysisConfig.general.temperature,
        },
    };
    return request;
};
