import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import Upload from "../components/board/Upload";
import Board from "../components/board/Board";
import Controls from "../components/board/Controls";
import styles from "../styles/pages/Home.module.css";

function Demo() {
    const [searchParams, setSearchParams] = useSearchParams();
    const viewSample = searchParams.get("sample") ? true : false;
    const [file, setFile] = useState("");
    const [gameData, setGameData] = useState(null);
    const [currentMove, setCurrentMove] = useState(null);
    const url = "/katago/get-game-data/";

    useEffect(() => {
        if (viewSample) {
            getGameData({});
        }

        if (!file) {
            return;
        }

        function getGameData(data) {
            api.post(url, data)
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

    return (
        <>
            <div className={styles.game}>
                <Board data={gameData} moveIndex={currentMove} />
                {gameData || viewSample ? (
                    <Controls
                        setMove={setCurrentMove}
                        max={gameData?.moves.length}
                    />
                ) : (
                    <Upload setFile={setFile} />
                )}
            </div>
        </>
    );
}

export default Demo;
