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
    /** Merge `fields` into one section of `analysisConfig` and call `onChange`. */
    function patch<K extends keyof AnalysisConfig>(
        section: K,
        fields: Partial<AnalysisConfig[K]>
    ) {
        onChange({
            ...analysisConfig,
            [section]: { ...analysisConfig[section], ...fields },
        });
    }

    const nnConfigContent = (
        <ConfigSection title="Neural Network">
            <ConfigTextField
                label="Model:"
                value={analysisConfig.nn.model}
                onChange={(v) => patch("nn", { model: v })}
            />
            <ConfigTextField
                label="Policy Softmax Temperature:"
                type="number"
                value={analysisConfig.nn.policy_softmax_temperature}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) =>
                    patch("nn", { policy_softmax_temperature: Number(v) })
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
                onChange={(v) => patch("mcts", { num_simulations: v })}
            />
            <ConfigTextField
                label="C-PUCT:"
                type="number"
                value={analysisConfig.mcts.c_puct}
                inputProps={{ min: 0.1, max: 5, step: 0.1 }}
                onChange={(v) => patch("mcts", { c_puct: Number(v) })}
            />
            <ConfigTextField
                label="Dirichlet Alpha:"
                type="number"
                value={analysisConfig.mcts.dirichlet_alpha}
                inputProps={{ min: 0, max: 0.5, step: 0.01 }}
                onChange={(v) => patch("mcts", { dirichlet_alpha: Number(v) })}
            />
            <ConfigTextField
                label="Dirichlet Epsilon:"
                type="number"
                value={analysisConfig.mcts.dirichlet_epsilon}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) =>
                    patch("mcts", { dirichlet_epsilon: Number(v) })
                }
            />
            <ConfigTextField
                label="Value Weight:"
                type="number"
                value={analysisConfig.mcts.value_weight}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) => patch("mcts", { value_weight: Number(v) })}
            />
            <ConfigTextField
                label="Policy Weight:"
                type="number"
                value={analysisConfig.mcts.policy_weight}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                onChange={(v) => patch("mcts", { policy_weight: Number(v) })}
            />
            <ConfigSelect
                label="Select By:"
                value={analysisConfig.mcts.select_by}
                options={[
                    { value: "visit_count", label: "Visit Count" },
                    { value: "value", label: "Value" },
                ]}
                onChange={(v) =>
                    patch("mcts", {
                        select_by: v as AnalysisConfig["mcts"]["select_by"],
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
                onChange={(v) => patch("minimax", { depth: Number(v) })}
            />
            <ConfigCheckbox
                label="Use Alpha Beta"
                checked={analysisConfig.minimax.use_alpha_beta}
                onChange={(v) => patch("minimax", { use_alpha_beta: v })}
            />
        </ConfigSection>
    );

    const algorithmContent: Partial<
        Record<AnalysisConfig["general"]["algorithm"], JSX.Element>
    > = {
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
                    onChange={(v) => patch("general", { algorithm: v })}
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
                    onChange={(v) => patch("general", { rules: v })}
                />
                <ConfigTextField
                    label="Komi:"
                    type="number"
                    value={analysisConfig.general.komi}
                    inputProps={{ min: 0.5, max: 10.5, step: 1.0 }}
                    onChange={(v) => patch("general", { komi: Number(v) })}
                />
                <ConfigSlider
                    label="Max Time (ms):"
                    tooltip="Note: 0 means no time limit"
                    value={analysisConfig.general.max_time_ms}
                    min={0}
                    max={5000}
                    step={100}
                    ariaLabel="max-time-ms"
                    onChange={(v) => patch("general", { max_time_ms: v })}
                />
                <ConfigTextField
                    label="Temperature:"
                    type="number"
                    value={analysisConfig.general.temperature}
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                    onChange={(v) =>
                        patch("general", { temperature: Number(v) })
                    }
                />
                <ConfigTextField
                    label="Seed:"
                    type="text"
                    value={analysisConfig.general.seed}
                    onChange={(v) => patch("general", { seed: v as string })}
                />
            </ConfigSection>
            {algorithmContent[analysisConfig.general.algorithm]}
            <ConfigSection title="Output">
                <ConfigTextField
                    label="Include Top Moves:"
                    type="number"
                    value={analysisConfig.output.include_top_moves}
                    inputProps={{ min: 0, max: 10, step: 1 }}
                    onChange={(v) =>
                        patch("output", { include_top_moves: Number(v) })
                    }
                />
                <ConfigCheckbox
                    label="Include Policy"
                    checked={analysisConfig.output.include_policy}
                    onChange={(v) => patch("output", { include_policy: v })}
                />
                <ConfigCheckbox
                    label="Include Win Rate"
                    checked={analysisConfig.output.include_winrate}
                    onChange={(v) => patch("output", { include_winrate: v })}
                />
                <ConfigCheckbox
                    label="Include Visits"
                    checked={analysisConfig.output.include_visits}
                    onChange={(v) => patch("output", { include_visits: v })}
                />
            </ConfigSection>
        </Box>
    );
}

export default AnalysisConfigFields;
