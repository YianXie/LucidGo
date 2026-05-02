import api from "@/api";
import Controls from "@/components/board/Controls";
import GameBoard, { type GameBoardHandle } from "@/components/board/GameBoard";
import WinRate from "@/components/board/WinRate";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import {
    ANALYSIS_RIGHT_PANEL_WIDTH,
    POST_ANALYSIS_URL,
    POST_WINRATE_URL,
    SGF_SAMPLE,
    SGF_SAMPLE_GAME_DATA,
} from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import {
    type AnalysisConfig,
    type AnalysisResult,
    type BoardState,
    type GameData,
    type GameSource,
    WinrateResult,
    isValidMove,
} from "@/types/game";
import {
    buildAnalysisRequest,
    buildWinrateRequest,
} from "@/utils/buildAnalysisRequest";
import { toGTPFormat } from "@/utils/coordinates";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const defaultBoard = (analysisConfig: AnalysisConfig): BoardState => ({
    name: null,
    file: null,
    gameID: null,
    sgfContent: SGF_SAMPLE,
    gameData: SGF_SAMPLE_GAME_DATA as GameData,
    analysisData: null,
    winrate: [],
    currentMoveIndex: null,
    loading: false,
    gameSource: "none",
    live: false,
    loadedValue: null,
    analysisConfig: analysisConfig,
    draftAnalysisConfig: analysisConfig,
});

