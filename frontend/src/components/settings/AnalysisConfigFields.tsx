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
    setAnalysisConfig,
}: {
    analysisConfig: AnalysisConfig;
    setAnalysisConfig: (config: AnalysisConfig) => void;
}) {
    function patch<K extends keyof AnalysisConfig>(
        section: K,
        fields: Partial<AnalysisConfig[K]>
    ) {
        setAnalysisConfig({
            ...analysisConfig,
            [section]: { ...analysisConfig[section], ...fields },
        });
    }

    const nnConfigContent = (
        <ConfigSection title="Neural Network">
            <ConfigTextField
                label="Policy Softmax Temperature:"
                type="number"
                value={analysisConfig.nn.policy_softmax_temperature}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                tooltip="Adjusts the sharpness of the policy output before it's returned. Lower values (closer to 0) concentrate probability on the top moves; higher values spread it more evenly. `0.2` is the default — it makes the displayed policy easier to read without completely flattening it."
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
                tooltip="How many MCTS simulations to run. Each simulation traverses the search tree, expands a node, and backs up the result. More simulations → stronger analysis, but it takes longer. Default is 500; range is 100–5000."
                ariaLabel="num-simulations"
                onChange={(v) => patch("mcts", { num_simulations: v })}
            />
            <ConfigTextField
                label="C-PUCT:"
                type="number"
                value={analysisConfig.mcts.c_puct}
                inputProps={{ min: 0.1, max: 5, step: 0.1 }}
                tooltip="The exploration constant in the PUCT formula. It balances how much MCTS prefers moves with high visit counts (exploitation) vs. moves with promising but underexplored priors (exploration). A higher value pushes the search to explore more broadly. Default is 1.5."
                onChange={(v) => patch("mcts", { c_puct: Number(v) })}
            />
            <ConfigTextField
                label="Dirichlet Alpha:"
                type="number"
                value={analysisConfig.mcts.dirichlet_alpha}
                inputProps={{ min: 0, max: 0.5, step: 0.01 }}
                tooltip="Concentration parameter for the Dirichlet noise added to the root node's prior probabilities. Smaller values (e.g. 0.03) focus the noise on a few moves; larger values spread it across more. Set to `0` to disable root noise entirely. Noise is typically used during training to encourage exploration — during analysis you can leave it at `0`."
                onChange={(v) => patch("mcts", { dirichlet_alpha: Number(v) })}
            />
            <ConfigTextField
                label="Dirichlet Epsilon:"
                type="number"
                value={analysisConfig.mcts.dirichlet_epsilon}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                tooltip="How much weight the Dirichlet noise contributes relative to the neural network's prior. `0` means no noise; `0.25` is common during training. For pure analysis, keep this at `0` unless you specifically want to inject randomness."
                onChange={(v) =>
                    patch("mcts", { dirichlet_epsilon: Number(v) })
                }
            />
            <ConfigTextField
                label="Value Weight:"
                type="number"
                value={analysisConfig.mcts.value_weight}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                tooltip="Scales the contribution of the neural network's value estimate to each node's score during backup. Default `1.0`. Lower values reduce how much the network's value head influences the search."
                onChange={(v) => patch("mcts", { value_weight: Number(v) })}
            />
            <ConfigTextField
                label="Policy Weight:"
                type="number"
                value={analysisConfig.mcts.policy_weight}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                tooltip="Scales how much the neural network's policy prior influences which nodes MCTS selects for exploration. Default `1.0`. Lowering it makes the search less guided by the policy."
                onChange={(v) => patch("mcts", { policy_weight: Number(v) })}
            />
            <ConfigSelect
                label="Select By:"
                value={analysisConfig.mcts.select_by}
                options={[
                    { value: "visit_count", label: "Visit Count" },
                    { value: "value", label: "Value" },
                ]}
                tooltip="Determines how MCTS picks the final best move after all simulations are complete."
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
                tooltip="How many half-moves (plies) the minimax search looks ahead. Each extra ply multiplies the search space, so keep this low (2–3) unless you're prepared to wait. On a 19x19 board, MiniMax without the neural network is quite weak — treat this as an educational comparison more than a practical analysis tool."
                onChange={(v) => patch("minimax", { depth: Number(v) })}
            />
            <ConfigCheckbox
                label="Use Alpha Beta"
                checked={analysisConfig.minimax.use_alpha_beta}
                tooltip="Enables alpha-beta pruning, which skips evaluating branches that can't possibly affect the final decision. This significantly reduces the number of nodes evaluated without changing the result. Leave this on."
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
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <ConfigSection title="General">
                <ConfigSelect
                    label="Algorithm:"
                    value={analysisConfig.general.algorithm}
                    labelID="algorithm-label"
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
                    labelID="rules-label"
                    id="rules-select"
                    tooltip="Determines how territory and scoring are calculated. Match this to the ruleset your game was actually played under."
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
                    tooltip="Controls how much randomness is applied when selecting moves. `0` means the AI always picks the highest-scoring option deterministically. Values above 0 introduce stochasticity — useful if you want to see varied candidate moves rather than always the same top choice."
                    onChange={(v) =>
                        patch("general", { temperature: Number(v) })
                    }
                />
                <ConfigTextField
                    label="Seed:"
                    type="text"
                    value={analysisConfig.general.seed}
                    tooltip="Random seed for the analysis. Leave it empty to get a different result each run. Set a fixed integer to make results reproducible."
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
                    tooltip="How many candidate moves to return, ranked by the algorithm's scoring. Default is 5. Set to 1 if you just want the best move; set higher (up to 10) if you want a broader view of the AI's options."
                    onChange={(v) =>
                        patch("output", { include_top_moves: Number(v) })
                    }
                />
                <ConfigCheckbox
                    label="Include Policy"
                    checked={analysisConfig.output.include_policy}
                    tooltip="Whether to include the neural network's raw policy probability for each top move. Useful for understanding how the network's prior compares to the MCTS-refined ranking."
                    onChange={(v) => patch("output", { include_policy: v })}
                />
                <ConfigCheckbox
                    label="Include Win Rate"
                    checked={analysisConfig.output.include_winrate}
                    tooltip="Whether to include the estimated win probability for each top move. Turn this off if you only care about move ordering and want a lighter response."
                    onChange={(v) => patch("output", { include_winrate: v })}
                />
                <ConfigCheckbox
                    label="Include Visits"
                    checked={analysisConfig.output.include_visits}
                    tooltip="Whether to include the MCTS visit count for each top move. Only meaningful when using the MCTS algorithm — the visit count shows how much time MCTS spent investigating each candidate."
                    onChange={(v) => patch("output", { include_visits: v })}
                />
            </ConfigSection>
        </Box>
    );
}

export default AnalysisConfigFields;
