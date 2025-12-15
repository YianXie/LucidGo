import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
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
    const [files, setFiles] = useState([null]);
    const [gameData, setGameData] = useState([null]);
    const [analysisData, setAnalysisData] = useState([null]);
    // eslint-disable-next-line no-unused-vars
    const [winRate, setWinRate] = useState([null]);
    const [currentMove, setCurrentMove] = useState([null]);
    const [loading, setLoading] = useState([false]);
    const [showRecommendedMoves, setShowRecommendedMoves] = useState([true]);
    const [showPolicy, setShowPolicy] = useState([false]);
    const [showOwnership, setShowOwnership] = useState([false]);
    const [loadedValue, setLoadedValue] = useState([0]);
    const [maxVisits, setMaxVisits] = useState([500]);
    // eslint-disable-next-line no-unused-vars
    const [totalBoards, setTotalBoards] = useState(1);
    const [useSamples, setUseSamples] = useState([null]);
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

    useEffect(() => {
        if (gameData.includes(null)) return;

        const tempWinRate = [];
        for (let i = 0; i < totalBoards; i++) {
            tempWinRate.push(
                Array.from({ length: gameData[i].moves.length }, () => 50)
            );
        }
        setWinRate(tempWinRate);

        async function analyze() {
            for (let i = 0; i < totalBoards; i++) {
                setLoading((prev) =>
                    prev.map((value, index) => (index === i ? true : value))
                );
                await analyzeAllMoves(i);
                setLoading((prev) =>
                    prev.map((value, index) => (index === i ? false : value))
                );
            }
        }
        analyze();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameData, maxVisits, totalBoards]);

    useEffect(() => {
        if (!files && !useSamples) return;

        async function getGameDataAllBoards(SGFContent) {
            try {
                for (let i = 0; i < totalBoards; i++) {
                    await getGameData(SGFContent, i);
                    setCurrentMove((prev) =>
                        prev.map((value, index) => (index === i ? 1 : value))
                    );
                }
            } catch (error) {
                toast.error("Invalid .sgf file");
                console.error("Error while fetching game data:", error);
            }
        }

        for (let i = 0; i < totalBoards; i++) {
            if (useSamples[i]) {
                getGameDataAllBoards(SGFSample);
            } else {
                if (files[i]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const fileContent = e.target.result;
                        getGameDataAllBoards(fileContent);
                    };
                    reader.readAsText(files[i]);
                }
            }
        }
    }, [files, totalBoards, useSamples]);

    const getGameData = async (SGFContent, boardIndex) => {
        const gameDataRes = await api.post(getGameDataURL, {
            sgf_file_data: SGFContent,
        });
        const rawGameData = await gameDataRes.data;
        const gameData = rawGameData.game_data;
        setGameData((prev) =>
            prev.map((value, index) =>
                index === boardIndex ? gameData : value
            )
        );
    };

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
                const res = await api.post(getAnalysisURL, {
                    analysis_request: request,
                });
                const data = res.data;
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
                        flexDirection: { xs: "column", lg: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        py: 4,
                        minHeight: "calc(100vh - 100px)",
                    }}
                >
                    <Box>
                        {Array.from({ length: totalBoards }, (_, i) => (
                            <React.Fragment key={i}>
                                <Typography variant="h6">
                                    Board {i + 1}
                                </Typography>
                                <GameBoard
                                    key={i}
                                    id={i}
                                    gameData={gameData[i]}
                                    analysisData={analysisData[i]}
                                    currentMove={currentMove[i]}
                                    setFiles={setFiles}
                                    handleViewSample={handleViewSample}
                                    useSamples={useSamples}
                                    setUseSamples={setUseSamples}
                                    maxVisits={maxVisits[i]}
                                    setMaxVisits={setMaxVisits}
                                    setCurrentMove={setCurrentMove}
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
                            </React.Fragment>
                        ))}
                    </Box>
                </Box>
            </Container>
        </>
    );
}

export default Demo;
