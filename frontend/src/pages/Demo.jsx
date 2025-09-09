import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { SGFSample, paddingTop } from "../constants";
import { toGTPFormat } from "../utils";
import api from "../api";
import LoadingIndicator from "../components/global/LoadingIndicator";
import Upload from "../components/global/Upload";
import GameBoard from "../components/board/GameBoard";
import Controls from "../components/board/Controls";
import WinRate from "../components/board/WinRate";
import Container from "../components/global/Container";

function Demo() {
    const [searchParams, setSearchParams] = useSearchParams();
    const viewSample = searchParams.get("sample") ? true : false;
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
    const getGameDataURL = "/katago/get-game-data/";
    const getAnalysisURL = "/katago/analyze/";

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
                    includePolicy: true,
                    includeOwnership: true,
                };
                try {
                    const res = await api.post(getAnalysisURL, {
                        analysis_request: request,
                    });
                    const data = await res.data;

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
    }, [gameData]);

    useEffect(() => {
        if (!file && !viewSample) {
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

        if (viewSample) {
            getGameData(SGFSample);
        } else {
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileContent = e.target.result;
                getGameData(fileContent);
            };
            reader.readAsText(file);
        }
    }, [file, viewSample]);

    const handleViewSample = (e) => {
        e.preventDefault();

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("sample", "true");
        setSearchParams(newSearchParams);
    };

    return (
        <>
            <LoadingIndicator show={loading} value={loadedValue} />
            <Container className="flex h-full w-full items-center justify-center">
                <div
                    className={
                        "inline-flex flex-col items-center justify-center"
                    }
                >
                    <GameBoard
                        gameData={gameData}
                        analysisData={analysisData}
                        currentMove={currentMove}
                        showRecommendedMoves={showRecommendedMoves}
                        showPolicy={showPolicy}
                        showOwnership={showOwnership}
                    />
                    {gameData || viewSample ? (
                        <>
                            <Controls
                                currentMove={currentMove}
                                setMove={setCurrentMove}
                                maxMove={gameData?.moves.length}
                                setShowRecommendedMoves={
                                    setShowRecommendedMoves
                                }
                                showRecommendedMoves={showRecommendedMoves}
                                showPolicy={showPolicy}
                                showOwnership={showOwnership}
                                setShowPolicy={setShowPolicy}
                                setShowOwnership={setShowOwnership}
                            />
                            <WinRate
                                data={winRate}
                                maxMove={gameData?.moves.length}
                                setMove={setCurrentMove}
                                currentMove={currentMove}
                            />
                        </>
                    ) : (
                        <div className="fixed flex h-full w-full flex-col items-center justify-center backdrop-blur-md backdrop-brightness-50">
                            <Upload setFile={setFile} accept={".sgf"} />
                            <a
                                className="mt-2 flex cursor-pointer items-center justify-center font-medium text-blue-400 hover:underline"
                                onClick={handleViewSample}
                            >
                                View a sample
                                <svg
                                    className="ms-2 h-4 w-4 rtl:rotate-180"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 10"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M1 5h12m0 0L9 1m4 4L9 9"
                                    />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>
            </Container>
        </>
    );
}

export default Demo;
