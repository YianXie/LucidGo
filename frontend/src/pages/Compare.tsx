import api from "@/api";
import { GAMES_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { GameState, HistoryAnalysisSession, HistoryEntry } from "@/types/game";
import { defaultBoard } from "@/utils/board";
import Box from "@mui/material/Box";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Compare = () => {
    const { userSettings } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const gameIDsText = searchParams.get("gameIDs") ?? "";
    const gameIDs = useMemo(() => gameIDsText.split(","), [gameIDsText]);

    const [_game, setGame] = useState<GameState | null>(null);
    const [_analysisSessions, setAnalysisSessions] = useState<
        HistoryAnalysisSession[][]
    >([]);

    useEffect(() => {
        if (gameIDs.length < 2 || gameIDs.length > 5) {
            toast.error("An error has occurred when comparing games.");
            navigate("/");
            return;
        }

        gameIDs.forEach((gameID) => {
            try {
                void api
                    .get<HistoryEntry>(`${GAMES_URL}${gameID}`)
                    .then(({ data }) => {
                        setAnalysisSessions((prev) => [
                            ...prev,
                            data.analysis_sessions,
                        ]);

                        // Use the functional updater so only the first resolved
                        // request sets the shared game state, avoiding races.
                        setGame((prev) => {
                            if (prev) return prev;
                            const newBoard = defaultBoard(
                                userSettings.analysis_config
                            );
                            newBoard.gameData = data.game_data;
                            newBoard.name = data.name;
                            newBoard.gameID = data.id;
                            newBoard.sgfContent = data.sgf_data ?? "";
                            newBoard.currentMoveIndex = 0;
                            newBoard.source = "file";
                            return newBoard;
                        });
                    });
            } catch (error) {
                console.error("Failed to load game data:", error);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameIDs]);

    return <Box>Compare</Box>;
};

export default Compare;
