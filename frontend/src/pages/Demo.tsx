import api from "@/api";
import AnalysisConfigFields from "@/components/analysis/AnalysisConfigFields";
import GameBoard from "@/components/board/GameBoard";
import {
    BOARD_SIZE,
    GAMES_URL,
    GET_ANALYSIS_URL,
    GET_GAME_DATA_URL,
    SGF_SAMPLE,
} from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import {
    type AnalysisConfig,
    type AnalysisResult,
    type BoardState,
    type GameData,
    isValidMove,
} from "@/types/game";
import { toGTPFormat } from "@/utils";
import { buildAnalysisRequest } from "@/utils/buildAnalysisRequest";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const defaultBoard = (analysisConfig: AnalysisConfig): BoardState => ({
    name: null,
    file: null,
    gameId: null,
    gameData: null,
    analysisData: null,
    currentMove: null,
    loading: false,
    useSample: null,
    useAI: false,
    loadedValue: 0,
    analysisConfig: analysisConfig,
});

const ANIMATION_MS = 250;

function Demo() {
    usePageTitle("Demo");

    const { defaultAnalysisConfig } = useAuth();

    const [boards, setBoards] = useState<BoardState[]>([
        defaultBoard(defaultAnalysisConfig),
    ]);
    const [deletingBoardIndex, setDeletingBoardIndex] = useState<number | null>(
        null
    );
    const [creatingBoardIndex, setCreatingBoardIndex] = useState<number | null>(
        null
    );
    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const [settingsBoardIndex, setSettingsBoardIndex] = useState(0);
    const [draftAnalysisConfig, setDraftAnalysisConfig] =
        useState<AnalysisConfig>(defaultAnalysisConfig);

    useEffect(() => {
        return () => {
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setBoards((prev) => {
            if (prev.length !== 1) return prev;
            const only = prev[0];
            const pristine =
                only.gameData === null &&
                only.file === null &&
                only.useSample === null &&
                only.analysisData === null &&
                !only.loading;
            if (!pristine) return prev;
            return [defaultBoard(defaultAnalysisConfig)];
        });
    }, [defaultAnalysisConfig]);

    useEffect(() => {
        setSettingsBoardIndex((idx) => {
            if (boards.length === 0) return 0;
            return Math.min(idx, boards.length - 1);
        });
    }, [boards.length]);

    useEffect(() => {
        const board = boards[settingsBoardIndex];
        if (board) {
            setDraftAnalysisConfig(structuredClone(board.analysisConfig));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsBoardIndex, defaultAnalysisConfig]);

    // Read file / sample content when a board's source changes.
    const fileSignature = boards
        .map((b) => `${b.file?.name ?? ""}:${String(b.useSample ?? "")}`)
        .join("|");

    useEffect(() => {
        boards.forEach((board, i) => {
            if (!board.file && board.useSample === null) return;
            if (board.gameData && board.gameData.moves.length > 0) return;

            if (board.useSample) {
                getGameData(SGF_SAMPLE, i);
            } else if (board.file) {
                const reader = new FileReader();
                reader.onload = (e) =>
                    getGameData(e.target?.result as string, i);
                reader.readAsText(board.file);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileSignature]);

    const updateBoard = (index: number, updates: Partial<BoardState>) => {
        setBoards((prev) =>
            prev.map((board, i) =>
                i === index ? { ...board, ...updates } : board
            )
        );
    };

    async function saveGame(
        boardIndex: number,
        source: "upload" | "live",
        gameData: GameData,
        boardName: string | null,
        sgfData: string = ""
    ): Promise<string | null> {
        try {
            const { data } = await api.post<{ id: string }>(GAMES_URL, {
                name: boardName || `Board ${boardIndex + 1}`,
                source,
                board_size: gameData.size,
                komi: gameData.komi ?? null,
                black_player: gameData.players?.black ?? "Unknown",
                white_player: gameData.players?.white ?? "Unknown",
                winner: gameData.winner ?? "Unknown",
                moves: gameData.moves,
                sgf_data: sgfData,
            });
            updateBoard(boardIndex, { gameId: data.id });
            return data.id;
        } catch (error) {
            console.error("Failed to save game:", error);
            return null;
        }
    }

    async function saveAnalysisSession(
        gameId: string,
        config: AnalysisConfig,
        results: AnalysisResult[]
    ) {
        try {
            await api.post(`${GAMES_URL}${gameId}/analyses/`, {
                analysis_config: config,
                results,
            });
        } catch (error) {
            console.error("Failed to save analysis session:", error);
        }
    }

    async function getGameData(
        SGFContent: string,
        boardIndex: number,
        source: "upload" | "live" = "upload"
    ) {
        updateBoard(boardIndex, { loading: true });
        try {
            const { data } = await api.post<GameData>(GET_GAME_DATA_URL, {
                sgf_file_data: SGFContent,
            });
            if (data.size === null || data.size != BOARD_SIZE) {
                throw new Error("Invalid board size");
            }

            for (let i = 0; i < data.moves.length; i++) {
                if (!isValidMove(data.moves[i])) {
                    data.moves.splice(i, 1);
                    i--;
                    continue;
                }
            }
            updateBoard(boardIndex, { gameData: data, currentMove: 0 });
            void saveGame(
                boardIndex,
                source,
                data,
                boards[boardIndex]?.name ?? null,
                SGFContent
            );
        } catch (error) {
            toast.error("Invalid .sgf file");
            console.error("Error while fetching game data:", error);
        } finally {
            updateBoard(boardIndex, { loading: false });
        }
    }

    const analyzeMove = useCallback(
        async (
            boardIndex: number,
            moveIndex: number,
            config: AnalysisConfig,
            gameData: GameData
        ) => {
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

            const request = buildAnalysisRequest(config, pastMoves, toPlay);
            try {
                const { data } = await api.post<AnalysisResult>(
                    GET_ANALYSIS_URL,
                    request
                );
                return data;
            } catch (error) {
                toast.error(
                    `Error analyzing move ${moveIndex + 1} in board ${boardIndex + 1}`
                );
                console.error(
                    `Error analyzing move ${moveIndex + 1} in board ${boardIndex + 1}:`,
                    error
                );
            }
            return null;
        },
        []
    );

    const analyzeAllMoves = useCallback(
        async (
            boardIndex: number,
            boardData: GameData,
            config: AnalysisConfig,
            gameId: string | null
        ) => {
            if (!boardData) return;

            updateBoard(boardIndex, { loading: true });

            const denom = Math.max(boardData.moves.length, 1);
            const analysisResults: AnalysisResult[] = [];
            for (let i = 0; i <= boardData.moves.length; i++) {
                const analysisResult = await analyzeMove(
                    boardIndex,
                    i,
                    config,
                    boardData
                );
                if (analysisResult) {
                    analysisResults.push(analysisResult);
                }
                updateBoard(boardIndex, {
                    loadedValue: (100 / denom) * i,
                });
            }
            updateBoard(boardIndex, { analysisData: analysisResults });
            updateBoard(boardIndex, { loading: false });

            if (gameId && analysisResults.length > 0) {
                void saveAnalysisSession(gameId, config, analysisResults);
            }
        },
        [analyzeMove]
    );

    const applyAnalysisSettings = () => {
        const idx = settingsBoardIndex;
        const board = boards[idx];
        if (!board) return;
        const next = structuredClone(draftAnalysisConfig);

        setBoards((prev) => {
            const target = prev[idx];
            const gameData = target?.gameData;
            const gameId = target?.gameId ?? null;
            const updated = prev.map((b, j) =>
                j === idx ? { ...b, analysisConfig: next } : b
            );
            if (gameData) {
                queueMicrotask(() => {
                    void analyzeAllMoves(idx, gameData, next, gameId);
                });
            }
            return updated;
        });
    };

    const requestDeleteBoard = (boardIndex: number) => {
        if (deletingBoardIndex !== null || creatingBoardIndex !== null) return;
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

        setDeletingBoardIndex(boardIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setDeletingBoardIndex(null);
            setBoards((prev) => prev.filter((_, i) => i !== boardIndex));
        }, ANIMATION_MS);
    };

    const requestCreateBoard = () => {
        if (deletingBoardIndex !== null || creatingBoardIndex !== null) return;
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

        const newIndex = boards.length;
        setBoards((prev) => [...prev, defaultBoard(defaultAnalysisConfig)]);
        setCreatingBoardIndex(newIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setCreatingBoardIndex(null);
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
                    {boards.map((board, i) => (
                        <Stack
                            key={i}
                            gap={1}
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                position: "relative",
                                width: "max-content",
                                maxWidth: "none",
                                mx: "auto",
                                flexShrink: 0,
                                transformOrigin: "center center",
                                willChange: "transform",
                                ...(deletingBoardIndex === i && {
                                    animation: `boardDeleteExit ${ANIMATION_MS}ms ease-in forwards`,
                                    pointerEvents: "none",
                                }),
                                ...(creatingBoardIndex === i && {
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
                                        value={board.name ?? `Board ${i + 1}`}
                                        onChange={(event) =>
                                            updateBoard(i, {
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
                                    <Tooltip title="Delete board" arrow>
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
                                                    boards.length === 1 ||
                                                    deletingBoardIndex !==
                                                        null ||
                                                    creatingBoardIndex !== null
                                                }
                                            >
                                                <DeleteIcon color="inherit" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Stack>
                                <GameBoard
                                    key={i}
                                    analysisData={board.analysisData}
                                    isLoading={board.loading}
                                    loadedValue={board.loadedValue}
                                    useAI={board.useAI}
                                    gameData={board.gameData}
                                    currentMove={board.currentMove}
                                    onCurrentMoveChange={(move) =>
                                        updateBoard(i, {
                                            currentMove: move,
                                        })
                                    }
                                    useSample={board.useSample}
                                    onUseSampleChange={(useSample) =>
                                        updateBoard(i, { useSample })
                                    }
                                    analysisConfig={board.analysisConfig}
                                    allowPass={true}
                                    onViewSample={() =>
                                        updateBoard(i, { useSample: true })
                                    }
                                    onPlayWithAI={() => {
                                        const liveGameData: GameData = {
                                            komi: 6.5,
                                            moves: [],
                                            size: 19,
                                            players: {
                                                black: "Black",
                                                white: "White",
                                            },
                                            winner: "Unknown",
                                        };
                                        updateBoard(i, {
                                            gameData: liveGameData,
                                            currentMove: 0,
                                            useAI: true,
                                        });
                                        void saveGame(
                                            i,
                                            "live",
                                            liveGameData,
                                            board.name
                                        );
                                    }}
                                    onAnalyzeWithAI={() => {
                                        const gd = board.gameData;
                                        if (gd) {
                                            void analyzeAllMoves(
                                                i,
                                                gd,
                                                board.analysisConfig,
                                                board.gameId
                                            );
                                        }
                                    }}
                                    onFileChange={(file) =>
                                        updateBoard(i, { file })
                                    }
                                />
                            </Box>
                            <Paper
                                elevation={1}
                                square
                                sx={{
                                    width: { xs: "100%", md: 400 },
                                    maxWidth: { xs: "100%", md: 400 },
                                    flexShrink: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    maxHeight: {
                                        xs: "none",
                                        md: "calc(100vh - 100px)",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 2,
                                        pt: 2,
                                        pb: 1,
                                        borderBottom: 1,
                                        borderColor: "divider",
                                    }}
                                >
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
                                    onClick={applyAnalysisSettings}
                                    sx={{
                                        m: 2,
                                    }}
                                >
                                    Apply
                                </Button>
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
                    disabled={
                        deletingBoardIndex !== null ||
                        creatingBoardIndex !== null
                    }
                >
                    Add Board
                </Button>
            </Box>
        </Box>
    );
}

export default Demo;
