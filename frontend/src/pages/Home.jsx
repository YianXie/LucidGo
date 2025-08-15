import { useState } from "react";
import api from "../api";
import Board from "../components/Board";
import styles from "../styles/Home.module.css";

function Home() {
    const [file, setFile] = useState("");
    const [gameData, setGameData] = useState(null);

    const handleSubmit = () => {
        if (!file) {
            alert("No file uploaded yet!");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;
            api.post("/katago/get-game-data/", { sgf_file_data: fileContent })
                .then((res) => res.data)
                .then((data) => {
                    console.log("data:", data);
                    setGameData(data.game_data);
                })
                .catch((error) => {
                    console.error("error:", error);
                });
        };
        reader.readAsText(file);
    };

    return (
        <>
            <h1>Home</h1>
            <input
                type="file"
                accept=".sgf"
                onChange={(e) => {
                    setFile(e.target.files[0]);
                }}
            />
            <button onClick={handleSubmit}>Upload file</button>
            <Board moves={gameData?.moves} size={gameData?.size} />
        </>
    );
}

export default Home;