function Demo() {
    usePageTitle("Demo");

    const { userSettings } = useAuth();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

    const [currentSettingsIndex, setCurrentSettingsIndex] = useState<number>(0);
    const [games, setGames] = useState<BoardState[]>([
        defaultBoard(userSettings.analysis_config),
    ]);
    const [liveMovesLengths, setLiveMovesLengths] = useState<
        Record<number, number>
    >({});

    const gameBoardRefs = useRef<Record<number, GameBoardHandle | null>>({});

    useEffect(() => {
        setGames((prev) => {
            if (prev.length !== 1) return prev;
            const only = prev[0];
            const pristine =
                only.gameData === null &&
                only.file === null &&
                only.gameSource === "none" &&
                only.analysisData === null &&
                !only.loading;
            if (!pristine) return prev;
            return [defaultBoard(userSettings.analysis_config)];
        });
    }, [userSettings.analysis_config]);

    const updateGame = (index: number, updates: Partial<BoardState>) => {
        setGames((prev) =>
            prev.map((board, i) =>
                i === index ? { ...board, ...updates } : board
            )
        );
    };

    const analyzeMove = useCallback(
        async (gameIndex: number, moveIndex: number) => {
            const gameData = games[gameIndex].gameData;
            const analysisConfig = games[gameIndex].analysisConfig;
            if (!gameData || !analysisConfig) return null;

            const pastMoves: [string, string][] = [];
            for (let i = 0; i < moveIndex; i++) {
                const move = gameData.moves[i];
                if (!isValidMove(move)) continue;
                const [color, [row, col]] = move;
                pastMoves.push([color, toGTPFormat(row, col)]);
            }

            const toPlay =
                pastMoves.length > 0 &&
                pastMoves[pastMoves.length - 1][0].toUpperCase() === "B"
                    ? "W"
                    : "B";

            const request = buildAnalysisRequest(
                analysisConfig,
                pastMoves,
                toPlay
            );
            try {
                const { data } = await api.post<AnalysisResult>(
                    POST_ANALYSIS_URL,
                    request
                );
                return data;
            } catch (error) {
                toast.error(
                    `Error analyzing move ${moveIndex + 1} in board ${gameIndex + 1}`
                );
                console.error(
                    `Error analyzing move ${moveIndex + 1} in board ${gameIndex + 1}:`,
                    error
                );
            }
            return null;
        },
        [games]
    );

    const onGenerateWinrate = useCallback(
        async (gameIndex: number) => {
            const gameData = games[gameIndex].gameData;
            const config = games[gameIndex].analysisConfig;
            if (!gameData || !config) return;

            updateGame(gameIndex, { loading: true, loadedValue: null });

            const pastMoves: [string, string][] = [];
            for (const move of gameData.moves) {
                if (!isValidMove(move)) continue;
                const [color, [row, col]] = move;
                pastMoves.push([color, toGTPFormat(row, col)]);
            }

            const request = buildWinrateRequest(pastMoves, config);
            try {
                const { data } = await api.post<WinrateResult>(
                    POST_WINRATE_URL,
                    request
                );
                updateGame(gameIndex, { winrate: data.winrate });
            } catch (error) {
                toast.error(`Error analyzing board ${gameIndex + 1}`);
                console.error(`Error analyzing board ${gameIndex + 1}:`, error);
            } finally {
                updateGame(gameIndex, { loading: false });
            }
        },
        [games]
    );

    const onAnalyzeCurrentMove = useCallback(
        async (gameIndex: number) => {
            const gameData = games[gameIndex].gameData;
            const analysisConfig = games[gameIndex].analysisConfig;
            const currentMove = games[gameIndex].currentMoveIndex;
            if (!gameData || !analysisConfig || currentMove === null) return;

            updateGame(gameIndex, { loading: true, loadedValue: null });

            const result = await analyzeMove(gameIndex, currentMove);
            if (!games[gameIndex].analysisData) {
                const len = games[gameIndex].gameData?.moves.length ?? 0;
                games[gameIndex].analysisData = Array.from(
                    { length: len },
                    () => null
                );
            }
            updateGame(gameIndex, {
                analysisData: games[gameIndex].analysisData.map((data, i) =>
                    i === currentMove ? result : data
                ),
            });
            updateGame(gameIndex, { loading: false });
        },
        [games, analyzeMove]
    );

    const onAnalyzeAllMoves = useCallback(
        async (gameIndex: number) => {
            const gameData = games[gameIndex].gameData;
            const analysisConfig = games[gameIndex].analysisConfig;
            if (!gameData || !analysisConfig) return;

            updateGame(gameIndex, { loading: true, loadedValue: null });

            const denom = Math.max(gameData.moves.length, 1);
            const analysisResults: AnalysisResult[] = [];
            for (let i = 0; i <= gameData.moves.length; i++) {
                const analysisResult = await analyzeMove(gameIndex, i);
                if (analysisResult) {
                    analysisResults.push(analysisResult);
                }
                updateGame(gameIndex, {
                    loadedValue: (100 / denom) * i,
                });
            }
            updateGame(gameIndex, { loadedValue: null });
            updateGame(gameIndex, { analysisData: analysisResults });
            updateGame(gameIndex, {
                winrate: analysisResults.map((result) => result.stats.winrate),
            });
            updateGame(gameIndex, { loading: false });
        },
        [analyzeMove, games]
    );

    const onResetAnalysisSettings = (gameIndex: number) => {
        updateGame(gameIndex, {
            draftAnalysisConfig: games[gameIndex].analysisConfig,
        });
    };

    const onSaveAnalysisSettings = (gameIndex: number) => {
        const next = structuredClone(games[gameIndex].draftAnalysisConfig);
        updateGame(gameIndex, { analysisConfig: next });
        toast.success("Configuration updated");
    };

    const analysisConfigIsDirty = (gameIndex: number) => {
        return (
            JSON.stringify(games[gameIndex].analysisConfig) !==
            JSON.stringify(games[gameIndex].draftAnalysisConfig)
        );
    };

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 4,
                py: 4,
                px: 2,
                boxSizing: "border-box",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "visible",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                <Box
                    sx={{
                        width: "max-content",
                        minWidth: "100%",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        alignItems: "center",
                        "@keyframes boardDeleteExit": {
                            from: {
                                transform: "scale(1)",
                                opacity: 1,
                                filter: "brightness(1)",
                            },
                            to: {
                                transform: "scale(0.22)",
                                opacity: 0,
                                filter: "brightness(0.2)",
                            },
                        },
                        "@keyframes boardCreate": {
                            from: {
                                transform: "scale(0.22)",
                                opacity: 0,
                                filter: "brightness(0.2)",
                            },
                            to: {
                                transform: "scale(1)",
                                opacity: 1,
                                filter: "brightness(1)",
                            },
                        },
                    }}
                >
                    {games.map((game, i) => {
                        const maxMoveForBoard = game.live
                            ? (liveMovesLengths[i] ?? 0)
                            : (game.gameData?.moves.length ?? 0);

                        const handleMoveChange = (amount: number) => {
                            const current = game.currentMoveIndex ?? 0;
                            updateGame(i, {
                                currentMoveIndex: Math.max(
                                    0,
                                    Math.min(current + amount, maxMoveForBoard)
                                ),
                            });
                        };

                        const controlsProps = {
                            maxMove: maxMoveForBoard,
                            live: game.live,
                            currentMoveIndex: game.currentMoveIndex,
                            onMoveChange: handleMoveChange,
                            onGenerateWinrate: () => void onGenerateWinrate(i),
                            onAnalyzeCurrentMove: () =>
                                void onAnalyzeCurrentMove(i),
                            onAnalyzeAllMoves: () => void onAnalyzeAllMoves(i),
                            onPassMove: () =>
                                gameBoardRefs.current[i]?.handlePassMove(),
                        };

                        const winRateProps = {
                            data: game.winrate,
                            setMove: (move: number) =>
                                updateGame(i, { currentMoveIndex: move }),
                            currentMove: game.currentMoveIndex ?? 0,
                        };

                        return (
                            <Stack
                                key={i}
                                gap={2}
                                direction={{ xs: "column", md: "row" }}
                                alignItems={{ xs: "stretch", md: "flex-start" }}
                                justifyContent="center"
                                sx={{
                                    position: "relative",
                                    width: { xs: "100%", md: "max-content" },
                                    maxWidth: "none",
                                    mx: "auto",
                                    flexShrink: 0,
                                    transformOrigin: "center center",
                                    willChange: "transform",
                                }}
                            >
                                <Box>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <TextField
                                            variant="standard"
                                            value={
                                                game.name ?? `Board ${i + 1}`
                                            }
                                            onChange={(event) =>
                                                updateGame(i, {
                                                    name: event.target.value,
                                                })
                                            }
                                            sx={{
                                                "& .MuiInput-underline:before":
                                                    {
                                                        borderBottom: "none",
                                                    },
                                                "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                                                    {
                                                        borderBottom:
                                                            "1px solid rgba(0, 0, 0, 0.87)",
                                                    },
                                            }}
                                        />
                                        {isMobile && (
                                            <Tooltip
                                                title="Analysis settings"
                                                arrow
                                            >
                                                <IconButton
                                                    onClick={() => {
                                                        setCurrentSettingsIndex(
                                                            i
                                                        );
                                                        setSettingsDrawerOpen(
                                                            true
                                                        );
                                                    }}
                                                    size="small"
                                                >
                                                    <TuneIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                    <GameBoard
                                        key={i}
                                        ref={(handle) => {
                                            gameBoardRefs.current[i] = handle;
                                        }}
                                        gameData={game.gameData}
                                        analysisData={game.analysisData}
                                        isLoading={game.loading}
                                        loadedValue={game.loadedValue}
                                        live={game.live}
                                        analysisConfig={game.analysisConfig}
                                        gameSource={game.gameSource}
                                        currentMoveIndex={game.currentMoveIndex}
                                        setCurrentMoveIndex={(move) =>
                                            updateGame(i, {
                                                currentMoveIndex: move,
                                            })
                                        }
                                        onGameSourceChange={(
                                            source: GameSource
                                        ) =>
                                            updateGame(i, {
                                                gameSource: source,
                                            })
                                        }
                                        onViewSample={() =>
                                            updateGame(i, {
                                                gameSource: "sample",
                                            })
                                        }
                                        onLive={() => {
                                            const liveData: GameData = {
                                                komi: 6.5,
                                                moves: [],
                                                size: 19,
                                                players: {
                                                    black: "Black",
                                                    white: "White",
                                                },
                                                winner: "Unknown",
                                            };
                                            updateGame(i, {
                                                gameData: liveData,
                                                currentMoveIndex: 0,
                                                live: true,
                                            });
                                        }}
                                        onFileChange={(file) =>
                                            updateGame(i, { file })
                                        }
                                        onMovesLengthChange={(n) =>
                                            setLiveMovesLengths((prev) =>
                                                prev[i] === n
                                                    ? prev
                                                    : { ...prev, [i]: n }
                                            )
                                        }
                                    />
                                    {/* Mobile: controls + winrate below board */}
                                    <Box
                                        sx={{
                                            display: {
                                                xs: "block",
                                                md: "none",
                                            },
                                        }}
                                    >
                                        <Controls {...controlsProps} />
                                        <WinRate {...winRateProps} />
                                    </Box>
                                </Box>

                                {/* Desktop right sidebar */}
                                <Paper
                                    elevation={1}
                                    square
                                    sx={{
                                        width: ANALYSIS_RIGHT_PANEL_WIDTH,
                                        flexShrink: 0,
                                        display: { xs: "none", md: "flex" },
                                        flexDirection: "column",
                                        position: "sticky",
                                        top: 16,
                                        maxHeight: "calc(100vh - 32px)",
                                        overflow: "hidden",
                                        alignSelf: "flex-start",
                                        pointerEvents: game.loading
                                            ? "none"
                                            : "auto",
                                        opacity: game.loading ? 0.5 : 1,
                                        filter: game.loading
                                            ? "brightness(0.5)"
                                            : "none",
                                        cursor: game.loading
                                            ? "not-allowed"
                                            : "auto",
                                    }}
                                >
                                    {/* 1. Controls */}
                                    <Controls
                                        {...controlsProps}
                                        sx={{
                                            borderRadius: 0,
                                            boxShadow: "none",
                                            borderBottom: 1,
                                            borderColor: "divider",
                                            flexWrap: "nowrap",
                                            overflowX: "auto",
                                        }}
                                    />

                                    {/* 2. Win Rate */}
                                    <Box
                                        sx={{
                                            borderBottom: 1,
                                            borderColor: "divider",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <WinRate {...winRateProps} />
                                    </Box>

                                    {/* 3. Settings header */}
                                    <Box
                                        sx={{
                                            px: 2,
                                            pt: 1.5,
                                            pb: 1,
                                            borderBottom: 1,
                                            borderColor: "divider",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            flexShrink: 0,
                                            cursor: "default",
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={500}
                                        >
                                            Analysis Settings
                                        </Typography>
                                    </Box>

                                    {/* Settings content */}
                                    <Box
                                        sx={{
                                            flex: 1,
                                            overflow: "auto",
                                            scrollbarWidth: "thin",
                                        }}
                                    >
                                        <AnalysisConfigFields
                                            analysisConfig={
                                                games[i].draftAnalysisConfig
                                            }
                                            setAnalysisConfig={(
                                                config: AnalysisConfig
                                            ) =>
                                                updateGame(i, {
                                                    draftAnalysisConfig: config,
                                                })
                                            }
                                        />
                                    </Box>

                                    {/* Action buttons */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                            p: 2,
                                            borderTop: 1,
                                            borderColor: "divider",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {analysisConfigIsDirty(i) && (
                                            <Box
                                                sx={{ display: "flex", gap: 1 }}
                                            >
                                                <Grow in={true} timeout="auto">
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() =>
                                                            onResetAnalysisSettings(
                                                                i
                                                            )
                                                        }
                                                        disabled={
                                                            game.gameData ===
                                                            null
                                                        }
                                                        fullWidth
                                                        sx={{
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "rgba(211, 47, 47, 0.08)",
                                                                borderColor:
                                                                    "#d32f2f",
                                                            },
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                </Grow>
                                                <Grow in={true} timeout="auto">
                                                    <Button
                                                        variant="contained"
                                                        onClick={() =>
                                                            onSaveAnalysisSettings(
                                                                i
                                                            )
                                                        }
                                                        disabled={
                                                            game.gameData ===
                                                            null
                                                        }
                                                        fullWidth
                                                    >
                                                        Save
                                                    </Button>
                                                </Grow>
                                            </Box>
                                        )}
                                        <Button
                                            variant="contained"
                                            onClick={() => onGenerateWinrate(i)}
                                            disabled={game.gameData === null}
                                            fullWidth
                                        >
                                            Generate Winrate
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() =>
                                                onAnalyzeCurrentMove(i)
                                            }
                                            disabled={game.gameData === null}
                                            fullWidth
                                        >
                                            Analyze Current Move
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => onAnalyzeAllMoves(i)}
                                            disabled={game.gameData === null}
                                            fullWidth
                                        >
                                            Analyze All Moves
                                        </Button>
                                    </Box>
                                </Paper>
                            </Stack>
                        );
                    })}
                </Box>
            </Box>

            {/* Mobile-only: analysis settings bottom drawer */}
            <SwipeableDrawer
                anchor="bottom"
                open={settingsDrawerOpen}
                onOpen={() => setSettingsDrawerOpen(true)}
                onClose={() => setSettingsDrawerOpen(false)}
                disableSwipeToOpen
                sx={{ display: { xs: "block", md: "none" } }}
                slotProps={{
                    paper: {
                        sx: {
                            maxHeight: "80vh",
                            borderRadius: "16px 16px 0 0",
                            display: "flex",
                            flexDirection: "column",
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 4,
                        bgcolor: "divider",
                        borderRadius: 2,
                        mx: "auto",
                        mt: 1.5,
                        mb: 1,
                        flexShrink: 0,
                    }}
                />
                <Box
                    sx={{
                        px: 2,
                        pt: 1,
                        pb: 1,
                        borderBottom: 1,
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                    }}
                >
                    <Typography variant="h6" component="h2">
                        Analysis settings
                    </Typography>
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        overflow: "auto",
                        px: 2,
                        py: 2,
                        scrollbarWidth: "thin",
                    }}
                >
                    {games[currentSettingsIndex] && (
                        <AnalysisConfigFields
                            analysisConfig={
                                games[currentSettingsIndex].draftAnalysisConfig
                            }
                            setAnalysisConfig={(config: AnalysisConfig) =>
                                updateGame(currentSettingsIndex, {
                                    draftAnalysisConfig: config,
                                })
                            }
                        />
                    )}
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 2,
                        borderTop: 1,
                        borderColor: "divider",
                        flexShrink: 0,
                    }}
                >
                    {analysisConfigIsDirty(currentSettingsIndex) && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Grow in={true} timeout="auto">
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() =>
                                        onResetAnalysisSettings(
                                            currentSettingsIndex
                                        )
                                    }
                                    disabled={
                                        games[currentSettingsIndex].gameData ===
                                        null
                                    }
                                    fullWidth
                                    sx={{
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(211, 47, 47, 0.08)",
                                            borderColor: "#d32f2f",
                                        },
                                    }}
                                >
                                    Reset
                                </Button>
                            </Grow>
                            <Grow in={true} timeout="auto">
                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        onSaveAnalysisSettings(
                                            currentSettingsIndex
                                        )
                                    }
                                    disabled={
                                        games[currentSettingsIndex].gameData ===
                                        null
                                    }
                                    fullWidth
                                >
                                    Save
                                </Button>
                            </Grow>
                        </Box>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => onGenerateWinrate(currentSettingsIndex)}
                        disabled={games[currentSettingsIndex].gameData === null}
                        fullWidth
                    >
                        Generate Winrate
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() =>
                            onAnalyzeCurrentMove(currentSettingsIndex)
                        }
                        disabled={games[currentSettingsIndex].gameData === null}
                        fullWidth
                    >
                        Analyze Current Move
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => onAnalyzeAllMoves(currentSettingsIndex)}
                        disabled={games[currentSettingsIndex].gameData === null}
                        fullWidth
                    >
                        Analyze All Moves
                    </Button>
                </Box>
            </SwipeableDrawer>
        </Box>
    );
}

export default Demo;
