import Controls from "@/components/board/Controls";
import WinRate from "@/components/board/WinRate";
import AnalysisConfigFields from "@/components/settings/AnalysisConfigFields";
import type { AnalysisConfig } from "@/types/game";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grow from "@mui/material/Grow";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

export type CompareSidebarLane = {
    name: string;
    color: string;
    analysisConfig: AnalysisConfig;
    draftAnalysisConfig: AnalysisConfig;
    loading: boolean;
    isDirty: boolean;
};

type CompareSidebarProps = {
    lanes: CompareSidebarLane[];
    activeLaneIndex: number;
    setActiveLaneIndex: (index: number) => void;
    setDraftAnalysisConfig: (laneIndex: number, config: AnalysisConfig) => void;
    onResetAnalysisSettings: (laneIndex: number) => void;
    onSaveAnalysisSettings: (laneIndex: number) => void;
    runForAll: boolean;
    setRunForAll: (value: boolean) => void;
    onGenerateWinrate: () => void;
    onAnalyzeCurrentMove: () => void;
    onAnalyzeAllMoves: () => void;
    /* Shared move controls */
    maxMove: number;
    currentMoveIndex: number | null;
    onMoveChange: (amount: number) => void;
    onPassMove: () => void;
    /* Win rate for the active lane */
    winrateData: { black: number; white: number }[];
    setCurrentMoveIndex: (move: number) => void;
};

/**
 * Inner content of the Compare sidebar. Used both inside the desktop Paper
 * and inside the mobile SwipeableDrawer.
 */
const CompareSidebar = ({
    lanes,
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
    maxMove,
    currentMoveIndex,
    onMoveChange,
    onPassMove,
    winrateData,
    setCurrentMoveIndex,
}: CompareSidebarProps) => {
    const active = lanes[activeLaneIndex];
    const anyLoading = lanes.some((l) => l.loading);
    const buttonsDisabled = runForAll ? anyLoading : active?.loading;

    return (
        <>
            {/* 1. Controls */}
            <Controls
                maxMove={maxMove}
                live={false}
                currentMoveIndex={currentMoveIndex}
                onMoveChange={onMoveChange}
                onPassMove={onPassMove}
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
                <WinRate
                    data={winrateData}
                    setMove={setCurrentMoveIndex}
                    currentMove={currentMoveIndex ?? 0}
                />
            </Box>

            {/* 3. Lane tabs */}
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    flexShrink: 0,
                }}
            >
                <Tabs
                    value={Math.min(activeLaneIndex, lanes.length - 1)}
                    onChange={(_, value: number) => setActiveLaneIndex(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        minHeight: 40,
                        "& .MuiTab-root": {
                            minHeight: 40,
                            textTransform: "none",
                            fontWeight: 500,
                            py: 0.5,
                        },
                    }}
                >
                    {lanes.map((lane, idx) => (
                        <Tab
                            key={`${lane.name}-${idx}`}
                            value={idx}
                            label={
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            backgroundColor: lane.color,
                                            border: "1px solid rgba(0,0,0,0.2)",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            maxWidth: 120,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={lane.name}
                                    >
                                        {lane.name}
                                    </Typography>
                                </Stack>
                            }
                        />
                    ))}
                </Tabs>
            </Box>

            {/* 4. Settings header */}
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
                }}
            >
                <Typography variant="subtitle1" fontWeight={500}>
                    Analysis Settings
                </Typography>
            </Box>

            {/* 5. AnalysisConfigFields for the active lane */}
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    scrollbarWidth: "thin",
                }}
            >
                {active && (
                    <AnalysisConfigFields
                        analysisConfig={active.draftAnalysisConfig}
                        setAnalysisConfig={(config: AnalysisConfig) =>
                            setDraftAnalysisConfig(activeLaneIndex, config)
                        }
                    />
                )}
            </Box>

            {/* 6. Action buttons */}
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
                {active?.isDirty && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Grow in={true} timeout="auto">
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                    onResetAnalysisSettings(activeLaneIndex)
                                }
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
                                onClick={() =>
                                    onSaveAnalysisSettings(activeLaneIndex)
                                }
                                fullWidth
                            >
                                Save
                            </Button>
                        </Grow>
                    </Box>
                )}

                <FormControlLabel
                    control={
                        <Switch
                            checked={runForAll}
                            onChange={(e) => setRunForAll(e.target.checked)}
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Run for all lanes
                        </Typography>
                    }
                    sx={{ alignSelf: "flex-start", m: 0 }}
                />

                <Button
                    variant="contained"
                    onClick={onGenerateWinrate}
                    disabled={buttonsDisabled}
                    fullWidth
                >
                    Generate Winrate
                </Button>
                <Button
                    variant="contained"
                    onClick={onAnalyzeCurrentMove}
                    disabled={buttonsDisabled}
                    fullWidth
                >
                    Analyze Current Move
                </Button>
                <Button
                    variant="contained"
                    onClick={onAnalyzeAllMoves}
                    disabled={buttonsDisabled}
                    fullWidth
                >
                    Analyze All Moves
                </Button>
            </Box>
        </>
    );
};

export default CompareSidebar;
