import api from "@/api";
import GameBoard from "@/components/board/GameBoard";
import WinRate from "@/components/board/WinRate";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import {
    BOARD_SIZE,
    GAMES_URL,
    GET_ANALYSIS_URL,
    GET_GAME_DATA_URL,
    GET_WINRATE_URL,
    SGF_SAMPLE,
} from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import {
    type AnalysisConfig,
    type AnalysisResult,
    type BoardState,
    type GameData,
    type GameSource,
    type HistoryAnalysisSession,
    type HistoryEntry,
    WinrateResult,
    isValidMove,
} from "@/types/game";
import {
    buildAnalysisRequest,
    buildWinrateRequest,
} from "@/utils/buildAnalysisRequest";
import { toGTPFormat } from "@/utils/coordinates";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const defaultBoard = (analysisConfig: AnalysisConfig): BoardState => ({
    name: null,
    file: null,
    gameId: null,
    gameData: null,
    analysisData: null,
    winrate: [],
    currentMoveIndex: null,
    loading: false,
    gameSource: "none",
    live: false,
    loadedValue: null,
    analysisConfig: analysisConfig,
});

const ANIMATION_MS = 250;

function Demo() {
    usePageTitle("Demo");

    const { defaultAnalysisConfig } = useAuth();
    const [searchParams] = useSearchParams();
    const gameId = searchParams.get("gameId");
    const [games, setGames] = useState<BoardState[]>([
        defaultBoard(defaultAnalysisConfig),
    ]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

    const [deletingGameIndex, setDeletingGameIndex] = useState<number | null>(
        null
    );
    const [creatingGameIndex, setCreatingGameIndex] = useState<number | null>(
        null
    );
    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const [settingsGameIndex, setSettingsGameIndex] = useState(0);
    const [draftAnalysisConfig, setDraftAnalysisConfig] =
        useState<AnalysisConfig>(defaultAnalysisConfig);
    const [analysisSessions, setAnalysisSessions] = useState<
        HistoryAnalysisSession[]
    >([]);
    const [historyMenuAnchor, setHistoryMenuAnchor] =
        useState<HTMLElement | null>(null);
    const [selectedAnalysisSession, setSelectedAnalysisSession] = useState<
        string | null
    >(null);

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
            void loadHistorySession(analysisSessions[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analysisSessions]);

    useEffect(() => {
        if (gameId) {
            try {
                void api
                    .get<HistoryEntry>(`${GAMES_URL}${gameId}`)
                    .then(({ data }) => {
                        setAnalysisSessions(data.analysis_sessions ?? []);
                        setGames((prev) => {
                            if (prev.length !== 1) return prev;
                            const newBoard = defaultBoard(
                                defaultAnalysisConfig
                            );
                            newBoard.gameData = {
                                size: data.board_size,
                                moves: data.moves,
                                komi: data.komi ?? undefined,
                                players: {
                                    black: data.black_player,
                                    white: data.white_player,
                                },
                                winner: data.winner ?? undefined,
                            };
                            newBoard.name = data.name;
                            newBoard.gameId = data.id;
                            newBoard.currentMoveIndex = 0;
                            newBoard.loading = false;
                            newBoard.gameSource = "file";
                            newBoard.live = false;
                            newBoard.loadedValue = 0;
                            newBoard.analysisConfig = defaultAnalysisConfig;
                            return [newBoard];
                        });
                    });
            } catch (error) {
                console.error("Failed to load game data:", error);
            }
        } else {
            setAnalysisSessions([]);
            setGames([defaultBoard(defaultAnalysisConfig)]);
        }
    }, [defaultAnalysisConfig, gameId, setGames]);

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
            return [defaultBoard(defaultAnalysisConfig)];
        });
    }, [defaultAnalysisConfig]);

    useEffect(() => {
        setSettingsGameIndex((idx) => {
            if (games.length === 0) return 0;
            return Math.min(idx, games.length - 1);
        });
    }, [games.length]);

    const settingsBoardAnalysisConfig =
        games[settingsGameIndex]?.analysisConfig;

    useEffect(() => {
        if (settingsBoardAnalysisConfig === undefined) return;
        setDraftAnalysisConfig(structuredClone(settingsBoardAnalysisConfig));
    }, [settingsGameIndex, settingsBoardAnalysisConfig]);

    // Read file / sample content when a board's source changes.
    const fileSignature = games
        .map((b) => `${b.file?.name ?? ""}:${b.gameSource}`)
        .join("|");

    useEffect(() => {
        games.forEach((board, i) => {
            if (board.gameSource === "none") return;
            if (board.gameData && board.gameData.moves.length > 0) return;

            if (board.gameSource === "sample") {
                getGameData(SGF_SAMPLE, i);
            } else if (board.gameSource === "file" && board.file) {
                const reader = new FileReader();
                reader.onload = (e) =>
                    getGameData(e.target?.result as string, i);
                reader.readAsText(board.file);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileSignature]);

    const updateGame = (index: number, updates: Partial<BoardState>) => {
        setGames((prev) =>
            prev.map((board, i) =>
                i === index ? { ...board, ...updates } : board
            )
        );
    };

    const saveGame = async (
        gameIndex: number,
        source: "upload" | "live",
        gameData: GameData,
        boardName: string | null,
        sgfData: string = ""
    ) => {
        try {
            const { data } = await api.post<{ id: string }>(GAMES_URL, {
                name: boardName || `Board ${gameIndex + 1}`,
                source,
                board_size: gameData.size,
                komi: gameData.komi ?? null,
                black_player: gameData.players?.black ?? "Unknown",
                white_player: gameData.players?.white ?? "Unknown",
                winner: gameData.winner ?? "Unknown",
                moves: gameData.moves,
                sgf_data: sgfData,
            });
            updateGame(gameIndex, { gameId: data.id });
            return data.id;
        } catch (error) {
            console.error("Failed to save game:", error);
            return null;
        }
    };

    // const saveAnalysisSession = async (
    //     gameId: string,
    //     config: AnalysisConfig,
    //     results: AnalysisResult[]
    // ) => {
    //     try {
    //         await api.post(`${GAMES_URL}${gameId}/analyses/`, {
    //             analysis_config: config,
    //             results,
    //         });
    //     } catch (error) {
    //         console.error("Failed to save analysis session:", error);
    //     }
    // };

    const getGameData = async (
        SGFContent: string,
        gameIndex: number,
        source: "upload" | "live" = "upload"
    ) => {
        updateGame(gameIndex, { loading: true, loadedValue: null });
        try {
            const { data } = await api.post<GameData>(GET_GAME_DATA_URL, {
                sgf_file_data: SGFContent,
            });
            if (data.size === null || data.size != BOARD_SIZE) {
                throw new Error("Invalid board size");
            }

            data.moves = data.moves.filter((m) => isValidMove(m));
            updateGame(gameIndex, { gameData: data, currentMoveIndex: 0 });
            void saveGame(
                gameIndex,
                source,
                data,
                games[gameIndex]?.name ?? null,
                SGFContent
            );
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
                    GET_ANALYSIS_URL,
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
        async (
            gameIndex: number
            // gameId: string | null
        ) => {
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
                    GET_WINRATE_URL,
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
        async (
            gameIndex: number
            // gameId: string | null
        ) => {
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
        async (
            gameIndex: number
            // gameId: string | null
        ) => {
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

            // if (gameId && analysisResults.length > 0) {
            //     void saveAnalysisSession(
            //         gameId,
            //         analysisConfig,
            //         analysisResults
            //     );
            // }
        },
        [analyzeMove, games]
    );

    const onApplyAnalysisSettings = () => {
        const idx = settingsGameIndex;
        const board = games[idx];

        if (!board) return;
        const next = structuredClone(draftAnalysisConfig);
        const gameData = board.gameData;
        // const gameId = board.gameId ?? null;

        setGames((prev) =>
            prev.map((b, j) => (j === idx ? { ...b, analysisConfig: next } : b))
        );

        // Do not analyze if the board is using AI (live game).
        if (gameData && !board.live) {
            void onAnalyzeAllMoves(idx);
        } else if (board.live) {
            toast.success("Configuration updated");
        }
    };

    const loadHistorySession = async (sessionId: string) => {
        if (!gameId) return;
        setHistoryMenuAnchor(null);
        const idx = settingsGameIndex;
        try {
            const { data } = await api.get<HistoryAnalysisSession>(
                `${GAMES_URL}${gameId}/analyses/${sessionId}/`
            );
            const config = structuredClone(data.analysis_config);
            setDraftAnalysisConfig(config);
            updateGame(idx, {
                analysisConfig: config,
                analysisData: data.results,
                loading: false,
            });
        } catch (error) {
            toast.error("Failed to load past analysis session");
            console.error("Failed to load analysis session:", error);
        }
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
        setGames((prev) => [...prev, defaultBoard(defaultAnalysisConfig)]);
        setCreatingGameIndex(newIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setCreatingGameIndex(null);
        }, ANIMATION_MS);
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
                    {games.map((game, i) => (
                        <Stack
                            key={i}
                            gap={2}
                            direction={{ xs: "column", md: "row" }}
                            alignItems={{ xs: "stretch", md: "center" }}
                            justifyContent="center"
                            sx={{
                                position: "relative",
                                width: { xs: "100%", md: "max-content" },
                                maxWidth: "none",
                                mx: "auto",
                                flexShrink: 0,
                                transformOrigin: "center center",
                                willChange: "transform",
                                ...(deletingGameIndex === i && {
                                    animation: `boardDeleteExit ${ANIMATION_MS}ms ease-in forwards`,
                                    pointerEvents: "none",
                                }),
                                ...(creatingGameIndex === i && {
                                    animation: `boardCreate ${ANIMATION_MS}ms ease-out forwards`,
                                    pointerEvents: "none",
                                }),
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
                                        value={game.name ?? `Board ${i + 1}`}
                                        onChange={(event) =>
                                            updateGame(i, {
                                                name: event.target.value,
                                            })
                                        }
                                        sx={{
                                            "& .MuiInput-underline:before": {
                                                borderBottom: "none",
                                            },
                                            "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                                                {
                                                    borderBottom:
                                                        "1px solid rgba(0, 0, 0, 0.87)",
                                                },
                                        }}
                                    />
                                    <Stack direction="row" alignItems="center">
                                        {isMobile && (
                                            <Tooltip
                                                title="Analysis settings"
                                                arrow
                                            >
                                                <IconButton
                                                    onClick={() => {
                                                        setSettingsGameIndex(i);
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
                                        <Tooltip
                                            title={
                                                games.length > 1 && !isAnimating
                                                    ? "Delete board"
                                                    : ""
                                            }
                                            arrow
                                        >
                                            <span>
                                                <IconButton
                                                    onClick={() =>
                                                        requestDeleteBoard(i)
                                                    }
                                                    sx={{
                                                        color: "error.main",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "#ff000010",
                                                        },
                                                    }}
                                                    disabled={
                                                        games.length === 1 ||
                                                        isAnimating
                                                    }
                                                >
                                                    <DeleteIcon color="inherit" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                                <GameBoard
                                    key={i}
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
                                    onGameSourceChange={(source: GameSource) =>
                                        updateGame(i, { gameSource: source })
                                    }
                                    onGenerateWinrate={() => {
                                        void onGenerateWinrate(i);
                                    }}
                                    onAnalyzeCurrentMove={() => {
                                        void onAnalyzeCurrentMove(i);
                                    }}
                                    onAnalyzeAllMoves={() => {
                                        void onAnalyzeAllMoves(i);
                                    }}
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
                                        void saveGame(
                                            i,
                                            "live",
                                            liveData,
                                            game.name
                                        );
                                    }}
                                    onFileChange={(file) =>
                                        updateGame(i, { file })
                                    }
                                />
                                <WinRate
                                    data={game.winrate}
                                    setMove={(move) =>
                                        updateGame(i, {
                                            currentMoveIndex: move,
                                        })
                                    }
                                    currentMove={game.currentMoveIndex ?? 0}
                                />
                            </Box>
                            <Paper
                                elevation={1}
                                square
                                sx={{
                                    width: { xs: "100%", md: 400 },
                                    maxWidth: { xs: "100%", md: 400 },
                                    flexShrink: 0,
                                    display: { xs: "none", md: "flex" },
                                    flexDirection: "column",
                                    maxHeight: {
                                        xs: "none",
                                        md: "calc(100vh - 100px)",
                                    },
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
                                <Box
                                    sx={{
                                        px: 2,
                                        pt: 2,
                                        pb: 1,
                                        borderBottom: 1,
                                        borderColor: "divider",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h6" component="h2">
                                            Analysis settings
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                        >
                                            Board {i + 1}
                                        </Typography>
                                    </Box>
                                    {gameId && analysisSessions.length > 0 && (
                                        <>
                                            <Tooltip
                                                title="Past configurations"
                                                arrow
                                            >
                                                <IconButton
                                                    size="medium"
                                                    onClick={(e) =>
                                                        setHistoryMenuAnchor(
                                                            e.currentTarget
                                                        )
                                                    }
                                                >
                                                    <HistoryIcon fontSize="medium" />
                                                </IconButton>
                                            </Tooltip>
                                            <Menu
                                                anchorEl={historyMenuAnchor}
                                                open={Boolean(
                                                    historyMenuAnchor
                                                )}
                                                onClose={() =>
                                                    setHistoryMenuAnchor(null)
                                                }
                                                anchorOrigin={{
                                                    vertical: "bottom",
                                                    horizontal: "right",
                                                }}
                                                transformOrigin={{
                                                    vertical: "top",
                                                    horizontal: "right",
                                                }}
                                                slotProps={{
                                                    list: {
                                                        autoFocusItem: true,
                                                    },
                                                }}
                                            >
                                                {analysisSessions.map(
                                                    (session) => {
                                                        const algo =
                                                            session
                                                                .analysis_config
                                                                ?.general
                                                                ?.algorithm ??
                                                            "Unknown";
                                                        const date = new Date(
                                                            session.created_at
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }
                                                        );
                                                        return (
                                                            <MenuItem
                                                                key={session.id}
                                                                onClick={() => {
                                                                    void loadHistorySession(
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
                                                                    {algo}{" "}
                                                                    &mdash;{" "}
                                                                    {date}
                                                                </ListItemText>
                                                            </MenuItem>
                                                        );
                                                    }
                                                )}
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
                                        analysisConfig={draftAnalysisConfig}
                                        onChange={setDraftAnalysisConfig}
                                    />
                                </Box>
                                <Tooltip
                                    title={
                                        game.gameData === null
                                            ? "No game data"
                                            : ""
                                    }
                                    arrow
                                >
                                    <span
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={onApplyAnalysisSettings}
                                            disabled={game.gameData === null}
                                            sx={{
                                                m: 2,
                                                width: "100%",
                                            }}
                                        >
                                            Apply
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Paper>
                        </Stack>
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
                    <Box>
                        <Typography variant="h6" component="h2">
                            Analysis settings
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Board {settingsGameIndex + 1}
                        </Typography>
                    </Box>
                    {gameId && analysisSessions.length > 0 && (
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
                        analysisConfig={draftAnalysisConfig}
                        onChange={setDraftAnalysisConfig}
                    />
                </Box>
                <Button
                    variant="contained"
                    onClick={() => {
                        onApplyAnalysisSettings();
                        setSettingsDrawerOpen(false);
                    }}
                    sx={{ m: 2, flexShrink: 0 }}
                >
                    Apply
                </Button>
            </SwipeableDrawer>
        </Box>
    );
}

export default Demo;
