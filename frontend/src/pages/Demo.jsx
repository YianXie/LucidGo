import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import GameBoard from "../components/board/GameBoard";
import WinRate from "../components/board/WinRate";
import Container from "../components/global/Container";
import Upload from "../components/global/Upload";
import { SGFSample } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { toGTPFormat } from "../utils";

/**
 * Check if the server is currently available based on GMT+8 timezone
 * Server starts at 15:00 GMT+8 on weekdays, 08:00 GMT+8 on weekends
 * Server stops at 22:00 GMT+8 every day
 * @returns {boolean} - True if server is available, false otherwise
 */
function isServerAvailable() {
    const now = new Date();

    // Get GMT+8 time using Intl.DateTimeFormat for accurate timezone conversion
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Shanghai",
        hour: "numeric",
        minute: "numeric",
        weekday: "long",
        hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hours = parseInt(parts.find((p) => p.type === "hour").value);
    const minutes = parseInt(parts.find((p) => p.type === "minute").value);
    const dayOfWeek = parts.find((p) => p.type === "weekday").value;

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
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const viewSampleParam = searchParams.get("sample");
    const maxVisitsParam = parseInt(searchParams.get("maxVisits")) || 500;
    const [file, setFile] = useState("");
    const [gameData, setGameData] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [winRate, setWinRate] = useState(null);
    const [currentMove, setCurrentMove] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showRecommendedMoves, setShowRecommendedMoves] = useState(true);
    const [showPolicy, setShowPolicy] = useState(false);
    const [showOwnership, setShowOwnership] = useState(false);
    const [loadedValue, setLoadedValue] = useState(0);
    const [maxVisits, setMaxVisits] = useState(500);
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
        if (!gameData) {
            return;
        }

        setWinRate(Array.from({ length: gameData.moves.length }, () => 50));

        async function analyzeAllMoves() {
            setLoading(true);
            const pastMoves = [];
            const analyzeResults = [];
            for (let i = 0; i < gameData.moves.length; i++) {
                const move = gameData.moves[i];

                if (move.includes(null)) {
                    continue;
                }

                const [color, [row, col]] = move;
                pastMoves.push([color, toGTPFormat(row, col)]);

                const request = {
                    id: `analysis_request_${i}`,
                    moves: pastMoves,
                    rules: "japanese",
                    komi: 6.5,
                    boardXSize: gameData.size,
                    boardYSize: gameData.size,
                    analyzeTurns: [i],
                    maxVisits: maxVisitsParam,
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
                        prev.map((value, index) =>
                            index === i ? winRate : value
                        )
                    );
                    analyzeResults.push(data);
                } catch (error) {
                    console.error("Error:", error);
                } finally {
                    setLoadedValue((100 / gameData.moves.length) * i);
                }
            }
            setLoading(false);
            setAnalysisData(analyzeResults);
        }
        analyzeAllMoves();

        return () => {
            setLoadedValue(0);
        };
    }, [gameData, maxVisitsParam]);

    useEffect(() => {
        if (!file && !viewSampleParam) {
            return;
        }

        async function getGameData(SGFContent) {
            try {
                setLoading(true);
                const gameDataRes = await api.post(getGameDataURL, {
                    sgf_file_data: SGFContent,
                });
                const rawGameData = await gameDataRes.data;
                const gameData = rawGameData.game_data;
                setGameData(gameData);

                const moves = [];
                for (let i = 0; i <= gameData.moves.length; i++) {
                    const move = gameData.moves[i];

                    // Invalid move
                    if (!move || move.includes(null)) {
                        continue;
                    }

                    const [color, [row, col]] = move;
                    moves.push([color, toGTPFormat(row, col)]);
                }
            } catch (error) {
                toast.error("Invalid .sgf file");
                console.error("Error while fetching game data:", error);
            } finally {
                setLoading(false);
                setCurrentMove(1);
            }
        }

        if (viewSampleParam) {
            getGameData(SGFSample);
        } else {
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileContent = e.target.result;
                getGameData(fileContent);
            };
            reader.readAsText(file);
        }
    }, [file, viewSampleParam]);

    const handleViewSample = (e) => {
        e.preventDefault();
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("sample", "true");
        setSearchParams(newSearchParams);
    };

    const handleApply = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("maxVisits", maxVisits);
        setSearchParams(newSearchParams);
    };

    // Get next available time message
    const getNextAvailableTime = () => {
        const now = new Date();

        // Get GMT+8 time using Intl.DateTimeFormat
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Singapore",
            hour: "numeric",
            minute: "numeric",
            weekday: "long",
            hour12: false,
        });

        const parts = formatter.formatToParts(now);
        const hours = parseInt(parts.find((p) => p.type === "hour").value);
        const minutes = parseInt(parts.find((p) => p.type === "minute").value);
        const dayOfWeek = parts.find((p) => p.type === "weekday").value;

        const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday";
        const currentTimeInMinutes = hours * 60 + minutes;
        const stopTimeInMinutes = 22 * 60;

        if (currentTimeInMinutes >= stopTimeInMinutes) {
            // Server will be available tomorrow
            const tomorrow = new Date(now);
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
            const tomorrowFormatter = new Intl.DateTimeFormat("en-US", {
                timeZone: "Asia/Singapore",
                weekday: "long",
            });
            const tomorrowDayOfWeek = tomorrowFormatter
                .formatToParts(tomorrow)
                .find((p) => p.type === "weekday").value;
            const tomorrowIsWeekend =
                tomorrowDayOfWeek === "Saturday" ||
                tomorrowDayOfWeek === "Sunday";
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
            <Backdrop
                open={loading}
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.appBar - 1,
                    backdropFilter: "blur(4px) brightness(0.8)",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {loadedValue > 0 ? (
                    <Box
                        sx={{
                            position: "relative",
                            display: "inline-flex",
                        }}
                    >
                        <CircularProgress
                            size={120}
                            variant="determinate"
                            value={loadedValue}
                        />
                        <Box
                            sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography
                                variant="body1"
                                component="div"
                                fontWeight={600}
                                sx={{ color: "primary.main" }}
                            >
                                {loadedValue.toFixed(1)}%
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <CircularProgress size={80} />
                        <Typography variant="h6">Loading...</Typography>
                    </>
                )}
            </Backdrop>

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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 3,
                        }}
                    >
                        <GameBoard
                            gameData={gameData}
                            analysisData={analysisData}
                            currentMove={currentMove}
                            setMove={setCurrentMove}
                            setShowRecommendedMoves={setShowRecommendedMoves}
                            setShowPolicy={setShowPolicy}
                            setShowOwnership={setShowOwnership}
                            showRecommendedMoves={showRecommendedMoves}
                            showPolicy={showPolicy}
                            showOwnership={showOwnership}
                        />
                    </Box>

                    <Card
                        sx={{
                            width: { xs: "100%", sm: 400 },
                            maxWidth: "100%",
                        }}
                    >
                        <CardContent>
                            <Stack spacing={3} alignItems="center">
                                <WinRate
                                    data={winRate}
                                    maxMove={gameData?.moves.length}
                                    setMove={setCurrentMove}
                                    currentMove={currentMove}
                                />
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Settings
                                    </Typography>
                                    <Box sx={{ width: "100%", px: 2 }}>
                                        <Typography
                                            variant="body2"
                                            gutterBottom
                                            sx={{ mb: 2 }}
                                        >
                                            Max Visits: {maxVisits}
                                        </Typography>
                                        <Slider
                                            value={maxVisits}
                                            onChange={(e, newValue) =>
                                                setMaxVisits(newValue)
                                            }
                                            min={100}
                                            max={1000}
                                            step={10}
                                            marks={[
                                                {
                                                    value: 100,
                                                    label: "100",
                                                },
                                                {
                                                    value: 1000,
                                                    label: "1000",
                                                },
                                            ]}
                                            aria-label="Max Visits"
                                        />
                                    </Box>
                                    <Button
                                        variant="contained"
                                        onClick={handleApply}
                                        sx={{ mt: 1 }}
                                    >
                                        Apply
                                    </Button>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                    {!gameData && !viewSampleParam && (
                        <Backdrop
                            open={true}
                            sx={{
                                color: "#fff",
                                flexDirection: "column",
                                gap: 2,
                                backdropFilter: "blur(4px)",
                                animation: "fadeIn 0.3s ease",
                                "@keyframes fadeIn": {
                                    from: {
                                        opacity: 0,
                                    },
                                    to: {
                                        opacity: 1,
                                    },
                                },
                            }}
                        >
                            <Upload setFile={setFile} accept={".sgf"} />
                            <Link
                                component="button"
                                onClick={handleViewSample}
                                sx={{
                                    color: "primary.light",
                                    textDecoration: "underline",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    cursor: "pointer",
                                    mt: 2,
                                    "&:hover": {
                                        color: "primary.dark",
                                    },
                                }}
                            >
                                View a sample
                                <OpenInNewIcon fontSize="small" />
                            </Link>
                        </Backdrop>
                    )}
                </Box>
            </Container>
        </>
    );
}

export default Demo;
