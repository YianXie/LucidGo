import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import GameBoard from "../components/board/GameBoard";
import { SGFSample } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import usePageTitle from "../hooks/usePageTitle";
import { toGTPFormat } from "../utils";

/**
 * Get GMT+8 time information using cached formatter
 * @returns {object} - Object with hours, minutes, and dayOfWeek
 */
const getGMT8Time = (() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Shanghai",
        hour: "numeric",
        minute: "numeric",
        weekday: "long",
        hour12: false,
    });

    return (now) => {
        const parts = formatter.formatToParts(now);
        return {
            hours: parseInt(parts.find((p) => p.type === "hour").value),
            minutes: parseInt(parts.find((p) => p.type === "minute").value),
            dayOfWeek: parts.find((p) => p.type === "weekday").value,
        };
    };
})();

/**
 * Check if the server is currently available based on GMT+8 timezone
 * Server starts at 15:00 GMT+8 on weekdays, 08:00 GMT+8 on weekends
 * Server stops at 22:00 GMT+8 every day
 * @returns {boolean} - True if server is available, false otherwise
 */
function isServerAvailable() {
    const now = new Date();
    const { hours, minutes, dayOfWeek } = getGMT8Time(now);

    const currentTimeInMinutes = hours * 60 + minutes;
    const stopTimeInMinutes = 22 * 60; // 22:00

    // Check if past stop time
    if (currentTimeInMinutes >= stopTimeInMinutes) {
        return false;
    }

    // Check if before start time
    const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday";
    const startTimeInMinutes = isWeekend ? 8 * 60 : 15 * 60; // 08:00 on weekends, 15:00 on weekdays

    if (currentTimeInMinutes < startTimeInMinutes) {
        return false;
    }

    return true;
}

