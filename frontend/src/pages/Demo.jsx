import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import GameBoard from "../components/board/GameBoard";
import { SGFSample } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../hooks/usePageTitle";
import { toGTPFormat } from "../utils";

function Demo() {
    usePageTitle("Demo");

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Board state management - using arrays indexed by board ID
    const [totalBoards, setTotalBoards] = useState(1);
    const [boardNames, setBoardNames] = useState([null]);
    const [files, setFiles] = useState([null]);
    const [gameData, setGameData] = useState([null]);
    const [analysisData, setAnalysisData] = useState([null]);
    const [winRate, setWinRate] = useState([null]);
    const [currentMove, setCurrentMove] = useState([null]);
    const [loading, setLoading] = useState([false]);
    const [useSamples, setUseSamples] = useState([null]);
    const [useAI, setUseAI] = useState([false]);

    // Display settings
    const [showRecommendedMoves, setShowRecommendedMoves] = useState([true]);
    const [deletingBoardIndex, setDeletingBoardIndex] = useState(null);
    const [creatingBoardIndex, setCreatingBoardIndex] = useState(null);
    const animationTimerRef = useRef(null);

    // Analysis settings
    const [loadedValue, setLoadedValue] = useState([0]);
    const getGameDataURL = "/api/get-game-data/";
    const getAnalysisURL = "/api/analyze/";

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

    // Effect to trigger analysis when gameData changes for a specific board
    useEffect(() => {
        for (let i = 0; i < totalBoards; i++) {
            // Skip if no game data
            if (!gameData || !gameData[i] || gameData[i] === null) continue;

            // Initialize win rate if needed
            if (!winRate[i] || winRate[i].length !== gameData[i].moves.length) {
                setWinRate((prev) =>
                    prev.map((value, index) =>
                        index === i
                            ? Array.from(
                                  { length: gameData[i].moves.length },
                                  () => 50
                              )
                            : value
                    )
                );
            }

            // Analysis is needed if no analysis data exists
            if (analysisData[i] === null) {
                async function analyze() {
                    setLoading((prev) =>
                        prev.map((value, index) => (index === i ? true : value))
                    );
                    await analyzeAllMoves(i);
                    setLoading((prev) =>
                        prev.map((value, index) =>
                            index === i ? false : value
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
            if (gameData[i] && gameData[i].moves.length > 0) continue;
            if (useSamples[i]) {
                getGameData(SGFSample, i);
            } else {
                if (files[i]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const fileContent = e.target.result;
                        getGameData(fileContent, i);
                    };
                    reader.readAsText(files[i]);
                }
            }
        }
    }, [files, gameData, totalBoards, useSamples]);

    async function getGameData(SGFContent, boardIndex) {
        setLoading((prev) =>
            prev.map((value, index) => (index === boardIndex ? true : value))
        );
        try {
            const gameDataResponse = await api.get(getGameDataURL, {
                params: {
                    sgf_file_data: SGFContent,
                },
            });
            const gameData = await gameDataResponse.data;
            setGameData((prev) =>
                prev.map((value, index) =>
                    index === boardIndex ? gameData : value
                )
            );
            setCurrentMove((prev) =>
                prev.map((value, index) => (index === boardIndex ? 1 : value))
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

    const analyzeAllMoves = async (boardIndex) => {
        const moves = [];
        const analyzeResults = [];
        for (let i = 0; i < gameData[boardIndex].moves.length; i++) {
            const move = gameData[boardIndex].moves[i];
            if (move.includes(null)) {
                continue;
            }

            const [color, [row, col]] = move;
            moves.push([color, toGTPFormat(row, col)]);

            const request = {
                board_size: gameData[boardIndex].size,
                rules: "japanese",
                komi: gameData[boardIndex].komi || 6.5,
                to_play: color.toUpperCase(),
                moves: moves,
                algo: "nn",
            };
            try {
                const analysisResponse = await api.post(
                    getAnalysisURL,
                    request
                );
                const data = analysisResponse.data;
                // data.response.moveInfos.sort((a, b) => {
                //     if (a.winrate > b.winrate) {
                //         return -1;
                //     }
                //     if (a.winrate < b.winrate) {
                //         return 1;
                //     }
                //     return 0;
                // });
                // const winRate = parseFloat(
                //     (data.response.rootInfo.winrate * 100).toFixed(1)
                // );
                // setWinRate((prev) =>
                //     prev.map((winrate, index) => {
                //         if (index === boardIndex) {
                //             return winrate.map((value, index) =>
                //                 index === i ? winRate : value
                //             );
                //         }
                //         return winrate;
                //     })
                // );
                analyzeResults.push(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoadedValue((prev) =>
                    prev.map((value, index) =>
                        index === boardIndex
                            ? (100 / gameData[boardIndex].moves.length) * i
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

    /**
     * Change the name of a board.
     * @param {number} boardIndex - The index of the board to change the name of.
     * @param {string} name - The new name of the board.
     */
    const handleBoardNameChange = (boardIndex, name) => {
        setBoardNames((prev) =>
            prev.map((value, index) => (index === boardIndex ? name : value))
        );
    };

    /**
     * Set the corresponding board to use a sample.
     * @param {number} boardIndex - The index of the board to set to use a sample.
     */
    const handleViewSample = (boardIndex) => {
        setUseSamples((prev) =>
            prev.map((value, index) => (index === boardIndex ? true : value))
        );
    };

    /**
     * Set the corresponding board to play with AI.
     * @param {number} boardIndex - The index of the board to set to play with AI.
     */
    const handlePlayWithAI = (boardIndex) => {
        setUseAI((prev) =>
            prev.map((value, index) => (index === boardIndex ? true : value))
        );
    };

    const ANIMATION_MS = 250;

    /**
     * Start delete: play exit animation, then {@link completeDeleteBoard} runs.
     * @param {number} boardIndex - The index of the board to delete.
     */
    const requestDeleteBoard = (boardIndex) => {
        if (deletingBoardIndex !== null || creatingBoardIndex !== null) return;
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
        }
        setDeletingBoardIndex(boardIndex);
        animationTimerRef.current = window.setTimeout(() => {
            animationTimerRef.current = null;
            completeDeleteBoard(boardIndex);
        }, ANIMATION_MS);
    };

    /**
     * Remove a board from state after its exit animation finishes.
     * @param {number} boardIndex - The index of the board to delete.
     */
    const completeDeleteBoard = (boardIndex) => {
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

    /**
     * Add a board and run the enter animation on the new row. The new index is
     * always the previous length (e.g. 1 board → new board is index 1), so we must
     * append state first, then mark that index as animating — not the reverse.
     */
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
        animationTimerRef.current = window.setTimeout(() => {
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
                                            boardNames[i] || `Board ${i + 1}`
                                        }
                                        onChange={(event) =>
                                            handleBoardNameChange(
                                                i,
                                                event.target.value
                                            )
                                        }
                                        sx={{
                                            "& .MuiInput-underline:before": {
                                                borderBottom: "none", // Hides the line initially
                                            },
                                            "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                                                {
                                                    borderBottom:
                                                        "1px solid rgba(0, 0, 0, 0.87)", // Shows on hover
                                                },
                                        }}
                                    ></TextField>
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
                                    id={i}
                                    gameData={gameData[i]}
                                    analysisData={analysisData[i]}
                                    isLoading={loading[i]}
                                    loadedValue={loadedValue[i]}
                                    useAI={useAI[i]}
                                    handleViewSample={handleViewSample}
                                    handlePlayWithAI={handlePlayWithAI}
                                    currentMove={currentMove[i]}
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
