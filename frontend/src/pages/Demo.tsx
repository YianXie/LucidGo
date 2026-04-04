import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import GameBoard from "../components/board/GameBoard";
import { SGFSample, getAnalysisURL, getGameDataURL } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../hooks/usePageTitle";
import { type AnalysisResult, type GameData, isValidMove } from "../types/game";
import { toGTPFormat } from "../utils";

interface BoardState {
    name: string | null;
    file: File | null;
    gameData: GameData | null;
    analysisData: AnalysisResult[] | null;
    winRate: number[] | null;
    currentMove: number | null;
    loading: boolean;
    useSample: boolean | null;
    useAI: boolean;
    showRecommendedMoves: boolean;
    loadedValue: number;
}

const defaultBoard = (): BoardState => ({
    name: null,
    file: null,
    gameData: null,
    analysisData: null,
    winRate: null,
    currentMove: null,
    loading: false,
    useSample: null,
    useAI: false,
    showRecommendedMoves: true,
    loadedValue: 0,
});

const ANIMATION_MS = 250;

function Demo() {
    usePageTitle("Demo");

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [boards, setBoards] = useState<BoardState[]>([defaultBoard()]);
    const [deletingBoardIndex, setDeletingBoardIndex] = useState<number | null>(
        null
    );
    const [creatingBoardIndex, setCreatingBoardIndex] = useState<number | null>(
        null
    );
    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const updateBoard = (index: number, updates: Partial<BoardState>) => {
        setBoards((prev) =>
            prev.map((board, i) =>
                i === index ? { ...board, ...updates } : board
            )
        );
    };

    useEffect(() => {
        if (isAuthenticated === null) return;
        if (!isAuthenticated) {
            navigate("/login");
            toast.error("Please login to use the demo");
            return;
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    // Trigger win-rate initialisation and analysis when game data changes.
    // The signature only changes when a board's game data is set or replaced,
    // not when loading / analysisData / winRate / loadedValue change, so there
    // is no risk of an infinite update loop.
    const gameDataSignature = boards
        .map((b) =>
            b.gameData
                ? `${b.gameData.size}:${b.gameData.moves.length}`
                : "null"
        )
        .join("|");

    useEffect(() => {
        boards.forEach((board, i) => {
            if (!board.gameData) return;

            if (
                !board.winRate ||
                board.winRate.length !== board.gameData.moves.length
            ) {
                updateBoard(i, {
                    winRate: Array.from(
                        { length: board.gameData.moves.length },
                        () => 50
                    ),
                });
            }

            if (board.analysisData === null) {
                const boardData = board.gameData;
                updateBoard(i, { loading: true });
                analyzeAllMoves(i, boardData).finally(() => {
                    updateBoard(i, { loading: false });
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameDataSignature]);

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

    async function getGameData(SGFContent: string, boardIndex: number) {
        updateBoard(boardIndex, { loading: true });
        try {
            const { data } = await api.get<GameData>(getGameDataURL, {
                params: { sgf_file_data: SGFContent },
            });
            updateBoard(boardIndex, { gameData: data, currentMove: 0 });
        } catch (error) {
            toast.error("Invalid .sgf file");
            console.error("Error while fetching game data:", error);
        } finally {
            updateBoard(boardIndex, { loading: false });
        }
    }

    const analyzeAllMoves = async (boardIndex: number, boardData: GameData) => {
        const moves: [string, string][] = [];
        const analyzeResults: AnalysisResult[] = [];

        for (let i = 0; i < boardData.moves.length; i++) {
            const move = boardData.moves[i];
            if (!isValidMove(move)) continue;

            const [color, [row, col]] = move;
            moves.push([color, toGTPFormat(row, col)]);

            const request = {
                board_size: boardData.size,
                rules: "japanese",
                komi: boardData.komi ?? 6.5,
                to_play: color.toUpperCase(),
                moves,
                algo: "nn",
            };
            try {
                const { data } = await api.post<AnalysisResult>(
                    getAnalysisURL,
                    request
                );
                analyzeResults.push(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                updateBoard(boardIndex, {
                    loadedValue: (100 / boardData.moves.length) * i,
                });
            }
        }
        updateBoard(boardIndex, { analysisData: analyzeResults });
    };

    const requestDeleteBoard = (boardIndex: number) => {
        if (deletingBoardIndex !== null || creatingBoardIndex !== null) return;
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
        }
        setDeletingBoardIndex(boardIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setDeletingBoardIndex(null);
            setBoards((prev) => prev.filter((_, i) => i !== boardIndex));
        }, ANIMATION_MS);
    };

    const requestCreateBoard = () => {
        if (deletingBoardIndex !== null || creatingBoardIndex !== null) return;
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
        }
        const newIndex = boards.length;

        setBoards((prev) => [...prev, defaultBoard()]);
        setCreatingBoardIndex(newIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            setCreatingBoardIndex(null);
        }, ANIMATION_MS);
    };

    return (
        <Container>
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
                                    showRecommendedMoves={
                                        board.showRecommendedMoves
                                    }
                                    onShowRecommendedMovesChange={(show) =>
                                        updateBoard(i, {
                                            showRecommendedMoves: show,
                                        })
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
                        deletingBoardIndex !== null ||
                        creatingBoardIndex !== null
                    }
                >
                    Add Board
                </Button>
            </Box>
        </Container>
    );
}

export default Demo;
