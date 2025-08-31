import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { SGFSample } from "../constants";
import { toGTPFormat } from "../utils";
import api from "../api";
import LoadingIndicator from "../components/global/LoadingIndicator";
import Upload from "../components/board/Upload";
import GameBoard from "../components/board/GameBoard";
import Controls from "../components/board/Controls";
import WinRate from "../components/board/WinRate";
import styles from "../styles/pages/Demo.module.css";

function Demo() {
    const [searchParams, setSearchParams] = useSearchParams();
    const viewSample = searchParams.get("sample") ? true : false;
    const [file, setFile] = useState("");
    const [gameData, setGameData] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [winRate, setWinRate] = useState(null);
    const [currentMove, setCurrentMove] = useState(null);
    const [loading, setLoading] = useState(false);
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

    const handleToggleRecommendedMoves = () => {
        console.log("toggle recommended moves");
    };

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <>
            <LoadingIndicator
                className={loading ? "fadeIn" : "fadeOut"}
                value={loadedValue}
            />
            <div className={styles.game}>
                <GameBoard
                    gameData={gameData}
                    analysisData={analysisData}
                    currentMove={currentMove}
                />
                {gameData || viewSample ? (
                    <>
                        <Controls
                            move={currentMove}
                            setMove={setCurrentMove}
                            max={gameData?.moves.length}
                            tools={{
                                handleAnalyze: handleToggleRecommendedMoves,
                                handleReset: handleReset,
                            }}
                        />
                        <WinRate
                            data={winRate}
                            maxMove={gameData?.moves.length}
                            currentMove={currentMove}
                        />
                    </>
                ) : (
                    <Upload setFile={setFile} />
                )}
            </div>
        </>
    );
}

export default Demo;
