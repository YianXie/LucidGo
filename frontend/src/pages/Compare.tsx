import api from "@/api";
import CompareLegend from "@/components/board/CompareLegend";
import CompareSidebar, {
    type CompareSidebarLane,
} from "@/components/board/CompareSidebar";
import Controls from "@/components/board/Controls";
import GameBoard, {
    type AnalysisOverlay,
    type GameBoardHandle,
} from "@/components/board/GameBoard";
import WinRate from "@/components/board/WinRate";
import {
    ANALYSIS_RIGHT_PANEL_WIDTH,
    GAMES_URL,
    POST_ANALYSIS_URL,
    POST_WINRATE_URL,
} from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import {
    type AnalysisConfig,
    type AnalysisResult,
    type GameData,
    type HistoryEntry,
    type WinrateResult,
    isValidMove,
} from "@/types/game";
import {
    buildAnalysisRequest,
    buildWinrateRequest,
} from "@/utils/buildAnalysisRequest";
import { MAX_COMPARE_LANES, compareColorAt } from "@/utils/compareColors";
import { toGTPFormat } from "@/utils/coordinates";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

type CompareLane = {
    gameID: string;
    name: string;
    color: string;
    analysisData: (AnalysisResult | null)[] | null;
    winrate: { black: number; white: number }[];
    analysisConfig: AnalysisConfig;
    draftAnalysisConfig: AnalysisConfig;
    loading: boolean;
    loadedValue: number | null;
};

