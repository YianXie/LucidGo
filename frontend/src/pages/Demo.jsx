import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api";
import GameBoard from "../components/board/GameBoard";
import WinRate from "../components/board/WinRate";
import Container from "../components/global/Container";
import ExternalLinkIcon from "../components/global/ExternalLinkIcon";
import Flex from "../components/global/Flex";
import LoadingIndicator from "../components/global/LoadingIndicator";
import RangeSelector from "../components/global/RangeSelector";
import Upload from "../components/global/Upload";
import { SGFSample } from "../constants";
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
                    const data = await res.data;
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

        const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday";
        const currentTimeInMinutes = hours * 60 + minutes;
        const stopTimeInMinutes = 22 * 60;

        if (currentTimeInMinutes >= stopTimeInMinutes) {
            // Server will be available tomorrow
            const tomorrow = new Date(now);
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
            const tomorrowFormatter = new Intl.DateTimeFormat("en-US", {
                timeZone: "Asia/Shanghai",
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
            <LoadingIndicator show={loading} value={loadedValue} />
            {!serverAvailable && (
                <div className="fixed top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center backdrop-blur-md backdrop-brightness-50">
                    <div className="bg-bg-1 rounded-lg border border-bg-3 p-8 shadow-lg max-w-md mx-4">
                        <h2 className="text-text-1 text-2xl font-bold mb-4 text-center">
                            Demo Unavailable
                        </h2>
                        <p className="text-text-1 text-lg mb-2 text-center">
                            The demo server is currently unavailable at this
                            time.
                        </p>
                        <p className="text-text-2 text-md mt-4 text-center">
                            {getNextAvailableTime()}
                        </p>
                        <div className="mt-6 text-text-2 text-sm text-center">
                            <p>Server Hours:</p>
                            <p className="mt-2">
                                Weekdays: 15:00 - 22:00 GMT+8
                            </p>
                            <p>Weekends: 08:00 - 22:00 GMT+8</p>
                        </div>
                    </div>
                </div>
            )}
            <Container className="flex h-full w-full items-center justify-center">
                <Flex className="w-full flex-wrap items-center justify-center gap-7.5">
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
                    {gameData || viewSampleParam ? (
                        <Flex className="flex-col flex-wrap items-center justify-center gap-5">
                            <WinRate
                                data={winRate}
                                maxMove={gameData?.moves.length}
                                setMove={setCurrentMove}
                                currentMove={currentMove}
                            />
                            <Flex
                                className={
                                    "flex-col items-center justify-center gap-5 pb-5"
                                }
                            >
                                <p className="text-text-1 text-lg font-[500]">
                                    Settings
                                </p>
                                <Flex className="w-full flex-wrap items-center justify-center gap-3">
                                    <p
                                        className="text-text-1 text-md"
                                        aria-label="Max Visits"
                                    >
                                        Max Visits
                                    </p>
                                    <RangeSelector
                                        min={100}
                                        max={1000}
                                        step={10}
                                        value={maxVisits}
                                        setValue={setMaxVisits}
                                    />
                                </Flex>
                                <button
                                    onClick={handleApply}
                                    className="text-text-1 bg-bg-4 hover:bg-bg-3 cursor-pointer rounded-md px-4 py-2 transition-all duration-300"
                                >
                                    Apply
                                </button>
                            </Flex>
                        </Flex>
                    ) : (
                        <div className="fixed top-0 left-0 flex h-full w-full flex-col items-center justify-center backdrop-blur-md backdrop-brightness-50">
                            <Upload setFile={setFile} accept={".sgf"} />
                            <a
                                className="mt-2 flex cursor-pointer items-center justify-center font-medium text-blue-400 hover:underline"
                                onClick={handleViewSample}
                            >
                                View a sample
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    )}
                </Flex>
            </Container>
        </>
    );
}

export default Demo;
