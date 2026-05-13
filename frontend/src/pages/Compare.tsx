import api from "@/api";
import { GAMES_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { GameState, HistoryAnalysisSession, HistoryEntry } from "@/types/game";
import { defaultBoard } from "@/utils/board";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Compare = () => {
    const { userSettings } = useAuth();

    const [searchParams] = useSearchParams();
    const gameIDsText = searchParams.get("gameIDs") ?? "";
    const gameIDs = gameIDsText.split(",");

    const [games, setGames] = useState<GameState[]>([]);
    const [analysisSessions, setAnalysisSessions] = useState<
        HistoryAnalysisSession[][]
    >([]);

    useEffect(() => {
        if (gameIDs.length < 2) throw new Error("Not enough games to compare!");
        else if (gameIDs.length > 5)
            throw new Error("Too many games to compare!");
    }, [gameIDs]);

    useEffect(() => {
        const id = gameIDs[0];
        if (id) {
            try {
                void api
                    .get<HistoryEntry>(`${GAMES_URL}${id}`)
                    .then(({ data }) => {
                        setAnalysisSessions((prev) => [
                            ...prev,
                            data.analysis_sessions,
                        ]);
                        setGames(() => {
                            const newBoard = defaultBoard(
                                userSettings.analysis_config
                            );
                            newBoard.gameData = {
                                size: data.board_size,
                                moves: data.moves,
                                komi: data.komi ?? undefined,
                                players: {
                                    black: data.black_player,
                                    white: data.white_player,
                                },
                                winner: data.winner ?? undefined,
                            };
                            newBoard.name = data.name;
                            newBoard.gameID = data.id;
                            newBoard.sgfContent = data.sgf_data ?? "";
                            newBoard.currentMoveIndex = 0;
                            newBoard.loading = false;
                            newBoard.gameSource = "file";
                            newBoard.live = false;
                            newBoard.loadedValue = 0;
                            newBoard.analysisConfig =
                                userSettings.analysis_config;
                            return [newBoard];
                        });
                    });
            } catch (error) {
                console.error("Failed to load game data:", error);
            }
        }
    }, [userSettings.analysis_config, setGames, gameIDs]);

    return <Box>Compare</Box>;
};

export default Compare;
