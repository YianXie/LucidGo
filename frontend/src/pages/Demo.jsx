import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { toGTPFormat } from "../utils";
import api from "../api";
import LoadingIndicator from "../components/global/LoadingIndicator";
import Upload from "../components/board/Upload";
import GameBoard from "../components/board/GameBoard";
import Controls from "../components/board/Controls";
import styles from "../styles/pages/Demo.module.css";

function Demo() {
    const [searchParams, setSearchParams] = useSearchParams();
    const viewSample = searchParams.get("sample") ? true : false;
    const [file, setFile] = useState("");
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recommendedMoves, setRecommendedMoves] = useState({});
    const [currentMove, setCurrentMove] = useState(null);
    const getGameDataURL = "/katago/get-game-data/";
    const getAnalysisURL = "/katago/analyze/";

    useEffect(() => {
        if (viewSample) {
            getGameData({});
        }

        if (!file) {
            return;
        }

        function getGameData(data) {
            api.post(getGameDataURL, data)
                .then((res) => res.data)
                .then((data) => {
                    setGameData(data.game_data);
                    setCurrentMove(1);
                })
                .catch((error) => {
                    toast.error("Invalid .sgf file");
                    console.error("error:", error);
                });
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;
            getGameData({ sgf_file_data: fileContent });
        };
        reader.readAsText(file);
    }, [file, viewSample]);

    const handleAnalyze = () => {
        if (!gameData) {
            return;
        }

        setLoading(true);

        const moves = [];
        for (let i = 0; i <= currentMove; i++) {
            const move = gameData.moves[i];

            // Invalid move
            if (move.includes(null)) {
                continue;
            }

            const [color, [row, col]] = move;
            moves.push([color, toGTPFormat(row, col)]);
        }
        const request = {
            id: `analysis_request_${currentMove}`,
            moves: moves,
            rules: "japanese",
            komi: 6.5,
            boardXSize: gameData.size,
            boardYSize: gameData.size,
            maxVisits: 100,
            analyzeTurns: [currentMove],
        };
        api.post(getAnalysisURL, { analysis_request: request })
            .then((res) => res.data)
            .then((data) => {
                const moves = data.response.moveInfos;
                moves.sort((a, b) => {
                    if (a.winrate >= b.winrate) {
                        return -1;
                    }
                    return 1;
                });
                setRecommendedMoves({
                    ...recommendedMoves,
                    [currentMove]: moves,
                });
            })
            .catch((error) => {
                console.error("Error:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <>
            <LoadingIndicator className={loading ? "fadeIn" : "fadeOut"} />
            <div className={styles.game}>
                <GameBoard
                    data={gameData}
                    moveIndex={currentMove}
                    recommendations={recommendedMoves}
                />
                {gameData || viewSample ? (
                    <Controls
                        move={currentMove}
                        setMove={setCurrentMove}
                        max={gameData?.moves.length}
                        tools={{
                            handleAnalyze: handleAnalyze,
                        }}
                    />
                ) : (
                    <Upload setFile={setFile} />
                )}
            </div>
        </>
    );
}

export default Demo;
