import api from "@/api";
import AnalysisConfigFields from "@/components/analysis/AnalysisConfigFields";
import GameBoard from "@/components/board/GameBoard";
import {
    BOARD_SIZE,
    SGFSample,
    getAnalysisURL,
    getGameDataURL,
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
import { buildAnalysisApiPayload } from "@/utils/analysisRequest";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const defaultBoard = (analysisConfig: AnalysisConfig): BoardState => ({
    name: null,
    file: null,
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

    const [analysisSettingsBoardIndex, setAnalysisSettingsBoardIndex] =
        useState<number | null>(null);
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

    // Read file / sample content when a board's source changes.
    const fileSignature = boards
        .map((b) => `${b.file?.name ?? ""}:${String(b.useSample ?? "")}`)
        .join("|");

    useEffect(() => {
        boards.forEach((board, i) => {
            if (!board.file && board.useSample === null) return;
            if (board.gameData && board.gameData.moves.length > 0) return;

            if (board.useSample) {
                getGameData(SGFSample, i);
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

    async function getGameData(SGFContent: string, boardIndex: number) {
        updateBoard(boardIndex, { loading: true });
        try {
            const { data } = await api.post<GameData>(getGameDataURL, {
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

            const request = buildAnalysisApiPayload(config, {
                moves: pastMoves,
                toPlay,
                gameData,
            });

            try {
                const { data } = await api.post<AnalysisResult>(
                    getAnalysisURL,
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
            config: AnalysisConfig
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
        },
        [analyzeMove]
    );

    const openAnalysisSettings = (boardIndex: number) => {
        const board = boards[boardIndex];
        if (!board) return;
        setDraftAnalysisConfig(structuredClone(board.analysisConfig));
        setAnalysisSettingsBoardIndex(boardIndex);
    };

    const closeAnalysisSettings = () => {
        setAnalysisSettingsBoardIndex(null);
    };

    const applyAnalysisSettings = () => {
        if (analysisSettingsBoardIndex === null) return;
        const idx = analysisSettingsBoardIndex;
        const next = structuredClone(draftAnalysisConfig);

        setBoards((prev) => {
            const gameData = prev[idx]?.gameData;
            const updated = prev.map((b, j) =>
                j === idx ? { ...b, analysisConfig: next } : b
            );
            if (gameData) {
                queueMicrotask(() => {
                    void analyzeAllMoves(idx, gameData, next);
                });
            }
            return updated;
        });
        setAnalysisSettingsBoardIndex(null);
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                py: 4,
                minHeight: "calc(100vh - 100px)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
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
                    <Box
                        key={i}
                        sx={{
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
                        <Stack gap={1}>
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
                                    <IconButton
                                        onClick={() => requestDeleteBoard(i)}
                                        sx={{
                                            color: "error.main",
                                            "&:hover": {
                                                backgroundColor: "#ff000010",
                                            },
                                        }}
                                        disabled={
                                            boards.length === 1 ||
                                            deletingBoardIndex !== null ||
                                            creatingBoardIndex !== null
                                        }
                                    >
                                        <DeleteIcon color="inherit" />
                                    </IconButton>
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
                                    updateBoard(i, { currentMove: move })
                                }
                                useSample={board.useSample}
                                onUseSampleChange={(useSample) =>
                                    updateBoard(i, { useSample })
                                }
                                analysisConfig={board.analysisConfig}
                                onOpenAnalysisSettings={() =>
                                    openAnalysisSettings(i)
                                }
                                onViewSample={() =>
                                    updateBoard(i, { useSample: true })
                                }
                                onPlayWithAI={() =>
                                    updateBoard(i, {
                                        gameData: {
                                            komi: 6.5,
                                            moves: [],
                                            size: 19,
                                            players: {
                                                black: "Black",
                                                white: "White",
                                            },
                                            winner: "Unknown",
                                        },
                                        currentMove: 0,
                                        useAI: true,
                                    })
                                }
                                onAnalyzeWithAI={() => {
                                    const gd = board.gameData;
                                    if (gd) {
                                        void analyzeAllMoves(
                                            i,
                                            gd,
                                            board.analysisConfig
                                        );
                                    }
                                }}
                                onFileChange={(file) =>
                                    updateBoard(i, { file })
                                }
                            />
                        </Stack>
                    </Box>
                ))}
            </Box>
            <Button
                variant="outlined"
                sx={{
                    borderColor: "divider",
                }}
                onClick={requestCreateBoard}
                disabled={
                    deletingBoardIndex !== null || creatingBoardIndex !== null
                }
            >
                Add Board
            </Button>

            <Dialog
                open={analysisSettingsBoardIndex !== null}
                onClose={closeAnalysisSettings}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                <DialogTitle>Analysis settings</DialogTitle>
                <DialogContent dividers>
                    <AnalysisConfigFields
                        analysisConfig={draftAnalysisConfig}
                        onChange={setDraftAnalysisConfig}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAnalysisSettings}>Cancel</Button>
                    <Button variant="contained" onClick={applyAnalysisSettings}>
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Demo;
