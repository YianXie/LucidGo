import Controls from "@/components/board/Controls";
import GameBoard, { type GameBoardHandle } from "@/components/board/GameBoard";
import WinRate from "@/components/board/WinRate";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import { ANALYSIS_RIGHT_PANEL_WIDTH } from "@/constants";
import { ANIMATION_MS } from "@/constants";
import {
    type AnalysisConfig,
    type GameData,
    type GameSource,
    type GameState,
    type HistoryAnalysisSession,
} from "@/types/game";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useState } from "react";

const Game = ({
    gameIndex,
    gameState,
    updateGame,
    selectedGameIndex,
    selectedGameSGF,
    onSelectGame,
    onGenerateWinrate,
    onAnalyzeCurrentMove,
    onAnalyzeAllMoves,
    handleBoardPassMove,
    setCurrentSettingsIndex,
    setSettingsDrawerOpen,
    onSaveGame,
    onUnsaveGame,
    onDeleteBoard,
    onSaveAnalysisSettings,
    onResetAnalysisSettings,
    analysisConfigIsDirty,
    analysisSessions,
    selectedAnalysisSession,
    setSelectedAnalysisSession,
    loadHistorySession,
    historyMenuAnchor,
    setHistoryMenuAnchor,
    gameBoardRefs,
    isCreating = false,
    isDeleting = false,
    numGames,
    compareOk,
}: {
    gameIndex: number;
    gameState: GameState;
    updateGame: (updates: Partial<GameState>) => void;
    selectedGameIndex?: number[];
    selectedGameSGF?: string | null;
    onSelectGame?: (checked: boolean) => void;
    onGenerateWinrate: () => void;
    onAnalyzeCurrentMove: () => void;
    onAnalyzeAllMoves: () => void;
    handleBoardPassMove: () => void;
    setCurrentSettingsIndex: (id: number) => void;
    setSettingsDrawerOpen: (opened: boolean) => void;
    onSaveGame?: () => void;
    onUnsaveGame?: () => void;
    onDeleteBoard?: () => void;
    onSaveAnalysisSettings: () => void;
    onResetAnalysisSettings: () => void;
    analysisConfigIsDirty: boolean;
    analysisSessions?: HistoryAnalysisSession[];
    selectedAnalysisSession?: string | null;
    setSelectedAnalysisSession?: (id: string) => void;
    loadHistorySession?: (id: string) => void;
    historyMenuAnchor?: Element | null;
    setHistoryMenuAnchor?: React.Dispatch<
        React.SetStateAction<HTMLElement | null>
    >;
    gameBoardRefs: React.MutableRefObject<
        Record<number, GameBoardHandle | null>
    >;
    isCreating?: boolean;
    isDeleting?: boolean;
    numGames: number;
    compareOk?: boolean;
}) => {
    const [compareCheckboxTooltipTitle, setCompareCheckboxTooltipTitle] =
        useState("");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const thisSelected =
        selectedGameIndex &&
        selectedGameIndex.some((index) => index === gameIndex);
    const checkboxDisabled =
        !thisSelected &&
        (!selectedGameIndex ||
            !compareOk ||
            gameState.live ||
            !gameState.gameData?.moves ||
            selectedGameIndex.length >= 2 ||
            (selectedGameSGF && gameState.sgfContent !== selectedGameSGF));

    useEffect(() => {
        if (!compareOk)
            setCompareCheckboxTooltipTitle(
                "At least two analyzed games are required to start comparison"
            );
        else if (gameState.live)
            setCompareCheckboxTooltipTitle(
                "Only uploaded or sample games can be compared"
            );
        else if (!gameState.gameData?.moves)
            setCompareCheckboxTooltipTitle("Game not initialized");
        else if (selectedGameIndex && selectedGameIndex.length >= 2)
            setCompareCheckboxTooltipTitle(
                "Two games are already selected — unselect them first"
            );
        else if (selectedGameSGF && gameState.sgfContent !== selectedGameSGF)
            setCompareCheckboxTooltipTitle(
                "Games must have the same SGF content to be compared"
            );
        else if (thisSelected)
            setCompareCheckboxTooltipTitle("Unselect this game");
        else setCompareCheckboxTooltipTitle("Select this game for comparison");
    }, [
        compareOk,
        gameState.gameData?.moves,
        gameState.live,
        gameState.sgfContent,
        selectedGameIndex,
        selectedGameSGF,
        thisSelected,
    ]);

    const handleMoveChange = (amount: number) => {
        const current = gameState.currentMoveIndex ?? 0;
        updateGame({
            currentMoveIndex: Math.max(
                0,
                Math.min(
                    current + amount,
                    gameState.gameData?.moves.length ?? 0
                )
            ),
        });
    };

    const controlsProps = {
        maxMove: gameState.gameData?.moves.length as number,
        live: gameState.live,
        currentMoveIndex: gameState.currentMoveIndex,
        onMoveChange: handleMoveChange,
        onGenerateWinrate: onGenerateWinrate,
        onAnalyzeCurrentMove: onAnalyzeCurrentMove,
        onAnalyzeAllMoves: onAnalyzeAllMoves,
        onPassMove: handleBoardPassMove,
    };

    const winRateProps = {
        data: gameState.winrate,
        setMove: (move: number) => updateGame({ currentMoveIndex: move }),
        currentMove: gameState.currentMoveIndex ?? 0,
    };

    return (
        <Stack
            gap={2}
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "flex-start" }}
            justifyContent="center"
            sx={{
                position: "relative",
                width: { xs: "100%", md: "max-content" },
                maxWidth: "none",
                mx: "auto",
                flexShrink: 0,
                transformOrigin: "center center",
                willChange: "transform",
                ...(isDeleting && {
                    animation: `boardDeleteExit ${ANIMATION_MS}ms ease-in forwards`,
                    pointerEvents: "none",
                }),
                ...(isCreating && {
                    animation: `boardCreate ${ANIMATION_MS}ms ease-out forwards`,
                    pointerEvents: "none",
                }),
            }}
        >
            <Box>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <TextField
                        variant="standard"
                        value={gameState.name ?? `Board ${gameIndex + 1}`}
                        onChange={(event) =>
                            updateGame({
                                name: event.target.value,
                            })
                        }
                        sx={{
                            "& .MuiInput-underline:before": {
                                borderBottom: "none",
                            },
                            "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                                {
                                    borderBottom:
                                        "1px solid rgba(0, 0, 0, 0.87)",
                                },
                        }}
                    />
                    <Box>
                        {isMobile && (
                            <Tooltip title="Analysis settings" arrow>
                                <IconButton
                                    onClick={() => {
                                        setCurrentSettingsIndex(gameIndex);
                                        setSettingsDrawerOpen(true);
                                    }}
                                    size="small"
                                >
                                    <TuneIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {(onSaveGame || onUnsaveGame) && (
                            <Tooltip
                                title={
                                    gameState.gameData === null
                                        ? ""
                                        : gameState.gameID
                                          ? "Unsave game"
                                          : "Save game"
                                }
                                arrow
                            >
                                <span>
                                    <IconButton
                                        onClick={() =>
                                            gameState.gameID
                                                ? void onUnsaveGame?.()
                                                : void onSaveGame?.()
                                        }
                                        disabled={gameState.gameData === null}
                                        color={
                                            gameState.gameID
                                                ? "primary"
                                                : "default"
                                        }
                                    >
                                        {gameState.gameID ? (
                                            <BookmarkIcon />
                                        ) : (
                                            <BookmarkBorderIcon />
                                        )}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {onDeleteBoard && (
                            <Tooltip title={"Delete board"} arrow>
                                <span>
                                    <IconButton
                                        onClick={onDeleteBoard}
                                        sx={{
                                            color: "error.main",
                                            "&:hover": {
                                                backgroundColor: "#ff000010",
                                            },
                                        }}
                                        disabled={numGames === 1}
                                    >
                                        <DeleteIcon color="inherit" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {onSelectGame && (
                            <Tooltip title={compareCheckboxTooltipTitle} arrow>
                                <span>
                                    <Checkbox
                                        checked={
                                            selectedGameIndex !== null &&
                                            selectedGameIndex !== undefined &&
                                            selectedGameIndex.some(
                                                (index) => index === gameIndex
                                            )
                                        }
                                        disabled={checkboxDisabled as boolean}
                                        onChange={(
                                            event: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                            onSelectGame(event.target.checked);
                                        }}
                                    />
                                </span>
                            </Tooltip>
                        )}
                    </Box>
                </Stack>
                <GameBoard
                    ref={(handle) => {
                        gameBoardRefs.current[gameIndex] = handle;
                    }}
                    gameData={gameState.gameData}
                    analysisData={gameState.analysisData}
                    isLoading={gameState.loading}
                    loadedValue={gameState.loadedValue}
                    live={gameState.live}
                    analysisConfig={gameState.analysisConfig}
                    gameSource={gameState.gameSource}
                    currentMoveIndex={gameState.currentMoveIndex}
                    setCurrentMoveIndex={(move) =>
                        updateGame({
                            currentMoveIndex: move,
                        })
                    }
                    onGameSourceChange={(source: GameSource) =>
                        updateGame({
                            gameSource: source,
                        })
                    }
                    onViewSample={() =>
                        updateGame({
                            gameSource: "sample",
                        })
                    }
                    onLive={() => {
                        const liveData: GameData = {
                            komi: 6.5,
                            moves: [],
                            size: 19,
                            players: {
                                black: "Black",
                                white: "White",
                            },
                            winner: "Unknown",
                        };
                        updateGame({
                            gameData: liveData,
                            currentMoveIndex: 0,
                            live: true,
                        });
                    }}
                    onFileChange={(file) => updateGame({ file })}
                />

                {/* Mobile: controls + winrate below board */}
                <Box
                    sx={{
                        display: {
                            xs: "block",
                            md: "none",
                        },
                    }}
                >
                    <Controls {...controlsProps} />
                    <WinRate {...winRateProps} />
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
                    pointerEvents: gameState.loading ? "none" : "auto",
                    opacity: gameState.loading ? 0.5 : 1,
                    filter: gameState.loading ? "brightness(0.5)" : "none",
                    cursor: gameState.loading ? "not-allowed" : "auto",
                }}
            >
                {/* 1. Controls */}
                <Controls
                    {...controlsProps}
                    sx={{
                        borderRadius: 0,
                        boxShadow: "none",
                        borderBottom: 1,
                        borderColor: "divider",
                        flexWrap: "nowrap",
                        overflowX: "auto",
                    }}
                />

                {/* 2. Win Rate */}
                <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        flexShrink: 0,
                    }}
                >
                    <WinRate {...winRateProps} />
                </Box>

                {/* 3. Settings header */}
                <Box
                    sx={{
                        px: 2,
                        pt: 1.5,
                        pb: 1,
                        borderBottom: 1,
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                        cursor: "default",
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={500}>
                        Analysis Settings
                    </Typography>
                    {gameState.gameID &&
                        analysisSessions &&
                        analysisSessions.length > 0 &&
                        setHistoryMenuAnchor && (
                            <>
                                <Tooltip title="Past configurations" arrow>
                                    <IconButton
                                        size="medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setHistoryMenuAnchor(
                                                e.currentTarget
                                            );
                                        }}
                                    >
                                        <HistoryIcon fontSize="medium" />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={historyMenuAnchor ?? null}
                                    open={Boolean(historyMenuAnchor)}
                                    onClose={() => setHistoryMenuAnchor(null)}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    slotProps={{
                                        list: {
                                            autoFocusItem: true,
                                        },
                                    }}
                                >
                                    {analysisSessions.map((session) => {
                                        const algo =
                                            session.analysis_config?.general
                                                ?.algorithm ?? "Unknown";
                                        const date = new Date(
                                            session.created_at
                                        ).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        });
                                        return (
                                            <MenuItem
                                                key={session.id}
                                                onClick={() => {
                                                    void loadHistorySession?.(
                                                        session.id
                                                    );
                                                    setSelectedAnalysisSession?.(
                                                        session.id
                                                    );
                                                }}
                                            >
                                                <ListItemIcon>
                                                    {session.id ===
                                                        selectedAnalysisSession && (
                                                        <CheckIcon color="primary" />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {algo} &mdash; {date}
                                                </ListItemText>
                                            </MenuItem>
                                        );
                                    })}
                                </Menu>
                            </>
                        )}
                </Box>

                {/* Settings content */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: "auto",
                        scrollbarWidth: "thin",
                    }}
                >
                    <AnalysisConfigFields
                        analysisConfig={gameState.draftAnalysisConfig}
                        setAnalysisConfig={(config: AnalysisConfig) =>
                            updateGame({
                                draftAnalysisConfig: config,
                            })
                        }
                    />
                </Box>

                {/* Action buttons */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 2,
                        borderTop: 1,
                        borderColor: "divider",
                        flexShrink: 0,
                    }}
                >
                    {analysisConfigIsDirty && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Grow in={true} timeout="auto">
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={onResetAnalysisSettings}
                                    disabled={gameState.gameData === null}
                                    fullWidth
                                    sx={{
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(211, 47, 47, 0.08)",
                                            borderColor: "#d32f2f",
                                        },
                                    }}
                                >
                                    Reset
                                </Button>
                            </Grow>
                            <Grow in={true} timeout="auto">
                                <Button
                                    variant="contained"
                                    onClick={onSaveAnalysisSettings}
                                    disabled={gameState.gameData === null}
                                    fullWidth
                                >
                                    Save
                                </Button>
                            </Grow>
                        </Box>
                    )}
                    <Button
                        variant="contained"
                        onClick={onGenerateWinrate}
                        disabled={gameState.gameData === null}
                        fullWidth
                    >
                        Generate Winrate
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onAnalyzeCurrentMove}
                        disabled={gameState.gameData === null}
                        fullWidth
                    >
                        Analyze Current Move
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onAnalyzeAllMoves}
                        disabled={gameState.gameData === null}
                        fullWidth
                    >
                        Analyze All Moves
                    </Button>
                </Box>
            </Paper>
        </Stack>
    );
};

export default Game;
