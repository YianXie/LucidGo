import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../hooks/usePageTitle";

function Settings() {
    usePageTitle("Settings");

    const { user } = useAuth();
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [analysisConfig, setAnalysisConfig] = useState<{
        general: {
            algorithm: string;
            rules: string;
            komi: number;
            max_time_ms: number;
            temperature: number;
            seed: number;
        };
        neural_network: {
            model: string;
            policy_softmax_temperature: number;
            use_value_head: boolean;
        };
        mcts: {
            num_simulations: number;
            c_puct: number;
            dirichlet_alpha: number;
            dirichlet_epsilon: number;
            value_weight: number;
            policy_weight: number;
            select_by: "visit_count" | "value";
        };
        minimax: {
            depth: number;
            use_alpha_beta: boolean;
        };
        output: {
            include_top_moves: number;
            include_policy: boolean;
            include_win_rate: boolean;
        };
    }>({
        general: {
            algorithm: "nn",
            rules: "japanese",
            komi: 6.5,
            max_time_ms: 0, // 0 means no time limit
            temperature: 0,
            seed: 0,
        },
        neural_network: {
            model: "checkpoint_19x19",
            policy_softmax_temperature: 0.2,
            use_value_head: true, // whether to return the win rate or not
        },
        mcts: {
            num_simulations: 500,
            c_puct: 1.5,
            dirichlet_alpha: 0.3,
            dirichlet_epsilon: 0.25,
            value_weight: 1.0,
            policy_weight: 1.0,
            select_by: "visit_count",
        },
        minimax: {
            depth: 3,
            use_alpha_beta: true,
        },
        output: {
            include_top_moves: 5,
            include_policy: false,
            include_win_rate: false,
        },
    });

    useEffect(() => {
        if (user) {
            setUsername((user.username as string) || "");
            setEmail((user.email as string) || "");
        }
    }, [user]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
                py: 4,
            }}
        >
            <Typography variant="h2" component="h1" fontWeight={600}>
                Settings
            </Typography>
            <Divider />
            <Box sx={{ my: 2 }}>
                <Typography variant="h4" component="h2" fontWeight={500}>
                    Account
                </Typography>
                <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <TextField
                            variant="standard"
                            label="Username"
                            defaultValue={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Button variant="contained" color="primary">
                            Update
                        </Button>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <TextField
                            variant="standard"
                            label="Email"
                            type="email"
                            defaultValue={email}
                        />
                        <Button variant="contained" color="primary">
                            Update
                        </Button>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <TextField
                            variant="standard"
                            label="Password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button variant="contained" color="primary">
                            Update
                        </Button>
                    </Box>
                </Stack>
            </Box>
            <Box sx={{ my: 2 }}>
                <Typography variant="h4" component="h2" fontWeight={500}>
                    Default Analysis Configuration
                </Typography>
                <Stack direction="column" spacing={3} sx={{ mt: 2 }}>
                    <Box>
                        <Typography
                            variant="h5"
                            component="h3"
                            fontWeight={500}
                        >
                            General
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Algorithm:
                                </Typography>
                                <Select
                                    labelId="algorithm-label"
                                    id="algorithm-select"
                                    variant="standard"
                                    value={analysisConfig.general.algorithm}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            general: {
                                                ...analysisConfig.general,
                                                algorithm: e.target.value,
                                            },
                                        })
                                    }
                                >
                                    <MenuItem value="nn">
                                        Neural Network
                                    </MenuItem>
                                    <MenuItem value="mcts">
                                        Monte Carlo Tree Search
                                    </MenuItem>
                                    <MenuItem value="minimax">MiniMax</MenuItem>
                                </Select>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">Rules:</Typography>
                                <Select
                                    variant="standard"
                                    labelId="rules-label"
                                    id="rules-select"
                                    label="Rules"
                                    value={analysisConfig.general.rules}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            general: {
                                                ...analysisConfig.general,
                                                rules: e.target.value,
                                            },
                                        })
                                    }
                                >
                                    <MenuItem value="japanese">
                                        Japanese
                                    </MenuItem>
                                    <MenuItem value="chinese">Chinese</MenuItem>
                                </Select>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">Komi:</Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={analysisConfig.general.komi}
                                    inputProps={{
                                        min: 0.5,
                                        max: 10.5,
                                        step: 1.0,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            general: {
                                                ...analysisConfig.general,
                                                komi: Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Tooltip
                                    title="Note: 0 means no time limit"
                                    placement="top"
                                    arrow
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            textDecoration: "underline",
                                            textDecorationStyle: "dotted",
                                        }}
                                    >
                                        Max Time (ms):
                                    </Typography>
                                </Tooltip>
                                <Stack
                                    spacing={2}
                                    direction="row"
                                    sx={{
                                        width: "500px",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">0</Typography>
                                    <Slider
                                        value={
                                            analysisConfig.general.max_time_ms
                                        }
                                        onChange={(_, value) =>
                                            setAnalysisConfig({
                                                ...analysisConfig,
                                                general: {
                                                    ...analysisConfig.general,
                                                    max_time_ms: value,
                                                },
                                            })
                                        }
                                        min={0}
                                        max={60000}
                                        step={250}
                                        valueLabelDisplay="auto"
                                        aria-label="max-time-ms"
                                    />
                                    <Typography variant="body1">
                                        60000
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Temperature:
                                </Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    inputProps={{
                                        min: 0,
                                        max: 1,
                                        step: 0.1,
                                    }}
                                    value={analysisConfig.general.temperature}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            general: {
                                                ...analysisConfig.general,
                                                temperature: Number(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">Seed:</Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={analysisConfig.general.seed}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            general: {
                                                ...analysisConfig.general,
                                                seed: Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Typography
                            variant="h5"
                            component="h3"
                            fontWeight={500}
                        >
                            Neural Network
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">Model:</Typography>
                                <TextField
                                    variant="standard"
                                    type="text"
                                    value={analysisConfig.neural_network.model}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            neural_network: {
                                                ...analysisConfig.neural_network,
                                                model: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Policy Softmax Temperature:
                                </Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={
                                        analysisConfig.neural_network
                                            .policy_softmax_temperature
                                    }
                                    inputProps={{
                                        min: 0,
                                        max: 1,
                                        step: 0.1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            neural_network: {
                                                ...analysisConfig.neural_network,
                                                policy_softmax_temperature:
                                                    Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Checkbox
                                    checked={
                                        analysisConfig.neural_network
                                            .use_value_head
                                    }
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            neural_network: {
                                                ...analysisConfig.neural_network,
                                                use_value_head:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                    sx={{
                                        width: 16,
                                        p: 0,
                                    }}
                                />
                                <Typography variant="body1">
                                    Use Value Head
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Typography
                            variant="h5"
                            component="h3"
                            fontWeight={500}
                        >
                            Monte Carlo Tree Search
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Num Simulations:
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{
                                        width: "500px",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">100</Typography>
                                    <Slider
                                        value={
                                            analysisConfig.mcts.num_simulations
                                        }
                                        onChange={(_, value) =>
                                            setAnalysisConfig({
                                                ...analysisConfig,
                                                mcts: {
                                                    ...analysisConfig.mcts,
                                                    num_simulations: value,
                                                },
                                            })
                                        }
                                        min={100}
                                        max={5000}
                                        step={100}
                                        valueLabelDisplay="auto"
                                        aria-label="num-simulations"
                                    />
                                    <Typography variant="body1">
                                        5000
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">C-PUCT:</Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={analysisConfig.mcts.c_puct}
                                    inputProps={{
                                        min: 0.1,
                                        max: 5,
                                        step: 0.1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            mcts: {
                                                ...analysisConfig.mcts,
                                                c_puct: Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Dirichlet Alpha:
                                </Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={analysisConfig.mcts.dirichlet_alpha}
                                    inputProps={{
                                        min: 0,
                                        max: 1,
                                        step: 0.1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            mcts: {
                                                ...analysisConfig.mcts,
                                                dirichlet_alpha: Number(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Dirichlet Epsilon:
                                </Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={
                                        analysisConfig.mcts.dirichlet_epsilon
                                    }
                                    inputProps={{
                                        min: 0,
                                        max: 1,
                                        step: 0.1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            mcts: {
                                                ...analysisConfig.mcts,
                                                dirichlet_epsilon: Number(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Value Weight:
                                </Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={analysisConfig.mcts.value_weight}
                                    inputProps={{
                                        min: 0,
                                        max: 1,
                                        step: 0.1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            mcts: {
                                                ...analysisConfig.mcts,
                                                value_weight: Number(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Policy Weight:
                                </Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={analysisConfig.mcts.policy_weight}
                                    inputProps={{
                                        min: 0,
                                        max: 1,
                                        step: 0.1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            mcts: {
                                                ...analysisConfig.mcts,
                                                policy_weight: Number(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Select By:
                                </Typography>
                                <Select
                                    variant="standard"
                                    value={analysisConfig.mcts.select_by}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            mcts: {
                                                ...analysisConfig.mcts,
                                                select_by: e.target.value as
                                                    | "visit_count"
                                                    | "value",
                                            },
                                        })
                                    }
                                >
                                    <MenuItem value="visit_count">
                                        Visit Count
                                    </MenuItem>
                                    <MenuItem value="value">Value</MenuItem>
                                </Select>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Typography
                            variant="h5"
                            component="h3"
                            fontWeight={500}
                        >
                            MiniMax
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">Depth:</Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={analysisConfig.minimax.depth}
                                    inputProps={{
                                        min: 1,
                                        max: 5,
                                        step: 1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            minimax: {
                                                ...analysisConfig.minimax,
                                                depth: Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Checkbox
                                    sx={{
                                        width: 16,
                                        p: 0,
                                    }}
                                    checked={
                                        analysisConfig.minimax.use_alpha_beta
                                    }
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            minimax: {
                                                ...analysisConfig.minimax,
                                                use_alpha_beta:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                />
                                <Typography variant="body1">
                                    Use Alpha Beta
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Typography
                            variant="h5"
                            component="h3"
                            fontWeight={500}
                        >
                            Output
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body1">
                                    Include Top Moves:
                                </Typography>
                                <TextField
                                    variant="standard"
                                    type="number"
                                    value={
                                        analysisConfig.output.include_top_moves
                                    }
                                    inputProps={{
                                        min: 0,
                                        max: 10,
                                        step: 1,
                                    }}
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            output: {
                                                ...analysisConfig.output,
                                                include_top_moves: Number(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Checkbox
                                    sx={{
                                        width: 16,
                                        p: 0,
                                    }}
                                    checked={
                                        analysisConfig.output.include_policy
                                    }
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            output: {
                                                ...analysisConfig.output,
                                                include_policy:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                />
                                <Typography variant="body1">
                                    Include Policy
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Checkbox
                                    sx={{
                                        width: 16,
                                        p: 0,
                                    }}
                                    checked={
                                        analysisConfig.output.include_win_rate
                                    }
                                    onChange={(e) =>
                                        setAnalysisConfig({
                                            ...analysisConfig,
                                            output: {
                                                ...analysisConfig.output,
                                                include_win_rate:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                />
                                <Typography variant="body1">
                                    Include Win Rate
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: "100px", mt: 2 }}
                    >
                        Save
                    </Button>
                </Stack>
            </Box>
            <Box sx={{ my: 2 }}>
                <Typography variant="h4" component="h2" fontWeight={500}>
                    Dangerous Zone
                </Typography>
                <Button variant="contained" color="error" sx={{ mt: 2 }}>
                    Delete Account
                </Button>
            </Box>
        </Box>
    );
}

export default Settings;