function Demo() {
    usePageTitle("Demo");

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Board state management - using arrays indexed by board ID
    const [totalBoards, setTotalBoards] = useState(1);
    const [files, setFiles] = useState([null]);
    const [gameData, setGameData] = useState([null]);
    const [analysisData, setAnalysisData] = useState([null]);
    const [winRate, setWinRate] = useState([null]);
    const [currentMove, setCurrentMove] = useState([null]);
    const [loading, setLoading] = useState([false]);
    const [useSamples, setUseSamples] = useState([null]);

    // Display settings
    const [showRecommendedMoves, setShowRecommendedMoves] = useState([true]);
    const [showPolicy, setShowPolicy] = useState([false]);
    const [showOwnership, setShowOwnership] = useState([false]);

    // Analysis settings
    const [maxVisits, setMaxVisits] = useState([500]);
    const [maxVisitsVersion, setMaxVisitsVersion] = useState([0]); // Track changes to force re-analysis
    const [loadedValue, setLoadedValue] = useState([0]);

    // Server state
    const [serverAvailable, setServerAvailable] = useState(isServerAvailable());

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

    // Check server availability periodically
    useEffect(() => {
        const checkAvailability = () => {
            setServerAvailable(isServerAvailable());
        };

        // Check immediately
        checkAvailability();

        // Check every minute
        const interval = setInterval(checkAvailability, 60000);

        return () => clearInterval(interval);
    }, []);

    // Effect to trigger analysis when gameData changes or maxVisits changes for a specific board
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

            // Check if analysis is needed for this board
            // Analysis is needed if:
            // 1. No analysis data exists, OR
            // 2. maxVisits changed (tracked by maxVisitsVersion > 0)
            const hasAnalysisData =
                analysisData[i] && analysisData[i].length > 0;
            const maxVisitsChanged = maxVisitsVersion[i] > 0;
            const needsAnalysis = !hasAnalysisData || maxVisitsChanged;

            if (needsAnalysis) {
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
                    // Reset the version tracker after analysis completes
                    setMaxVisitsVersion((prev) =>
                        prev.map((value, index) => (index === i ? 0 : value))
                    );
                }
                analyze();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameData, maxVisitsVersion, totalBoards]);

    async function getGameData(SGFContent, boardIndex) {
        try {
            const gameDataResponse = await api.post(getGameDataURL, {
                sgf_file_data: SGFContent,
            });
            const rawGameData = await gameDataResponse.data;
            const gameData = rawGameData.game_data;
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
        }
    }

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

    const analyzeAllMoves = async (boardIndex) => {
        const pastMoves = [];
        const analyzeResults = [];
        for (let i = 0; i < gameData[boardIndex].moves.length; i++) {
            const move = gameData[boardIndex].moves[i];
            if (move.includes(null)) {
                continue;
            }

            const [color, [row, col]] = move;
            pastMoves.push([color, toGTPFormat(row, col)]);

            const request = {
                id: `analysis_request_${boardIndex}_${i}`,
                moves: pastMoves,
                rules: "japanese",
                komi: 6.5,
                boardXSize: gameData[boardIndex].size,
                boardYSize: gameData[boardIndex].size,
                analyzeTurns: [i],
                maxVisits: maxVisits[boardIndex],
                includePolicy: true,
                includeOwnership: true,
            };
            try {
                const analysisResponse = await api.post(getAnalysisURL, {
                    analysis_request: request,
                });
                const data = analysisResponse.data;
                data.response.moveInfos.sort((a, b) => {
                    if (a.winrate > b.winrate) {
                        return -1;
                    }
                    if (a.winrate < b.winrate) {
                        return 1;
                    }
                    return 0;
                });

                const winRate = parseFloat(
                    (data.response.rootInfo.winrate * 100).toFixed(1)
                );
                setWinRate((prev) =>
                    prev.map((winrate, index) => {
                        if (index === boardIndex) {
                            return winrate.map((value, index) =>
                                index === i ? winRate : value
                            );
                        }
                        return winrate;
                    })
                );
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

    const handleViewSample = (boardIndex) => {
        setUseSamples((prev) =>
            prev.map((value, index) => (index === boardIndex ? true : value))
        );
    };

    // Wrapper function to handle maxVisits changes and trigger re-analysis
    const handleMaxVisitsChange = (updater) => {
        if (typeof updater === "function") {
            setMaxVisits((prev) => {
                const newMaxVisits = updater(prev);
                // Find which board(s) had their maxVisits changed and update accordingly
                const changedBoards = [];
                prev.forEach((oldValue, index) => {
                    if (oldValue !== newMaxVisits[index]) {
                        changedBoards.push(index);
                    }
                });

                // Clear analysis data for changed boards
                if (changedBoards.length > 0) {
                    setAnalysisData((prevAnalysis) =>
                        prevAnalysis.map((analysis, i) =>
                            changedBoards.includes(i) ? null : analysis
                        )
                    );
                    // Increment version for changed boards
                    setMaxVisitsVersion((prevVersion) =>
                        prevVersion.map((version, i) =>
                            changedBoards.includes(i) ? version + 1 : version
                        )
                    );
                }

                return newMaxVisits;
            });
        } else {
            // Handle direct array assignment (shouldn't happen in normal flow)
            setMaxVisits(updater);
        }
    };

    const handleNewBoard = () => {
        setUseSamples((prev) => [...prev, null]);
        setGameData((prev) => [...prev, null]);
        setAnalysisData((prev) => [...prev, null]);
        setCurrentMove((prev) => [...prev, null]);
        setLoading((prev) => [...prev, false]);
        setShowRecommendedMoves((prev) => [...prev, true]);
        setShowPolicy((prev) => [...prev, false]);
        setShowOwnership((prev) => [...prev, false]);
        setLoadedValue((prev) => [...prev, 0]);
        setMaxVisits((prev) => [...prev, 500]);
        setMaxVisitsVersion((prev) => [...prev, 0]);
        setWinRate((prev) => [...prev, null]);
        setFiles((prev) => [...prev, null]);
        setTotalBoards(totalBoards + 1);
    };

    // Get next available time message
    const getNextAvailableTime = () => {
        const now = new Date();
        const { hours, minutes, dayOfWeek } = getGMT8Time(now);

        const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday";
        const currentTimeInMinutes = hours * 60 + minutes;
        const stopTimeInMinutes = 22 * 60;

        if (currentTimeInMinutes >= stopTimeInMinutes) {
            // Server will be available tomorrow
            const tomorrow = new Date(now);
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
            const tomorrowInfo = getGMT8Time(tomorrow);
            const tomorrowIsWeekend =
                tomorrowInfo.dayOfWeek === "Saturday" ||
                tomorrowInfo.dayOfWeek === "Sunday";
            const startTime = tomorrowIsWeekend ? "08:00" : "15:00";
            return `The server will be available tomorrow at ${startTime} GMT+8`;
        } else {
            // Server will be available today
            const startTime = isWeekend ? "08:00" : "15:00";
            return `The server will be available today at ${startTime} GMT+8`;
        }
    };

    return (
        <>
            <Dialog
                open={!serverAvailable}
                maxWidth="sm"
                fullWidth
                sx={{
                    zIndex: (theme) => theme.zIndex.appBar - 1,
                }}
                slotProps={{
                    sx: {
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle>Demo Unavailable</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        The demo server is currently unavailable at this time.
                    </DialogContentText>
                    <DialogContentText sx={{ mb: 3 }}>
                        {getNextAvailableTime()}
                    </DialogContentText>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Server Hours:
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Weekdays: 15:00 - 22:00 GMT+8
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Weekends: 08:00 - 22:00 GMT+8
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>

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
                        }}
                    >
                        {Array.from({ length: totalBoards }, (_, i) => (
                            <Stack key={i}>
                                <Typography variant="h6">
                                    Board {i + 1}
                                </Typography>
                                <GameBoard
                                    key={i}
                                    id={i}
                                    gameData={gameData[i]}
                                    analysisData={analysisData[i]}
                                    currentMove={currentMove[i]}
                                    setCurrentMove={setCurrentMove}
                                    setFiles={setFiles}
                                    handleViewSample={handleViewSample}
                                    useSamples={useSamples}
                                    setUseSamples={setUseSamples}
                                    maxVisits={maxVisits[i]}
                                    setMaxVisits={handleMaxVisitsChange}
                                    loadedValue={loadedValue[i]}
                                    isLoading={loading[i]}
                                    showRecommendedMoves={
                                        showRecommendedMoves[i]
                                    }
                                    showPolicy={showPolicy[i]}
                                    showOwnership={showOwnership[i]}
                                    setShowRecommendedMoves={
                                        setShowRecommendedMoves
                                    }
                                    setShowPolicy={setShowPolicy}
                                    setShowOwnership={setShowOwnership}
                                />
                            </Stack>
                        ))}
                    </Box>
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: "divider",
                        }}
                        onClick={handleNewBoard}
                    >
                        Add Board
                    </Button>
                </Box>
            </Container>
        </>
    );
}

export default Demo;
