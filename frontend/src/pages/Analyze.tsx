import api from "@/api";
import ComparisonReadyIndicator from "@/components/board/ComparisonReadyIndicator";
import Game from "@/components/board/Game";
import { type GameBoardHandle } from "@/components/board/GameBoard";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import {
    BOARD_SIZE,
    GAMES_URL,
    GET_GAME_DATA_URL,
    POST_ANALYSIS_URL,
    POST_WINRATE_URL,
    SGF_SAMPLE,
} from "@/constants";
import { ANIMATION_MS } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import {
    type AnalysisConfig,
    type AnalysisResult,
    type GameData,
    type GameState,
    type HistoryAnalysisSession,
    type HistoryEntry,
    WinrateResult,
    isValidMove,
} from "@/types/game";
import { defaultBoard } from "@/utils/board";
import {
    buildAnalysisRequest,
    buildWinrateRequest,
} from "@/utils/buildAnalysisRequest";
import { toGTPFormat } from "@/utils/coordinates";
import CheckIcon from "@mui/icons-material/Check";
import HistoryIcon from "@mui/icons-material/History";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Slide from "@mui/material/Slide";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Demo = () => {
    usePageTitle("Analyze");

    const { userSettings } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const gameID = searchParams.get("gameID");

    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const [games, setGames] = useState<GameState[]>([
        defaultBoard(userSettings.analysis_config),
    ]);
    const [analysisSessions, setAnalysisSessions] = useState<
        HistoryAnalysisSession[]
    >([]);
    const [currentSettingsIndex, setCurrentSettingsIndex] = useState<number>(0);
    const [deletingGameIndex, setDeletingGameIndex] = useState<number | null>(
        null
    );
    const [creatingGameIndex, setCreatingGameIndex] = useState<number | null>(
        null
    );
    const [selectedGameIndex, setSelectedGameIndex] = useState<number[]>([]);
    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
    const gameBoardRefs = useRef<Record<number, GameBoardHandle | null>>({});
    const [selectedAnalysisSession, setSelectedAnalysisSession] = useState<
        string | null
    >(null);
    const [historyMenuAnchor, setHistoryMenuAnchor] =
        useState<HTMLElement | null>(null);

    const handleBoardPassMove = useCallback((boardIndex: number) => {
        gameBoardRefs.current[boardIndex]?.handlePassMove();
    }, []);

    useEffect(() => {
        return () => {
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (analysisSessions.length > 0) {
            setSelectedAnalysisSession(analysisSessions[0].id);
            void loadHistorySession(0, analysisSessions[0].id); // set the index to 0 because it the loaded game is always the first game
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analysisSessions]);

    useEffect(() => {
        if (gameID) {
            try {
                void api
                    .get<HistoryEntry>(`${GAMES_URL}${gameID}`)
                    .then(({ data }) => {
                        setAnalysisSessions(data.analysis_sessions ?? []);
                        setGames((prev) => {
                            if (prev.length !== 1) return prev;
                            const newBoard = defaultBoard(
                                userSettings.analysis_config
                            );
                            newBoard.gameData = data.game_data;
                            newBoard.name = data.name;
                            newBoard.gameID = data.id;
                            newBoard.sgfContent = data.sgf_data ?? "";
                            newBoard.currentMoveIndex = 0;
                            newBoard.loading = false;
                            newBoard.source = "file";
                            newBoard.live = false;
                            newBoard.loadedValue = 0;
                            newBoard.analysisConfig =
                                userSettings.analysis_config;
                            return [newBoard];
                        });
                    });
            } catch (error) {
                console.error("Failed to load game data:", error);
            }
        } else {
            setAnalysisSessions([]);
            setGames([defaultBoard(userSettings.analysis_config)]);
        }
    }, [userSettings.analysis_config, gameID, setGames]);

    useEffect(() => {
        setGames((prev) => {
            if (prev.length !== 1) return prev;
            const only = prev[0];
            const pristine =
                only.gameData === null &&
                only.file === null &&
                only.source === "none" &&
                only.analysisData === null &&
                !only.loading;
            if (!pristine) return prev;
            return [defaultBoard(userSettings.analysis_config)];
        });
    }, [userSettings.analysis_config]);

    // Read file / sample content when a board's source changes.
    const fileSignature = games
        .map((b) => `${b.file?.name ?? ""}:${b.source}`)
        .join("|");

    useEffect(() => {
        games.forEach((board, i) => {
            if (board.source === "none") return;
            if (board.gameData && board.gameData.moves.length > 0) return;

            if (board.source === "sample") {
                getGameData(SGF_SAMPLE, i);
            } else if (board.source === "file" && board.file) {
                const reader = new FileReader();
                reader.onload = (e) =>
                    getGameData(e.target?.result as string, i);
                reader.readAsText(board.file);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileSignature, games]);

    const updateGame = (index: number, updates: Partial<GameState>) => {
        setGames((prev) =>
            prev.map((board, i) =>
                i === index ? { ...board, ...updates } : board
            )
        );
    };

    const saveGame = async (gameIndex: number, sgfData: string) => {
        const game = games[gameIndex];
        try {
            const { data } = await api.post<{ id: string }>(GAMES_URL, {
                name: game.name || `Board ${gameIndex + 1}`,
                source: game.source,
                game_data: game.gameData,
                sgf_data: sgfData,
            });
            updateGame(gameIndex, { gameID: data.id });
            return data.id;
        } catch (error) {
            console.error("Failed to save game:", error);
            return null;
        }
    };

    const autoSaveEnabled = userSettings.general_settings.auto_save_games;

    const saveAnalysisSession = async (
        gameIndex: number,
        savedGameID: string = ""
    ): Promise<HistoryAnalysisSession | null> => {
        const game = games[gameIndex];
        if (!game.gameID && !savedGameID) {
            toast.error("No game ID found while saving analysis session!");
            return null;
        }

        try {
            const { data } = await api.post<HistoryAnalysisSession>(
                `${GAMES_URL}${game.gameID ?? savedGameID}/analyses/`,
                {
                    analysis_config: game.analysisConfig,
                    results: game.analysisData ?? [],
                }
            );
            return data;
        } catch (error) {
            console.error("Failed to save analysis session:", error);
            toast.error("Failed to save analysis session");
            return null;
        }
    };

    const getGameData = async (SGFContent: string, gameIndex: number) => {
        updateGame(gameIndex, { loading: true, loadedValue: null });
        try {
            const { data } = await api.post<GameData>(GET_GAME_DATA_URL, {
                sgf_file_data: SGFContent,
            });
            if (data.size === null || data.size != BOARD_SIZE) {
                throw new Error("Invalid board size");
            }

            data.moves = data.moves.filter((m) => isValidMove(m));
            updateGame(gameIndex, {
                gameData: data,
                currentMoveIndex: 0,
                sgfContent: SGFContent,
            });
        } catch (error) {
            toast.error("Invalid .sgf file");
            console.error("Error while fetching game data:", error);
        } finally {
            updateGame(gameIndex, { loading: false });
        }
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
            updateGame(gameIndex, {
                loadedValue: null,
                analysisData: analysisResults,
                winrate: analysisResults.map((result) => result.stats.winrate),
                loading: false,
            });

            const fullyAnalyzed =
                analysisResults.length === gameData.moves.length + 1;
            if ((autoSaveEnabled || games[gameIndex].gameID) && fullyAnalyzed) {
                await saveAnalysisSession(gameIndex);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [analyzeMove, games, autoSaveEnabled]
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

    const loadHistorySession = async (gameIndex: number, sessionID: string) => {
        if (!gameID) return;

        updateGame(gameIndex, { loading: true });
        try {
            const { data } = await api.get<HistoryAnalysisSession>(
                `${GAMES_URL}${gameID}/analyses/${sessionID}/`
            );
            const config = structuredClone(data.analysis_config);
            updateGame(gameIndex, {
                analysisData: data.results,
                loading: false,
                analysisConfig: config,
                draftAnalysisConfig: config,
            });
        } catch (error) {
            toast.error("Failed to load past analysis session");
            console.error("Failed to load analysis session:", error);
        }
    };

    const onSaveGame = async (
        gameIndex: number,
        forceSaveAnalysisSession: boolean = false
    ) => {
        const game = games[gameIndex];
        if (!game || !game.gameData) return null;

        const savedGameID = await saveGame(gameIndex, game.sgfContent);
        if (!savedGameID) {
            toast.error("Failed to save game");
            return null;
        }
        if (forceSaveAnalysisSession)
            await saveAnalysisSession(gameIndex, savedGameID);

        toast.success("Game saved");
        return savedGameID;
    };

    const onUnsaveGame = async (gameIndex: number) => {
        const game = games[gameIndex];
        if (!game?.gameID) return;

        const savedGameID = game.gameID;
        try {
            await api.delete(`${GAMES_URL}${savedGameID}/`);
            updateGame(gameIndex, { gameID: null });
            if (gameID === savedGameID) {
                setAnalysisSessions([]);
                setSelectedAnalysisSession(null);
            }
            toast.success("Game unsaved");
        } catch (error) {
            console.error("Failed to unsave game:", error);
            toast.error("Failed to unsave game");
        }
    };

    const onCompare = async () => {
        const savedGameIDs: string[] = [];
        for (const idx of selectedGameIndex) {
            const game = games[idx];

            // If the game is already saved
            if (game.gameID) {
                savedGameIDs.push(game.gameID);
                continue;
            }

            updateGame(idx, { loading: true, loadedValue: null });
            try {
                const savedGameID = await onSaveGame(idx, true);
                console.log(savedGameID);
                if (savedGameID) savedGameIDs.push(savedGameID as string);
            } catch (error) {
                console.error(
                    "Error while saving games for comparison:",
                    error
                );
                toast.error("Error while saving games for comparison");
            } finally {
                updateGame(idx, { loading: false });
            }
        }
        navigate(`/compare?gameIDs=${savedGameIDs.join(",")}`);
    };

    const analysisConfigIsDirty = (gameIndex: number) => {
        return (
            JSON.stringify(games[gameIndex].analysisConfig) !==
            JSON.stringify(games[gameIndex].draftAnalysisConfig)
        );
    };

    const isAnimating =
        deletingGameIndex !== null || creatingGameIndex !== null;

    const requestDeleteBoard = (gameIndex: number) => {
        if (isAnimating) return;
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

        setDeletingGameIndex(gameIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setDeletingGameIndex(null);
            setGames((prev) => prev.filter((_, i) => i !== gameIndex));
        }, ANIMATION_MS);
    };

    const requestCreateBoard = () => {
        if (isAnimating) return;
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

        const newIndex = games.length;
        setGames((prev) => [
            ...prev,
            defaultBoard(userSettings.analysis_config),
        ]);
        setCreatingGameIndex(newIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setCreatingGameIndex(null);
        }, ANIMATION_MS);
    };

    // Require at least two initialized and non-live games to compare
    const compareOk =
        games.filter((game) => !game.live && game.gameData?.moves).length >= 2;

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
                    {games.map((game, gameIndex) => (
                        <Game
                            key={gameIndex}
                            gameIndex={gameIndex}
                            gameState={game}
                            updateGame={(update: Partial<GameState>) =>
                                updateGame(gameIndex, update)
                            }
                            selectedGameIndex={selectedGameIndex}
                            selectedGameSGF={
                                selectedGameIndex.length > 0
                                    ? games[selectedGameIndex[0]].sgfContent
                                    : null
                            }
                            onSelectGame={(checked: boolean) => {
                                if (checked) {
                                    setSelectedGameIndex((prev) => [
                                        ...prev,
                                        gameIndex,
                                    ]);
                                } else {
                                    setSelectedGameIndex((prev) =>
                                        prev.filter(
                                            (index) => gameIndex !== index
                                        )
                                    );
                                }
                            }}
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
                            onSaveGame={() => onSaveGame(gameIndex)}
                            onUnsaveGame={() => onUnsaveGame(gameIndex)}
                            onDeleteBoard={() => requestDeleteBoard(gameIndex)}
                            onSaveAnalysisSettings={() =>
                                onSaveAnalysisSettings(gameIndex)
                            }
                            onResetAnalysisSettings={() =>
                                onResetAnalysisSettings(gameIndex)
                            }
                            analysisConfigIsDirty={analysisConfigIsDirty(
                                gameIndex
                            )}
                            analysisSessions={analysisSessions}
                            selectedAnalysisSession={selectedAnalysisSession}
                            setSelectedAnalysisSession={
                                setSelectedAnalysisSession
                            }
                            loadHistorySession={(id: string) =>
                                loadHistorySession(gameIndex, id)
                            }
                            historyMenuAnchor={historyMenuAnchor}
                            setHistoryMenuAnchor={setHistoryMenuAnchor}
                            gameBoardRefs={gameBoardRefs}
                            isCreating={creatingGameIndex === gameIndex}
                            isDeleting={deletingGameIndex === gameIndex}
                            numGames={games.length}
                            compareOk={compareOk}
                        />
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                    variant="outlined"
                    sx={{
                        borderColor: "divider",
                    }}
                    onClick={requestCreateBoard}
                    disabled={isAnimating}
                >
                    Add Board
                </Button>
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
                    {gameID && analysisSessions.length > 0 && (
                        <>
                            <Tooltip title="Past configurations" arrow>
                                <IconButton
                                    size="medium"
                                    onClick={(e) =>
                                        setHistoryMenuAnchor(e.currentTarget)
                                    }
                                >
                                    <HistoryIcon fontSize="medium" />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorEl={historyMenuAnchor}
                                open={Boolean(historyMenuAnchor)}
                                onClose={() => setHistoryMenuAnchor(null)}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                slotProps={{
                                    list: { autoFocusItem: true },
                                }}
                            >
                                {analysisSessions.map((session) => {
                                    const algo =
                                        session.analysis_config?.general
                                            ?.algorithm ?? "Unknown";
                                    const date = new Date(
                                        session.created_at
                                    ).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    });
                                    return (
                                        <MenuItem
                                            key={session.id}
                                            onClick={() => {
                                                void loadHistorySession(
                                                    0,
                                                    session.id
                                                );
                                                setSelectedAnalysisSession(
                                                    session.id
                                                );
                                            }}
                                        >
                                            <ListItemIcon>
                                                {session.id ===
                                                    selectedAnalysisSession && (
                                                    <CheckIcon color="primary" />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText>
                                                {algo} &mdash; {date}
                                            </ListItemText>
                                        </MenuItem>
                                    );
                                })}
                            </Menu>
                        </>
                    )}
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

            {/* The comparison-ready indicator */}
            {selectedGameIndex.length >= 2 && (
                <Slide appear={true} in={true} direction="up">
                    <ComparisonReadyIndicator
                        games={games
                            .map((game, index) => {
                                if (selectedGameIndex.includes(index))
                                    return game.name ?? `Board ${index}`;
                                return null;
                            })
                            .filter((game) => game !== null)}
                        onCompare={onCompare}
                    />
                </Slide>
            )}
        </Box>
    );
};

export default Demo;
