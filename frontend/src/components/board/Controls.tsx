import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import SettingsIcon from "@mui/icons-material/Settings";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import ControlMoveButton from "./ControlMoveButton";

function Controls({
    maxMove,
    disabled,
    currentMove,
    onMoveChange,
    handleAnalyzeWithAI,
    onOpenAnalysisSettings,
}: {
    maxMove: number;
    disabled: boolean;
    currentMove: number | null;
    onMoveChange: (move: number) => void;
    handleAnalyzeWithAI: () => void;
    onOpenAnalysisSettings: () => void;
}) {
    const fastForwardAmount = 5;

    const handleMove = (amount: number) => {
        const next = (currentMove ?? 0) + amount;
        onMoveChange(Math.max(0, Math.min(next, maxMove)));
    };

    const moveIndex = currentMove ?? 0;

    return (
        <Paper
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                p: 1,
                borderRadius: "0 0 12px 12px",
                flexWrap: "wrap",
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto",
            }}
        >
            <Tooltip title="Analyze with AI" arrow placement="top">
                <IconButton
                    aria-label="Analyze with AI"
                    size="small"
                    onClick={handleAnalyzeWithAI}
                >
                    <SmartToyIcon />
                </IconButton>
            </Tooltip>

            <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
                <ControlMoveButton
                    amount={-maxMove}
                    icon={<SkipPreviousIcon />}
                    label="Move to the beginning"
                    handleMove={handleMove}
                    disabled={moveIndex <= 0}
                />
                <ControlMoveButton
                    amount={-fastForwardAmount}
                    icon={<FastRewindIcon />}
                    label={`Rewind ${fastForwardAmount} moves`}
                    handleMove={handleMove}
                    disabled={moveIndex <= 0}
                />
                <ControlMoveButton
                    amount={-1}
                    icon={<ArrowBackIosIcon />}
                    label="Move backward 1 move"
                    handleMove={handleMove}
                    disabled={moveIndex <= 0}
                />
            </Stack>

            <Typography
                variant="body2"
                sx={{
                    minWidth: 40,
                    textAlign: "center",
                    fontWeight: 500,
                }}
            >
                {moveIndex}
            </Typography>

            <Stack direction="row" spacing={0.5} sx={{ mr: "auto" }}>
                <ControlMoveButton
                    amount={1}
                    icon={<ArrowForwardIosIcon fontSize="small" />}
                    label="Move forward 1 move"
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove}
                />
                <ControlMoveButton
                    amount={fastForwardAmount}
                    icon={<FastForwardIcon />}
                    label={`Fast forward ${fastForwardAmount} moves`}
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove}
                />
                <ControlMoveButton
                    amount={maxMove}
                    icon={<SkipNextIcon />}
                    label="Move to the end"
                    handleMove={handleMove}
                    disabled={moveIndex >= maxMove}
                />
            </Stack>

            <Tooltip title="Show settings" arrow placement="top">
                <IconButton
                    aria-label="Show settings"
                    size="small"
                    onClick={onOpenAnalysisSettings}
                >
                    <SettingsIcon />
                </IconButton>
            </Tooltip>
        </Paper>
    );
}

export default Controls;
