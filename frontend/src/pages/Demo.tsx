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

function Demo() {
    usePageTitle("Demo");

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [totalBoards, setTotalBoards] = useState(1);
    const [boardNames, setBoardNames] = useState<(string | null)[]>([null]);
    const [files, setFiles] = useState<(File | null)[]>([null]);
    const [gameData, setGameData] = useState<(GameData | null)[]>([null]);
    const [analysisData, setAnalysisData] = useState<
        (AnalysisResult[] | null)[]
    >([null]);
    const [winRate, setWinRate] = useState<(number[] | null)[]>([null]);
    const [currentAnalyzedMoves, setCurrentMove] = useState<(number | null)[]>([
        null,
    ]);
    const [loading, setLoading] = useState<boolean[]>([false]);
    const [useSamples, setUseSamples] = useState<(boolean | null)[]>([null]);
    const [useAI, setUseAI] = useState<boolean[]>([false]);

    const [showRecommendedMoves, setShowRecommendedMoves] = useState<boolean[]>(
        [true]
    );
    const [deletingBoardIndex, setDeletingBoardIndex] = useState<number | null>(
        null
    );
    const [creatingBoardIndex, setCreatingBoardIndex] = useState<number | null>(
        null
    );
    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const [loadedValue, setLoadedValue] = useState<number[]>([0]);

    useEffect(() => {
        if (isAuthenticated === null) return;
        if (isAuthenticated === false) {
            navigate("/login");
            toast.error("Please login to use the demo");
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    useEffect(() => {
        return () => {
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        for (let i = 0; i < totalBoards; i++) {
            if (!gameData || !gameData[i] || gameData[i] === null) continue;

            if (
                !winRate[i] ||
                winRate[i]!.length !== gameData[i]!.moves.length
            ) {
                setWinRate((prev) =>
                    prev.map((value, index) =>
                        index === i
                            ? Array.from(
                                  { length: gameData[i]!.moves.length },
                                  () => 50
                              )
                            : value
                    )
                );
            }

            if (analysisData[i] === null) {
                const boardIndex = i;
                async function analyze() {
                    setLoading((prev) =>
                        prev.map((value, index) =>
                            index === boardIndex ? true : value
                        )
                    );
                    await analyzeAllMoves(boardIndex);
                    setLoading((prev) =>
                        prev.map((value, index) =>
                            index === boardIndex ? false : value
                        )
                    );
                }
                analyze();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameData, totalBoards]);

    useEffect(() => {
        for (let i = 0; i < totalBoards; i++) {
            if (!files[i] && !useSamples[i]) continue;
            if (gameData[i] && gameData[i]!.moves.length > 0) continue;
            if (useSamples[i]) {
                getGameData(SGFSample, i);
            } else {
                if (files[i]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const fileContent = e.target?.result as string;
                        getGameData(fileContent, i);
                    };
                    reader.readAsText(files[i]!);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files, gameData, totalBoards, useSamples]);

    async function getGameData(SGFContent: string, boardIndex: number) {
        setLoading((prev) =>
            prev.map((value, index) => (index === boardIndex ? true : value))
        );
        try {
            const gameDataResponse = await api.get<GameData>(getGameDataURL, {
                params: {
                    sgf_file_data: SGFContent,
                },
            });
            const data = gameDataResponse.data;
            setGameData((prev) =>
                prev.map((value, index) =>
                    index === boardIndex ? data : value
                )
            );
            setCurrentMove((prev) =>
                prev.map((value, index) => (index === boardIndex ? 0 : value))
            );
        } catch (error) {
            toast.error("Invalid .sgf file");
            console.error("Error while fetching game data:", error);
        } finally {
            setLoading((prev) =>
                prev.map((value, index) =>
                    index === boardIndex ? false : value
                )
            );
        }
    }

    const analyzeAllMoves = async (boardIndex: number) => {
        const moves: [string, string][] = [];
        const analyzeResults: AnalysisResult[] = [];
        const boardData = gameData[boardIndex];
        if (!boardData) return;

        for (let i = 0; i < boardData.moves.length; i++) {
            const move = boardData.moves[i];
            if (!isValidMove(move)) {
                continue;
            }

            const [color, [row, col]] = move;
            moves.push([color, toGTPFormat(row, col)]);

            const request = {
                board_size: boardData.size,
                rules: "japanese",
                komi: boardData.komi ?? 6.5,
                to_play: color.toUpperCase(),
                moves: moves,
                algo: "nn",
            };
            try {
                const analysisResponse = await api.post<AnalysisResult>(
                    getAnalysisURL,
                    request
                );
                analyzeResults.push(analysisResponse.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoadedValue((prev) =>
                    prev.map((value, index) =>
                        index === boardIndex
                            ? (100 / boardData.moves.length) * i
                            : value
                    )
                );
            }
        }
        setAnalysisData((prev) =>
            prev.map((value, index) =>
                index === boardIndex ? analyzeResults : value
            )
        );
    };

    const handleBoardNameChange = (boardIndex: number, name: string) => {
        setBoardNames((prev) =>
            prev.map((value, index) => (index === boardIndex ? name : value))
        );
    };

    const handleViewSample = (boardIndex: number) => {
        setUseSamples((prev) =>
            prev.map((value, index) => (index === boardIndex ? true : value))
        );
    };

    const handlePlayWithAI = (boardIndex: number) => {
        setGameData((prev) =>
            prev.map((value, index) =>
                index === boardIndex
                    ? {
                          komi: 6.5,
                          moves: [],
                          size: 19,
                          players: {
                              black: "Black",
                              white: "White",
                          },
                          winner: "Unknown",
                      }
                    : value
            )
        );
        setCurrentMove((prev) =>
            prev.map((value, index) => (index === boardIndex ? 0 : value))
        );
        setUseAI((prev) =>
            prev.map((value, index) => (index === boardIndex ? true : value))
        );
    };

    const ANIMATION_MS = 250;

    const requestDeleteBoard = (boardIndex: number) => {
        if (deletingBoardIndex !== null || creatingBoardIndex !== null) return;
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
        }
        setDeletingBoardIndex(boardIndex);
        animationTimerRef.current = setTimeout(() => {
            animationTimerRef.current = null;
            completeDeleteBoard(boardIndex);
        }, ANIMATION_MS);
    };

    const completeDeleteBoard = (boardIndex: number) => {
        setDeletingBoardIndex(null);
        setTotalBoards((n) => n - 1);
        setBoardNames((prev) =>
            prev.filter((_, index) => index !== boardIndex)
        );
        setGameData((prev) => prev.filter((_, index) => index !== boardIndex));
        setAnalysisData((prev) =>
            prev.filter((_, index) => index !== boardIndex)
        );
        setCurrentMove((prev) =>
            prev.filter((_, index) => index !== boardIndex)
        );
        setLoading((prev) => prev.filter((_, index) => index !== boardIndex));
        setShowRecommendedMoves((prev) =>
            prev.filter((_, index) => index !== boardIndex)
        );
        setLoadedValue((prev) =>
            prev.filter((_, index) => index !== boardIndex)
        );
        setWinRate((prev) => prev.filter((_, index) => index !== boardIndex));
        setFiles((prev) => prev.filter((_, index) => index !== boardIndex));
        setUseSamples((prev) =>
            prev.filter((_, index) => index !== boardIndex)
        );
        setUseAI((prev) => prev.filter((_, index) => index !== boardIndex));
    };

    const requestCreateBoard = () => {
        if (deletingBoardIndex !== null || creatingBoardIndex !== null) return;
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
        }
        const newIndex = totalBoards;

        setTotalBoards((n) => n + 1);
        setBoardNames((prev) => [...prev, null]);
        setUseSamples((prev) => [...prev, null]);
        setUseAI((prev) => [...prev, false]);
        setGameData((prev) => [...prev, null]);
        setAnalysisData((prev) => [...prev, null]);
        setCurrentMove((prev) => [...prev, null]);
        setLoading((prev) => [...prev, false]);
        setShowRecommendedMoves((prev) => [...prev, true]);
        setLoadedValue((prev) => [...prev, 0]);
        setWinRate((prev) => [...prev, null]);
        setFiles((prev) => [...prev, null]);

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
                    {Array.from({ length: totalBoards }, (_, i) => (
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
                                        value={
                                            boardNames[i] === null
                                                ? `Board ${i + 1}`
                                                : boardNames[i]
                                        }
                                        onChange={(event) =>
                                            handleBoardNameChange(
                                                i,
                                                event.target.value
                                            )
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
                                                totalBoards === 1 ||
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
                                    boardIdx={i}
                                    analysisData={analysisData[i]}
                                    isLoading={loading[i]}
                                    loadedValue={loadedValue[i]}
                                    useAI={useAI[i]}
                                    handleViewSample={handleViewSample}
                                    handlePlayWithAI={handlePlayWithAI}
                                    gameData={gameData[i]}
                                    currentMove={currentAnalyzedMoves[i]}
                                    setCurrentMove={setCurrentMove}
                                    useSamples={useSamples[i]}
                                    setUseSamples={setUseSamples}
                                    showRecommendedMoves={
                                        showRecommendedMoves[i]
                                    }
                                    setShowRecommendedMoves={
                                        setShowRecommendedMoves
                                    }
                                    setFiles={setFiles}
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