const Compare = () => {
    usePageTitle("Compare");

    const { userSettings } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const gameIDsText = searchParams.get("gameIDs") ?? "";
    const gameIDs = useMemo(
        () => gameIDsText.split(",").filter((id) => id.length > 0),
        [gameIDsText]
    );

    const [gameData, setGameData] = useState<GameData | null>(null);
    const [lanes, setLanes] = useState<CompareLane[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
    const [activeLaneIndex, setActiveLaneIndex] = useState<number>(0);
    const [runForAll, setRunForAll] = useState<boolean>(false);
    const [settingsDrawerOpen, setSettingsDrawerOpen] =
        useState<boolean>(false);
    const [bootstrapped, setBootstrapped] = useState<boolean>(false);

    const gameBoardRef = useRef<GameBoardHandle | null>(null);

    useEffect(() => {
        if (gameIDs.length < 2 || gameIDs.length > MAX_COMPARE_LANES) {
            toast.error("An error has occurred when comparing games.");
            navigate("/");
            return;
        }

        let cancelled = false;
        const load = async () => {
            try {
                const responses = await Promise.all(
                    gameIDs.map((id) =>
                        api.get<HistoryEntry>(`${GAMES_URL}${id}`)
                    )
                );
                if (cancelled) return;

                const entries = responses.map((r) => r.data);
                const firstGameData = entries[0]?.game_data;
                if (!firstGameData) {
                    toast.error("Failed to load game data.");
                    navigate("/");
                    return;
                }

                const fallbackConfig = userSettings.analysis_config;
                const initialLanes: CompareLane[] = entries.map(
                    (entry, idx) => {
                        const latestSession = entry.analysis_sessions[0];
                        const config = latestSession
                            ? structuredClone(latestSession.analysis_config)
                            : structuredClone(fallbackConfig);
                        const results = latestSession?.results ?? null;
                        const winrate = results
                            ? results
                                  .map((r) => r?.stats?.winrate)
                                  .filter(
                                      (
                                          w
                                      ): w is {
                                          black: number;
                                          white: number;
                                      } => w !== undefined && w !== null
                                  )
                            : [];
                        return {
                            gameID: entry.id,
                            name: entry.name || `Board ${idx + 1}`,
                            color: compareColorAt(idx),
                            analysisData: results,
                            winrate,
                            analysisConfig: config,
                            draftAnalysisConfig: structuredClone(config),
                            loading: false,
                            loadedValue: null,
                        };
                    }
                );

                setGameData(firstGameData);
                setLanes(initialLanes);
                setCurrentMoveIndex(0);
                setActiveLaneIndex(0);
                setBootstrapped(true);
            } catch (error) {
                if (cancelled) return;
                console.error("Failed to load games for comparison:", error);
                toast.error("Failed to load games for comparison.");
                navigate("/");
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameIDsText]);

    const updateLane = (laneIndex: number, updates: Partial<CompareLane>) => {
        setLanes((prev) =>
            prev.map((lane, i) =>
                i === laneIndex ? { ...lane, ...updates } : lane
            )
        );
    };

    const moves = gameData?.moves ?? [];

    const analyzeMoveForLane = async (
        laneIndex: number,
        moveIndex: number
    ): Promise<AnalysisResult | null> => {
        const lane = lanes[laneIndex];
        if (!lane || !gameData) return null;

        const pastMoves: [string, string][] = [];
        for (let i = 0; i < moveIndex; i++) {
            const move = gameData.moves[i];
            if (!isValidMove(move)) continue;
            const [color, [row, col]] = move;
            pastMoves.push([color, toGTPFormat(row, col)]);
        }

        const toPlay =
            pastMoves.length > 0 &&
            pastMoves[pastMoves.length - 1][0].toUpperCase() === "B"
                ? "W"
                : "B";

        const request = buildAnalysisRequest(
            lane.analysisConfig,
            pastMoves,
            toPlay
        );
        try {
            const { data } = await api.post<AnalysisResult>(
                POST_ANALYSIS_URL,
                request
            );
            return data;
        } catch (error) {
            toast.error(
                `Error analyzing move ${moveIndex + 1} on lane "${lane.name}"`
            );
            console.error(
                `Error analyzing move ${moveIndex + 1} on lane "${lane.name}":`,
                error
            );
            return null;
        }
    };

    const onGenerateWinrateForLane = async (laneIndex: number) => {
        const lane = lanes[laneIndex];
        if (!lane || !gameData) return;

        updateLane(laneIndex, { loading: true, loadedValue: null });

        const pastMoves: [string, string][] = [];
        for (const move of gameData.moves) {
            if (!isValidMove(move)) continue;
            const [color, [row, col]] = move;
            pastMoves.push([color, toGTPFormat(row, col)]);
        }

        const request = buildWinrateRequest(pastMoves, lane.analysisConfig);
        try {
            const { data } = await api.post<WinrateResult>(
                POST_WINRATE_URL,
                request
            );
            updateLane(laneIndex, { winrate: data.winrate });
        } catch (error) {
            toast.error(`Error generating winrate for lane "${lane.name}"`);
            console.error(
                `Error generating winrate for lane "${lane.name}":`,
                error
            );
        } finally {
            updateLane(laneIndex, { loading: false });
        }
    };

    const onAnalyzeCurrentMoveForLane = async (laneIndex: number) => {
        const lane = lanes[laneIndex];
        if (!lane || !gameData) return;

        updateLane(laneIndex, { loading: true, loadedValue: null });

        const result = await analyzeMoveForLane(laneIndex, currentMoveIndex);
        const totalMoves = gameData.moves.length;
        const existing =
            lane.analysisData ??
            Array.from({ length: totalMoves + 1 }, () => null);
        const next = existing.map((data, i) =>
            i === currentMoveIndex ? result : data
        );

        updateLane(laneIndex, { analysisData: next, loading: false });
    };

    const onAnalyzeAllMovesForLane = async (laneIndex: number) => {
        const lane = lanes[laneIndex];
        if (!lane || !gameData) return;

        updateLane(laneIndex, { loading: true, loadedValue: null });

        const denom = Math.max(gameData.moves.length, 1);
        const analysisResults: AnalysisResult[] = [];
        for (let i = 0; i <= gameData.moves.length; i++) {
            const analysisResult = await analyzeMoveForLane(laneIndex, i);
            if (analysisResult) {
                analysisResults.push(analysisResult);
            }
            updateLane(laneIndex, {
                loadedValue: (100 / denom) * i,
            });
        }

        updateLane(laneIndex, {
            loadedValue: null,
            analysisData: analysisResults,
            winrate: analysisResults.map((r) => r.stats.winrate),
            loading: false,
        });
    };

    const runForAllLanes = async (fn: (laneIndex: number) => Promise<void>) => {
        await Promise.all(lanes.map((_, idx) => fn(idx)));
    };

    const onGenerateWinrate = () => {
        if (runForAll) {
            void runForAllLanes(onGenerateWinrateForLane);
        } else {
            void onGenerateWinrateForLane(activeLaneIndex);
        }
    };

    const onAnalyzeCurrentMove = () => {
        if (runForAll) {
            void runForAllLanes(onAnalyzeCurrentMoveForLane);
        } else {
            void onAnalyzeCurrentMoveForLane(activeLaneIndex);
        }
    };

    const onAnalyzeAllMoves = () => {
        if (runForAll) {
            void runForAllLanes(onAnalyzeAllMovesForLane);
        } else {
            void onAnalyzeAllMovesForLane(activeLaneIndex);
        }
    };

    const setDraftAnalysisConfig = (
        laneIndex: number,
        config: AnalysisConfig
    ) => {
        updateLane(laneIndex, { draftAnalysisConfig: config });
    };

    const onResetAnalysisSettings = (laneIndex: number) => {
        const lane = lanes[laneIndex];
        if (!lane) return;
        updateLane(laneIndex, {
            draftAnalysisConfig: structuredClone(lane.analysisConfig),
        });
    };

    const onSaveAnalysisSettings = (laneIndex: number) => {
        const lane = lanes[laneIndex];
        if (!lane) return;
        updateLane(laneIndex, {
            analysisConfig: structuredClone(lane.draftAnalysisConfig),
        });
        toast.success(`Configuration updated for "${lane.name}"`);
    };

    const onMoveChange = (amount: number) => {
        const next = currentMoveIndex + amount;
        setCurrentMoveIndex(Math.max(0, Math.min(next, moves.length)));
    };

    const onPassMove = () => {
        gameBoardRef.current?.handlePassMove();
    };

    const overlays: AnalysisOverlay[] = useMemo(
        () =>
            lanes.map((lane) => ({
                analysisData: lane.analysisData,
                color: lane.color,
                label: lane.name,
            })),
        [lanes]
    );

    const sidebarLanes: CompareSidebarLane[] = useMemo(
        () =>
            lanes.map((lane) => ({
                name: lane.name,
                color: lane.color,
                analysisConfig: lane.analysisConfig,
                draftAnalysisConfig: lane.draftAnalysisConfig,
                loading: lane.loading,
                isDirty:
                    JSON.stringify(lane.analysisConfig) !==
                    JSON.stringify(lane.draftAnalysisConfig),
            })),
        [lanes]
    );

    const legendItems = useMemo(
        () => lanes.map((lane) => ({ name: lane.name, color: lane.color })),
        [lanes]
    );

    const activeLane = lanes[activeLaneIndex];
    const isAnyLoading = lanes.some((l) => l.loading);
    const aggregatedLoadedValue = activeLane?.loadedValue ?? null;

    const sidebarProps = {
        lanes: sidebarLanes,
        activeLaneIndex,
        setActiveLaneIndex,
        setDraftAnalysisConfig,
        onResetAnalysisSettings,
        onSaveAnalysisSettings,
        runForAll,
        setRunForAll,
        onGenerateWinrate,
        onAnalyzeCurrentMove,
        onAnalyzeAllMoves,
        maxMove: moves.length,
        currentMoveIndex,
        onMoveChange,
        onPassMove,
        winrateData: activeLane?.winrate ?? [],
        setCurrentMoveIndex: (move: number) => setCurrentMoveIndex(move),
    };

    if (!bootstrapped || !gameData) {
        return (
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 8,
                }}
            >
                <Typography variant="body1" color="text.secondary">
                    Loading comparison...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                py: 4,
                px: 2,
                boxSizing: "border-box",
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                position="relative"
                sx={{ mb: 1 }}
            >
                <Typography variant="h4" fontWeight={500} textAlign="center">
                    Compare
                </Typography>
                <Box
                    sx={{
                        position: "absolute",
                        right: 0,
                        display: { xs: "block", md: "none" },
                    }}
                >
                    <Tooltip title="Analysis settings" arrow>
                        <IconButton onClick={() => setSettingsDrawerOpen(true)}>
                            <TuneIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Stack>

            <CompareLegend items={legendItems} />

            <Box
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "visible",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "stretch", md: "flex-start" }}
                    justifyContent="center"
                    gap={2}
                    sx={{
                        width: { xs: "100%", md: "max-content" },
                        mx: "auto",
                    }}
                >
                    <Box>
                        <GameBoard
                            ref={(handle) => {
                                gameBoardRef.current = handle;
                            }}
                            gameData={gameData}
                            overlays={overlays}
                            isLoading={isAnyLoading}
                            loadedValue={aggregatedLoadedValue}
                            live={false}
                            analysisConfig={
                                activeLane?.analysisConfig ??
                                userSettings.analysis_config
                            }
                            source="file"
                            currentMoveIndex={currentMoveIndex}
                            setCurrentMoveIndex={setCurrentMoveIndex}
                            onSourceChange={() => {}}
                            onViewSample={() => {}}
                            onLive={() => {}}
                            onFileChange={() => {}}
                        />

                        {/* Mobile: shared controls + winrate below the board */}
                        <Box sx={{ display: { xs: "block", md: "none" } }}>
                            <Controls
                                maxMove={moves.length}
                                live={false}
                                currentMoveIndex={currentMoveIndex}
                                onMoveChange={onMoveChange}
                                onPassMove={onPassMove}
                            />
                            <WinRate
                                data={activeLane?.winrate ?? []}
                                setMove={setCurrentMoveIndex}
                                currentMove={currentMoveIndex}
                            />
                        </Box>
                    </Box>

                    {/* Desktop right sidebar */}
                    <Paper
                        elevation={1}
                        square
                        sx={{
                            width: ANALYSIS_RIGHT_PANEL_WIDTH,
                            flexShrink: 0,
                            display: { xs: "none", md: "flex" },
                            flexDirection: "column",
                            position: "sticky",
                            top: 16,
                            maxHeight: "calc(100vh - 32px)",
                            overflow: "hidden",
                            alignSelf: "flex-start",
                            pointerEvents: isAnyLoading ? "none" : "auto",
                            opacity: isAnyLoading ? 0.6 : 1,
                            filter: isAnyLoading ? "brightness(0.8)" : "none",
                            cursor: isAnyLoading ? "not-allowed" : "auto",
                        }}
                    >
                        <CompareSidebar {...sidebarProps} />
                    </Paper>
                </Stack>
            </Box>

            {/* Mobile-only: analysis settings bottom drawer */}
            <SwipeableDrawer
                anchor="bottom"
                open={settingsDrawerOpen}
                onOpen={() => setSettingsDrawerOpen(true)}
                onClose={() => setSettingsDrawerOpen(false)}
                disableSwipeToOpen
                sx={{ display: { xs: "block", md: "none" } }}
                slotProps={{
                    paper: {
                        sx: {
                            maxHeight: "85vh",
                            borderRadius: "16px 16px 0 0",
                            display: "flex",
                            flexDirection: "column",
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 4,
                        bgcolor: "divider",
                        borderRadius: 2,
                        mx: "auto",
                        mt: 1.5,
                        mb: 1,
                        flexShrink: 0,
                    }}
                />
                <CompareSidebar {...sidebarProps} />
            </SwipeableDrawer>
        </Box>
    );
};

export default Compare;
