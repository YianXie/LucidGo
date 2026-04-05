import type { AnalysisConfig } from "@/types/game";
import Box from "@mui/material/Box";

import {
    ConfigCheckbox,
    ConfigSection,
    ConfigSelect,
    ConfigSlider,
    ConfigTextField,
} from "./ConfigFields";

function AnalysisConfigFields({
    analysisConfig,
    onChange,
}: {
    analysisConfig: AnalysisConfig;
    onChange: (config: AnalysisConfig) => void;
}) {
    const nnConfigContent = (
        <ConfigSection title="Neural Network">
            <ConfigTextField
                label="Model:"
                value={analysisConfig.neural_network.model}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        neural_network: {
                            ...analysisConfig.neural_network,
                            model: v,
                        },
                    })
                }
            />
            <ConfigTextField
                label="Policy Softmax Temperature:"
                type="number"
                value={analysisConfig.neural_network.policy_softmax_temperature}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        neural_network: {
                            ...analysisConfig.neural_network,
                            policy_softmax_temperature: Number(v),
                        },
                    })
                }
            />
            <ConfigCheckbox
                label="Use Value Head"
                checked={analysisConfig.neural_network.use_value_head}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        neural_network: {
                            ...analysisConfig.neural_network,
                            use_value_head: v,
                        },
                    })
                }
            />
        </ConfigSection>
    );

    const mctsConfigContent = (
        <ConfigSection title="Monte Carlo Tree Search">
            <ConfigSlider
                label="Num Simulations:"
                value={analysisConfig.mcts.num_simulations}
                min={100}
                max={5000}
                step={100}
                ariaLabel="num-simulations"
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        mcts: {
                            ...analysisConfig.mcts,
                            num_simulations: v,
                        },
                    })
                }
            />
            <ConfigTextField
                label="C-PUCT:"
                type="number"
                value={analysisConfig.mcts.c_puct}
                inputProps={{ min: 0.1, max: 5, step: 0.1 }}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        mcts: { ...analysisConfig.mcts, c_puct: Number(v) },
                    })
                }
            />
            <ConfigTextField
                label="Dirichlet Alpha:"
                type="number"
                value={analysisConfig.mcts.dirichlet_alpha}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        mcts: {
                            ...analysisConfig.mcts,
                            dirichlet_alpha: Number(v),
                        },
                    })
                }
            />
            <ConfigTextField
                label="Dirichlet Epsilon:"
                type="number"
                value={analysisConfig.mcts.dirichlet_epsilon}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        mcts: {
                            ...analysisConfig.mcts,
                            dirichlet_epsilon: Number(v),
                        },
                    })
                }
            />
            <ConfigTextField
                label="Value Weight:"
                type="number"
                value={analysisConfig.mcts.value_weight}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        mcts: {
                            ...analysisConfig.mcts,
                            value_weight: Number(v),
                        },
                    })
                }
            />
            <ConfigTextField
                label="Policy Weight:"
                type="number"
                value={analysisConfig.mcts.policy_weight}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        mcts: {
                            ...analysisConfig.mcts,
                            policy_weight: Number(v),
                        },
                    })
                }
            />
            <ConfigSelect
                label="Select By:"
                value={analysisConfig.mcts.select_by}
                options={[
                    { value: "visit_count", label: "Visit Count" },
                    { value: "value", label: "Value" },
                ]}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        mcts: {
                            ...analysisConfig.mcts,
                            select_by: v as "visit_count" | "value",
                        },
                    })
                }
            />
        </ConfigSection>
    );

    const minimaxConfigContent = (
        <ConfigSection title="MiniMax">
            <ConfigTextField
                label="Depth:"
                type="number"
                value={analysisConfig.minimax.depth}
                inputProps={{ min: 1, max: 5, step: 1 }}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        minimax: {
                            ...analysisConfig.minimax,
                            depth: Number(v),
                        },
                    })
                }
            />
            <ConfigCheckbox
                label="Use Alpha Beta"
                checked={analysisConfig.minimax.use_alpha_beta}
                onChange={(v) =>
                    onChange({
                        ...analysisConfig,
                        minimax: {
                            ...analysisConfig.minimax,
                            use_alpha_beta: v,
                        },
                    })
                }
            />
        </ConfigSection>
    );

    const content = {
        nn: nnConfigContent,
        mcts: mctsConfigContent,
        minimax: minimaxConfigContent,
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ConfigSection title="General">
                <ConfigSelect
                    label="Algorithm:"
                    value={analysisConfig.general.algorithm}
                    labelId="algorithm-label"
                    id="algorithm-select"
                    options={[
                        { value: "nn", label: "Neural Network" },
                        { value: "mcts", label: "Monte Carlo Tree Search" },
                        { value: "minimax", label: "MiniMax" },
                    ]}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            general: {
                                ...analysisConfig.general,
                                algorithm: v,
                            },
                        })
                    }
                />
                <ConfigSelect
                    label="Rules:"
                    value={analysisConfig.general.rules}
                    labelId="rules-label"
                    id="rules-select"
                    options={[
                        { value: "japanese", label: "Japanese" },
                        { value: "chinese", label: "Chinese" },
                    ]}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            general: {
                                ...analysisConfig.general,
                                rules: v,
                            },
                        })
                    }
                />
                <ConfigTextField
                    label="Komi:"
                    type="number"
                    value={analysisConfig.general.komi}
                    inputProps={{ min: 0.5, max: 10.5, step: 1.0 }}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            general: {
                                ...analysisConfig.general,
                                komi: Number(v),
                            },
                        })
                    }
                />
                <ConfigSlider
                    label="Max Time (ms):"
                    tooltip="Note: 0 means no time limit"
                    value={analysisConfig.general.max_time_ms}
                    min={0}
                    max={60000}
                    step={250}
                    ariaLabel="max-time-ms"
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            general: {
                                ...analysisConfig.general,
                                max_time_ms: v,
                            },
                        })
                    }
                />
                <ConfigTextField
                    label="Temperature:"
                    type="number"
                    value={analysisConfig.general.temperature}
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            general: {
                                ...analysisConfig.general,
                                temperature: Number(v),
                            },
                        })
                    }
                />
                <ConfigTextField
                    label="Seed:"
                    type="number"
                    value={analysisConfig.general.seed}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            general: {
                                ...analysisConfig.general,
                                seed: Number(v),
                            },
                        })
                    }
                />
            </ConfigSection>
            {content[analysisConfig.general.algorithm as keyof typeof content]}
            <ConfigSection title="Output">
                <ConfigTextField
                    label="Include Top Moves:"
                    type="number"
                    value={analysisConfig.output.include_top_moves}
                    inputProps={{ min: 0, max: 10, step: 1 }}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            output: {
                                ...analysisConfig.output,
                                include_top_moves: Number(v),
                            },
                        })
                    }
                />
                <ConfigCheckbox
                    label="Include Policy"
                    checked={analysisConfig.output.include_policy}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            output: {
                                ...analysisConfig.output,
                                include_policy: v,
                            },
                        })
                    }
                />
                <ConfigCheckbox
                    label="Include Win Rate"
                    checked={analysisConfig.output.include_win_rate}
                    onChange={(v) =>
                        onChange({
                            ...analysisConfig,
                            output: {
                                ...analysisConfig.output,
                                include_win_rate: v,
                            },
                        })
                    }
                />
            </ConfigSection>
        </Box>
    );
}

export default AnalysisConfigFields;
