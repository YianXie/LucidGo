import api from "@/api";
import Game from "@/components/board/Game";
import { type GameBoardHandle } from "@/components/board/GameBoard";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import {
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
    type GameData,
    type GameState,
    WinrateResult,
    isValidMove,
} from "@/types/game";
import {
    buildAnalysisRequest,
    buildWinrateRequest,
} from "@/utils/buildAnalysisRequest";
import { toGTPFormat } from "@/utils/coordinates";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grow from "@mui/material/Grow";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";

const defaultBoard = (analysisConfig: AnalysisConfig): GameState => ({
    name: "Ke Jie v.s. AlphaGo Game 1",
    file: null,
    gameID: null,
    sgfContent: SGF_SAMPLE,
    gameData: SGF_SAMPLE_GAME_DATA as GameData,
    analysisData: null,
    winrate: [],
    currentMoveIndex: null,
    loading: false,
    source: "sample",
    live: false,
    loadedValue: null,
    analysisConfig: analysisConfig,
    draftAnalysisConfig: analysisConfig,
});

const Demo = () => {
    usePageTitle("Demo");

    const { userSettings } = useAuth();

    const gameBoardRefs = useRef<Record<number, GameBoardHandle | null>>({});

    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
    const [currentSettingsIndex, setCurrentSettingsIndex] = useState<number>(0);
    const [games, setGames] = useState<GameState[]>([
        defaultBoard(userSettings.analysis_config),
    ]);

    const handleBoardPassMove = useCallback((boardIndex: number) => {
        gameBoardRefs.current[boardIndex]?.handlePassMove();
    }, []);

    const updateGame = (index: number, updates: Partial<GameState>) => {
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
                toast.error(`Error analyzing move ${moveIndex + 1}`);
                console.error(`Error analyzing move ${moveIndex + 1}:`, error);
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
                toast.error(`Error generating winrate`);
                console.error(`Error generating winrate:`, error);
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
                    }}
                >
                    {games.map((game, gameIndex) => (
                        <Game
                            key={gameIndex}
                            gameIndex={gameIndex}
                            gameState={game}
                            updateGame={(update: Partial<GameState>) =>
                                updateGame(gameIndex, update)
                            }
                            onGenerateWinrate={() =>
                                onGenerateWinrate(gameIndex)
                            }
                            onAnalyzeCurrentMove={() =>
                                onAnalyzeCurrentMove(gameIndex)
                            }
                            onAnalyzeAllMoves={() =>
                                onAnalyzeAllMoves(gameIndex)
                            }
                            handleBoardPassMove={() =>
                                handleBoardPassMove(gameIndex)
                            }
                            setCurrentSettingsIndex={setCurrentSettingsIndex}
                            setSettingsDrawerOpen={setSettingsDrawerOpen}
                            onSaveAnalysisSettings={() =>
                                onSaveAnalysisSettings(gameIndex)
                            }
                            onResetAnalysisSettings={() =>
                                onResetAnalysisSettings(gameIndex)
                            }
                            analysisConfigIsDirty={analysisConfigIsDirty(
                                gameIndex
                            )}
                            gameBoardRefs={gameBoardRefs}
                            numGames={games.length}
                        />
                    ))}
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
};

export default Demo;
